//require("dotenv").config();
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const sessionMiddleware = require("./config/session");

const csrfProtection = require("./middleware/csrf");

const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const adminRoutes = require("./routes/adminRoutes");


const isAuthenticated = require("./middleware/authMiddleware");

const app = express();
app.set("trust proxy", 1); 

const PORT = process.env.PORT || 8080;

// =======================
// STATIC FILES
// =======================

app.use(express.static(
    path.join(__dirname, "public"),
    {
        etag: false,
        lastModified: false,

        setHeaders: (res) => {
            res.set("Cache-Control", "no-store");
        }
    }
));

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

// =======================
// BODY PARSERS & COOKIE
// =======================

app.use(express.json({
    limit: "10kb"
}));

app.use(express.urlencoded({
    limit: "10kb",
    extended: true
}));

app.use(cookieParser());

app.use(sessionMiddleware);

// =======================
// ROUTES
// =======================

app.use("/", contactRoutes);

app.use("/api", authRoutes);

app.use("/", adminRoutes);
// =======================
// CSRF TOKEN ROUTE
// =======================

app.get(
    "/csrf-token",
    csrfProtection,
    (req, res) => {

        res.json({
            csrfToken: req.csrfToken()
        });
    }
);

// =======================
// PROTECTED ROUTE
// =======================

app.get(
    "/dashboard",
    isAuthenticated,

    (req, res) => {

        res.send(
            `Welcome ${req.session.username}! You are logged in.`
        );
    }
);

// =======================
// MAIN PAGE
// =======================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

// =======================
// START SERVER
// =======================

//app.listen(PORT, () => {
app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});
// =======================
// LOG ENV VARIABLES (for debugging)
// =======================

console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_USER =", process.env.DB_USER);

console.log("MYSQLHOST =", process.env.MYSQLHOST);
console.log("MYSQLUSER =", process.env.MYSQLUSER);
console.log("MYSQLDATABASE =", process.env.MYSQLDATABASE);

