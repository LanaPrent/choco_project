
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }

    res.status(401).json({
        message: "Unauthorized"
    });
}
//if admin messages access restriction is active this line should be commented out or deleted:
//module.exports = isAuthenticated;

// admin/messages access restriction: goes together with changes in contact.

  function adminBasicAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).send("Admin login required");
  }

  const base64 = authHeader.split(" ")[1];
  const decoded = Buffer.from(base64, "base64").toString("utf-8");

  const [username, password] = decoded.split(":");

  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return next();
  }

  res.setHeader("WWW-Authenticate", "Basic");
  return res.status(401).send("Wrong credentials");
}

module.exports={ isAuthenticated,adminBasicAuth };


