import logger from '../utils/logger'

let _pdfDepsPromise = null
async function getPdfDeps() {
    if (_pdfDepsPromise) return _pdfDepsPromise

    _pdfDepsPromise = Promise.all([
        import('pdf-lib'),
        import('@pdf-lib/fontkit')
    ]).then(([pdfLib, fontkitMod]) => ({
        PDFDocument: pdfLib.PDFDocument,
        rgb: pdfLib.rgb,
        fontkit: fontkitMod?.default || fontkitMod
    }))

    return _pdfDepsPromise
}

// Helper function to extract day name from date
function getDayName(dateString) {
    if (!dateString) return '';
    try {
        // Handle YYYY-MM-DD format explicitly
        let date;
        if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
            // YYYY-MM-DD format
            date = new Date(dateString + 'T00:00:00');
        } else {
            date = new Date(dateString);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return '';
        }
        
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return days[date.getDay()];
    } catch (e) {
        logger.error('Error parsing date for day name:', e)
        return '';
    }
}

// Helper function to format date from YYYY-MM-DD to DD-MM-YYYY
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateString;
    } catch (e) {
        return dateString;
    }
}

// Helper function to convert days to months (approximately)
function daysToMonths(days) {
    if (!days) return '';
    const months = Math.ceil(parseInt(days) / 30);
    return months.toString();
}



// Simple Arabic reshaper (very basic, for full support we'd need 'arabic-persian-reshaper' library)
function reshapeArabic(text) {
    if (!text) return '';
    return text.split('').reverse().join(''); 
}

// Helper to get Arabic values for dropdowns
function getCommissionFromArabic(value) {
    const map = {
        'owner': 'المالك',
        'partner': 'المشتري'
    };
    return map[value] || value || '';
}

