const express = require("express");
const db = require("../config/db");

const router = express.Router();


/* ==========================================
   GET ALL STAFF
========================================== */

router.get("/", (req, res) => {

    try {

        const staff = db.prepare(`
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE role IN (
                'admin',
                'staff',
                'manager',
                'chef',
                'cashier',
                'delivery'
            )
            ORDER BY id DESC
        `).all();


        res.json(staff);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to load staff",

            error:
                error.message

        });

    }

});


/* ==========================================
   GET STAFF BY ID
========================================== */

router.get("/:id", (req, res) => {

    try {

        const staff = db.prepare(`
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE id = ?
            AND role IN (
                'admin',
                'staff',
                'manager',
                'chef',
                'cashier',
                'delivery'
            )
        `).get(
            req.params.id
        );


        if (!staff) {

            return res.status(404).json({

                message:
                    "Staff member not found"

            });

        }


        res.json(staff);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to load staff details",

            error:
                error.message

        });

    }

});


/* ==========================================
   ADD STAFF
========================================== */

router.post("/", (req, res) => {

    const {
        name,
        email,
        password,
        role
    } = req.body;


    if (
        !name ||
        !email ||
        !password ||
        !role
    ) {

        return res.status(400).json({

            message:
                "Name, email, password and role are required"

        });

    }


    const allowedRoles = [
        "admin",
        "staff",
        "manager",
        "chef",
        "cashier",
        "delivery"
    ];


    if (
        !allowedRoles.includes(
            role.toLowerCase()
        )
    ) {

        return res.status(400).json({

            message:
                "Invalid staff role"

        });

    }


    try {

        const existingUser =
            db.prepare(`
                SELECT id
                FROM users
                WHERE email = ?
            `).get(
                email.trim()
            );


        if (existingUser) {

            return res.status(400).json({

                message:
                    "Email already exists"

            });

        }


        const result =
            db.prepare(`
                INSERT INTO users
                (
                    name,
                    email,
                    password,
                    role
                )
                VALUES (?, ?, ?, ?)
            `).run(
                name.trim(),
                email.trim(),
                password,
                role.toLowerCase()
            );


        res.json({

            message:
                "Staff added successfully",

            staffId:
                Number(
                    result.lastInsertRowid
                )

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to add staff",

            error:
                error.message

        });

    }

});


/* ==========================================
   UPDATE STAFF
========================================== */

router.put("/:id", (req, res) => {

    const {
        name,
        email,
        password,
        role
    } = req.body;


    try {

        const staff =
            db.prepare(`
                SELECT id
                FROM users
                WHERE id = ?
                AND role IN (
                    'admin',
                    'staff',
                    'manager',
                    'chef',
                    'cashier',
                    'delivery'
                )
            `).get(
                req.params.id
            );


        if (!staff) {

            return res.status(404).json({

                message:
                    "Staff member not found"

            });

        }


        const allowedRoles = [
            "admin",
            "staff",
            "manager",
            "chef",
            "cashier",
            "delivery"
        ];


        if (
            role &&
            !allowedRoles.includes(
                role.toLowerCase()
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid staff role"

            });

        }


        if (email) {

            const duplicate =
                db.prepare(`
                    SELECT id
                    FROM users
                    WHERE email = ?
                    AND id != ?
                `).get(
                    email.trim(),
                    req.params.id
                );


            if (duplicate) {

                return res.status(400).json({

                    message:
                        "Email already exists"

                });

            }

        }


        if (password) {

            db.prepare(`
                UPDATE users
                SET
                    name = ?,
                    email = ?,
                    password = ?,
                    role = ?
                WHERE id = ?
            `).run(
                name,
                email,
                password,
                role
                    ? role.toLowerCase()
                    : undefined,
                req.params.id
            );

        } else {

            db.prepare(`
                UPDATE users
                SET
                    name = ?,
                    email = ?,
                    role = ?
                WHERE id = ?
            `).run(
                name,
                email,
                role
                    ? role.toLowerCase()
                    : undefined,
                req.params.id
            );

        }


        res.json({

            message:
                "Staff updated successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to update staff",

            error:
                error.message

        });

    }

});


/* ==========================================
   DELETE STAFF
========================================== */

router.delete("/:id", (req, res) => {

    try {

        const staff =
            db.prepare(`
                SELECT id
                FROM users
                WHERE id = ?
                AND role IN (
                    'admin',
                    'staff',
                    'manager',
                    'chef',
                    'cashier',
                    'delivery'
                )
            `).get(
                req.params.id
            );


        if (!staff) {

            return res.status(404).json({

                message:
                    "Staff member not found"

            });

        }


        db.prepare(`
            DELETE FROM users
            WHERE id = ?
        `).run(
            req.params.id
        );


        res.json({

            message:
                "Staff deleted successfully"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to delete staff",

            error:
                error.message

        });

    }

});


/* ==========================================
   SEARCH STAFF
========================================== */

router.get("/search/:keyword", (req, res) => {

    try {

        const keyword =
            `%${req.params.keyword}%`;


        const staff = db.prepare(`
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE role IN (
                'admin',
                'staff',
                'manager',
                'chef',
                'cashier',
                'delivery'
            )
            AND (
                name LIKE ?
                OR email LIKE ?
                OR role LIKE ?
            )
            ORDER BY id DESC
        `).all(
            keyword,
            keyword,
            keyword
        );


        res.json(staff);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Staff search failed",

            error:
                error.message

        });

    }

});


module.exports = router;
