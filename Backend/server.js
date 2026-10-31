const express = require("express");
const app = express();

const authRoutes = require("./routes/auth");
const db = require("./config/db");

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});