const express = require("express");
const db = require("../config/db");

const router = express.Router();


/* ==========================================
   GET ALL ORDERS
========================================== */

router.get(
    "/",
    (req, res) => {

        try {

            const orders =
                db.prepare(`
                    SELECT
                        orders.*,
                        users.name AS customer_name,
                        users.email AS customer_email
                    FROM orders
                    LEFT JOIN users
                    ON orders.user_id = users.id
                    ORDER BY orders.id DESC
                `).all();


            for (const order of orders) {

                order.items =
                    db.prepare(`
                        SELECT
                            order_items.id,
                            order_items.food_id,
                            foods.name,
                            order_items.quantity,
                            order_items.price
                        FROM order_items
                        JOIN foods
                        ON order_items.food_id =
                           foods.id
                        WHERE order_items.order_id = ?
                    `).all(
                        order.id
                    );

            }


            res.json(orders);

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to get orders",

                error:
                    error.message

            });

        }

    }
);


/* ==========================================
   GET SINGLE ORDER
========================================== */

router.get(
    "/:id",
    (req, res) => {

        try {

            const order =
                db.prepare(`
                    SELECT
                        orders.*,
                        users.name
                            AS customer_name,
                        users.email
                            AS customer_email
                    FROM orders
                    LEFT JOIN users
                    ON orders.user_id =
                       users.id
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


            const items =
                db.prepare(`
                    SELECT
                        order_items.id,
                        order_items.food_id,
                        foods.name,
                        order_items.quantity,
                        order_items.price
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

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to get order",

                error:
                    error.message

            });

        }

    }
);


/* ==========================================
   UPDATE ORDER STATUS
========================================== */

router.patch(
    "/:id/status",
    (req, res) => {

        const {
            status
        } = req.body;


        const allowedStatuses = [

            "Pending",

            "Confirmed",

            "Preparing",

            "Ready",

            "Served",

            "Completed",

            "Cancelled"

        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid order status",

                allowedStatuses

            });

        }


        try {

            const result =
                db.prepare(`
                    UPDATE orders
                    SET status = ?
                    WHERE id = ?
                `).run(
                    status,
                    req.params.id
                );


            if (
                result.changes === 0
            ) {

                return res.status(404).json({

                    message:
                        "Order not found"

                });

            }


            res.json({

                message:
                    "Order status updated",

                orderId:
                    Number(
                        req.params.id
                    ),

                status

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to update order status",

                error:
                    error.message

            });

        }

    }
);


/* ==========================================
   CONFIRM ORDER
========================================== */

router.patch(
    "/:id/confirm",
    (req, res) => {

        updateStatus(
            req,
            res,
            "Confirmed"
        );

    }
);


/* ==========================================
   PREPARE ORDER
========================================== */

router.patch(
    "/:id/prepare",
    (req, res) => {

        updateStatus(
            req,
            res,
            "Preparing"
        );

    }
);


/* ==========================================
   READY ORDER
========================================== */

router.patch(
    "/:id/ready",
    (req, res) => {

        updateStatus(
            req,
            res,
            "Ready"
        );

    }
);


/* ==========================================
   SERVE ORDER
========================================== */

router.patch(
    "/:id/served",
    (req, res) => {

        updateStatus(
            req,
            res,
            "Served"
        );

    }
);


/* ==========================================
   COMPLETE ORDER
========================================== */

router.patch(
    "/:id/complete",
    (req, res) => {

        updateStatus(
            req,
            res,
            "Completed"
        );

    }
);


/* ==========================================
   CANCEL ORDER
========================================== */

router.patch(
    "/:id/cancel",
    (req, res) => {

        updateStatus(
            req,
            res,
            "Cancelled"
        );

    }
);


/* ==========================================
   UPDATE PAYMENT STATUS
========================================== */

router.patch(
    "/:id/payment-status",
    (req, res) => {

        const {
            payment_status
        } = req.body;


        const allowedPaymentStatuses = [

            "Paid",

            "Pending",

            "Cancelled"

        ];


        if (
            !allowedPaymentStatuses.includes(
                payment_status
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid payment status",

                allowedStatuses:
                    allowedPaymentStatuses

            });

        }


        try {

            const result =
                db.prepare(`
                    UPDATE orders
                    SET payment_status = ?
                    WHERE id = ?
                `).run(
                    payment_status,
                    req.params.id
                );


            if (
                result.changes === 0
            ) {

                return res.status(404).json({

                    message:
                        "Order not found"

                });

            }


            const updatedOrder =
                db.prepare(`
                    SELECT
                        id,
                        payment_method,
                        payment_status,
                        total
                    FROM orders
                    WHERE id = ?
                `).get(
                    req.params.id
                );


            res.json({

                message:
                    "Payment status updated",

                orderId:
                    Number(
                        req.params.id
                    ),

                paymentStatus:
                    updatedOrder.payment_status,

                paymentMethod:
                    updatedOrder.payment_method,

                total:
                    updatedOrder.total

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to update payment status",

                error:
                    error.message

            });

        }

    }
);


/* ==========================================
   HELPER - UPDATE ORDER STATUS
========================================== */

function updateStatus(
    req,
    res,
    newStatus
) {

    try {

        const result =
            db.prepare(`
                UPDATE orders
                SET status = ?
                WHERE id = ?
            `).run(
                newStatus,
                req.params.id
            );


        if (
            result.changes === 0
        ) {

            return res.status(404).json({

                message:
                    "Order not found"

            });

        }


        res.json({

            message:
                "Order status updated",

            orderId:
                Number(
                    req.params.id
                ),

            status:
                newStatus

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to update order status",

            error:
                error.message

        });

    }

}


module.exports = router;
