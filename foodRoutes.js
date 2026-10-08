const express = require("express");
const db = require("../config/db");

const router = express.Router();

// ===============================
// GET ALL FOODS
// ===============================
router.get("/", (req, res) => {
    try {
        const foods = db.prepare(
            "SELECT * FROM foods ORDER BY id DESC"
        ).all();

        res.json(foods);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get foods",
            error: error.message
        });
    }
});


// ===============================
// GET FOOD BY ID
// ===============================
router.get("/:id", (req, res) => {
    try {
        const food = db.prepare(
            "SELECT * FROM foods WHERE id = ?"
        ).get(req.params.id);

        if (!food) {
            return res.status(404).json({
                message: "Food not found"
            });
        }

        res.json(food);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get food",
            error: error.message
        });
    }
});


// ===============================
// ADD FOOD
// ===============================
router.post("/", (req, res) => {

    const {
        name,
        category,
        price,
        description,
        image
    } = req.body;

    if (!name || !category || !price) {
        return res.status(400).json({
            message: "Name, category and price are required"
        });
    }

    try {

        const result = db.prepare(`
            INSERT INTO foods
            (name, category, price, description, image)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            name,
            category,
            Number(price),
            description || "",
            image || ""
        );

        res.json({
            message: "Food added successfully",
            id: result.lastInsertRowid
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to add food",
            error: error.message
        });
    }
});


// ===============================
// UPDATE FOOD
// ===============================
router.put("/:id", (req, res) => {

    const {
        name,
        category,
        price,
        description,
        image,
        available
    } = req.body;

    try {

        const food = db.prepare(
            "SELECT * FROM foods WHERE id = ?"
        ).get(req.params.id);

        if (!food) {
            return res.status(404).json({
                message: "Food not found"
            });
        }

        db.prepare(`
            UPDATE foods
            SET
                name = ?,
                category = ?,
                price = ?,
                description = ?,
                image = ?,
                available = ?
            WHERE id = ?
        `).run(
            name,
            category,
            Number(price),
            description || "",
            image || "",
            available === undefined ? 1 : Number(available),
            req.params.id
        );

        res.json({
            message: "Food updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to update food",
            error: error.message
        });
    }
});


// ===============================
// DELETE FOOD
// ===============================
router.delete("/:id", (req, res) => {

    try {

        const food = db.prepare(
            "SELECT * FROM foods WHERE id = ?"
        ).get(req.params.id);

        if (!food) {
            return res.status(404).json({
                message: "Food not found"
            });
        }

        db.prepare(
            "DELETE FROM foods WHERE id = ?"
        ).run(req.params.id);

        res.json({
            message: "Food deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to delete food",
            error: error.message
        });
    }
});


// ===============================
// SAMPLE FOODS
// ===============================
router.get("/sample/add", (req, res) => {

    const foods = [
        ["Chicken Biryani", "Biryani", 220, "Spicy chicken biryani", "biryani.jpg"],
        ["Veg Biryani", "Biryani", 180, "Delicious vegetable biryani", "vegbiryani.jpg"],
        ["Paneer Butter Masala", "Main Course", 200, "Creamy paneer butter masala", "paneer.jpg"],
        ["Chicken 65", "Starters", 180, "Crispy spicy chicken starter", "chicken65.jpg"],
        ["Masala Dosa", "South Indian", 80, "Crispy dosa with potato masala", "dosa.jpg"],
        ["Idly", "South Indian", 60, "Soft idly with sambar", "idly.jpg"],
        ["Veg Fried Rice", "Rice", 150, "Delicious vegetable fried rice", "friedrice.jpg"],
        ["Chicken Noodles", "Noodles", 170, "Spicy chicken noodles", "noodles.jpg"],
        ["Gulab Jamun", "Dessert", 90, "Sweet gulab jamun", "gulabjamun.jpg"],
        ["Fresh Lime Soda", "Drinks", 60, "Refreshing lime soda", "lime.jpg"]
    ];

    try {

        const insert = db.prepare(`
            INSERT INTO foods
            (name, category, price, description, image)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (const food of foods) {
            insert.run(...food);
        }

        res.json({
            message: "Sample foods added successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to add sample foods",
            error: error.message
        });
    }
});


module.exports = router;