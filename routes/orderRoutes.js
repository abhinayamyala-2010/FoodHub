
const express = require("express");
const db = require("../config/db");

const router = express.Router();


// ==========================================
// PLACE ORDER
// ==========================================

router.post("/", (req, res) => {

    const {
        user_id,
        customer_name,
        items,
        customer_phone,
        delivery_address,
        order_type,
        coupon_code,
        discount
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!user_id) {
        return res.status(400).json({
            message: "User ID is required"
        });
    }


    if (!customer_name || !customer_name.trim()) {
        return res.status(400).json({
            message: "Customer name is required"
        });
    }


    if (
        !items ||
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return res.status(400).json({
            message: "Cart is empty"
        });
    }


    try {

        let subtotal = 0;

        const orderItems = [];

        const requiredIngredients = {};


        // ==========================================
        // CHECK FOODS
        // ==========================================

        for (const item of items) {

            const food = db.prepare(`
                SELECT *
                FROM foods
                WHERE id = ?
            `).get(item.food_id);


            if (!food) {
                return res.status(400).json({
                    message:
                        "Food ID " +
                        item.food_id +
                        " not found"
                });
            }


            if (Number(food.available) === 0) {
                return res.status(400).json({
                    message:
                        food.name +
                        " is currently unavailable"
                });
            }


            const quantity = Number(item.quantity);


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {
                return res.status(400).json({
                    message: "Invalid quantity"
                });
            }


            const itemTotal =
                Number(food.price) * quantity;


            subtotal += itemTotal;


            orderItems.push({
                food_id: food.id,
                quantity: quantity,
                price: Number(food.price)
            });


            // ==========================================
            // GET INGREDIENTS
            // ==========================================

            const ingredients =
                db.prepare(`
                    SELECT
                        food_ingredients.ingredient_id,
                        food_ingredients.quantity,
                        food_ingredients.unit,
                        inventory.name,
                        inventory.stock

                    FROM food_ingredients

                    JOIN inventory
                    ON food_ingredients.ingredient_id =
                       inventory.id

                    WHERE food_ingredients.food_id = ?
                `).all(food.id);


            for (const ingredient of ingredients) {

                const required =
                    Number(ingredient.quantity) *
                    quantity;


                if (
                    !requiredIngredients[
                        ingredient.ingredient_id
                    ]
                ) {

                    requiredIngredients[
                        ingredient.ingredient_id
                    ] = {

                        ingredient_id:
                            ingredient.ingredient_id,

                        name:
                            ingredient.name,

                        required: 0,

                        stock:
                            Number(ingredient.stock),

                        unit:
                            ingredient.unit
                    };

                }


                requiredIngredients[
                    ingredient.ingredient_id
                ].required += required;

            }

        }


        // ==========================================
        // CHECK INVENTORY STOCK
        // ==========================================

        for (
            const ingredientId
            in requiredIngredients
        ) {

            const ingredient =
                requiredIngredients[ingredientId];


            if (
                ingredient.required >
                ingredient.stock
            ) {

                return res.status(400).json({

                    message:
                        "Insufficient stock for " +
                        ingredient.name,

                    ingredient:
                        ingredient.name,

                    available:
                        ingredient.stock,

                    required:
                        ingredient.required,

                    unit:
                        ingredient.unit

                });

            }

        }


        // ==========================================
        // COUPON / DISCOUNT
        // ==========================================

        let finalDiscount =
            Number(discount || 0);


        let finalCouponCode =
            coupon_code || "";


        if (finalCouponCode) {

            finalCouponCode =
                finalCouponCode.trim();


            const coupon =
                db.prepare(`
                    SELECT *
                    FROM coupons

                    WHERE UPPER(code) =
                          UPPER(?)

                    AND active = 1
                `).get(
                    finalCouponCode
                );


            if (!coupon) {

                return res.status(400).json({
                    message:
                        "Invalid coupon code"
                });

            }


            // ==========================================
            // CALCULATE DISCOUNT
            // ==========================================

            if (
                coupon.discount_type ===
                "percentage"
            ) {

                finalDiscount =
                    subtotal *
                    Number(
                        coupon.discount_value
                    ) /
                    100;

            } else {

                finalDiscount =
                    Number(
                        coupon.discount_value
                    );

            }


            // ==========================================
            // MINIMUM ORDER
            // ==========================================

            if (
                subtotal <
                Number(coupon.minimum_order)
            ) {

                return res.status(400).json({

                    message:
                        `Minimum order amount is ₹${coupon.minimum_order}`

                });

            }


            // ==========================================
            // MAXIMUM DISCOUNT
            // ==========================================

            if (
                Number(
                    coupon.maximum_discount
                ) > 0 &&

                finalDiscount >
                Number(
                    coupon.maximum_discount
                )
            ) {

                finalDiscount =
                    Number(
                        coupon.maximum_discount
                    );

            }


            if (
                finalDiscount >
                subtotal
            ) {

                finalDiscount =
                    subtotal;

            }

        }


        // ==========================================
        // GST
        // ==========================================

        const taxableAmount =
            Math.max(
                subtotal - finalDiscount,
                0
            );


        const gst =
            taxableAmount * 0.05;


        // ==========================================
        // DELIVERY CHARGE
        // ==========================================

        let deliveryCharge = 0;


        if (
            order_type !== "Takeaway" &&
            subtotal < 500
        ) {

            deliveryCharge = 40;

        }


        // ==========================================
        // GRAND TOTAL
        // ==========================================

        const grandTotal =
            taxableAmount +
            gst +
            deliveryCharge;


        // ==========================================
        // INSERT ORDER
        // ==========================================

        const orderResult =
            db.prepare(`
                INSERT INTO orders
                (
                    user_id,
                    customer_name,
                    subtotal,
                    gst,
                    delivery_charge,
                    discount,
                    total,
                    coupon_code,
                    status,
                    payment_method,
                    payment_status,
                    customer_phone,
                    delivery_address,
                    order_type
                )

                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    'Pending',
                    'WhatsApp',
                    'Pending',
                    ?,
                    ?,
                    ?
                )
            `).run(

                Number(user_id),

                customer_name.trim(),

                subtotal,

                gst,

                deliveryCharge,

                finalDiscount,

                grandTotal,

                finalCouponCode,

                customer_phone || "",

                delivery_address || "",

                order_type || "Delivery"

            );


        const orderId =
            Number(
                orderResult.lastInsertRowid
            );


        // ==========================================
        // INSERT ORDER ITEMS
        // ==========================================

        const itemInsert =
            db.prepare(`
                INSERT INTO order_items
                (
                    order_id,
                    food_id,
                    quantity,
                    price
                )

                VALUES (?, ?, ?, ?)
            `);


        for (const item of orderItems) {

            itemInsert.run(

                orderId,

                item.food_id,

                item.quantity,

                item.price

            );

        }


        // ==========================================
        // DEDUCT INVENTORY
        // ==========================================

        const stockUpdate =
            db.prepare(`
                UPDATE inventory

                SET stock = stock - ?

                WHERE id = ?
            `);


        for (
            const ingredientId
            in requiredIngredients
        ) {

            const ingredient =
                requiredIngredients[
                    ingredientId
                ];


            stockUpdate.run(

                ingredient.required,

                ingredient.ingredient_id

            );

        }


        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({

            message:
                "Order placed successfully!",

            orderId,

            customerName:
                customer_name.trim(),

            subtotal:
                Number(
                    subtotal.toFixed(2)
                ),

            discount:
                Number(
                    finalDiscount.toFixed(2)
                ),

            couponCode:
                finalCouponCode,

            gst:
                Number(
                    gst.toFixed(2)
                ),

            deliveryCharge:
                Number(
                    deliveryCharge.toFixed(2)
                ),

            total:
                Number(
                    grandTotal.toFixed(2)
                ),

            paymentMethod:
                "WhatsApp",

            paymentStatus:
                "Pending"

        });

    } catch (error) {

        console.error(
            "PLACE ORDER ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Failed to place order",

            error:
                error.message

        });

    }

});


