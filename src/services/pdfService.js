import logger from '@/utils/logger';
// CJS package: use namespace import so Vite/Rollup can resolve it
import * as ArabicReshaperModule from 'arabic-reshaper';
const ArabicReshaper = ArabicReshaperModule?.default ?? ArabicReshaperModule;

let _pdfDepsPromise = null;

/** Shared PDF deps (pdf-lib + fontkit) for use by composables and other services. */
export async function getPdfDeps() {
  if (_pdfDepsPromise) return _pdfDepsPromise;

  _pdfDepsPromise = Promise.all([import('pdf-lib'), import('@pdf-lib/fontkit')]).then(
    ([pdfLib, fontkitMod]) => ({
      PDFDocument: pdfLib.PDFDocument,
      rgb: pdfLib.rgb,
      fontkit: fontkitMod?.default || fontkitMod,
    })
  );

  return _pdfDepsPromise;
}

/**
 * Arabic font: TTF only — pdf-lib/fontkit renders Arabic correctly only with TTF.
 * WOFF/WOFF2 cause disconnected letters and broken ligatures.
 */
const ARABIC_FONT_URLS_TTF_ONLY = [
  '/fonts/Amiri-Regular.ttf',
  'https://mirrors.ctan.org/fonts/amiri/Amiri-Regular.ttf',
];

/**
 * Load Arabic font bytes for embedding in PDF (TTF only for correct Arabic support).
 * @returns {Promise<ArrayBuffer>}
 */
export async function loadArabicFontBytes() {
  for (const url of ARABIC_FONT_URLS_TTF_ONLY) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.arrayBuffer();
    } catch (_) {}
  }
  throw new Error('Could not load Arabic font for PDF');
}

/** Check if a character is in the Arabic Unicode block (including presentation forms). */
function isArabicChar(code) {
  return (
    (code >= 0x0600 && code <= 0x06ff) ||
    (code >= 0x0750 && code <= 0x077f) ||
    (code >= 0x08a0 && code <= 0x08ff) ||
    (code >= 0xfb50 && code <= 0xfdff) ||
    (code >= 0xfe70 && code <= 0xfeff)
  );
}

/**
 * Reshape text for PDF: only Arabic segments are reshaped and reversed (RTL);
 * Latin and other scripts are left unchanged so they display LTR.
 * @param {string} text
 * @returns {string}
 */
/** True if the character is only whitespace (space, tab, etc.). */
function isSpaceOnly(s) {
  return /^\s*$/.test(s);
}

export function reshapeArabic(text) {
  if (!text) return '';
  const str = String(text);
  if (!str.length) return '';

  const runs = [];
  let i = 0;
  while (i < str.length) {
    const start = i;
    const isArabic = isArabicChar(str.charCodeAt(i));
    while (i < str.length && isArabicChar(str.charCodeAt(i)) === isArabic) {
      i += 1;
    }
    runs.push({ text: str.slice(start, i), isArabic });
  }

  // Merge consecutive Arabic runs separated only by spaces so phrases like "خطة المطور" stay in one run.
  const merged = [];
  for (let j = 0; j < runs.length; j++) {
    const r = runs[j];
    if (!r.isArabic) {
      merged.push(r);
      continue;
    }
    let combined = r.text;
    while (j + 1 < runs.length && !runs[j + 1].isArabic && isSpaceOnly(runs[j + 1].text) && j + 2 < runs.length && runs[j + 2].isArabic) {
      combined += runs[j + 1].text + runs[j + 2].text;
      j += 2;
    }
    merged.push({ text: combined, isArabic: true });
  }

  const nonArabic = merged.filter(r => !r.isArabic).map(r => r.text).join('');
  const arabicParts = merged.filter(r => r.isArabic).map(r => {
    try {
      const reshaped = ArabicReshaper.convertArabic(r.text);
      return Array.from(reshaped).reverse().join('');
    } catch (_) {
      return Array.from(r.text).reverse().join('');
    }
  });
  return nonArabic + [...arabicParts].reverse().join('');
}

/** Reshape Arabic only (logical order), for use with drawTextRtl. No character reverse. */
function reshapeArabicLogical(text) {
  if (!text) return '';
  const str = String(text);
  const runs = [];
  let i = 0;
  while (i < str.length) {
    const start = i;
    const isArabic = isArabicChar(str.charCodeAt(i));
    while (i < str.length && isArabicChar(str.charCodeAt(i)) === isArabic) i += 1;
    runs.push({ text: str.slice(start, i), isArabic });
  }
  const merged = [];
  for (let j = 0; j < runs.length; j++) {
    const r = runs[j];
    if (!r.isArabic) {
      merged.push(r);
      continue;
    }
    let combined = r.text;
    while (j + 1 < runs.length && !runs[j + 1].isArabic && isSpaceOnly(runs[j + 1].text) && j + 2 < runs.length && runs[j + 2].isArabic) {
      combined += runs[j + 1].text + runs[j + 2].text;
      j += 2;
    }
    merged.push({ text: combined, isArabic: true });
  }
  const nonArabic = merged.filter(r => !r.isArabic).map(r => r.text).join('');
  const arabicParts = merged.filter(r => r.isArabic).map(r => {
    try {
      return ArabicReshaper.convertArabic(r.text);
    } catch (_) {
      return r.text;
    }
  });
  return nonArabic + arabicParts.join('');
}

function widthOfLogicalText(font, text, size) {
  const logical = reshapeArabicLogical(text);
  if (!logical) return 0;
  return Array.from(logical).reduce((sum, ch) => sum + font.widthOfTextAtSize(ch, size), 0);
}

/** Draw text RTL: logical order, each character placed from right to left so it reads correctly. */
function drawTextRtl(page, font, text, xRight, y, size, color) {
  const logical = reshapeArabicLogical(text);
  if (!logical) return;
  const chars = Array.from(logical);
  let x = xRight;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const w = font.widthOfTextAtSize(ch, size);
    x -= w;
    page.drawText(ch, { x, y, size, font, color });
  }
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
    logger.error('Error parsing date for day name:', e);
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
  } catch (_err) {
    return dateString;
  }
}

// Helper function to convert days to months (approximately)
function daysToMonths(days) {
  if (!days) return '';
  const months = Math.ceil(parseInt(days) / 30);
  return months.toString();
}


// Helper to get Arabic values for dropdowns
function getCommissionFromArabic(value) {
  const map = {
    owner: 'المالك',
    partner: 'المشتري',
  };
  return map[value] || value || '';
}

