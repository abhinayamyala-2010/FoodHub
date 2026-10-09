```javascript
const express = require("express");
const cors = require("cors");

// Create Express app
const app = express();

// Render assigns the port through process.env.PORT
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
    res.json({
        message: "FoodHub API is running",
        status: "success"
    });
});

// ==========================================
// API HEALTH CHECK
// ==========================================

app.get("/api", (req, res) => {
    res.json({
        message: "FoodHub API is running",
        status: "success"
    });
});

// ==========================================
// API ROUTES
// ==========================================

app.use(
    "/api/foods",
    require("./routes/foodRoutes")
);

app.use(
    "/api/auth",
    require("./routes/authRoutes")
);

app.use(
    "/api/orders",
    require("./routes/orderRoutes")
);

app.use(
    "/api/admin/orders",
    require("./routes/adminOrderRoutes")
);

app.use(
    "/api/reservations",
    require("./routes/reservationRoutes")
);

app.use(
    "/api/inventory",
    require("./routes/inventoryRoutes")
);

app.use(
    "/api/coupons",
    require("./routes/couponRoutes")
);

app.use(
    "/api/reviews",
    require("./routes/reviewRoutes")
);

app.use(
    "/api/reports",
    require("./routes/reportRoutes")
);

app.use(
    "/api/customers",
    require("./routes/customerRoutes")
);

app.use(
    "/api/staff",
    require("./routes/staffRoutes")
);

app.use(
    "/api/tables",
    require("./routes/tableRoutes")
);

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

app.listen(PORT, () => {
    console.log("=================================");
    console.log("FoodHub Server Started");
    console.log(`Port: ${PORT}`);
    console.log("=================================");
    console.log("Available APIs:");
    console.log("/api/foods");
    console.log("/api/auth");
    console.log("/api/orders");
    console.log("/api/admin/orders");
    console.log("/api/reservations");
    console.log("/api/inventory");
    console.log("/api/coupons");
    console.log("/api/reviews");
    console.log("/api/reports");
    console.log("/api/customers");
    console.log("/api/staff");
    console.log("/api/tables");
    console.log("=================================");
});
```
