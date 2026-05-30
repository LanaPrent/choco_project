const conn = require("../config/db");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields required"
        });
    }

    try {

        const hash = await bcrypt.hash(password, 12);

        conn.execute(
            "INSERT INTO auth_users (username, email, password_hash) VALUES (?, ?, ?)",
            [username, email, hash],

            (err) => {

                if (err) {

                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({
                            success: false,
                            message: "User already exists"
                        });
                    }

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                res.json({
                    success: true,
                    message: "Registration successful"
                });
            }
        );

    } catch (err) {

        //console.error(err);
        logger.error(err.message);


        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

exports.login = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields required"
        });
    }

    conn.execute(
        "SELECT * FROM auth_users WHERE email = ?",
        [email],

        async (err, results) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }

            const user = results[0];

            const match = await bcrypt.compare(
                password,
                user.password_hash
            );

            if (!match) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }

            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.email = user.email;

            res.json({
                success: true,
                message: "Login successful"
            });
        }
    );
};

exports.logout = (req, res) => {

    req.session.destroy(err => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            success: true,
            message: "Logged out"
        });
    });
};

exports.status = (req, res) => {

    if (req.session.userId) {

        res.json({
            loggedIn: true,
            username: req.session.username,
            email: req.session.email
        });

    } else {

        res.json({
            loggedIn: false
        });
    }
};
