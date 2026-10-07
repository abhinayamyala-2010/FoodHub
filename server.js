const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = 5000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ==========================================
// FRONTEND
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


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

// ⭐ REPORTS
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
// HOME
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../frontend/index.html"
        )
    );

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
// 404
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

    console.error(
        "Server Error:",
        err
    );

    res.status(500).json({

        message: "Internal server error",

        error: err.message

    });

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        "================================="
    );

    console.log(
        "FoodHub Server Started"
    );

    console.log(
        `http://localhost:${PORT}`
    );

    console.log(
        "================================="
    );

    console.log(
        "Available APIs:"
    );

    console.log(
        "Foods       : /api/foods"
    );

    console.log(
        "Auth        : /api/auth"
    );

    console.log(
        "Orders      : /api/orders"
    );

    console.log(
        "Admin Orders: /api/admin/orders"
    );

    console.log(
        "Reservations: /api/reservations"
    );

    console.log(
        "Inventory   : /api/inventory"
    );

    console.log(
        "Coupons     : /api/coupons"
    );

    console.log(
        "Reviews     : /api/reviews"
    );

    console.log(
        "Reports     : /api/reports"
    );

    console.log(
        "Customers   : /api/customers"
    );

    console.log(
        "Staff       : /api/staff"
    );

    console.log(
        "Tables      : /api/tables"
    );

    console.log(
        "================================="
    );

});