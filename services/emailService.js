/*
//controllers/emailService.js
const nodemailer = require("nodemailer");

async function sendContactEmail({ name, email, comments }) {

    const transporter = nodemailer.createTransport({

        host: "smtp.mail.yahoo.com",
        port: 587,
        secure: false,

        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },

        connectionTimeout: 10000,
        greetingTimeout: 10000
    });

    await transporter.sendMail({

        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,

        subject: "New Contact Form Submission",

        text:
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Comments: ${comments}`
    });
}

module.exports = { sendContactEmail };
*/
//new version with CSV attachment sending function
const nodemailer = require("nodemailer");

// Existing function
async function sendContactEmail({ name, email, comments }) {
    const transporter = nodemailer.createTransport({
        host: "smtp.mail.yahoo.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "New Contact Form Submission",
        text:
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Comments: ${comments}`
    });
}

// **New function to send a CSV file**
async function sendCsvEmail(recipient, filePath) {
    const transporter = nodemailer.createTransport({
        host: "smtp.mail.yahoo.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient,
        subject: "CSV Report",
        text: "Attached is the CSV report.",
        attachments: [
            {
                filename: filePath.split(/[/\\]/).pop(), // just the file name
                path: filePath
            }
        ]
    });
}

module.exports = { sendContactEmail, sendCsvEmail };
