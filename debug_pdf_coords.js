const fs = require('fs');
const { PdfReader } = require('pdfreader');

// Simple script to output ALL text items with coordinates to debug location
console.log("--- START DEBUG DUMP ---");

new PdfReader().parseBuffer(fs.readFileSync('public/contract_template.pdf'), (err, item) => {
    if (err) console.error("error:", err);
    else if (!item) {
        console.log("--- END DEBUG DUMP ---");
    } else if (item.text) {
        // Filter slightly to avoid noise, but keep enough to find our targets
        const t = item.text.trim();
        // We look for parts of the known placeholders or brackets
        if (t.includes('«') || t.includes('»') || t.includes('عورشم') || t.includes('فرطلا') || t.includes('خيرات')) {
             console.log(JSON.stringify({
                 page: item.page, // Verify if 'page' is attached to text item in this version
                 x: item.x,
                 y: item.y,
                 text: item.text,
                 w: item.w
             }));
        }
    }
});
