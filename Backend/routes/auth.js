const express = require("express");
const router = express.Router();

router.post("/register", (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    // Check password length
    if (password.length <= 8) {
        return res.status(400).json({
            message: "Password must be more than 8 characters"
        });
    }

    // Check password complexity
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasSpecial) {
        return res.status(400).json({
            message:
                "Password must contain uppercase, lowercase and special characters"
        });
    }

    // Database connection will be added next
    return res.status(503).json({
        message: "Registration is not available yet"
    });
});

module.exports = router;