/** Single contract template used 100%: all pages preserved, only variable data drawn on top. */
const CONTRACT_TEMPLATE_PATH = '/contract_template_v2.pdf';

/** Developer plan (خطة المطور) template — نفس تصميم دوم_12. All pages preserved, variable data drawn on top. */
const DEVELOPER_PLAN_TEMPLATE_PATHS = [
  '/%D8%AF%D9%88%D9%85_12%5B1%5D.pdf',
  '/developer_plan_template.pdf',
];

/** Table cell positions when using template (دوم_12) — نضع الأرقام في خلايا الجدول الموجود. Tune to match your template. */
const DEVELOPER_PLAN_TEMPLATE_TABLE = {
  startY: null,
  rowHeight: 24,
  colLefts: null,
  cellPadding: 6,
};

/**
 * Unified PDF layout — same format and comprehensiveness as contract template (A4, margins, fonts, RTL).
 * All PDFs (reports, vouchers, unit details, etc.) use this so every document follows one standard.
 */
const PDF_LAYOUT = {
  PAGE_WIDTH: 595,
  PAGE_HEIGHT: 842,
  DOC_MARGIN: 50,
  LINE_HEIGHT: 18,
  TABLE_ROW: 16,
  TITLE_SIZE: 16,
  SUBTITLE_SIZE: 10,
  SECTION_TITLE_SIZE: 12,
  BODY_SIZE: 10,
  TABLE_HEADER_SIZE: 9,
  TABLE_CELL_SIZE: 8,
  FOOTER_SIZE: 8,
  STANDARD_FOOTER: 'تم إنشاؤه آلياً بواسطة نظام راكز',
};

