const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ==========================================
// GET ALL REVIEWS - ADMIN
// ==========================================
router.get("/", (req, res) => {
    try {
        const reviews = db.prepare(`
            SELECT
                r.id,
                r.food_id,
                r.user_id,
                r.rating,
                r.comment,
                r.created_at,
                f.name AS food_name,
                u.name AS customer_name,
                u.email AS customer_email
            FROM reviews r
            LEFT JOIN foods f ON r.food_id = f.id
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
        `).all();

        const totalReviews = reviews.length;

        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / totalReviews
            : 0;

        const fiveStar = reviews.filter(r => Number(r.rating) === 5).length;
        const oneStar = reviews.filter(r => Number(r.rating) === 1).length;

        res.json({
            reviews,
            summary: {
                total_reviews: totalReviews,
                average_rating: Number(averageRating.toFixed(2)),
                five_star: fiveStar,
                one_star: oneStar
            }
        });

    } catch (error) {
        console.error("Get all reviews error:", error);
        res.status(500).json({
            message: "Failed to fetch reviews",
            error: error.message
        });
    }
});


// ==========================================
// GET REVIEWS FOR ONE FOOD
// ==========================================
router.get("/food/:food_id", (req, res) => {
    try {
        const foodId = Number(req.params.food_id);

        const reviews = db.prepare(`
            SELECT
                r.id,
                r.food_id,
                r.user_id,
                r.rating,
                r.comment,
                r.created_at,
                u.name AS customer_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.food_id = ?
            ORDER BY r.created_at DESC
        `).all(foodId);

        const totalReviews = reviews.length;

        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / totalReviews
            : 0;

        res.json({
            reviews,
            summary: {
                total_reviews: totalReviews,
                average_rating: Number(averageRating.toFixed(2))
            }
        });

    } catch (error) {
        console.error("Get food reviews error:", error);

        res.status(500).json({
            message: "Failed to fetch food reviews",
            error: error.message
        });
    }
});


// ==========================================
// ADD REVIEW
// ==========================================
router.post("/", (req, res) => {
    try {
        const {
            food_id,
            user_id,
            rating,
            comment
        } = req.body;

        if (!food_id || !user_id || !rating) {
            return res.status(400).json({
                message: "Food ID, user ID and rating are required"
            });
        }

        const ratingNumber = Number(rating);

        if (ratingNumber < 1 || ratingNumber > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const result = db.prepare(`
            INSERT INTO reviews
            (food_id, user_id, rating, comment)
            VALUES (?, ?, ?, ?)
        `).run(
            food_id,
            user_id,
            ratingNumber,
            comment || ""
        );

        res.status(201).json({
            message: "Review added successfully",
            review_id: Number(result.lastInsertRowid)
        });

    } catch (error) {
        console.error("Add review error:", error);

        res.status(500).json({
            message: "Failed to add review",
            error: error.message
        });
    }
});


// ==========================================
// DELETE REVIEW - ADMIN
// ==========================================
router.delete("/:id", (req, res) => {
    try {
        const reviewId = Number(req.params.id);

        const review = db.prepare(`
            SELECT id
            FROM reviews
            WHERE id = ?
        `).get(reviewId);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        db.prepare(`
            DELETE FROM reviews
            WHERE id = ?
        `).run(reviewId);

        res.json({
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error("Delete review error:", error);

        res.status(500).json({
            message: "Failed to delete review",
            error: error.message
        });
    }
});


module.exports = router;
