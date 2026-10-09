const express = require("express");
const db = require("../config/db");

const router = express.Router();


// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

function isValidDate(date) {

    return /^\d{4}-\d{2}-\d{2}$/.test(date);

}


function isValidTime(time) {

    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

}


function isValidGuests(guests) {

    const number = Number(guests);

    return (
        Number.isInteger(number) &&
        number > 0
    );

}


function isPastReservation(
    date,
    time
) {

    const selected =
        new Date(
            `${date}T${time}:00`
        );

    const now =
        new Date();

    return selected <= now;

}


// ==========================================
// GET ALL TABLES
// ==========================================

router.get("/tables", (req, res) => {

    try {

        const tables =
            db.prepare(`
                SELECT *
                FROM tables
                ORDER BY table_number
            `).all();

        res.json(tables);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to load tables",

            error:
                error.message

        });

    }

});


// ==========================================
// GET AVAILABLE TABLES
// ==========================================

router.get(
    "/available-tables",
    (req, res) => {

        try {

            const tables =
                db.prepare(`
                    SELECT *
                    FROM tables
                    WHERE status = 'Available'
                    ORDER BY table_number
                `).all();

            res.json(tables);

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to load available tables",

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// GET TABLES AVAILABLE
// FOR SPECIFIC DATE & TIME
// ==========================================

router.get(
    "/available-tables-by-time",
    (req, res) => {

        const {
            reservation_date,
            reservation_time,
            guests
        } = req.query;


        // -------------------------------
        // DATE CHECK
        // -------------------------------

        if (
            !reservation_date ||
            !isValidDate(
                reservation_date
            )
        ) {

            return res.status(400).json({

                message:
                    "Valid reservation date is required (YYYY-MM-DD)"

            });

        }


        // -------------------------------
        // TIME CHECK
        // -------------------------------

        if (
            !reservation_time ||
            !isValidTime(
                reservation_time
            )
        ) {

            return res.status(400).json({

                message:
                    "Valid reservation time is required (HH:MM)"

            });

        }


        // -------------------------------
        // GUEST CHECK
        // -------------------------------

        const guestCount =
            Number(
                guests || 1
            );


        if (
            !isValidGuests(
                guestCount
            )
        ) {

            return res.status(400).json({

                message:
                    "Guests must be a positive whole number"

            });

        }


        // -------------------------------
        // PAST DATE/TIME CHECK
        // -------------------------------

        if (
            isPastReservation(
                reservation_date,
                reservation_time
            )
        ) {

            return res.status(400).json({

                message:
                    "Reservation date and time must be in the future"

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

                    FROM tables

                    WHERE tables.status = 'Available'

                    AND tables.seats >= ?

                    AND tables.id NOT IN (

                        SELECT
                            reservations.table_id

                        FROM reservations

                        WHERE
                            reservations.reservation_date = ?

                        AND
                            reservations.reservation_time = ?

                        AND
                            reservations.status = 'Booked'

                    )

                    ORDER BY
                        tables.table_number

                `).all(

                    guestCount,

                    reservation_date,

                    reservation_time

                );


            res.json(tables);


        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to find available tables",

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// CREATE RESERVATION
// ==========================================

router.post("/", (req, res) => {

    const {

        user_id,

        table_id,

        reservation_date,

        reservation_time,

        guests

    } = req.body;


    // -------------------------------
    // REQUIRED FIELD CHECK
    // -------------------------------

    if (
        !user_id ||
        !table_id ||
        !reservation_date ||
        !reservation_time ||
        !guests
    ) {

        return res.status(400).json({

            message:
                "All reservation fields are required"

        });

    }


    // -------------------------------
    // DATE FORMAT
    // -------------------------------

    if (
        !isValidDate(
            reservation_date
        )
    ) {

        return res.status(400).json({

            message:
                "Invalid reservation date"

        });

    }


    // -------------------------------
    // TIME FORMAT
    // -------------------------------

    if (
        !isValidTime(
            reservation_time
        )
    ) {

        return res.status(400).json({

            message:
                "Invalid reservation time"

        });

    }


    // -------------------------------
    // GUEST VALIDATION
    // -------------------------------

    if (
        !isValidGuests(
            guests
        )
    ) {

        return res.status(400).json({

            message:
                "Guests must be a positive whole number"

        });

    }


    // -------------------------------
    // PAST DATE/TIME CHECK
    // -------------------------------

    if (
        isPastReservation(
            reservation_date,
            reservation_time
        )
    ) {

        return res.status(400).json({

            message:
                "Reservation date and time must be in the future"

        });

    }


    try {

        // ==========================================
        // CHECK USER
        // ==========================================

        const user =
            db.prepare(`
                SELECT *
                FROM users
                WHERE id = ?
            `).get(
                user_id
            );


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        // ==========================================
        // CHECK TABLE
        // ==========================================

        const table =
            db.prepare(`
                SELECT *
                FROM tables
                WHERE id = ?
            `).get(
                table_id
            );


        if (!table) {

            return res.status(404).json({

                message:
                    "Table not found"

            });

        }


        // ==========================================
        // CHECK TABLE STATUS
        // ==========================================

        if (
            table.status ===
            "Occupied"
        ) {

            return res.status(400).json({

                message:
                    "This table is currently occupied"

            });

        }


        if (
            table.status !==
            "Available"
        ) {

            return res.status(400).json({

                message:
                    "This table is not currently available"

            });

        }


        // ==========================================
        // CHECK TABLE CAPACITY
        // ==========================================

        if (
            Number(guests) >
            Number(table.seats)
        ) {

            return res.status(400).json({

                message:
                    `This table can accommodate only ${table.seats} guests`

            });

        }


        // ==========================================
        // CHECK DUPLICATE RESERVATION
        // ==========================================

        const existingReservation =
            db.prepare(`

                SELECT *

                FROM reservations

                WHERE
                    table_id = ?

                AND
                    reservation_date = ?

                AND
                    reservation_time = ?

                AND
                    status = 'Booked'

            `).get(

                table_id,

                reservation_date,

                reservation_time

            );


        if (existingReservation) {

            return res.status(400).json({

                message:
                    "This table is already reserved for the selected date and time"

            });

        }


        // ==========================================
        // CREATE RESERVATION
        // ==========================================

        const result =
            db.prepare(`

                INSERT INTO reservations

                (
                    user_id,

                    table_id,

                    reservation_date,

                    reservation_time,

                    guests,

                    status

                )

                VALUES

                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    'Booked'
                )

            `).run(

                user_id,

                table_id,

                reservation_date,

                reservation_time,

                Number(guests)

            );


        const reservationId =
            Number(
                result.lastInsertRowid
            );


        res.json({

            message:
                "Table reserved successfully!",

            reservationId:

                reservationId

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to create reservation",

            error:
                error.message

        });

    }

});


// ==========================================
// GET USER RESERVATIONS
// ==========================================

router.get(
    "/user/:user_id",
    (req, res) => {

        try {

            const reservations =
                db.prepare(`

                    SELECT

                        reservations.id,

                        reservations.reservation_date,

                        reservations.reservation_time,

                        reservations.guests,

                        reservations.status,

                        reservations.table_id,

                        tables.table_number,

                        tables.seats

                    FROM reservations

                    LEFT JOIN tables

                    ON reservations.table_id =
                       tables.id

                    WHERE
                        reservations.user_id = ?

                    ORDER BY
                        reservations.id DESC

                `).all(
                    req.params.user_id
                );


            res.json(
                reservations
            );


        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to load reservations",

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// CANCEL RESERVATION FUNCTION
// ==========================================

function cancelReservation(
    req,
    res
) {

    try {

        const reservation =
            db.prepare(`

                SELECT *

                FROM reservations

                WHERE id = ?

            `).get(
                req.params.id
            );


        // -------------------------------
        // RESERVATION NOT FOUND
        // -------------------------------

        if (!reservation) {

            return res.status(404).json({

                message:
                    "Reservation not found"

            });

        }


        // -------------------------------
        // ALREADY CANCELLED
        // -------------------------------

        if (
            reservation.status ===
            "Cancelled"
        ) {

            return res.status(400).json({

                message:
                    "Reservation is already cancelled"

            });

        }


        // -------------------------------
        // CANCEL
        // -------------------------------

        db.prepare(`

            UPDATE reservations

            SET status = 'Cancelled'

            WHERE id = ?

        `).run(
            req.params.id
        );


        res.json({

            message:
                "Reservation cancelled successfully"

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to cancel reservation",

            error:
                error.message

        });

    }

}


// ==========================================
// CANCEL RESERVATION - PUT
// ==========================================

router.put(
    "/:id/cancel",
    cancelReservation
);


// ==========================================
// CANCEL RESERVATION - DELETE
// ==========================================
// Added so the current reservation.html
// can also cancel reservations using DELETE
// ==========================================

router.delete(
    "/:id",
    cancelReservation
);


// ==========================================
// ADMIN - GET ALL RESERVATIONS
// ==========================================

router.get(
    "/admin/all",
    (req, res) => {

        try {

            const reservations =
                db.prepare(`

                    SELECT

                        reservations.id,

                        reservations.user_id,

                        reservations.table_id,

                        reservations.reservation_date,

                        reservations.reservation_time,

                        reservations.guests,

                        reservations.status,

                        reservations.created_at,

                        users.name
                        AS customer_name,

                        users.email,

                        tables.table_number,

                        tables.seats

                    FROM reservations

                    LEFT JOIN users

                    ON reservations.user_id =
                       users.id

                    LEFT JOIN tables

                    ON reservations.table_id =
                       tables.id

                    ORDER BY
                        reservations.id DESC

                `).all();


            res.json(
                reservations
            );


        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to load reservations",

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// ADMIN - RESERVATION SUMMARY
// ==========================================

router.get(
    "/admin/summary",
    (req, res) => {

        try {

            const total =
                db.prepare(`

                    SELECT
                        COUNT(*) AS count

                    FROM reservations

                `).get();


            const booked =
                db.prepare(`

                    SELECT
                        COUNT(*) AS count

                    FROM reservations

                    WHERE status = 'Booked'

                `).get();


            const cancelled =
                db.prepare(`

                    SELECT
                        COUNT(*) AS count

                    FROM reservations

                    WHERE status = 'Cancelled'

                `).get();


            const today =
                db.prepare(`

                    SELECT
                        COUNT(*) AS count

                    FROM reservations

                    WHERE
                        reservation_date =
                        date('now','localtime')

                    AND
                        status = 'Booked'

                `).get();


            res.json({

                totalReservations:
                    total.count,

                bookedReservations:
                    booked.count,

                cancelledReservations:
                    cancelled.count,

                todayReservations:
                    today.count

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to load reservation summary",

                error:
                    error.message

            });

        }

    }
);


module.exports = router;