export const downloadFilledContract = async contractData => {
  try {
    const { PDFDocument, rgb, fontkit } = await getPdfDeps();
    const existingPdfBytes = await fetch(CONTRACT_TEMPLATE_PATH).then(res =>
      res.arrayBuffer()
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = await loadArabicFontBytes();
    const arabicFont = await pdfDoc.embedFont(fontBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Template is used in full: no pages added/removed; we only fill variable fields at these positions.
    // Coordinates aligned with contract_template_v2.pdf (عقد حصري استاندرد).

    // We define fields with potentially multiple locations
    const FIELDS = [
      // --- Page 1 Header/Preamble ---
      {
        key: 'units_count',
        locations: [
          { x: 15.5, y: 10.2, page: 0 },
          { x: 13.7, y: 15.0, page: 0 },
          { x: 13.6, y: 16.0, page: 0 }, // _تادحولا_ددع
          { x: 13.7, y: 18.2, page: 0 },
        ],
      },
      {
        key: 'district',
        locations: [
          { x: 7.9, y: 15.0, page: 0 },
          { x: 7.9, y: 16.0, page: 0 },
          { x: 7.8, y: 18.2, page: 0 },
        ],
      },
      {
        key: 'unit_type',
        locations: [
          { x: 19.5, y: 15.0, page: 0 },
          { x: 19.4, y: 16.9, page: 0 },
          { x: 19.4, y: 18.2, page: 0 },
        ],
      },
      {
        key: 'project_name',
        locations: [
          { x: 23.8, y: 15.0, page: 0 },
          { x: 23.8, y: 16.9, page: 0 },
          { x: 23.8, y: 18.2, page: 0 },
          { x: 23.8, y: 18.2, page: 0 }, // Appears close
          { x: 10.6, y: 31.7, page: 0 }, // Second Party obligations section
        ],
      },

      // --- Dates Section (Row y=16.9) ---
      { key: 'gregorian_date', locations: [{ x: 5.0, y: 16.9, page: 0 }], type: 'date' },
      { key: 'hijri_date', locations: [{ x: 15.2, y: 16.9, page: 0 }] },
      { key: 'contract_day', locations: [{ x: 21.7, y: 16.9, page: 0 }] },

      // --- Contract City ---
      { key: 'contract_city', locations: [{ x: 23.5, y: 18.2, page: 0 }] },

      // --- Second Party (Header Section, y=31.1) ---
      { key: 'second_party_cr_number', locations: [{ x: 5.5, y: 31.2, page: 0 }] },
      { key: 'second_party_id', locations: [{ x: 19.7, y: 31.2, page: 0 }] }, // Using 'يناثلا_فرطلا_رقم' pos
      {
        key: 'second_party_name',
        locations: [
          { x: 26.2, y: 31.2, page: 0 },
          { x: 8.9, y: 32.9, page: 0 }, // Signature section
        ],
      },
      { key: 'second_party_address', locations: [{ x: 24.2, y: 31.2, page: 0 }] }, // 'اهرقم'

      // --- Second Party (Signature/Obligations) ---
      { key: 'second_party_signatory', locations: [{ x: 12.5, y: 34.1, page: 0 }] },

      // --- Bottom Section ---
      {
        key: 'second_party_role',
        locations: [
          { x: 7.6, y: 36.1, page: 0 },
          { x: 9.5, y: 36.1, page: 0 },
        ],
      },
      { key: 'second_party_phone', locations: [{ x: 15.8, y: 36.1, page: 0 }] },
      { key: 'agreement_duration_months', locations: [{ x: 18.5, y: 36.1, page: 0 }] }, // Duration
      { key: 'second_party_id_2', locations: [{ x: 25.7, y: 36.1, page: 0 }] }, // 'مقر_ةيوه'

      // --- Commission ---
      { key: 'commission_from', locations: [{ x: 7.7, y: 40.5, page: 0 }] },
      { key: 'commission_percent', locations: [{ x: 21.1, y: 40.5, page: 0 }] },
    ];

    const scaleX = 14.5;
    const scaleY = 14.5;
    const offsetX = 20;

    const drawText = (text, loc, size = 11) => {
      if (!text) return;
      const pageIndex = loc.page ?? 0;
      const page = pages[pageIndex] ?? firstPage;
      const { height } = page.getSize();

      const textWidth = arabicFont.widthOfTextAtSize(reshapeArabic(text), size);
      const textHeight = size + 4;

      // Overlay only the placeholder area so the rest of the template stays 100% intact
      page.drawRectangle({
        x: loc.x * scaleX + offsetX - 2,
        y: height - loc.y * scaleY - 22,
        width: textWidth + 4,
        height: textHeight,
        color: rgb(1, 1, 1),
      });

      page.drawText(reshapeArabic(text), {
        x: loc.x * scaleX + offsetX,
        y: height - loc.y * scaleY - 20,
        size,
        font: arabicFont,
        color: rgb(0, 0, 0),
      });
    };

    // Prepare Data
    const preparedData = {
      ...contractData,
      contract_day: getDayName(contractData.gregorian_date),
      gregorian_date: formatDate(contractData.gregorian_date),
      commission_from: getCommissionFromArabic(contractData.commission_from),
      agreement_duration_months: daysToMonths(contractData.agreement_duration_days),
      // Duplicate ID for multiple spots if needed
      second_party_id_2: contractData.second_party_id,
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
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    logger.error('PDF Generation Error:', error);
    throw error;
  }
};

/**
 * Generate a simple unit details PDF for download (project tracker).
 * @param {Object} unit - Unit object (unit_number, floor, area, bedrooms, price, facade, status, etc.)
 * @param {{ projectName?: string }} options - Optional project name for header
 * @returns {Promise<Uint8Array>} PDF bytes
 */
export const generateUnitDetailsPdf = async (unit, options = {}) => {
  try {
    const { PDFDocument, rgb, fontkit } = await getPdfDeps();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = await loadArabicFontBytes();
    const font = await pdfDoc.embedFont(fontBytes);

    const { PAGE_WIDTH, PAGE_HEIGHT, DOC_MARGIN, TITLE_SIZE, BODY_SIZE, FOOTER_SIZE, STANDARD_FOOTER } = PDF_LAYOUT;
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const { height } = page.getSize();
    const lineHeight = 22;
    let y = height - DOC_MARGIN;

    const drawLine = (label, value, size = PDF_LAYOUT.SECTION_TITLE_SIZE) => {
      if (y < DOC_MARGIN + lineHeight) return;
      const text = value != null && value !== '' ? `${label}: ${value}` : `${label}: —`;
      const shaped = reshapeArabic(text);
      const textW = font.widthOfTextAtSize(shaped, size);
      page.drawText(shaped, {
        x: PAGE_WIDTH - DOC_MARGIN - textW,
        y,
        size,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= lineHeight;
    };

    const title = options.projectName
      ? `تفاصيل الوحدة — ${options.projectName}`
      : 'تفاصيل الوحدة';
    const titleShaped = reshapeArabic(title);
    const titleW = font.widthOfTextAtSize(titleShaped, TITLE_SIZE);
    page.drawText(titleShaped, {
      x: PAGE_WIDTH - DOC_MARGIN - titleW,
      y,
      size: TITLE_SIZE,
      font,
      color: rgb(0.11, 0.16, 0.29),
    });
    y -= lineHeight * 1.5;

    const unitId = unit?.unit_number ?? unit?.id ?? '—';
    drawLine('رقم الوحدة', `#${unitId}`, 14);
    y -= 4;

    const statusMap = {
      available: 'متاحة',
      reserved: 'محجوزة',
      sold: 'مباعة',
      pending: 'قيد التفاوض',
    };
    const statusLabel = statusMap[unit?.status] || unit?.status || '—';
    drawLine('الحالة', statusLabel);

    drawLine('الدور', unit?.floor != null && !Number.isNaN(Number(unit.floor)) ? String(unit.floor) : null);
    drawLine('المساحة', unit?.area != null ? `${unit.area} م²` : null);
    drawLine('المساحة الخاصة', unit?.private_area != null ? `${unit.private_area} م²` : unit?.balcony_area != null ? `${unit.balcony_area} م²` : null);
    drawLine('إجمالي المساحة', unit?.total_area != null ? `${unit.total_area} م²` : null);
    drawLine('الغرف', unit?.bedrooms != null ? String(unit.bedrooms) : unit?.rooms != null ? String(unit.rooms) : null);
    drawLine('الواجهة', unit?.facade || unit?.view || null);

    const priceVal = unit?.price ?? unit?.total_price;
    const priceStr =
      priceVal != null && !Number.isNaN(Number(priceVal))
        ? `${Number(priceVal).toLocaleString('en-US')} ر.س`
        : null;
    drawLine('السعر', priceStr);

    const footerText = `${STANDARD_FOOTER} | ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`;
    const footerShaped = reshapeArabic(footerText);
    const footerW = font.widthOfTextAtSize(footerShaped, FOOTER_SIZE);
    page.drawText(footerShaped, {
      x: PAGE_WIDTH - DOC_MARGIN - footerW,
      y: DOC_MARGIN + 10,
      size: FOOTER_SIZE,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    logger.error('Unit details PDF generation error', error);
    throw error;
  }
};

// --- Shared document builder: same format as contract template (PDF_LAYOUT) ---
const { PAGE_WIDTH, PAGE_HEIGHT, DOC_MARGIN, LINE_HEIGHT, TABLE_ROW } = PDF_LAYOUT;
const TABLE_CELL_PAD = 4;

function drawSectionTitle(page, font, rgb, title, y) {
  const shaped = reshapeArabic(title);
  const textWidth = font.widthOfTextAtSize(shaped, PDF_LAYOUT.SECTION_TITLE_SIZE);
  const xRtl = PAGE_WIDTH - DOC_MARGIN - textWidth;
  page.drawText(shaped, {
    x: xRtl,
    y,
    size: PDF_LAYOUT.SECTION_TITLE_SIZE,
    font,
    color: rgb(0.11, 0.16, 0.29),
  });
  return y - LINE_HEIGHT;
}

function drawInfoTable(page, font, rgb, rows, y) {
  for (const [label, value] of rows) {
    if (y < DOC_MARGIN + LINE_HEIGHT) return y;
    const text = `${label}: ${value ?? '—'}`;
    const shaped = reshapeArabic(text);
    const textWidth = font.widthOfTextAtSize(shaped, PDF_LAYOUT.BODY_SIZE);
    const xRtl = PAGE_WIDTH - DOC_MARGIN - textWidth;
    page.drawText(shaped, {
      x: xRtl,
      y,
      size: PDF_LAYOUT.BODY_SIZE,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= TABLE_ROW;
  }
  return y - 8;
}

function drawDataTable(page, font, rgb, headers, rows, y) {
  const colCount = headers.length;
  const colWidth = (PAGE_WIDTH - 2 * DOC_MARGIN) / colCount;
  const headY = y;
  page.drawRectangle({
    x: DOC_MARGIN,
    y: headY - 20,
    width: PAGE_WIDTH - 2 * DOC_MARGIN,
    height: 20,
    color: rgb(0.11, 0.16, 0.29),
  });
  headers.forEach((h, i) => {
    const xRtl = PAGE_WIDTH - DOC_MARGIN - (i + 1) * colWidth + TABLE_CELL_PAD;
    page.drawText(reshapeArabic(String(h)), {
      x: xRtl,
      y: headY - 14,
      size: PDF_LAYOUT.TABLE_HEADER_SIZE,
      font,
      color: rgb(1, 1, 1),
    });
  });
  y -= 24;
  for (const row of rows) {
    if (y < DOC_MARGIN + 14) return y;
    row.forEach((cell, i) => {
      const xRtl = PAGE_WIDTH - DOC_MARGIN - (i + 1) * colWidth + TABLE_CELL_PAD;
      page.drawText(reshapeArabic(String(cell ?? '—')), {
        x: xRtl,
        y: y - 10,
        size: PDF_LAYOUT.TABLE_CELL_SIZE,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    });
    y -= TABLE_ROW;
  }
  return y - 10;
}

/** Build a report-style PDF from unified shape (title, subtitle, sections, footer). Exported for API-driven PDF. */
export async function buildDocumentPdf({ title, subtitle, sections, footer }) {
  const { PDFDocument, rgb, fontkit } = await getPdfDeps();
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const fontBytes = await loadArabicFontBytes();
  const font = await pdfDoc.embedFont(fontBytes);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - DOC_MARGIN;

  const titleShaped = reshapeArabic(title);
  const titleW = font.widthOfTextAtSize(titleShaped, PDF_LAYOUT.TITLE_SIZE);
  page.drawText(titleShaped, {
    x: PAGE_WIDTH - DOC_MARGIN - titleW,
    y,
    size: PDF_LAYOUT.TITLE_SIZE,
    font,
    color: rgb(0.11, 0.16, 0.29),
  });
  y -= 22;
  if (subtitle) {
    const subShaped = reshapeArabic(subtitle);
    const subW = font.widthOfTextAtSize(subShaped, PDF_LAYOUT.SUBTITLE_SIZE);
    page.drawText(subShaped, {
      x: PAGE_WIDTH - DOC_MARGIN - subW,
      y,
      size: PDF_LAYOUT.SUBTITLE_SIZE,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    y -= LINE_HEIGHT;
  }
  y -= 10;

  for (const sec of sections) {
    if (y < DOC_MARGIN + 80) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - DOC_MARGIN;
    }
    y = drawSectionTitle(page, font, rgb, sec.sectionTitle, y);
    if (sec.infoRows?.length) {
      y = drawInfoTable(page, font, rgb, sec.infoRows, y);
    }
    if (sec.headers && sec.rows) {
      y = drawDataTable(page, font, rgb, sec.headers, sec.rows, y);
    }
  }

  if (footer) {
    if (y < DOC_MARGIN + 30) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - DOC_MARGIN;
    }
    const footerShaped = reshapeArabic(footer);
    const footerW = font.widthOfTextAtSize(footerShaped, PDF_LAYOUT.FOOTER_SIZE);
    page.drawText(footerShaped, {
      x: PAGE_WIDTH - DOC_MARGIN - footerW,
      y: DOC_MARGIN + 10,
      size: PDF_LAYOUT.FOOTER_SIZE,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  return pdfDoc.save();
}

/** Project management contract summary (from resources/views/pdfs/project_management_contract) */
export async function generateContractSummaryPdf(contract) {
  const sections = [
    {
      sectionTitle: '◆ معلومات المشروع',
      infoRows: [
        ['اسم المشروع', contract?.project_name],
        ['المطور', contract?.developer_name],
        ['المدينة', contract?.city],
        ['الحي', contract?.district],
        ['الحالة', contract?.status],
        ...(contract?.notes ? [['ملاحظات', contract.notes]] : []),
      ],
    },
    {
      sectionTitle: '◆ التاريخ',
      infoRows: [['تاريخ الإنشاء', contract?.created_at ? new Date(contract.created_at).toISOString().slice(0, 10) : null]],
    },
  ];
  return buildDocumentPdf({
    title: 'تفاصيل العقد',
    subtitle: (contract?.project_name ?? 'Contract') + ' | Contract Summary',
    sections,
    footer: `هذا المستند تم إنشاؤه آلياً بواسطة نظام راكز | ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
  });
}

/** Commission claim (from resources/views/pdfs/commission-claim) */
export async function generateCommissionClaimPdf(commission, distributions = []) {
  const statusMap = { pending: 'معلق', approved: 'معتمد', paid: 'مدفوع', rejected: 'مرفوض' };
  const sections = [
    {
      sectionTitle: '◆ معلومات العمولة',
      infoRows: [
        ['سعر البيع النهائي', commission ? `${Number(commission.final_selling_price ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ريال` : null],
        ['نسبة العمولة', commission ? `${commission.commission_percentage}%` : null],
        ['الحالة', commission?.status ? statusMap[commission.status] ?? commission.status : null],
      ],
    },
    {
      sectionTitle: '◆ توزيع العمولة',
      headers: ['المستلم', 'النوع', 'النسبة', 'المبلغ', 'الحالة'],
      rows: (distributions || []).map(d => [
        d.recipient?.name ?? d.external_marketer_name ?? 'غير محدد',
        d.type ?? '—',
        `${d.percentage ?? 0}%`,
        `${Number(d.amount ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ريال`,
        statusMap[d.status] ?? d.status ?? '—',
      ]),
    },
    {
      sectionTitle: '◆ الإجماليات',
      infoRows: [
        ['المبلغ الإجمالي', commission ? `${Number(commission.total_amount ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ريال` : null],
        ['ضريبة القيمة المضافة (15%)', commission ? `${Number(commission.vat ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ريال` : null],
        ['مصاريف التسويق', commission ? `${Number(commission.marketing_expenses ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ريال` : null],
        ['رسوم البنك', commission ? `${Number(commission.bank_fees ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ريال` : null],
        ['صافي العمولة', commission ? `${Number(commission.net_amount ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ريال` : null],
      ],
    },
  ];
  return buildDocumentPdf({
    title: 'مطالبة عمولة',
    subtitle: `رقم العمولة: ${commission?.id ?? '—'} | تاريخ الإصدار: ${new Date().toISOString().slice(0, 10)}`,
    sections,
    footer: `هذا المستند تم إنشاؤه آلياً بواسطة نظام راكز العقاري | ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
  });
}

/** Deposit claim (from resources/views/pdfs/deposit-claim) */
export async function generateDepositClaimPdf(deposit) {
  const statusMap = { pending: 'معلق', received: 'مستلم', confirmed: 'مؤكد', refunded: 'مسترد' };
  const sourceMap = { owner: 'المالك', buyer: 'المشتري' };
  const infoRows = [
    ['المشروع', deposit?.contract?.project_name ?? 'غير محدد'],
    ...(deposit?.contractUnit ? [['الوحدة', `${deposit.contractUnit.unit_type ?? ''} - ${deposit.contractUnit.unit_number ?? ''}`]] : []),
    ['مصدر العمولة', deposit?.commission_source ? sourceMap[deposit.commission_source] ?? deposit.commission_source : null],
    ['طريقة الدفع', deposit?.payment_method],
    ['تاريخ الدفع', deposit?.payment_date],
    ['الحالة', deposit?.status ? statusMap[deposit.status] ?? deposit.status : null],
  ];
  if (deposit?.confirmedBy) {
    infoRows.push(['تم التأكيد بواسطة', deposit.confirmedBy.name], ['تاريخ التأكيد', deposit.confirmed_at]);
  }
  if (deposit?.refund_reason) {
    infoRows.push(['سبب الاسترداد', deposit.refund_reason], ['تاريخ الاسترداد', deposit.refunded_at]);
  }
  const sections = [
    { sectionTitle: '◆ معلومات العربون', infoRows },
    ...(deposit?.notes ? [{ sectionTitle: '◆ ملاحظات', infoRows: [['ملاحظات', deposit.notes]] }] : []),
  ];
  return buildDocumentPdf({
    title: 'مطالبة عربون',
    subtitle: `رقم العربون: ${deposit?.id ?? '—'} | تاريخ الإصدار: ${new Date().toISOString().slice(0, 10)}`,
    sections,
    footer: `هذا المستند تم إنشاؤه آلياً بواسطة نظام راكز العقاري | ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
  });
}

/** Marketer performance report (from resources/views/pdfs/marketer_performance_report) */
export async function generateMarketerPerformanceReportPdf(report, generatedAt) {
  const marketers = report?.marketers ?? [];
  const sections = [
    {
      sectionTitle: '◆ أداء المسوقين',
      headers: ['الاسم', 'البريد الإلكتروني', 'الفريق', 'نسبة تحقيق الهدف %', 'عدد الودائع', 'عدد الإنذارات', 'فترة التجربة'],
      rows: marketers.map(r => [
        r.name ?? '-',
        r.email ?? '-',
        r.team_name ?? '-',
        typeof r.target_achievement_rate === 'number' ? r.target_achievement_rate.toFixed(1) : (r.target_achievement_rate ?? '-'),
        String(r.deposits_count ?? 0),
        String(r.warnings_count ?? 0),
        r.is_in_probation ? 'نعم' : 'لا',
      ]),
    },
  ];
  if (report?.totals) {
    sections.push({
      sectionTitle: '◆ الملخص',
      infoRows: [
        ['عدد المسوقين', String(report.totals.marketers_count ?? 0)],
        ['متوسط تحقيق الهدف %', report.totals.avg_achievement != null ? Number(report.totals.avg_achievement).toFixed(1) : '—'],
        ['إجمالي الودائع', String(report.totals.total_deposits ?? 0)],
        ['إجمالي الإنذارات', String(report.totals.total_warnings ?? 0)],
      ],
    });
  }
  const period = report?.period ? `${report.period.year ?? ''} / ${report.period.month ?? ''}` : '';
  return buildDocumentPdf({
    title: 'تقرير أداء المسوقين',
    subtitle: `الفترة: ${period} | تاريخ التقرير: ${generatedAt ?? new Date().toISOString().slice(0, 10)}`,
    sections,
    footer: `هذا المستند تم إنشاؤه آلياً بواسطة نظام راكز | ${generatedAt ?? new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
  });
}

/** Expiring contracts report (from resources/views/pdfs/expiring_contracts_report) */
export async function generateExpiringContractsReportPdf(report, days = 30) {
  const expiring = report?.expiring_contracts ?? [];
  const probation = report?.probation_ending ?? [];
  const sections = [
    {
      sectionTitle: '◆ عقود قريبة من الانتهاء',
      headers: ['رقم العقد', 'اسم الموظف', 'البريد الإلكتروني', 'تاريخ الانتهاء', 'الأيام المتبقية'],
      rows: expiring.map(r => [r.contract_id ?? '-', r.employee_name ?? '-', r.employee_email ?? '-', r.end_date ?? '-', String(r.days_remaining ?? '-')]),
    },
    {
      sectionTitle: '◆ موظفون قرب انتهاء فترة التجربة',
      headers: ['الاسم', 'البريد الإلكتروني', 'تاريخ انتهاء التجربة', 'الأيام المتبقية'],
      rows: probation.map(r => [r.name ?? '-', r.email ?? '-', r.probation_end_date ?? '-', String(r.days_remaining ?? '-')]),
    },
  ];
  if (report?.summary) {
    sections.push({
      sectionTitle: '◆ الملخص',
      infoRows: [
        ['عدد العقود القريبة من الانتهاء', String(report.summary.contracts_expiring_count ?? 0)],
        ['عدد الموظفين قرب انتهاء التجربة', String(report.summary.probation_ending_count ?? 0)],
        ['الفترة المعتمدة (أيام)', String(report.summary.days_checked ?? days)],
      ],
    });
  }
  return buildDocumentPdf({
    title: 'تقرير العقود القريبة من الانتهاء وقرب انتهاء فترة التجربة',
    subtitle: `الفترة: خلال ${days} يوماً | تاريخ التقرير: ${report?.generated_at ?? new Date().toISOString().slice(0, 10)}`,
    sections,
    footer: `هذا المستند تم إنشاؤه آلياً بواسطة نظام راكز | ${report?.generated_at ?? ''}`,
  });
}

/** Marketing plan export (from resources/views/marketing/plan_export) */
export async function generateMarketingPlanExportPdf(plan) {
  const projectName = plan?.marketingProject?.contract?.project_name ?? plan?.marketing_project_name ?? '-';
  const sections = [
    {
      sectionTitle: '◆ معلومات الخطة',
      infoRows: [
        ['المشروع / Project', projectName],
        ['الموظف / User', plan?.user?.name ?? '-'],
        ['قيمة العمولة / Commission', plan?.commission_value != null ? Number(plan.commission_value).toFixed(2) : '-'],
        ['قيمة التسويق / Marketing', plan?.marketing_value != null ? Number(plan.marketing_value).toFixed(2) : '-'],
      ],
    },
  ];
  const dist = plan?.platform_distribution ?? {};
  if (Object.keys(dist).length) {
    sections.push({
      sectionTitle: '◆ توزيع المنصات / Platform Distribution',
      headers: ['المنصة / Platform', 'النسبة / Percentage'],
      rows: Object.entries(dist).map(([platform, pct]) => [platform, `${pct}%`]),
    });
  }
  const campaign = plan?.campaign_distribution ?? {};
  if (Object.keys(campaign).length) {
    sections.push({
      sectionTitle: '◆ توزيع الحملات / Campaign Distribution',
      headers: ['الحملة / Campaign', 'النسبة / Percentage'],
      rows: Object.entries(campaign).map(([c, pct]) => [c, `${pct}%`]),
    });
  }
  return buildDocumentPdf({
    title: 'خطة تسويق',
    subtitle: `Marketing Plan #${plan?.id ?? ''}`,
    sections,
    footer: 'هذا المستند تم إنشاؤه آلياً بواسطة نظام راكز العقاري',
  });
}

/** Default platform labels (Arabic) matching reference document order */
const WEEKLY_PLAN_PLATFORM_LABELS = [
  'منصة انستغرام',
  'منصة سناب',
  'منصة تيك توك',
  'منصة تويتر X',
  'منصة جوجل (تضمن يوتيوب)',
  'منصات اخرى (بيوت - سكني - حراج ....)',
  'منصة عقار',
];

/**
 * Build rows for weekly plan from distribution object (rows array or platform_distribution map).
 * @param {Object} distribution - { rows: [{ platform_ar, clicks, impressions }], total_clicks, total_impressions } or { platform_distribution: { instagram: pct, ... }, ... } with optional clicks/impressions per platform
 */
/** Western digits for PDF tables to avoid Arabic-Indic font issues. */
function fmtNum(n) {
  return Number(n ?? 0).toLocaleString('en-US');
}

function getWeeklyPlanTableData(distribution) {
  const rows = distribution?.rows ?? [];
  if (rows.length > 0) {
    const totalClicks = Number(distribution?.total_clicks ?? rows.reduce((s, r) => s + Number(r.clicks ?? 0), 0));
    const totalImpressions = Number(distribution?.total_impressions ?? rows.reduce((s, r) => s + Number(r.impressions ?? 0), 0));
    const tableRows = rows.map((r, i) => [
      String((i + 1).toString().padStart(2, '0')),
      r.platform_ar ?? r.platform ?? WEEKLY_PLAN_PLATFORM_LABELS[i] ?? '',
      fmtNum(r.clicks ?? 0),
      fmtNum(r.impressions ?? 0),
    ]);
    return { tableRows, totalClicks, totalImpressions };
  }
  const dist = distribution?.platform_distribution ?? distribution ?? {};
  const order = ['instagram', 'snapchat', 'tiktok', 'x', 'google_youtube', 'other', 'aqar'];
  const labels = {
    instagram: 'منصة انستغرام',
    snapchat: 'منصة سناب',
    tiktok: 'منصة تيك توك',
    x: 'منصة تويتر X',
    google_youtube: 'منصة جوجل (تضمن يوتيوب)',
    other: 'منصات اخرى (بيوت - سكني - حراج ....)',
    aqar: 'منصة عقار',
  };
  // Use plan totals so numbers change per plan; fallback only when no data at all
  const planTotalClicks = Number(distribution?.total_clicks);
  const planTotalImpressions = Number(distribution?.total_impressions);
  const totalClicksBase = Number.isFinite(planTotalClicks) ? planTotalClicks : 0;
  const totalImpressionsBase = Number.isFinite(planTotalImpressions) ? planTotalImpressions : 0;
  const tableRows = [];
  let totalClicks = 0;
  let totalImpressions = 0;
  order.forEach((key, i) => {
    const pct = dist[key] ?? 0;
    const clicks = dist[`${key}_clicks`] ?? (totalClicksBase > 0 ? Math.round(totalClicksBase * (pct / 100)) : 0);
    const impressions = dist[`${key}_impressions`] ?? (totalImpressionsBase > 0 ? Math.round(totalImpressionsBase * (pct / 100)) : 0);
    tableRows.push([
      (i + 1).toString().padStart(2, '0'),
      labels[key] ?? key,
      fmtNum(clicks),
      fmtNum(impressions),
    ]);
    totalClicks += clicks;
    totalImpressions += impressions;
  });
  return {
    tableRows,
    totalClicks: totalClicksBase > 0 ? totalClicksBase : totalClicks,
    totalImpressions: totalImpressionsBase > 0 ? totalImpressionsBase : totalImpressions,
  };
}

/** Logo paths for PDF header (optional). Add logo.png or logo.jpg to public/ for image logo. */
const PDF_LOGO_PATHS = ['/logo.png', '/logo.jpg', '/logo.jpeg'];
const PDF_LOGO_MAX_WIDTH = 120;
const PDF_LOGO_MAX_HEIGHT = 56;

/**
 * Draw logo image if available (PNG or JPG), else text. Uses pdfDoc and page.
 */
async function drawPdfLogo(pdfDoc, page, w, yStart) {
  for (const path of PDF_LOGO_PATHS) {
    try {
      const res = await fetch(path);
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const isJpg = /\.jpe?g$/i.test(path);
      const image = isJpg ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);
      const scale = Math.min(PDF_LOGO_MAX_WIDTH / image.width, PDF_LOGO_MAX_HEIGHT / image.height, 1);
      const imgW = image.width * scale;
      const imgH = image.height * scale;
      page.drawImage(image, { x: (w - imgW) / 2, y: yStart - imgH, width: imgW, height: imgH });
      return yStart - imgH - 16;
    } catch (_) {
      continue;
    }
  }
  return null;
}

/** Format number for PDF table: Western digits to avoid font rendering issues. */
function formatNumberForPdf(num) {
  if (num == null || Number.isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US');
}

/** Try to load developer plan template (دوم_12). Returns { pdfDoc, page, font, w, h } or null. */
async function loadDeveloperPlanTemplate() {
  const { PDFDocument, fontkit } = await getPdfDeps();
  for (const path of DEVELOPER_PLAN_TEMPLATE_PATHS) {
    try {
      const res = await fetch(path);
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      pdfDoc.registerFontkit(fontkit);
      const fontBytes = await loadArabicFontBytes();
      const font = await pdfDoc.embedFont(fontBytes);
      const pages = pdfDoc.getPages();
      if (!pages.length) continue;
      const page = pages[0];
      const { width: w, height: h } = page.getSize();
      return { pdfDoc, page, font, w, h };
    } catch (_) {
      continue;
    }
  }
  return null;
}

/** Platform distribution weekly — uses template دوم_12[1].pdf when available, else builds from scratch */
export async function generatePlatformDistributionPdf(distribution) {
  const { PDFDocument, rgb, fontkit } = await getPdfDeps();
  const brown = rgb(0.42, 0.33, 0.27);

  let pdfDoc;
  let page;
  let font;
  let w;
  let h;
  const useTemplate = await loadDeveloperPlanTemplate();
  if (useTemplate) {
    ({ pdfDoc, page, font, w, h } = useTemplate);
  } else {
    pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await loadArabicFontBytes();
    font = await pdfDoc.embedFont(fontBytes);
    const { PAGE_WIDTH, PAGE_HEIGHT } = PDF_LAYOUT;
    w = PAGE_WIDTH;
    h = PAGE_HEIGHT;
    page = pdfDoc.addPage([w, h]);
  }

  const margin = PDF_LAYOUT.DOC_MARGIN;
  const rowAlt = rgb(0.98, 0.98, 0.97);
  let y = h - margin;

  const hasArabic = (t) => /[\u0600-\u06FF]/.test(t);
  const drawCentered = (text, size, yPos) => {
    if (hasArabic(text)) {
      const tw = widthOfLogicalText(font, text, size);
      drawTextRtl(page, font, text, (w + tw) / 2, yPos, size, brown);
    } else {
      const tw = font.widthOfTextAtSize(text, size);
      page.drawText(text, { x: (w - tw) / 2, y: yPos, size, font, color: brown });
    }
  };

  const drawR = (text, x, yPos, size = 10, color = rgb(0.2, 0.2, 0.2)) => {
    if (hasArabic(text)) {
      const tw = widthOfLogicalText(font, text, size);
      drawTextRtl(page, font, text, x + tw, yPos, size, color);
    } else {
      page.drawText(text, { x, y: yPos, size, font, color });
    }
  };

  if (!useTemplate) {
    const logoEndY = await drawPdfLogo(pdfDoc, page, w, y);
    if (logoEndY != null) {
      y = logoEndY;
    } else {
      drawCentered('راكز', 22, y);
      y -= 22;
      drawCentered('RAKEZ', 14, y);
      y -= 36;
    }
  } else {
    y = h - margin - 80;
  }

  const { tableRows, totalClicks, totalImpressions } = getWeeklyPlanTableData(distribution);
  const colW = [w * 0.08, w * 0.42, w * 0.25, w * 0.25];
  const defaultLefts = [margin, margin + colW[0], margin + colW[0] + colW[1], margin + colW[0] + colW[1] + colW[2]];
  const rowH = useTemplate && DEVELOPER_PLAN_TEMPLATE_TABLE.rowHeight != null
    ? DEVELOPER_PLAN_TEMPLATE_TABLE.rowHeight
    : 24;
  const pad = useTemplate ? (DEVELOPER_PLAN_TEMPLATE_TABLE.cellPadding ?? 6) : 6;
  const headers = ['م', 'المنصة الإعلانية', 'النقرات', 'المشاهدات'];
  const lefts = (useTemplate && Array.isArray(DEVELOPER_PLAN_TEMPLATE_TABLE.colLefts) && DEVELOPER_PLAN_TEMPLATE_TABLE.colLefts.length >= 4)
    ? DEVELOPER_PLAN_TEMPLATE_TABLE.colLefts
    : defaultLefts;

  drawR('◆', margin, y, 14, brown);
  drawR('الحملات الإعلانية على المنصات الإلكترونية', margin + 20, y, 16, brown);
  y -= 22;
  drawCentered('خطة اسبوعية مرنة :', 14, y);
  y -= 28;

  if (useTemplate && typeof DEVELOPER_PLAN_TEMPLATE_TABLE.startY === 'number') {
    y = DEVELOPER_PLAN_TEMPLATE_TABLE.startY;
  }

  if (!useTemplate) {
    page.drawRectangle({ x: margin, y: y - rowH, width: w - 2 * margin, height: rowH, color: brown });
  }
  headers.forEach((hdr, i) => {
    const xRight = lefts[i] + pad + widthOfLogicalText(font, hdr, 10);
    drawTextRtl(page, font, hdr, xRight, y - 16, 10, useTemplate ? rgb(0.2, 0.2, 0.2) : rgb(1, 1, 1));
  });
  y -= rowH;

  tableRows.forEach((row, idx) => {
    if (y < margin + rowH) return;
    if (!useTemplate && idx < tableRows.length - 1 && idx % 2 === 1) {
      page.drawRectangle({ x: margin, y: y - rowH, width: w - 2 * margin, height: rowH, color: rowAlt });
    }
    row.forEach((cell, i) => {
      const cellStr = String(cell ?? '—');
      const isNumeric = i >= 2 && /^[\d,\s.-]+$/.test(cellStr);
      const cellY = y - 16;
      if (isNumeric) {
        page.drawText(cellStr, { x: lefts[i] + pad, y: cellY, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
      } else {
        const xRight = lefts[i] + pad + widthOfLogicalText(font, cellStr, 9);
        drawTextRtl(page, font, cellStr, xRight, cellY, 9, rgb(0.2, 0.2, 0.2));
      }
    });
    y -= rowH;
  });

  if (!useTemplate) {
    page.drawRectangle({ x: margin, y: y - rowH, width: w - 2 * margin, height: rowH, color: brown });
  }
  const totalLabelRight = lefts[1] + pad + widthOfLogicalText(font, 'الإجمالي', 10);
  drawTextRtl(page, font, 'الإجمالي', totalLabelRight, y - 16, 10, useTemplate ? rgb(0.2, 0.2, 0.2) : rgb(1, 1, 1));
  page.drawText(formatNumberForPdf(totalClicks), { x: lefts[2] + pad, y: y - 16, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  page.drawText(formatNumberForPdf(totalImpressions), { x: lefts[3] + pad, y: y - 16, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= rowH + 20;

  drawR('◆ الأرقام مرنة بشكل أسبوعي', margin, y, 11, rgb(0.25, 0.25, 0.25));
  y -= 20;
  drawR('◆ سيتم تفعيل حملات - Sales - Leads - Awareness - Traffic -', margin, y, 11, rgb(0.25, 0.25, 0.25));
  y -= 40;

  const footerY = 58;
  if (!useTemplate) {
    page.drawRectangle({ x: 0, y: 0, width: w, height: footerY + 20, color: rgb(0.99, 0.99, 0.99) });
    page.drawLine({ start: { x: margin, y: footerY + 18 }, end: { x: w - margin, y: footerY + 18 }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
  }

  const footerLeft = margin;
  const footerRight = w - margin;
  const footerMid = (footerLeft + footerRight) / 2;
  const fs = 8;
  const drawFooterRtl = (text, xRight, yPos, color) => drawTextRtl(page, font, text, xRight, yPos, fs, color);
  if (hasArabic('© 920015711')) {
    drawFooterRtl('© 920015711', footerLeft + widthOfLogicalText(font, '© 920015711', fs), footerY, rgb(0.4, 0.4, 0.4));
  } else {
    page.drawText('© 920015711', { x: footerLeft, y: footerY, size: fs, font, color: rgb(0.4, 0.4, 0.4) });
  }
  page.drawText('rakezalaqaria.com', { x: footerLeft, y: footerY - 12, size: fs, font, color: rgb(0.4, 0.4, 0.4) });

  const addrAr = 'المملكة العربية السعودية الرياض 3310 أنس بن مالك، حي الملقا';
  const addrEn = 'Kingdom of Saudi Arabia Riyadh 3310 Anas bin Malik street, Al Malqa Dist.';
  const crAr = 'س.ت 1010650301';
  const crEn = 'C. R. 1010650301';
  const twAr = widthOfLogicalText(font, addrAr, fs);
  drawFooterRtl(addrAr, footerMid + twAr / 2, footerY, rgb(0.4, 0.4, 0.4));
  const twEn = font.widthOfTextAtSize(addrEn, fs - 1);
  page.drawText(addrEn, { x: footerMid - twEn / 2, y: footerY - 10, size: fs - 1, font, color: rgb(0.5, 0.5, 0.5) });
  const twCr = widthOfLogicalText(font, crAr, fs);
  drawFooterRtl(crAr, footerMid + twCr / 2, footerY - 22, rgb(0.4, 0.4, 0.4));
  page.drawText(crEn, { x: footerMid - font.widthOfTextAtSize(crEn, fs - 1) / 2, y: footerY - 32, size: fs - 1, font, color: rgb(0.5, 0.5, 0.5) });

  const companyAr = 'شركة راكز العقارية';
  const companyEn = 'RAKEZ REAL ESTATE CO';
  drawFooterRtl(companyAr, footerRight, footerY, brown);
  page.drawText(companyEn, { x: footerRight - font.widthOfTextAtSize(companyEn, fs - 1), y: footerY - 12, size: fs - 1, font, color: rgb(0.5, 0.5, 0.5) });

  return pdfDoc.save();
}

/** Reservation voucher (from resources/views/reservations/voucher) */
export async function generateReservationVoucherPdf(reservation, project = {}, unit = {}, employee = {}) {
  const res = reservation ?? {};
  const typeLabel = res.reservation_type === 'confirmed_reservation' ? 'حجز مؤكد' : 'حجز للتفاوض';
  const paymentLabels = { bank_transfer: 'تحويل بنكي', cash: 'نقداً', bank_financing: 'تمويل بنكي' };
  const purchaseLabels = { cash: 'نقدي', supported_bank: 'بنك معتمد', unsupported_bank: 'بنك غير معتمد' };
  const downStatus = res.down_payment_status === 'refundable' ? 'قابلة للاسترداد' : 'غير قابلة للاسترداد';
  const contractDate = res.contract_date ? new Date(res.contract_date).toISOString().slice(0, 10) : '—';
  const sections = [
    {
      sectionTitle: '◆ بيانات المشروع والوحدة',
      infoRows: [
        ['اسم المشروع / Project Name', project?.name ?? 'N/A'],
        ['المدينة / City', project?.city ?? 'N/A'],
        ['الحي / District', project?.district ?? 'N/A'],
        ['اسم المطور / Developer', project?.developer_name ?? 'N/A'],
        ['رقم الوحدة / Unit No', unit?.number ?? unit?.unit_number ?? 'N/A'],
        ['نوع الوحدة / Unit Type', unit?.type ?? unit?.unit_type ?? 'N/A'],
        ['المساحة (م²) / Area', unit?.area ?? 'N/A'],
        ['الطابق / Floor', unit?.floor ?? 'N/A'],
        ['سعر الوحدة (ريال) / Price', unit?.price != null ? Number(unit.price).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) : 'N/A'],
      ],
    },
    {
      sectionTitle: '◆ بيانات الدفع',
      infoRows: [
        ['طريقة الدفع / Payment Method', paymentLabels[res.payment_method] ?? res.payment_method],
        ['مبلغ الدفعة المقدمة (ريال)', res.down_payment_amount != null ? Number(res.down_payment_amount).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) : '—'],
        ['حالة الدفعة المقدمة', downStatus],
        ['آلية الشراء / Purchase', purchaseLabels[res.purchase_mechanism] ?? res.purchase_mechanism],
      ],
    },
    {
      sectionTitle: '◆ بيانات العميل',
      infoRows: [
        ['اسم العميل / Client Name', res.client_name],
        ['رقم الجوال / Mobile', res.client_mobile],
        ['الجنسية / Nationality', res.client_nationality],
        ['رقم الآيبان / IBAN', res.client_iban],
      ],
    },
    {
      sectionTitle: '◆ بيانات الموظف المسؤول',
      infoRows: [
        ['اسم الموظف / Employee', employee?.name ?? 'N/A'],
        ['الفريق / Team', employee?.team ?? 'N/A'],
      ],
    },
  ];
  if (res.negotiation_notes) {
    sections.push({ sectionTitle: '◆ ملاحظات التفاوض', infoRows: [['ملاحظات', res.negotiation_notes]] });
  }
  return buildDocumentPdf({
    title: `سند حجز - ${res.id ?? ''}`,
    subtitle: `مستلم من: ${res.client_name ?? ''} | رقم الجوال: ${res.client_mobile ?? ''} | النوع: ${typeLabel} | المبلغ: ${Number(res.down_payment_amount ?? 0).toLocaleString('ar-SA')} | التاريخ: ${contractDate}`,
    sections,
    footer: 'يعتبر اعتماد الحجز بتوقيع العميل والإقرار بالموافقة وقراءة الشروط. تم إنشاؤه آلياً بواسطة نظام راكز.',
  });
}
