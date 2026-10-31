const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin-only: Create a subscription plan

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const {
                product_id,
                plan_name,
                billing_frequency,
                minimum_quantity,
                start_date,
                end_date,
                auto_close,
                allow_early_close,
                allow_pause,
                auto_renew
            } = req.body;

            // Check required fields
            if (
                !product_id ||
                !plan_name?.trim() ||
                !billing_frequency ||
                !start_date
            ) {
                return res.status(400).json({
                    message: "Product ID, plan name, billing frequency and start date are required"
                });
            }

            // Validate billing frequency
            const allowedFrequencies = [
                "daily",
                "weekly",
                "monthly",
                "yearly"
            ];

            if (!allowedFrequencies.includes(billing_frequency)) {
                return res.status(400).json({
                    message: "Invalid billing frequency"
                });
            }

            // Validate quantity
            const quantity = Number(minimum_quantity ?? 1);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                return res.status(400).json({
                    message: "Minimum quantity must be a positive integer"
                });
            }

            // Validate dates
            const validDate = (date) =>
                /^\d{4}-\d{2}-\d{2}$/.test(date) &&
                !Number.isNaN(Date.parse(date)) &&
                new Date(date).toISOString().slice(0, 10) === date;

            if (!validDate(start_date)) {
                return res.status(400).json({
                    message: "Invalid start date"
                });
            }

            if (end_date && !validDate(end_date)) {
                return res.status(400).json({
                    message: "Invalid end date"
                });
            }

            if (end_date && end_date < start_date) {
                return res.status(400).json({
                    message: "End date cannot be before start date"
                });
            }

            // Check whether the product exists
            const [products] = await db.execute(
                "SELECT id FROM products WHERE id = ?",
                [Number(product_id)]
            );

            if (products.length === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            // Insert subscription plan
            const [result] = await db.execute(
                `INSERT INTO plans (
                    product_id,
                    plan_name,
                    billing_frequency,
                    minimum_quantity,
                    start_date,
                    end_date,
                    auto_close,
                    allow_early_close,
                    allow_pause,
                    auto_renew
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    Number(product_id),
                    plan_name.trim(),
                    billing_frequency,
                    quantity,
                    start_date,
                    end_date || null,
                    auto_close === true,
                    allow_early_close === true,
                    allow_pause === true,
                    auto_renew === true
                ]
            );

            return res.status(201).json({
                message: "Subscription plan created successfully",
                plan_id: result.insertId
            });

        } catch (error) {
            console.error("Create plan error:", error);

            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
);

// Admin and staff: Get all subscription plans
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin", "staff"),
    async (req, res) => {
        try {
            const [plans] = await db.execute(`
                SELECT
                    plans.*,
                    products.name AS product_name
                FROM plans
                INNER JOIN products
                    ON plans.product_id = products.id
                ORDER BY plans.id DESC
            `);

            return res.status(200).json({
                count: plans.length,
                plans: plans
            });

        } catch (error) {
            console.error("Get plans error:", error);

            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
);

// Admin and staff: Get a single subscription plan
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "staff"),
    async (req, res) => {
        try {
            const planId = Number(req.params.id);

            if (!Number.isInteger(planId) || planId <= 0) {
                return res.status(400).json({
                    message: "Invalid plan ID"
                });
            }

            const [plans] = await db.execute(
                `SELECT
                    plans.*,
                    products.name AS product_name
                 FROM plans
                 INNER JOIN products
                    ON plans.product_id = products.id
                 WHERE plans.id = ?`,
                [planId]
            );

            if (plans.length === 0) {
                return res.status(404).json({
                    message: "Subscription plan not found"
                });
            }

            return res.status(200).json({
                plan: plans[0]
            });

        } catch (error) {
            console.error("Get single plan error:", error);

            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
);

// Admin-only: Update a subscription plan
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const planId = Number(req.params.id);

            const {
                product_id,
                plan_name,
                billing_frequency,
                minimum_quantity,
                start_date,
                end_date,
                auto_close,
                allow_early_close,
                allow_pause,
                auto_renew
            } = req.body;

            if (!Number.isInteger(planId) || planId <= 0) {
                return res.status(400).json({
                    message: "Invalid plan ID"
                });
            }

            if (
                !product_id ||
                !plan_name?.trim() ||
                !billing_frequency ||
                !start_date
            ) {
                return res.status(400).json({
                    message: "Product ID, plan name, billing frequency and start date are required"
                });
            }

            const allowedFrequencies = [
                "daily", "weekly", "monthly", "yearly"
            ];

            if (!allowedFrequencies.includes(billing_frequency)) {
                return res.status(400).json({
                    message: "Invalid billing frequency"
                });
            }

            const quantity = Number(minimum_quantity ?? 1);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                return res.status(400).json({
                    message: "Minimum quantity must be a positive integer"
                });
            }

            const validDate = (date) =>
                typeof date === "string" &&
                /^\d{4}-\d{2}-\d{2}$/.test(date) &&
                !Number.isNaN(Date.parse(date)) &&
                new Date(date).toISOString().slice(0, 10) === date;

            if (!validDate(start_date)) {
                return res.status(400).json({
                    message: "Invalid start date"
                });
            }

            if (end_date && !validDate(end_date)) {
                return res.status(400).json({
                    message: "Invalid end date"
                });
            }

            if (end_date && end_date < start_date) {
                return res.status(400).json({
                    message: "End date cannot be before start date"
                });
            }

            const [existingPlans] = await db.execute(
                "SELECT id FROM plans WHERE id = ?",
                [planId]
            );

            if (existingPlans.length === 0) {
                return res.status(404).json({
                    message: "Subscription plan not found"
                });
            }

            const [products] = await db.execute(
                "SELECT id FROM products WHERE id = ?",
                [Number(product_id)]
            );

            if (products.length === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            await db.execute(
                `UPDATE plans SET
                    product_id = ?,
                    plan_name = ?,
                    billing_frequency = ?,
                    minimum_quantity = ?,
                    start_date = ?,
                    end_date = ?,
                    auto_close = ?,
                    allow_early_close = ?,
                    allow_pause = ?,
                    auto_renew = ?
                 WHERE id = ?`,
                [
                    Number(product_id),
                    plan_name.trim(),
                    billing_frequency,
                    quantity,
                    start_date,
                    end_date || null,
                    auto_close === true,
                    allow_early_close === true,
                    allow_pause === true,
                    auto_renew === true,
                    planId
                ]
            );

            return res.status(200).json({
                message: "Subscription plan updated successfully"
            });

        } catch (error) {
            console.error("Update plan error:", error);

            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
);

// Admin-only: Delete a subscription plan
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const planId = Number(req.params.id);

            if (!Number.isInteger(planId) || planId <= 0) {
                return res.status(400).json({
                    message: "Invalid plan ID"
                });
            }

            const [result] = await db.execute(
                "DELETE FROM plans WHERE id = ?",
                [planId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Subscription plan not found"
                });
            }

            return res.status(200).json({
                message: "Subscription plan deleted successfully"
            });

        } catch (error) {
            console.error("Delete plan error:", error);

            // A foreign-key reference may prevent deletion
            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                    message: "This plan is being used and cannot be deleted"
                });
            }

            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
);
module.exports = router;