const session = require("express-session");

module.exports = session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // relax for production cross-site - added by 2nd AI
        maxAge: 1000 * 60 * 60
    }
});
