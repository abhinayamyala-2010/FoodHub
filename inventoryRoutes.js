const express = require("express");
const router = express.Router();

const db = require("../config/db");


// ==========================================
// GET ALL INVENTORY
// ==========================================

router.get("/", (req, res) => {

    try {

        const inventory = db.prepare(`
            SELECT *
            FROM inventory
            ORDER BY id DESC
        `).all();

        res.json(inventory);

    } catch (error) {

        console.error("INVENTORY GET ERROR:", error);

        res.status(500).json({
            message: "Failed to load inventory",
            error: error.message
        });

    }

});


// ==========================================
// ADD INGREDIENT
// ==========================================

router.post("/", (req, res) => {

    const {
        name,
        unit,
        stock,
        minimum_stock,
        price,
        supplier
    } = req.body;

    if (!name || !unit) {

        return res.status(400).json({
            message: "Name and unit are required"
        });

    }

    try {

        const result = db.prepare(`
            INSERT INTO inventory
            (
                name,
                unit,
                stock,
                minimum_stock,
                price,
                supplier
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            name,
            unit,
            Number(stock) || 0,
            Number(minimum_stock) || 0,
            Number(price) || 0,
            supplier || ""
        );

        res.status(201).json({
            message: "Ingredient added successfully",
            id: Number(result.lastInsertRowid)
        });

    } catch (error) {

        console.error("INVENTORY ADD ERROR:", error);

        res.status(500).json({
            message: "Failed to add ingredient",
            error: error.message
        });

    }

});


// ==========================================
// UPDATE INGREDIENT
// ==========================================

router.put("/:id", (req, res) => {

    const { id } = req.params;

    const {
        name,
        unit,
        stock,
        minimum_stock,
        price,
        supplier
    } = req.body;

    try {

        const result = db.prepare(`
            UPDATE inventory
            SET
                name = ?,
                unit = ?,
                stock = ?,
                minimum_stock = ?,
                price = ?,
                supplier = ?
            WHERE id = ?
        `).run(
            name,
            unit,
            Number(stock) || 0,
            Number(minimum_stock) || 0,
            Number(price) || 0,
            supplier || "",
            Number(id)
        );

        if (result.changes === 0) {

            return res.status(404).json({
                message: "Ingredient not found"
            });

        }

        res.json({
            message: "Ingredient updated successfully"
        });

    } catch (error) {

        console.error("INVENTORY UPDATE ERROR:", error);

        res.status(500).json({
            message: "Failed to update ingredient",
            error: error.message
        });

    }

});


// ==========================================
// DELETE INGREDIENT
// ==========================================

router.delete("/:id", (req, res) => {

    const { id } = req.params;

    try {

        const result = db.prepare(`
            DELETE FROM inventory
            WHERE id = ?
        `).run(Number(id));

        if (result.changes === 0) {

            return res.status(404).json({
                message: "Ingredient not found"
            });

        }

        res.json({
            message: "Ingredient deleted successfully"
        });

    } catch (error) {

        console.error("INVENTORY DELETE ERROR:", error);

        res.status(500).json({
            message: "Failed to delete ingredient",
            error: error.message
        });

    }

});


// ==========================================
// PURCHASE STOCK
// ==========================================

router.post("/purchase", (req, res) => {

    const {
        ingredient_id,
        inventory_id,
        quantity,
        price,
        supplier
    } = req.body;

    // Accept either ingredient_id or inventory_id
    const ingredientId = ingredient_id || inventory_id;

    const qty = Number(quantity);

    if (!ingredientId) {

        return res.status(400).json({
            message: "Ingredient is required"
        });

    }

    if (!qty || qty <= 0) {

        return res.status(400).json({
            message: "Quantity must be greater than 0"
        });

    }

    try {

        const ingredient = db.prepare(`
            SELECT *
            FROM inventory
            WHERE id = ?
        `).get(Number(ingredientId));

        if (!ingredient) {

            return res.status(404).json({
                message: "Ingredient not found"
            });

        }

        // Increase stock
        db.prepare(`
            UPDATE inventory
            SET stock = stock + ?
            WHERE id = ?
        `).run(
            qty,
            Number(ingredientId)
        );

        // Save purchase history
        db.prepare(`
            INSERT INTO inventory_purchases
            (
                ingredient_id,
                quantity,
                price,
                supplier
            )
            VALUES (?, ?, ?, ?)
        `).run(
            Number(ingredientId),
            qty,
            Number(price) || 0,
            supplier || ingredient.supplier || ""
        );

        res.json({
            message: "Stock purchased successfully",
            ingredient_id: Number(ingredientId),
            ingredient_name: ingredient.name,
            quantity_added: qty,
            new_stock: Number(ingredient.stock) + qty
        });

    } catch (error) {

        console.error(
            "PURCHASE ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to purchase stock",
            error: error.message
        });

    }

});


// ==========================================
// WASTAGE STOCK
// ==========================================

router.post("/wastage", (req, res) => {

    const {
        ingredient_id,
        inventory_id,
        quantity,
        reason
    } = req.body;

    const ingredientId = ingredient_id || inventory_id;

    const qty = Number(quantity);

    if (!ingredientId) {

        return res.status(400).json({
            message: "Ingredient is required"
        });

    }

    if (!qty || qty <= 0) {

        return res.status(400).json({
            message: "Quantity must be greater than 0"
        });

    }

    try {

        const ingredient = db.prepare(`
            SELECT *
            FROM inventory
            WHERE id = ?
        `).get(Number(ingredientId));

        if (!ingredient) {

            return res.status(404).json({
                message: "Ingredient not found"
            });

        }

        if (Number(ingredient.stock) < qty) {

            return res.status(400).json({
                message: "Insufficient stock"
            });

        }

        // Reduce stock
        db.prepare(`
            UPDATE inventory
            SET stock = stock - ?
            WHERE id = ?
        `).run(
            qty,
            Number(ingredientId)
        );

        // Save wastage in purchase/history table
        db.prepare(`
            INSERT INTO inventory_wastage
            (
                ingredient_id,
                quantity,
                reason
            )
            VALUES (?, ?, ?)
        `).run(
            Number(ingredientId),
            qty,
            reason || ""
        );

        res.json({
            message: "Wastage recorded successfully",
            ingredient_id: Number(ingredientId),
            ingredient_name: ingredient.name,
            quantity_wasted: qty,
            new_stock: Number(ingredient.stock) - qty
        });

    } catch (error) {

        console.error(
            "WASTAGE ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to record wastage",
            error: error.message
        });

    }

});


// ==========================================
// INVENTORY USAGE
// ==========================================

router.get("/usage/all", (req, res) => {

    try {

        const usage = db.prepare(`
            SELECT
                fi.id,
                fi.food_id,
                fi.ingredient_id,
                fi.quantity,
                fi.unit,
                f.name AS food_name,
                i.name AS ingredient_name
            FROM food_ingredients fi
            LEFT JOIN foods f
                ON fi.food_id = f.id
            LEFT JOIN inventory i
                ON fi.ingredient_id = i.id
            ORDER BY fi.id DESC
        `).all();

        res.json(usage);

    } catch (error) {

        console.error("USAGE GET ERROR:", error);

        res.status(500).json({
            message: "Failed to load ingredient usage",
            error: error.message
        });

    }

});


// ==========================================
// ASSIGN INGREDIENT TO FOOD
// ==========================================

router.post("/usage", (req, res) => {

    const {
        food_id,
        ingredient_id,
        quantity,
        unit
    } = req.body;

    if (!food_id || !ingredient_id || !quantity) {

        return res.status(400).json({
            message: "Food, ingredient and quantity are required"
        });

    }

    try {

        const result = db.prepare(`
            INSERT INTO food_ingredients
            (
                food_id,
                ingredient_id,
                quantity,
                unit
            )
            VALUES (?, ?, ?, ?)
        `).run(
            Number(food_id),
            Number(ingredient_id),
            Number(quantity),
            unit || ""
        );

        res.status(201).json({
            message: "Ingredient assigned successfully",
            id: Number(result.lastInsertRowid)
        });

    } catch (error) {

        console.error("USAGE ADD ERROR:", error);

        res.status(500).json({
            message: "Failed to assign ingredient",
            error: error.message
        });

    }

});


// ==========================================
// GET INVENTORY HISTORY
// ==========================================

router.get("/history/all", (req, res) => {

    try {

        const purchases = db.prepare(`
            SELECT
                ip.id,
                i.name AS ingredient_name,
                ip.quantity,
                i.unit,
                ip.price,
                ip.supplier,
                ip.purchase_date AS date,
                'Purchase' AS type
            FROM inventory_purchases ip
            LEFT JOIN inventory i
                ON ip.ingredient_id = i.id
        `).all();

        const wastage = db.prepare(`
            SELECT
                iw.id,
                i.name AS ingredient_name,
                iw.quantity,
                i.unit,
                0 AS price,
                iw.reason AS supplier,
                iw.wastage_date AS date,
                'Wastage' AS type
            FROM inventory_wastage iw
            LEFT JOIN inventory i
                ON iw.ingredient_id = i.id
        `).all();

        const history = [...purchases, ...wastage];

        history.sort((a, b) =>
            String(b.date).localeCompare(String(a.date))
        );

        res.json(history);

    } catch (error) {

        console.error("HISTORY ERROR:", error);

        res.status(500).json({
            message: "Failed to load inventory history",
            error: error.message
        });

    }

});


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;