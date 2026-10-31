const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin-only: Create a product variant
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const {
                product_id,
                attribute_name,
                variant_name,
                extra_price
            } = req.body;

            if (
                !product_id ||
                !attribute_name ||
                !variant_name ||
                extra_price === undefined
            ) {
                return res.status(400).json({
                    message: "Product ID, attribute name, variant name and extra price are required"
                });
            }

            if (
                !Number.isInteger(Number(product_id)) ||
                Number(product_id) <= 0 ||
                !Number.isFinite(Number(extra_price)) ||
                Number(extra_price) < 0
            ) {
                return res.status(400).json({
                    message: "Invalid product ID or extra price"
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

            const [result] = await db.execute(
                `INSERT INTO product_variants
                (product_id, attribute_name, variant_name, extra_price)
                VALUES (?, ?, ?, ?)`,
                [
                    Number(product_id),
                    attribute_name.trim(),
                    variant_name.trim(),
                    Number(extra_price)
                ]
            );

            return res.status(201).json({
                message: "Product variant created successfully",
                variant_id: result.insertId
            });
        } catch (error) {
            console.error("Variant creation error:", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
);

module.exports = router;