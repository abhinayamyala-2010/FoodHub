
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors({
    origin: [
        "https://abhinayamyala-2010.github.io"
    ]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// HOME AND HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
    res.json({
        message: "FoodHub API is running",
        status: "success"
    });
});

app.get("/api", (req, res) => {
    res.json({
        message: "FoodHub API is running",
        status: "success"
    });
});

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/foods", require("./routes/foodRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin/orders", require("./routes/adminOrderRoutes"));
app.use("/api/reservations", require("./routes/reservationRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/tables", require("./routes/tableRoutes"));

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        message: "API endpoint not found",
        path: req.originalUrl
    });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        message: "Internal server error",
        error: err.message
    });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`FoodHub API running on port ${PORT}`);
});
