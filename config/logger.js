const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../logs/app.log");

function writeLog(type, message) {
    const time = new Date().toISOString();
    const line = `[${time}] [${type}] ${message}\n`;

    fs.appendFileSync(logFile, line);
}

module.exports = {
    info: (msg) => writeLog("INFO", msg),
    error: (msg) => writeLog("ERROR", msg),
};
