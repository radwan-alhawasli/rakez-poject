const fs = require('fs');
const { PdfReader } = require('pdfreader');

fs.readFile('public/contract_template.pdf', (err, pdfBuffer) => {
  if (err) console.error(err);
  else {
    let fullText = "";
    new PdfReader().parseBuffer(pdfBuffer, (err, item) => {
      if (err) console.error("error:", err);
      else if (!item) {
          // End of file
          console.warn("End of file");
           // Find all occurrences of <<...>>
            const regex = /<<\s*([^>]+)\s*>>/g; 
            const matches = [...fullText.matchAll(regex)];
            
            console.log('--- FOUND PLACEHOLDERS ---');
            if (matches.length > 0) {
                const uniquePlaceholders = [...new Set(matches.map(m => m[0]))];
                uniquePlaceholders.forEach(p => console.log(p));
            } else {
                console.log('No placeholders found in text format.');
                console.log('Sample text dump (first 1000 chars):');
                console.log(fullText.substring(0, 1000));
            }
            console.log('--------------------------');
      }
      else if (item.text) {
        fullText += item.text + " ";
      }
    });
  }
});
