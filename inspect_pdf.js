const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function listFields() {
  try {
    const pdfBytes = fs.readFileSync('public/contract_template.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log('--- PDF Fields ---');
    fields.forEach(field => {
      const type = field.constructor.name;
      const name = field.getName();
      console.log(`Name: "${name}", Type: ${type}`);
    });
    console.log('------------------');
  } catch (err) {
    console.error('Error:', err);
  }
}

listFields();
