/* version 1
//controllers/emailService.js
const nodemailer = require("nodemailer");

async function sendContactEmail({ name, email, comments }) {

    const transporter = nodemailer.createTransport({

        host: "smtp.mail.yahoo.com",
        port: 587, //this 587 version often fails on Railway and other hosting platforms
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
/* version 2
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
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
            //user: process.env.OWNER_EMAIL,
           // pass: process.env.OWNER_EMAIL_PASS
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000
    });
    const recipients = [
        //process.env.SMTP_USER,
        process.env.OWNER_EMAIL,
       // "assistant@example.com"
    ]
// Send the email
    await transporter.sendMail({
        from: process.env.SMTP_USER,
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
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000
    });

    await transporter.sendMail({
        from: process.env.SMTP_USER,
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
*/

//version 3

const nodemailer = require("nodemailer");

// Uncomment the following block to use Resend API
// -------------------------------
// Resend API
// -------------------------------
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ recipients, subject, html, attachments }) {
  for (const to of recipients) {
    await resend.emails.send({
      from: process.env.SMTP_USER, // sender
      to,
      subject,
      html,
      attachments
    });
  }
}

/*
// -------------------------------
// SMTP (Yahoo) Version
// -------------------------------

async function sendEmail({ recipients, subject, text, attachments }) {
  // Create the SMTP transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000
  });

  // Join multiple recipients as a comma-separated string
  const toList = recipients.join(",");

  // Send the email
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: toList,
    subject,
    text,
    attachments // optional
  });
}
*/
// -------------------------------
// Contact Form Email Function
// -------------------------------
async function sendContactEmail({ name, email, comments }) {
  // Decide recipients
  const recipients = [process.env.OWNER_EMAIL];
  if (process.env.ASSISTANT_EMAIL) {
    recipients.push(process.env.ASSISTANT_EMAIL);
  }

  const subject = "New Contact Form Submission";
  const text =
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    `Comments: ${comments}`;

  await sendEmail({ recipients, subject, text });
}

// -------------------------------
// CSV Email Function
// -------------------------------
async function sendCsvEmail(recipientEmail, csvContent, filename = "report.csv") {
  const subject = `CSV Report: ${filename}`;
  const text = "Please find the CSV report attached.";

  await sendEmail({
    recipients: [recipientEmail],
    subject,
    text,
    attachments: [
      {
        filename,
        content: csvContent
      }
    ]
  });
}

module.exports = { sendContactEmail, sendCsvEmail, sendEmail };

