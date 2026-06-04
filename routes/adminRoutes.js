const express = require("express");
const router = express.Router();
const { getAllMessages } = require("../controllers/adminController");

// Admin page - show all messages
router.get("/admin/messages", getAllMessages);

module.exports = router;
