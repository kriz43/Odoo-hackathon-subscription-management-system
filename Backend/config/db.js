const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config({
    path: path.resolve(__dirname, "../.env")
});

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
    ca: fs.readFileSync(path.resolve(__dirname, "../ca.pem")),
    rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;