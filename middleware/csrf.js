const csurf = require("csurf");  
const csrfProtection = csurf({
    cookie: {
        httpOnly: true,
        sameSite: "strict"
    }
});

module.exports = csrfProtection;
