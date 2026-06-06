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
//emailService.js moved from controllers file to services file
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
            //user: process.env.CONTACT_EMAIL,
           // pass: process.env.CONTACT_EMAIL_PASS
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000
    });
    const recipients = [
        //process.env.EMAIL_USER,
        process.env.CONTACT_EMAIL,
       // "assistant@example.com"
    ]

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        //to: process.env.EMAIL_USER,
        //from: process.env.CONTACT_EMAIL,
        //to: process.env.CONTACT_EMAIL,
        to: recipients.join(","),
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
