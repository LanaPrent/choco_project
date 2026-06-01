const mysql = require("mysql2");
/*
const conn = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306,
    connectionLimit: 5
});
*/
const conn = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    connectionLimit: 5
});


conn.getConnection((err, connection) => {
    if (err) {
        console.error("❌ MySQL connection FAILED:", err.message);
        return;
    }

    console.log("✅ Connected to MySQL database");
    connection.release();
});

module.exports = conn;
