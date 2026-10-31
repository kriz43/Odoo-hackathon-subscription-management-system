const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin-only: Create a product
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const {
                name,
                product_type,
                sales_price,
                cost_price,
                notes
            } = req.body;

            if (
                !name ||
                !product_type ||
                sales_price === undefined ||
                cost_price === undefined
            ) {
                return res.status(400).json({
                    message: "Name, product type, sales price and cost price are required"
                });
            }

            if (
                !Number.isFinite(Number(sales_price)) ||
                !Number.isFinite(Number(cost_price)) ||
                Number(sales_price) < 0 ||
                Number(cost_price) < 0
            ) {
                return res.status(400).json({
                    message: "Prices must be valid non-negative numbers"
                });
            }

            const [result] = await db.execute(
                `INSERT INTO products
                (name, product_type, sales_price, cost_price, notes)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    name.trim(),
                    product_type.trim(),
                    Number(sales_price),
                    Number(cost_price),
                    notes || null
                ]
            );

            return res.status(201).json({
                message: "Product created successfully",
                product_id: result.insertId
            });
        } catch (error) {
            console.error("Product creation error:", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
);

// Admin and staff: Get all products
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin", "staff"),
    async (req, res) => {
        try {
            const [products] = await db.execute(
                `SELECT
                    p.*,
                    COUNT(pv.id) AS variant_count
                 FROM products p
                 LEFT JOIN product_variants pv
                    ON p.id = pv.product_id
                 GROUP BY p.id
                 ORDER BY p.id DESC`
            );

            return res.status(200).json({
                message: "Products retrieved successfully",
                products: products
            });
        } catch (error) {
            console.error("Get products error:", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
);

// Admin and staff: Get one product with its variants
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "staff"),
    async (req, res) => {
        try {
            const productId = Number(req.params.id);

            if (!Number.isInteger(productId) || productId <= 0) {
                return res.status(400).json({
                    message: "Invalid product ID"
                });
            }

            const [products] = await db.execute(
                "SELECT * FROM products WHERE id = ?",
                [productId]
            );

            if (products.length === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            const [variants] = await db.execute(
                `SELECT id, attribute_name, variant_name, extra_price
                 FROM product_variants
                 WHERE product_id = ?`,
                [productId]
            );

            return res.status(200).json({
                message: "Product retrieved successfully",
                product: {
                    ...products[0],
                    variants: variants
                }
            });
        } catch (error) {
            console.error("Get product error:", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
);

// Admin-only: Update a product
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const productId = Number(req.params.id);
            const { name, product_type, sales_price, cost_price, notes } = req.body;

            if (!Number.isInteger(productId) || productId <= 0) {
                return res.status(400).json({
                    message: "Invalid product ID"
                });
            }

            if (
                !name?.trim() ||
                !product_type?.trim() ||
                sales_price === undefined ||
                cost_price === undefined
            ) {
                return res.status(400).json({
                    message: "Name, product type, sales price and cost price are required"
                });
            }

            if (
                !Number.isFinite(Number(sales_price)) ||
                !Number.isFinite(Number(cost_price)) ||
                Number(sales_price) < 0 ||
                Number(cost_price) < 0
            ) {
                return res.status(400).json({
                    message: "Prices must be valid non-negative numbers"
                });
            }

            const [result] = await db.execute(
                `UPDATE products
                 SET name = ?, product_type = ?, sales_price = ?,
                     cost_price = ?, notes = ?
                 WHERE id = ?`,
                [
                    name.trim(),
                    product_type.trim(),
                    Number(sales_price),
                    Number(cost_price),
                    notes || null,
                    productId
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            return res.status(200).json({
                message: "Product updated successfully"
            });
        } catch (error) {
            console.error("Update product error:", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
);

// Admin-only: Delete a product
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const productId = Number(req.params.id);

            if (!Number.isInteger(productId) || productId <= 0) {
                return res.status(400).json({
                    message: "Invalid product ID"
                });
            }

            const [result] = await db.execute(
                "DELETE FROM products WHERE id = ?",
                [productId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            return res.status(200).json({
                message: "Product deleted successfully"
            });
        } catch (error) {
            console.error("Delete product error:", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
);

module.exports = router;