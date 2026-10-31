const express = require("express");
const app = express();

const authRoutes = require("./routes/auth");
const db = require("./config/db");

const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

// Test the database connection
db.getConnection()
    .then((connection) => {
        console.log("Connected to Aiven MySQL!");
        connection.release();
    })
    .catch((error) => {
        console.error("Database connection failed:", error.message);
    });

// Middleware
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Subscription Management Backend is running!");
});

const PORT = 3000;

app.get("/api/protected", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "You have accessed a protected route!",
        user: req.user
    });
});

// Admin-only route
app.get("/api/admin", authMiddleware, roleMiddleware("admin"), (req, res) => {
    res.status(200).json({
        message: "Welcome, Admin!",
        user: req.user
    });
});

// Staff and Admin route
app.get("/api/staff", authMiddleware, roleMiddleware("staff", "admin"), (req, res) => {
    res.status(200).json({
        message: "Welcome, Staff!",
        user: req.user
    });
});

// Customer-only route
app.get("/api/customer", authMiddleware, roleMiddleware("customer"), (req, res) => {
    res.status(200).json({
        message: "Welcome, Customer!",
        user: req.user
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});