const express = require("express");
const db = require("../config/db");

const router = express.Router();


// ==========================================
// GET ALL ACTIVE COUPONS
// ==========================================

router.get("/", (req, res) => {

    try {

        const coupons = db.prepare(`
            SELECT *
            FROM coupons
            WHERE active = 1
            ORDER BY id DESC
        `).all();

        res.json(coupons);

    } catch (error) {

        res.status(500).json({
            message: "Failed to load coupons",
            error: error.message
        });

    }

});


// ==========================================
// VALIDATE COUPON
// ==========================================

router.post("/validate", (req, res) => {

    const {
        code,
        subtotal
    } = req.body;

    if (!code) {

        return res.status(400).json({
            message: "Coupon code is required"
        });

    }

    try {

        const coupon = db.prepare(`
            SELECT *
            FROM coupons
            WHERE UPPER(code) = UPPER(?)
            AND active = 1
        `).get(code.trim());

        if (!coupon) {

            return res.status(404).json({
                message: "Invalid or inactive coupon"
            });

        }

        const amount = Number(subtotal || 0);

        if (
            amount <
            Number(coupon.minimum_order)
        ) {

            return res.status(400).json({
                message:
                    `Minimum order amount is ₹${coupon.minimum_order}`
            });

        }

        let discount = 0;


        // Percentage discount
        if (
            coupon.discount_type === "percentage"
        ) {

            discount =
                amount *
                Number(coupon.discount_value) /
                100;

        }

        // Fixed discount
        else {

            discount =
                Number(coupon.discount_value);

        }


        // Maximum discount limit
        if (
            Number(coupon.maximum_discount) > 0 &&
            discount >
            Number(coupon.maximum_discount)
        ) {

            discount =
                Number(coupon.maximum_discount);

        }


        // Discount cannot exceed subtotal
        if (discount > amount) {

            discount = amount;

        }


        res.json({

            message:
                "Coupon applied successfully",

            coupon: {

                id: coupon.id,

                code: coupon.code,

                discount_type:
                    coupon.discount_type,

                discount_value:
                    coupon.discount_value

            },

            discount:
                Number(
                    discount.toFixed(2)
                )

        });

    } catch (error) {

        res.status(500).json({

            message:
                "Coupon validation failed",

            error:
                error.message

        });

    }

});


// ==========================================
// ADD COUPON
// ==========================================

router.post("/", (req, res) => {

    const {
        code,
        discount_type,
        discount_value,
        minimum_order,
        maximum_discount
    } = req.body;


    if (
        !code ||
        !discount_type ||
        discount_value === undefined
    ) {

        return res.status(400).json({

            message:
                "Required fields are missing"

        });

    }


    if (
        !["percentage", "fixed"]
        .includes(discount_type)
    ) {

        return res.status(400).json({

            message:
                "Invalid discount type"

        });

    }


    try {

        const result = db.prepare(`
            INSERT INTO coupons
            (
                code,
                discount_type,
                discount_value,
                minimum_order,
                maximum_discount,
                active
            )
            VALUES (?, ?, ?, ?, ?, 1)
        `).run(

            code
                .trim()
                .toUpperCase(),

            discount_type,

            Number(discount_value),

            Number(minimum_order || 0),

            Number(maximum_discount || 0)

        );


        res.json({

            message:
                "Coupon created successfully",

            id:
                Number(
                    result.lastInsertRowid
                )

        });

    } catch (error) {

        res.status(400).json({

            message:
                "Coupon already exists or could not be created",

            error:
                error.message

        });

    }

});


// ==========================================
// DEACTIVATE COUPON
// ==========================================

router.delete("/:id", (req, res) => {

    try {

        const coupon = db.prepare(
            "SELECT * FROM coupons WHERE id = ?"
        ).get(req.params.id);


        if (!coupon) {

            return res.status(404).json({

                message:
                    "Coupon not found"

            });

        }


        db.prepare(`
            UPDATE coupons
            SET active = 0
            WHERE id = ?
        `).run(req.params.id);


        res.json({

            message:
                "Coupon deactivated successfully"

        });

    } catch (error) {

        res.status(500).json({

            message:
                "Failed to deactivate coupon",

            error:
                error.message

        });

    }

});


module.exports = router;
