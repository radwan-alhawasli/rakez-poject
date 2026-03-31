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
    } catch (_) {
      // Try next URL when a font host is unavailable.
    }
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

export function widthOfLogicalText(font, text, size) {
  const logical = reshapeArabicLogical(text);
  if (!logical) return 0;
  return Array.from(logical).reduce((sum, ch) => sum + font.widthOfTextAtSize(ch, size), 0);
}

/** Draw text RTL: logical order, each character placed from right to left so it reads correctly. */
export function drawTextRtl(page, font, text, xRight, y, size, color) {
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

/** Developer plan (خطة المطور) template — نفس تصميم دوم_12. All pages preserved, variable data drawn on top. */
export const DEVELOPER_PLAN_TEMPLATE_PATHS = [
  '/%D8%AF%D9%88%D9%85_12%5B1%5D.pdf',
  '/developer_plan_template.pdf',
];

/** Table cell positions when using template (دوم_12) — نضع الأرقام في خلايا الجدول الموجود. Tune to match your template. */
export const DEVELOPER_PLAN_TEMPLATE_TABLE = {
  startY: null,
  rowHeight: 24,
  colLefts: null,
  cellPadding: 6,
};

/**
 * Unified PDF layout — same format and comprehensiveness as contract template (A4, margins, fonts, RTL).
 * All PDFs (reports, vouchers, unit details, etc.) use this so every document follows one standard.
 */
export const PDF_LAYOUT = {
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
