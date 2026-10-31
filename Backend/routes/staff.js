const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin-only: Create a staff account
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: "Email and password are required"
                });
            }

            if (
                password.length <= 8 ||
                !/[A-Z]/.test(password) ||
                !/[a-z]/.test(password) ||
                !/[^A-Za-z0-9]/.test(password)
            ) {
                return res.status(400).json({
                    message: "Password must be more than 8 characters and include uppercase, lowercase, and special characters"
                });
            }

            const [existingUsers] = await db.execute(
                "SELECT id FROM users WHERE email = ?",
                [email]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({
                    message: "Email is already registered"
                });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            await db.execute(
                "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
                [email, passwordHash, "staff"]
            );

            return res.status(201).json({
                message: "Staff account created successfully"
            });
        } catch (error) {
            console.error("Staff creation error:", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
);

module.exports = router;