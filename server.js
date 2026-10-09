```javascript
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home
app.get("/", (req, res) => {
    res.json({
        message: "FoodHub API is running",
        status: "success"
    });
});

// Health check
app.get("/api", (req, res) => {
    res.json({
        message: "FoodHub API is running",
        status: "success"
    });
});

// API routes
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

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "API endpoint not found",
        path: req.originalUrl
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({
        message: "Internal server error",
        error: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`FoodHub Server Started on port ${PORT}`);
});
```
