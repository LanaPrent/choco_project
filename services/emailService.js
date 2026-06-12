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

//version 3 - Resend code only (1st part commented out) and Resend -SMTP/Resend toggle button

const nodemailer = require("nodemailer");

// -------------------------------
// Resend API
// -------------------------------
const { Resend } = require("resend");

/*
//----------------------------------
//Resend only code until Provider Selection and from Contact Form Email Function
//----------------------------------
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ recipients, subject, html, text, attachments }) {
  const results = [];

  for (const to of recipients) {
    try{
    const result = await resend.emails.send({
      from: process.env.SMTP_USER, // sender
      to,
      subject,
      html:html|| `<pre>${text}</pre>`,
      attachments
    });

    results.push(result);
  }catch(err){
    console.error("❌ Failed sending to:", to);
    console.error(err);
    results.push({error:err, to});
}
}
return results;
}
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
*/

// -------------------------------
// Provider selection - Until Contact Form Email Function toggle button SMTP/Resen
// -------------------------------
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "resend"; // "smtp" or "resend"

// Resend setup
const resend = new Resend(process.env.RESEND_API_KEY);

// SMTP setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// -------------------------------
// Unified sendEmail function
// -------------------------------
async function sendEmail({ recipients, subject, html, text, attachments }) {
  const results = [];


  for (const to of recipients) {
    try {
      let result;

      if (EMAIL_PROVIDER === "resend") {
        result = await resend.emails.send({
          from: process.env.SMTP_USER,
          to,
          subject,
          html: html || `<pre>${text}</pre>`,
          attachments
        });
        console.log(
          "RESEND RESULT:",
          JSON.stringify(result,null, 2)
        );
        console.log("📤 [Resend] Email sent to:", to);
      } else if (EMAIL_PROVIDER === "smtp") {
        result = await transporter.sendMail({
          from: process.env.SMTP_USER,
          to,
          subject,
          html: html || `<pre>${text}</pre>`,
          attachments
        });
      } else {
        throw new Error(`Unknown EMAIL_PROVIDER: ${EMAIL_PROVIDER}`);
      }

      results.push(result);
    } catch (err) {
      console.error(`❌ [${EMAIL_PROVIDER.toUpperCase()}] Failed sending to: ${to}`);
      console.error(err);
      results.push({ error: err, to });
    }
  }
  return results;
}

console.log("Using email provider:", EMAIL_PROVIDER);



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

  // Send contact form email
  const result = await sendEmail({ recipients, subject, text });
  console.log ("✅ Contact email results:", result)
}

// -------------------------------
// CSV Email Function
// -------------------------------
async function sendCsvEmail(recipientEmail, csvContent, filename = "report.csv") {
  const subject = `CSV Report: ${filename}`;
  const text = "Please find the CSV report attached.";

  try{
    console.log("➡️ Sending email to:", recipientEmail); 

  const result = await sendEmail({
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
  console.log("✅ Email function completed for", recipientEmail, "Result:", result);
}catch (err){
  console.error("❌ Failed sending to:", recipientEmail);
  console.error(err);
}
}

module.exports = { sendContactEmail, sendCsvEmail, sendEmail };

