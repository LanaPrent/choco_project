const express = require("express");
const router = express.Router();

const csrfProtection = require("../middleware/csrf");

const {
    register,
    login,
    logout,
    status
} = require("../controllers/authController");

router.post(
    "/register",
    csrfProtection,
    register
);

router.post(
    "/login",
    csrfProtection,
    login
);

router.post(
    "/logout",
    logout
);

router.get(
    "/status",
    status
);

module.exports = router;
