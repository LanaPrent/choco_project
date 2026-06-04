const conn = require("../config/db");

exports.getAllMessages = (req, res) => {
  conn.query("SELECT * FROM users ORDER BY created DESC", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }

    // Render simple HTML table
    let html = `<h1>Contact Messages</h1>
                <table border="1" cellpadding="5">
                <tr><th>ID</th><th>Name</th><th>Email</th><th>Comments</th><th>Created</th></tr>`;

    results.forEach(row => {
      html += `<tr>
                <td>${row.id}</td>
                <td>${row.name}</td>
                <td>${row.email}</td>
                <td>${row.comments}</td>
                <td>${row.created}</td>
              </tr>`;
    });

    html += "</table>";

    res.send(html);
  });
};
