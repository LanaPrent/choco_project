const express = require("express");
const router = express.Router();
const { getAllMessages } = require("../controllers/adminController");
const { exportMessagesCSV } = require("../controllers/adminController");


// Admin page - show all messages plus export messages CSV
router.get("/admin/messages", getAllMessages);
router.get("/admin/messages/export", exportMessagesCSV);

module.exports = router;
