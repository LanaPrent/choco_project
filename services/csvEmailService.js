/*
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
*/
//CSV+email logic moved from server.js to csvEmailService.js file
// services/csvEmailService.js - an option to enable sending csv by email
const { generateObjectCsvString } = require("csv-stringify/sync");
const nodemailer = require("nodemailer");

/**
 * Generate CSV from 2D array or objects and send it via email
 *
 * @param {string} recipientEmail
 * @param {Array} rows - array of arrays or array of objects
 * @param {string} filename - CSV filename
 */
async function generateAndSendCsv(recipientEmail, rows, filename) {
  // Generate CSV
  const csv = generateObjectCsvString(rows, {
    header: true,
  });

  // Prepare transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });

  // Send CSV as email attachment
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `CSV Report: ${filename}`,
    text: "Please find the CSV report attached.",
    attachments: [
      {
        filename,
        content: csv,
      },
    ],
  });
}

module.exports = { generateAndSendCsv };
