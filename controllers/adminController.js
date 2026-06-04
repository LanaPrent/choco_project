/* 1st version with two separate codes for table and CSV
const conn = require("../config/db");

exports.getAllMessages = (req, res) => {
  conn.query("SELECT * FROM users ORDER BY created DESC", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database sending data to HTML table error");
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
*/
//2nd version with both together
// controllers/adminController.js

const conn = require("../config/db");

//
// ===============================
// 1. VIEW ALL MESSAGES (ADMIN PAGE)
// ===============================
//
exports.getAllMessages = (req, res) => {
  conn.query(
    "SELECT * FROM users ORDER BY created DESC",
    (err, results) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).send("Database error");
      }

      let html = `
        <h1>Contact Messages</h1>
        <p>Total messages: ${results.length}</p>
        <a href="/admin/messages/export">⬇ Download CSV</a>
        <br><br>

        <table border="1" cellpadding="8" cellspacing="0">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Comments</th>
            <th>Date</th>
          </tr>
      `;

      results.forEach((row) => {
        html += `
          <tr>
            <td>${row.id}</td>
            <td>${row.name}</td>
            <td>${row.email}</td>
            <td>${row.comments}</td>
            <td>${row.created}</td>
          </tr>
        `;
      });

      html += `</table>`;

      res.send(html);
    }
  );
};

//
// ===============================
// 2. EXPORT MESSAGES AS CSV
// ===============================
//
exports.exportMessagesCSV = (req, res) => {
  conn.query(
    "SELECT * FROM users ORDER BY created DESC",
    (err, results) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).send("Database error");
      }

      // CSV header
      let csv = "ID,Name,Email,Comments,Created\n";

      results.forEach((row) => {
        const name = `"${(row.name || "").replace(/"/g, '""')}"`;
        const email = `"${(row.email || "").replace(/"/g, '""')}"`;
        const comments = `"${(row.comments || "").replace(/"/g, '""')}"`;
        const created = row.created || "";

        csv += `${row.id},${name},${email},${comments},${created}\n`;
      });

      // Send file download response
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=contact_messages.csv"
      );
      res.setHeader("Content-Type", "text/csv");

      res.status(200).send(csv);
    }
  );
};

