const express = require("express");
const db = require("../config/db");

const router = express.Router();


/* ==========================================
   GET ALL TABLES
========================================== */

router.get("/", (req, res) => {

    try {

        const tables = db.prepare(`
            SELECT
                id,
                table_number,
                seats,
                status
            FROM tables
            ORDER BY table_number ASC
        `).all();

        res.json(tables);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to load tables",
            error: error.message
        });

    }

});


/* ==========================================
   GET TABLE BY ID
========================================== */

router.get("/:id", (req, res) => {

    try {

        const table = db.prepare(`
            SELECT
                id,
                table_number,
                seats,
                status
            FROM tables
            WHERE id = ?
        `).get(req.params.id);

        if (!table) {

            return res.status(404).json({
                message: "Table not found"
            });

        }

        res.json(table);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to load table",
            error: error.message
        });

    }

});


/* ==========================================
   ADD TABLE
========================================== */

router.post("/", (req, res) => {

    const {
        table_number,
        seats
    } = req.body;


    if (
        table_number === undefined ||
        seats === undefined
    ) {

        return res.status(400).json({
            message:
                "Table number and seats are required"
        });

    }


    const tableNumber =
        Number(table_number);

    const seatCount =
        Number(seats);


    if (
        !Number.isInteger(tableNumber) ||
        tableNumber <= 0
    ) {

        return res.status(400).json({
            message:
                "Invalid table number"
        });

    }


    if (
        !Number.isInteger(seatCount) ||
        seatCount <= 0
    ) {

        return res.status(400).json({
            message:
                "Invalid seat count"
        });

    }


    try {

        const existing =
            db.prepare(`
                SELECT id
                FROM tables
                WHERE table_number = ?
            `).get(tableNumber);


        if (existing) {

            return res.status(400).json({
                message:
                    "Table number already exists"
            });

        }


        const result =
            db.prepare(`
                INSERT INTO tables
                (
                    table_number,
                    seats,
                    status
                )
                VALUES (?, ?, 'Available')
            `).run(
                tableNumber,
                seatCount
            );


        res.json({

            message:
                "Table added successfully",

            tableId:
                Number(
                    result.lastInsertRowid
                )

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to add table",

            error:
                error.message

        });

    }

});


/* ==========================================
   UPDATE TABLE
========================================== */

router.put("/:id", (req, res) => {

    const {
        table_number,
        seats,
        status
    } = req.body;


    try {

        const table =
            db.prepare(`
                SELECT id
                FROM tables
                WHERE id = ?
            `).get(req.params.id);


        if (!table) {

            return res.status(404).json({

                message:
                    "Table not found"

            });

        }


        const allowedStatuses = [

            "Available",
            "Reserved",
            "Occupied"

        ];


        if (
            status &&
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                message:
                    "Invalid table status"

            });

        }


        if (table_number !== undefined) {

            const newTableNumber =
                Number(table_number);


            if (
                !Number.isInteger(
                    newTableNumber
                ) ||
                newTableNumber <= 0
            ) {

                return res.status(400).json({

                    message:
                        "Invalid table number"

                });

            }


            const duplicate =
                db.prepare(`
                    SELECT id
                    FROM tables
                    WHERE table_number = ?
                    AND id != ?
                `).get(
                    newTableNumber,
                    req.params.id
                );


            if (duplicate) {

                return res.status(400).json({

                    message:
                        "Table number already exists"

                });

            }

        }


        if (seats !== undefined) {

            const newSeats =
                Number(seats);


            if (
                !Number.isInteger(
                    newSeats
                ) ||
                newSeats <= 0
            ) {

                return res.status(400).json({

                    message:
                        "Invalid seat count"

                });

            }

        }


        const current =
            db.prepare(`
                SELECT
                    table_number,
                    seats,
                    status
                FROM tables
                WHERE id = ?
            `).get(req.params.id);


        const newTableNumber =
            table_number !== undefined
                ? Number(table_number)
                : current.table_number;


        const newSeats =
            seats !== undefined
                ? Number(seats)
                : current.seats;


        const newStatus =
            status ||
            current.status;


        db.prepare(`
            UPDATE tables

            SET
                table_number = ?,
                seats = ?,
                status = ?

            WHERE id = ?
        `).run(
            newTableNumber,
            newSeats,
            newStatus,
            req.params.id
        );


        res.json({

            message:
                "Table updated successfully"

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to update table",

            error:
                error.message

        });

    }

});


/* ==========================================
   UPDATE TABLE STATUS
========================================== */

router.patch("/:id/status", (req, res) => {

    const {
        status
    } = req.body;


    const allowedStatuses = [

        "Available",
        "Reserved",
        "Occupied"

    ];


    if (
        !allowedStatuses.includes(status)
    ) {

        return res.status(400).json({

            message:
                "Invalid table status"

        });

    }


    try {

        const table =
            db.prepare(`
                SELECT id
                FROM tables
                WHERE id = ?
            `).get(req.params.id);


        if (!table) {

            return res.status(404).json({

                message:
                    "Table not found"

            });

        }


        db.prepare(`
            UPDATE tables
            SET status = ?
            WHERE id = ?
        `).run(
            status,
            req.params.id
        );


        res.json({

            message:
                "Table status updated successfully"

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to update table status",

            error:
                error.message

        });

    }

});


