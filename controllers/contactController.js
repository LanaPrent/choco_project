// controllers/contactController.js

const logger = require("../config/logger");
const conn = require("../config/db");
//const { sendContactEmail } = require("./emailService");
const { sendContactEmail } = require("../services/emailService"); //after creating folder services
exports.submitContactForm = async (req, res) => {
  console.log("REQUEST BODY:", req.body);
  console.log("IP:", req.ip);

  let { name, email, comments, website } = req.body;

  if (website) {
    return res.status(400).json({
      success: false,
      message: "Bot detected",
    });
  }

  name = name?.normalize("NFKC").trim();
  email = email?.normalize("NFKC").trim();
  comments = comments?.normalize("NFKC").trim();

  if (!name || !email || !comments) {
    return res.status(400).json({
      success: false,
      message: "All fields required",
    });
  }

  if (name.length > 100 || email.length > 100 || comments.length > 1000) {
    return res.status(400).json({
      success: false,
      message: "Too long",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email",
    });
  }

  // Insert into database
  conn.execute(
    "INSERT INTO users (name,email,comments) VALUES (?,?,?)",
    [name, email, comments],
    async (err) => {
      if (err) {
        logger.error(err.message);
        return res.status(500).json({
          success: false,
          message: "DB error",
        });
      }

      // Try sending email, but ensure DB success is always communicated
      try {
        await sendContactEmail({ name, email, comments });
        res.json({
          success: true,
          message: "Your message has been sent",
        });
      } catch (err) {
        console.error("EMAIL ERROR:", err);
        res.json({
          success: true,
          message:
            "Your message has been saved" //(Check logs for details),
        });
      }
    }
  );
};
