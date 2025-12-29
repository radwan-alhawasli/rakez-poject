const fs = require('fs');
const { PdfReader } = require('pdfreader');

const placeholdersMap = {
    'اسم_المشروع': '« _عورشملا_مسا  »',
    'يوم_التعاقد': '« دقاعتلا_موي »',
    'اسم_الطرف_الثاني': '«  يناثلا_فرطلا_مسا »',
    'مقر_الطرف_الثاني': '«  يناثلا_فرطلا_رقم  »', // Assuming this maps to address/location based on 'mqr'
    'تاريخ_هجري': '« يرجه_خيرات »',
    'تاريخ_ميلادي': '« يدلايم_خيرات »',
    'مدينة_التعاقد': '« دقاعتلا_ةنيدم  »',
    'هوية_رقم': '« مقر_ةيوه »',
    'رقم_الجوال': '«  لاوجلا_مقر  »',
    'بصفته': '«  _هتفصب  »'
};

// Reverse map to lookup by the PDF string
const pdfStringMap = {};
Object.entries(placeholdersMap).forEach(([key, val]) => {
    // Normalizing spaces for lookup
    pdfStringMap[val.replace(/\s+/g, ' ').trim()] = key;
});

const foundPlaceholders = {};

fs.readFile('public/contract_template.pdf', (err, pdfBuffer) => {
  if (err) return console.error(err);

  new PdfReader().parseBuffer(pdfBuffer, (err, item) => {
    if (err) console.error("error:", err);
    else if (!item) {
        console.log(JSON.stringify(foundPlaceholders, null, 2));
    }
    else if (item.text) {
        const text = item.text.replace(/\s+/g, ' ').trim();
        // Check if this text item resembles any of our placeholders
        // We do loose matching because pdfreader might split text or have extra spaces
        
        for (const [pdfString, key] of Object.entries(pdfStringMap)) {
             if (text.includes(pdfString) || pdfString.includes(text)) {
                 // If the match is close enough. 
                 // Note: strict equality is safer if the PDF text is cleanly separated.
                 // Let's try to match parts if it's split, but for now assuming it might be whole.
                 
                 // Better check: does it look like a placeholder?
                 if (text.includes('«') && text.includes('»')) {
                     // It is a placeholder line.
                     // Let's see which one it matches best.
                     if (text === pdfString || text.includes(pdfString)) {
                         foundPlaceholders[key] = {
                             page: item.page, // Note: pdfreader might not give 'page' in 'item' directly in all versions, usually it emits a "page" event. 
                             // Wait, PdfReader usage: 'item' has 'page' if using specific table mode, but basic parseBuffer emits items.
                             // Actually parseBuffer callback gets (err, item). item has text, x, y. 
                             // Page tracking needs to handle the 'page' item type or null check? 
                             // Let's verify PdfReader behavior. usually it emits { page: X } item.
                             x: item.x,
                             y: item.y,
                             original_text: item.text
                         };
                     }
                 }
             }
        }
    }
    else if (item.page) {
        // Tracker for current page if needed, but the item itself usually doesn't have page prop if it's a text item
        // Actually the example shows we might need to track page manually if item.page is a separate event.
        // But let's assume valid output for now or refine.
    }
  });
});

// We need to track page numbers, PdfReader emits { page: 1 } objects
let currentPage = 0;
// Re-write using detailed tracking
const coordinates = {};

new PdfReader().parseBuffer(fs.readFileSync('public/contract_template.pdf'), (err, item) => {
    if (err) console.error(err);
    else if (!item) {
        // End
        console.log("--- JSON OUTPUT ---");
        console.log(JSON.stringify(coordinates, null, 2));
        console.log("-------------------");
    } else if (item.page) {
        currentPage = item.page;
    } else if (item.text) {
        const text = item.text.trim().replace(/\s+/g, ' ');
        // Find which placeholder this text corresponds to
        Object.entries(pdfStringMap).forEach(([pdfStr, key]) => {
             // Clean the pdfStr too
             const cleanPdfStr = pdfStr.replace(/\s+/g, ' ');
             if (text.includes(cleanPdfStr) || cleanPdfStr.includes(text)) {
                 // If it's a significant match (sometimes text is just "«")
                 if (text.length > 2 && text.includes('«') && text.includes('»')) {
                      coordinates[key] = {
                          page: currentPage,
                          x: item.x,
                          y: item.y,
                          text: text,
                          w: item.w // width if available
                      };
                 }
             }
        });
    }
});
