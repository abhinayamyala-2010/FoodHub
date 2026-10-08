const express = require("express");
const db = require("../config/db");

const router = express.Router();


/* ==========================================
   GET ALL CUSTOMERS
========================================== */

router.get("/", (req, res) => {

    try {

        const customers = db.prepare(`
            SELECT
                users.id,
                users.name,
                users.email,
                users.role,

                COUNT(DISTINCT orders.id)
                    AS total_orders,

                COALESCE(
                    SUM(
                        CASE
                            WHEN orders.payment_status = 'Paid'
                            OR orders.status = 'Completed'
                            THEN orders.total
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_spent,

                MAX(orders.order_date)
                    AS last_order_date

            FROM users

            LEFT JOIN orders
            ON users.id = orders.user_id

            WHERE users.role = 'customer'

            GROUP BY
                users.id,
                users.name,
                users.email,
                users.role

            ORDER BY users.id DESC
        `).all();


        res.json(customers);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to load customers",

            error:
                error.message

        });

    }

});


/* ==========================================
   GET CUSTOMER BY ID
========================================== */

router.get("/:id", (req, res) => {

    try {

        const customer = db.prepare(`
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE id = ?
            AND role = 'customer'
        `).get(
            req.params.id
        );


        if (!customer) {

            return res.status(404).json({

                message:
                    "Customer not found"

            });

        }


        const orderSummary = db.prepare(`
            SELECT

                COUNT(*) AS total_orders,

                COALESCE(
                    SUM(
                        CASE
                            WHEN payment_status = 'Paid'
                            OR status = 'Completed'
                            THEN total
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_spent

            FROM orders

            WHERE user_id = ?
        `).get(
            req.params.id
        );


        const orders = db.prepare(`
            SELECT
                id,
                subtotal,
                gst,
                delivery_charge,
                discount,
                total,
                status,
                payment_method,
                payment_status,
                order_type,
                order_date

            FROM orders

            WHERE user_id = ?

            ORDER BY id DESC
        `).all(
            req.params.id
        );


        res.json({

            customer,

            summary: {

                totalOrders:
                    Number(
                        orderSummary.total_orders || 0
                    ),

                totalSpent:
                    Number(
                        orderSummary.total_spent || 0
                    )

            },

            orders

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to load customer details",

            error:
                error.message

        });

    }

});


/* ==========================================
   SEARCH CUSTOMERS
========================================== */

router.get("/search/:keyword", (req, res) => {

    try {

        const keyword =
            `%${req.params.keyword}%`;


        const customers = db.prepare(`
            SELECT
                users.id,
                users.name,
                users.email,

                COUNT(
                    DISTINCT orders.id
                ) AS total_orders,

                COALESCE(
                    SUM(
                        CASE
                            WHEN orders.payment_status = 'Paid'
                            OR orders.status = 'Completed'
                            THEN orders.total
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_spent

            FROM users

            LEFT JOIN orders
            ON users.id = orders.user_id

            WHERE users.role = 'customer'

            AND (
                users.name LIKE ?
                OR users.email LIKE ?
            )

            GROUP BY
                users.id,
                users.name,
                users.email

            ORDER BY users.id DESC
        `).all(
            keyword,
            keyword
        );


        res.json(customers);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Customer search failed",

            error:
                error.message

        });

    }

});


/* ==========================================
   CUSTOMER STATISTICS
========================================== */

router.get("/stats/summary", (req, res) => {

    try {

        const totalCustomers =
            db.prepare(`
                SELECT COUNT(*) AS count
                FROM users
                WHERE role = 'customer'
            `).get();


        const activeCustomers =
            db.prepare(`
                SELECT COUNT(
                    DISTINCT user_id
                ) AS count

                FROM orders

                WHERE user_id IS NOT NULL
            `).get();


        const newCustomers =
            db.prepare(`
                SELECT COUNT(*) AS count
                FROM users
                WHERE role = 'customer'
            `).get();


        res.json({

            totalCustomers:
                Number(
                    totalCustomers.count || 0
                ),

            activeCustomers:
                Number(
                    activeCustomers.count || 0
                ),

            newCustomers:
                Number(
                    newCustomers.count || 0
                )

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to load customer statistics",

            error:
                error.message

        });

    }

});


module.exports = router;
