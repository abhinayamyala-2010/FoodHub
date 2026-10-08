const express = require("express");
const db = require("../config/db");

const router = express.Router();

// REGISTER
router.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {
        const existingUser = db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).get(email);

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const result = db.prepare(`
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, 'customer')
        `).run(name, email, password);

        res.json({
            message: "Registration successful",
            userId: result.lastInsertRowid
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

// LOGIN
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {
        const user = db.prepare(`
            SELECT id, name, email, role
            FROM users
            WHERE email = ? AND password = ?
        `).get(email, password);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful",
            user: user
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});

module.exports = router;