// ==========================================
// GET USER ORDERS
// ==========================================

router.get(
    "/user/:user_id",
    (req, res) => {

        try {

            const orders =
                db.prepare(`
                    SELECT
                        id,
                        user_id,
                        customer_name,
                        subtotal,
                        gst,
                        delivery_charge,
                        discount,
                        total,
                        coupon_code,
                        status,
                        payment_method,
                        payment_status,
                        customer_phone,
                        delivery_address,
                        order_type,
                        order_date

                    FROM orders

                    WHERE user_id = ?

                    ORDER BY id DESC
                `).all(
                    req.params.user_id
                );


            res.json(orders);

        } catch (error) {

            console.error(
                "GET USER ORDERS ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to get orders",

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// GET SINGLE ORDER
// ==========================================

router.get(
    "/:id",
    (req, res) => {

        try {

            const order =
                db.prepare(`
                    SELECT
                        orders.*,

                        COALESCE(
                            orders.customer_name,
                            users.name
                        ) AS customer_display_name,

                        users.email

                    FROM orders

                    LEFT JOIN users
                    ON orders.user_id = users.id

                    WHERE orders.id = ?
                `).get(
                    req.params.id
                );


            if (!order) {

                return res.status(404).json({

                    message:
                        "Order not found"

                });

            }


            // ==========================================
            // GET ORDER ITEMS
            // ==========================================

            const items =
                db.prepare(`
                    SELECT
                        order_items.id,
                        order_items.quantity,
                        order_items.price,
                        foods.name

                    FROM order_items

                    JOIN foods
                    ON order_items.food_id =
                       foods.id

                    WHERE order_items.order_id = ?
                `).all(
                    req.params.id
                );


            res.json({

                order,

                items

            });

        } catch (error) {

            console.error(
                "GET SINGLE ORDER ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to get order details",

                error:
                    error.message

            });

        }

    }
);


module.exports = router;

