require("dotenv").config();

const express = require("express");
const path = require("path");
const helmet = require("helmet");
const csurf = require("csurf");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// STATIC FILES
// =======================
app.use(express.static(path.join(__dirname, "public"), {
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
        res.set('Cache-Control', 'no-store');
    }
}));

// =======================
// SECURITY
// =======================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            objectSrc: ["'none'"]
        }
    }
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb", extended: true }));
app.use(cookieParser());

// =======================
// SESSIONS
// =======================
app.use(session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

// =======================
// CSRF
// =======================
const csrfProtection = csurf({
    cookie: { httpOnly: true, sameSite: "strict" }
});

// =======================
// DATABASE
// =======================
const conn = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
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

// =======================
// MIDDLEWARE
// =======================
function isAuthenticated(req, res, next) {
    if (req.session.userId) return next();
    res.status(401).json({ message: "Unauthorized" });
}

// =======================
// ROUTES
// =======================

// Serve main HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// CSRF token route
app.get("/csrf-token", csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// =======================
// CONTACT FORM (fixed)
// =======================
app.post("/submit", csrfProtection, async (req, res) => {
    console.log("REQUEST BODY:", req.body);
    console.log("IP:", req.ip);

    let { name, email, comments, website } = req.body;

    if (website) return res.status(400).send("Bot detected");

    name = name?.normalize("NFKC").trim();
    email = email?.normalize("NFKC").trim();
    comments = comments?.normalize("NFKC").trim();

    if (!name || !email || !comments) {
        return res.status(400).json({ success: false, message: "All fields required" });
    }

    if (name.length > 100 || email.length > 100 || comments.length > 1000) {
        return res.status(400).json({ success: false, message: "Too long" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Insert into users table
    conn.execute(
        "INSERT INTO users (name,email,comments) VALUES (?,?,?)",
        [name, email, comments],
        async (err) => { 
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "DB error" });
            }

            // Send email to owner
            try {
                const transporter = nodemailer.createTransport({
                    host: "smtp.mail.yahoo.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: process.env.EMAIL_USER,
                    subject: "New Submission",
                    text: `Name: ${name}\nEmail: ${email}\nComments: ${comments}`
                });

                res.json({ success: true, message: "Saved + email sent" });

            } catch (err){
                console.error(err);
                res.json({ success: false, message: "Saved but email failed" });
            }
        }
    );     
});

// =======================
// LOGIN / REGISTER / LOGOUT (added back)
// =======================

// Registration
app.post("/register", csrfProtection, async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ success:false, message: "All fields required" });

    try {
        const hash = await bcrypt.hash(password, 12);
        conn.execute(
            "INSERT INTO auth_users (username, email, password_hash) VALUES (?, ?, ?)",
            [username, email, hash],
            (err) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ success:false, message: "User already exists" });
                    return res.status(500).json({ success:false, message: "Database error" });
                }
                res.json({ success: true, message: "Registration successful" });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ success:false, message: "Server error" });
    }
});

// Login
app.post("/login", csrfProtection, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message: "All fields required" });

    conn.execute(
        "SELECT * FROM auth_users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) return res.status(500).json({ success:false, message: "Database error" });
            if (results.length === 0) return res.status(400).json({ success:false, message: "Invalid credentials" });

            const user = results[0];
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) return res.status(400).json({ success:false, message: "Invalid credentials" });

            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.email = user.email;

            res.json({ success: true, message: "Login successful" });
        }
    );
});

// Logout
app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ success:false, message: "Logout failed" });
        res.clearCookie("connect.sid");
        res.json({ success: true, message: "Logged out" });
    });
});

// Status route (for updating navbar)
app.get("/api/status", (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, username: req.session.username, email: req.session.email });
    } else {
        res.json({ loggedIn: false });
    }
});

// Example protected route
app.get("/dashboard", isAuthenticated, (req, res) => {
    res.send(`Welcome ${req.session.username}! You are logged in.`);
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