/* ==========================================
   GET TABLES WITH RESERVATION INFORMATION
========================================== */

router.get(
    "/reservation-status/all",
    (req, res) => {

        try {

            const tables =
                db.prepare(`

                    SELECT

                        tables.id,

                        tables.table_number,

                        tables.seats,

                        tables.status,

                        reservations.id
                        AS reservation_id,

                        reservations.reservation_date,

                        reservations.reservation_time,

                        reservations.guests,

                        reservations.status
                        AS reservation_status,

                        users.name
                        AS customer_name,

                        users.email
                        AS customer_email

                    FROM tables

                    LEFT JOIN reservations

                    ON tables.id =
                       reservations.table_id

                    AND reservations.status =
                        'Booked'

                    LEFT JOIN users

                    ON reservations.user_id =
                       users.id

                    ORDER BY
                        tables.table_number ASC

                `).all();


            res.json(tables);


        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to load table reservation status",

                error:
                    error.message

            });

        }

    }
);


/* ==========================================
   GET TABLE STATUS FOR SPECIFIC DATE/TIME
========================================== */

router.get(
    "/availability/check",
    (req, res) => {

        const {
            date,
            time
        } = req.query;


        if (!date || !time) {

            return res.status(400).json({

                message:
                    "Date and time are required"

            });

        }


        try {

            const tables =
                db.prepare(`

                    SELECT

                        tables.id,

                        tables.table_number,

                        tables.seats,

                        tables.status
                        AS table_status,

                        reservations.id
                        AS reservation_id,

                        reservations.status
                        AS reservation_status,

                        reservations.guests

                    FROM tables

                    LEFT JOIN reservations

                    ON tables.id =
                       reservations.table_id

                    AND reservations.reservation_date = ?

                    AND reservations.reservation_time = ?

                    AND reservations.status =
                        'Booked'

                    ORDER BY
                        tables.table_number ASC

                `).all(
                    date,
                    time
                );


            const result =
                tables.map(
                    table => {

                        let availability =
                            "Available";


                        if (
                            table.table_status ===
                            "Occupied"
                        ) {

                            availability =
                                "Occupied";

                        } else if (
                            table.reservation_id
                        ) {

                            availability =
                                "Reserved";

                        } else if (
                            table.table_status ===
                            "Reserved"
                        ) {

                            availability =
                                "Reserved";

                        }


                        return {

                            id:
                                table.id,

                            table_number:
                                table.table_number,

                            seats:
                                table.seats,

                            status:
                                availability,

                            reservation_id:
                                table.reservation_id,

                            guests:
                                table.guests || 0

                        };

                    }
                );


            res.json(result);


        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to check table availability",

                error:
                    error.message

            });

        }

    }
);


/* ==========================================
   DELETE TABLE
========================================== */

router.delete("/:id", (req, res) => {

    try {

        const table =
            db.prepare(`
                SELECT *
                FROM tables
                WHERE id = ?
            `).get(req.params.id);


        if (!table) {

            return res.status(404).json({

                message:
                    "Table not found"

            });

        }


        if (
            table.status !==
            "Available"
        ) {

            return res.status(400).json({

                message:
                    "Only available tables can be deleted"

            });

        }


        // --------------------------------------
        // CHECK EXISTING RESERVATIONS
        // --------------------------------------

        const reservation =
            db.prepare(`

                SELECT id

                FROM reservations

                WHERE table_id = ?

                AND status = 'Booked'

                LIMIT 1

            `).get(
                req.params.id
            );


        if (reservation) {

            return res.status(400).json({

                message:
                    "Table has an active reservation and cannot be deleted"

            });

        }


        db.prepare(`
            DELETE FROM tables
            WHERE id = ?
        `).run(
            req.params.id
        );


        res.json({

            message:
                "Table deleted successfully"

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to delete table",

            error:
                error.message

        });

    }

});


/* ==========================================
   TABLE STATISTICS
========================================== */

router.get(
    "/stats/summary",
    (req, res) => {

        try {

            const total =
                db.prepare(`
                    SELECT
                        COUNT(*) AS count
                    FROM tables
                `).get();


            const available =
                db.prepare(`
                    SELECT
                        COUNT(*) AS count
                    FROM tables
                    WHERE status = 'Available'
                `).get();


            const reserved =
                db.prepare(`
                    SELECT
                        COUNT(*) AS count
                    FROM tables
                    WHERE status = 'Reserved'
                `).get();


            const occupied =
                db.prepare(`
                    SELECT
                        COUNT(*) AS count
                    FROM tables
                    WHERE status = 'Occupied'
                `).get();


            const activeReservations =
                db.prepare(`
                    SELECT
                        COUNT(*) AS count
                    FROM reservations
                    WHERE status = 'Booked'
                `).get();


            res.json({

                totalTables:
                    Number(
                        total.count || 0
                    ),

                availableTables:
                    Number(
                        available.count || 0
                    ),

                reservedTables:
                    Number(
                        reserved.count || 0
                    ),

                occupiedTables:
                    Number(
                        occupied.count || 0
                    ),

                activeReservations:
                    Number(
                        activeReservations.count || 0
                    )

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to load table statistics",

                error:
                    error.message

            });

        }

    }
);


module.exports = router;
