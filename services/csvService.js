const fs = require('fs');
const path = require('path');

function createCsv(rows, filename = 'report.csv') {
    // Ensure output folder exists
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const csvPath = path.join(outputDir, filename);
    const csvContent = rows.map(row => row.join(',')).join('\n');
    fs.writeFileSync(csvPath, csvContent, 'utf8');

    console.log(`CSV saved to ${csvPath}`);
    return csvPath;
}

module.exports = { createCsv };