export const downloadFilledContract = async (contractData) => {
    try {
        const { PDFDocument, rgb, fontkit } = await getPdfDeps()
        // Use the new template
        const existingPdfBytes = await fetch('/contract_template_v2.pdf').then(res => res.arrayBuffer())

        const pdfDoc = await PDFDocument.load(existingPdfBytes)
        
        // Register fontkit
        pdfDoc.registerFontkit(fontkit)
        
        // Load Arabic font
        const fontBytes = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/amiri@5.0.0/files/amiri-arabic-400-normal.woff').then(res => res.arrayBuffer())
        const arabicFont = await pdfDoc.embedFont(fontBytes)

        const pages = pdfDoc.getPages()
        const firstPage = pages[0]
        
        // Coordinates extracted from 'عقد حصري استاندرد v27.10.2024.pdf'
        // Using extracted X and Y from pdfreader
        
        // We define fields with potentially multiple locations
        const FIELDS = [
            // --- Page 1 Header/Preamble ---
            { key: 'units_count', locations: [
                { x: 15.5, y: 10.2, page: 0 }, 
                { x: 13.7, y: 15.0, page: 0 },
                { x: 13.6, y: 16.0, page: 0 }, // _تادحولا_ددع
                { x: 13.7, y: 18.2, page: 0 }
            ]},
            { key: 'district', locations: [
                { x: 7.9, y: 15.0, page: 0 },
                { x: 7.9, y: 16.0, page: 0 },
                { x: 7.8, y: 18.2, page: 0 }
            ]},
            { key: 'unit_type', locations: [
                { x: 19.5, y: 15.0, page: 0 },
                { x: 19.4, y: 16.9, page: 0 },
                { x: 19.4, y: 18.2, page: 0 }
            ]},
            { key: 'project_name', locations: [
                { x: 23.8, y: 15.0, page: 0 },
                { x: 23.8, y: 16.9, page: 0 },
                { x: 23.8, y: 18.2, page: 0 },
                { x: 23.8, y: 18.2, page: 0 }, // Appears close
                { x: 10.6, y: 31.7, page: 0 }  // Second Party obligations section
            ]},
            
            // --- Dates Section (Row y=16.9) ---
            { key: 'gregorian_date', locations: [{ x: 5.0, y: 16.9, page: 0 }], type: 'date' },
            { key: 'hijri_date', locations: [{ x: 15.2, y: 16.9, page: 0 }] },
            { key: 'contract_day', locations: [{ x: 21.7, y: 16.9, page: 0 }] },
            
            // --- Contract City ---
            { key: 'contract_city', locations: [{ x: 23.5, y: 18.2, page: 0 }] },
            
            // --- Second Party (Header Section, y=31.1) ---
            { key: 'second_party_cr_number', locations: [{ x: 5.5, y: 31.2, page: 0 }] },
            { key: 'second_party_id', locations: [{ x: 19.7, y: 31.2, page: 0 }] }, // Using 'يناثلا_فرطلا_رقم' pos
            { key: 'second_party_name', locations: [
                { x: 26.2, y: 31.2, page: 0 },
                { x: 8.9, y: 32.9, page: 0 } // Signature section
            ]},
            { key: 'second_party_address', locations: [{ x: 24.2, y: 31.2, page: 0 }] }, // 'اهرقم'
            
            // --- Second Party (Signature/Obligations) ---
            { key: 'second_party_signatory', locations: [{ x: 12.5, y: 34.1, page: 0 }] }, 
            
            // --- Bottom Section ---
            { key: 'second_party_role', locations: [{ x: 7.6, y: 36.1, page: 0 }, { x: 9.5, y: 36.1, page: 0 }] },
            { key: 'second_party_phone', locations: [{ x: 15.8, y: 36.1, page: 0 }] },
            { key: 'agreement_duration_months', locations: [{ x: 18.5, y: 36.1, page: 0 }] }, // Duration
            { key: 'second_party_id_2', locations: [{ x: 25.7, y: 36.1, page: 0 }] }, // 'مقر_ةيوه'
            
            // --- Commission ---
            { key: 'commission_from', locations: [{ x: 7.7, y: 40.5, page: 0 }] },
            { key: 'commission_percent', locations: [{ x: 21.1, y: 40.5, page: 0 }] },
        ];


        // Coordinate conversion helper
        const { height } = firstPage.getSize()
        const scaleX = 14.5; // Keeping existing scale, seems robust
        const scaleY = 14.5; 
        const offsetX = 20; 
        
        const drawText = (text, loc, size = 11) => {
            if (!text) return;
            const page = pages[loc.page || 0] || firstPage;
            
            const textWidth = arabicFont.widthOfTextAtSize(reshapeArabic(text), size);
            const textHeight = size + 4;
            
            // Draw white rectangle behind text to cover placeholder
            page.drawRectangle({
                x: loc.x * scaleX + offsetX - 2,
                y: height - (loc.y * scaleY) - 22,
                width: textWidth + 4,
                height: textHeight,
                color: rgb(1, 1, 1),
            });
            
            // Draw the actual text
            page.drawText(reshapeArabic(text), {
                x: loc.x * scaleX + offsetX,
                y: height - (loc.y * scaleY) - 20, 
                size,
                font: arabicFont,
                color: rgb(0, 0, 0),
            })
        }

        // Prepare Data
        const preparedData = {
            ...contractData,
            contract_day: getDayName(contractData.gregorian_date),
            gregorian_date: formatDate(contractData.gregorian_date),
            commission_from: getCommissionFromArabic(contractData.commission_from),
            agreement_duration_months: daysToMonths(contractData.agreement_duration_days),
             // Duplicate ID for multiple spots if needed
            second_party_id_2: contractData.second_party_id
        };

        // Iterate and Draw
        FIELDS.forEach(field => {
            const value = preparedData[field.key];
            if (value) {
                field.locations.forEach(loc => {
                    drawText(String(value), loc);
                });
            }
        });
        
        // Save
        const pdfBytes = await pdfDoc.save()
        return pdfBytes
    } catch (error) {
        logger.error('PDF Generation Error:', error)
        throw error
    }
}
