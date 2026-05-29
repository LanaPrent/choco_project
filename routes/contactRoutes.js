const express = require("express");
const router = express.Router();

const csrfProtection = require("../middleware/csrf");

const {
    submitContactForm
} = require("../controllers/contactController");

router.post(
    "/submit",
    csrfProtection,
    submitContactForm
);

module.exports = router;

