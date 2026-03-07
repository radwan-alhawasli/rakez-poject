const fs = require('fs');
const path = require('path');

const files = [
  'src/components/sales/tabs/SalesSoldUnitsTab.vue',
  'src/components/sales/tabs/SalesProjectSchedulesTab.vue',
  'src/components/sales/tabs/SalesDepositsTab.vue'
];

function fixEncoding(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    // Try to decode as UTF-8 first
    let content = buffer.toString('utf8');
    
    // Check if it looks like double-encoded UTF-8 (Windows-1252 interpreted UTF-8)
    // Common sequences: Ã (0xC3) followed by various chars
    if (content.includes('Ã') || content.includes('Ø') || content.includes('Ù')) {
      // It's likely corrupted. We need to reverse the damage.
      // The damage usually happens when UTF-8 bytes are read as Windows-1252 (or ISO-8859-1)
      // and then saved back as UTF-8.
      
      // To reverse:
      // 1. Convert the string back to bytes using 'binary' (which maps 1:1 to bytes for 0-255 range)
      //    or 'latin1'.
      // 2. Interpret those bytes as UTF-8.
      
      const recovered = Buffer.from(content, 'binary').toString('utf8');
      
      // Check if recovered looks better (contains Arabic)
      if (/[\u0600-\u06FF]/.test(recovered)) {
        console.log(`Fixed encoding for ${filePath}`);
        fs.writeFileSync(filePath, recovered, 'utf8');
      } else {
        console.log(`Could not recover ${filePath} (result didn't look like Arabic)`);
      }
    } else {
      console.log(`${filePath} does not appear to be corrupted.`);
    }
  } catch (e) {
    console.error(`Error processing ${filePath}:`, e);
  }
}

files.forEach(file => {
  fixEncoding(path.resolve(__dirname, file));
});
