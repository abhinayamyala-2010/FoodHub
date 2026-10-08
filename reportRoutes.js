const express = require("express");
const router = express.Router();

const db = require("../config/db");

// ==========================================
// GET REPORT SUMMARY
// GET /api/reports
// ==========================================
router.get("/", (req, res) => {
    try {

        // ------------------------------------------
        // TOTAL ORDERS
        // ------------------------------------------
        const totalOrdersResult = db.prepare(`
            SELECT COUNT(*) AS total
            FROM orders
        `).get();

        const totalOrders = Number(totalOrdersResult.total || 0);


        // ------------------------------------------
        // COMPLETED ORDERS
        // ------------------------------------------
        const completedOrdersResult = db.prepare(`
            SELECT COUNT(*) AS total
            FROM orders
            WHERE status = 'Completed'
        `).get();

        const completedOrders =
            Number(completedOrdersResult.total || 0);


        // ------------------------------------------
        // PENDING ORDERS
        // ------------------------------------------
        const pendingOrdersResult = db.prepare(`
            SELECT COUNT(*) AS total
            FROM orders
            WHERE status IN (
                'Pending',
                'Confirmed',
                'Preparing',
                'Ready',
                'Served'
            )
        `).get();

        const pendingOrders =
            Number(pendingOrdersResult.total || 0);


        // ------------------------------------------
        // TOTAL REVENUE
        // ------------------------------------------
        const totalRevenueResult = db.prepare(`
            SELECT COALESCE(SUM(total), 0) AS total
            FROM orders
            WHERE status != 'Cancelled'
        `).get();

        const totalRevenue =
            Number(totalRevenueResult.total || 0);


        // ------------------------------------------
        // TODAY'S REVENUE
        // ------------------------------------------
        const todayRevenueResult = db.prepare(`
            SELECT COALESCE(SUM(total), 0) AS total
            FROM orders
            WHERE status != 'Cancelled'
            AND DATE(order_date) = DATE('now', 'localtime')
        `).get();

        const todayRevenue =
            Number(todayRevenueResult.total || 0);


        // ------------------------------------------
        // AVERAGE ORDER VALUE
        // ------------------------------------------
        const averageOrderValue =
            totalOrders > 0
                ? totalRevenue / totalOrders
                : 0;


        // ------------------------------------------
        // PAID ORDERS
        // ------------------------------------------
        const paidOrdersResult = db.prepare(`
            SELECT COUNT(*) AS total
            FROM orders
            WHERE payment_status = 'Paid'
        `).get();

        const paidOrders =
            Number(paidOrdersResult.total || 0);


        // ------------------------------------------
        // PENDING PAYMENTS
        // ------------------------------------------
        const pendingPaymentsResult = db.prepare(`
            SELECT COUNT(*) AS total
            FROM orders
            WHERE payment_status = 'Pending'
        `).get();

        const pendingPayments =
            Number(pendingPaymentsResult.total || 0);


        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------
        res.json({
            totalOrders,
            completedOrders,
            pendingOrders,

            totalRevenue:
                Number(totalRevenue.toFixed(2)),

            todayRevenue:
                Number(todayRevenue.toFixed(2)),

            averageOrderValue:
                Number(averageOrderValue.toFixed(2)),

            paidOrders,
            pendingPayments
        });

    } catch (error) {

        console.error(
            "Reports API Error:",
            error
        );

        res.status(500).json({
            message: "Failed to generate reports",
            error: error.message
        });
    }
});


// ==========================================
// GET SALES REPORT BY DATE
// GET /api/reports/sales
// ==========================================
router.get("/sales", (req, res) => {

    try {

        const {
            from,
            to
        } = req.query;

        let query = `
            SELECT
                DATE(order_date) AS order_date,
                COUNT(*) AS total_orders,
                COALESCE(SUM(total), 0) AS revenue
            FROM orders
            WHERE status != 'Cancelled'
        `;

        const params = [];

        if (from) {
            query += ` AND DATE(order_date) >= DATE(?) `;
            params.push(from);
        }

        if (to) {
            query += ` AND DATE(order_date) <= DATE(?) `;
            params.push(to);
        }

        query += `
            GROUP BY DATE(order_date)
            ORDER BY DATE(order_date) DESC
        `;

        const sales = db.prepare(query).all(...params);

        res.json(sales);

    } catch (error) {

        console.error(
            "Sales report error:",
            error
        );

        res.status(500).json({
            message: "Failed to generate sales report",
            error: error.message
        });
    }
});


// ==========================================
// GET TOP FOODS
// GET /api/reports/top-foods
// ==========================================
router.get("/top-foods", (req, res) => {

    try {

        const foods = db.prepare(`
            SELECT
                f.id,
                f.name,
                SUM(oi.quantity) AS quantity_sold,
                SUM(oi.quantity * oi.price) AS revenue
            FROM order_items oi
            INNER JOIN foods f
                ON oi.food_id = f.id
            INNER JOIN orders o
                ON oi.order_id = o.id
            WHERE o.status != 'Cancelled'
            GROUP BY f.id, f.name
            ORDER BY quantity_sold DESC
            LIMIT 10
        `).all();

        res.json(foods);

    } catch (error) {

        console.error(
            "Top foods report error:",
            error
        );

        res.status(500).json({
            message: "Failed to generate top foods report",
            error: error.message
        });
    }
});


module.exports = router;