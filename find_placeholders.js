const fs = require('fs');
const { PdfReader } = require('pdfreader');

const filePath = 'public/contract_template_v2.pdf';

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

console.log(`Analyzing ${filePath}...`);

const rows = {}; // aggregated text by y-coordinate

new PdfReader().parseFileItems(filePath, (err, item) => {
  if (err) console.error("error:", err);
  else if (!item) {
      // End of file, process rows
      console.log('--- Aggregated Rows ---');
      Object.keys(rows).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach(y => {
          const rowItems = rows[y];
          // sort by x
          rowItems.sort((a, b) => a.x - b.x);
          
          const rowText = rowItems.map(i => i.text).join('');
          
          // Check for placeholders in the aggregated row text
          if (rowText.includes('«') || rowText.includes('»') || rowText.includes('<<') || rowText.includes('>>')) {
              console.log(`Row at y=${y}: "${rowText}"`);
              // Print individual items to help pinpoint coordinates for specific parts if needed
              rowItems.forEach(i => {
                  if (i.text.includes('«') || i.text.includes('»') || i.text.includes('<<') || i.text.includes('>>') || i.text.length > 2) {
                       console.log(`   - Item: "${i.text}" at x=${i.x}`);
                  }
              });
          }
      });
  }
  else if (item.text) {
    // Group by Y coordinate (with some tolerance)
    let foundRow = false;
    for (const y of Object.keys(rows)) {
        if (Math.abs(y - item.y) < 0.5) { // 0.5 tolerance
            rows[y].push(item);
            foundRow = true;
            break;
        }
    }
    if (!foundRow) {
        rows[item.y] = [item];
    }
  }
});
