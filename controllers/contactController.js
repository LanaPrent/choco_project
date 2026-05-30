const logger = require("../config/logger");
const conn = require("../config/db"); //tj. ovo ne vidim u server.js fajlu
const nodemailer = require("nodemailer");

exports.submitContactForm = async (req, res) => {

    console.log("REQUEST BODY:", req.body);
    console.log("IP:", req.ip);
   // logger.info(`REQUEST BODY: ${JSON.stringify(req.body)}`);
    //logger.info(`IP: ${req.ip}`);


    let { name, email, comments, website } = req.body;

    if (website) {
        //return res.status(400).send("Bot detected");
        return res.status(400).json({
    success: false,
    message: "Bot detected"
});

    }

    name = name?.normalize("NFKC").trim();
    email = email?.normalize("NFKC").trim();
    comments = comments?.normalize("NFKC").trim();

    if (!name || !email || !comments) {
        return res.status(400).json({
            success: false,
            message: "All fields required"
        });
    }

    if (
        name.length > 100 ||
        email.length > 100 ||
        comments.length > 1000
    ) {
        return res.status(400).json({
            success: false,
            message: "Too long"
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email"
        });
    }

    conn.execute(
        "INSERT INTO users (name,email,comments) VALUES (?,?,?)",
        [name, email, comments],

        async (err) => {

            if (err) {
               //console.error(err);
              logger.error(err.message);

                return res.status(500).json({
                    success: false,
                    message: "DB error"
                });
            }

            try {

                const transporter = nodemailer.createTransport({
                    host: "smtp.mail.yahoo.com",
                    port: 587,
                    secure: false,

                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: process.env.EMAIL_USER,
                    subject: "New Submission",
                    text:
`Name: ${name}
Email: ${email}
Comments: ${comments}`
                });

                res.json({
                    success: true,
                    message: "Your message has been sent"
                });

            } catch (err) {

                console.error(err);

                res.json({
                    success: false,
                    message: "Saved but email failed"
                });
            }
        }
    );
};
