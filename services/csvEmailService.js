// services/csvEmailService.js
const path = require("path");
const { createCsv } = require("./csvService"); // your CSV generator
const { sendCsvEmail } = require("./emailService"); // your email service

async function generateAndSendCsv(recipient, rows, filename = "report.csv") {
    // 1️⃣ Generate CSV
    const csvPath = createCsv(rows, filename);

    // 2️⃣ Send CSV by email
    await sendCsvEmail(recipient, csvPath);

    console.log("CSV created and emailed successfully!");
}

module.exports = { generateAndSendCsv };
