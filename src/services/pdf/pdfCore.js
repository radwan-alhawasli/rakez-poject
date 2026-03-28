import logger from '@/utils/logger';
import * as ArabicReshaperModule from 'arabic-reshaper';
const ArabicReshaper = ArabicReshaperModule?.default ?? ArabicReshaperModule;

let _pdfDepsPromise = null;

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

const ARABIC_FONT_URLS_TTF_ONLY = [
  '/fonts/Amiri-Regular.ttf',
  'https://mirrors.ctan.org/fonts/amiri/Amiri-Regular.ttf',
];

export async function loadArabicFontBytes() {
  for (const url of ARABIC_FONT_URLS_TTF_ONLY) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.arrayBuffer();
    } catch (_) {}
  }
  throw new Error('Could not load Arabic font for PDF');
}

function isArabicChar(code) {
  return (
    (code >= 0x0600 && code <= 0x06ff) ||
    (code >= 0x0750 && code <= 0x077f) ||
    (code >= 0x08a0 && code <= 0x08ff) ||
    (code >= 0xfb50 && code <= 0xfdff) ||
    (code >= 0xfe70 && code <= 0xfeff)
  );
}

function isSpaceOnly(s) { return /^\s*$/.test(s); }

export function reshapeArabic(text) {
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
    if (!r.isArabic) { merged.push(r); continue; }
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
    } catch (_) { return Array.from(r.text).reverse().join(''); }
  });
  return nonArabic + [...arabicParts].reverse().join('');
}

export function reshapeArabicLogical(text) {
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
    if (!r.isArabic) { merged.push(r); continue; }
    let combined = r.text;
    while (j + 1 < runs.length && !runs[j + 1].isArabic && isSpaceOnly(runs[j + 1].text) && j + 2 < runs.length && runs[j + 2].isArabic) {
      combined += runs[j + 1].text + runs[j + 2].text;
      j += 2;
    }
    merged.push({ text: combined, isArabic: true });
  }
  const nonArabic = merged.filter(r => !r.isArabic).map(r => r.text).join('');
  const arabicParts = merged.filter(r => r.isArabic).map(r => {
    try { return ArabicReshaper.convertArabic(r.text); } catch (_) { return r.text; }
  });
  return nonArabic + arabicParts.join('');
}

export function widthOfLogicalText(font, text, size) {
  const logical = reshapeArabicLogical(text);
  if (!logical) return 0;
  return Array.from(logical).reduce((sum, ch) => sum + font.widthOfTextAtSize(ch, size), 0);
}

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

export function drawSectionTitle(page, font, rgb, title, y) {
  const shaped = reshapeArabic(title);
  const textWidth = font.widthOfTextAtSize(shaped, PDF_LAYOUT.SECTION_TITLE_SIZE);
  const xRtl = PDF_LAYOUT.PAGE_WIDTH - PDF_LAYOUT.DOC_MARGIN - textWidth;
  page.drawText(shaped, {
    x: xRtl, y, size: PDF_LAYOUT.SECTION_TITLE_SIZE, font, color: rgb(0.11, 0.16, 0.29),
  });
  return y - PDF_LAYOUT.LINE_HEIGHT;
}

export function drawInfoTable(page, font, rgb, rows, y) {
  for (const [label, value] of rows) {
    if (y < PDF_LAYOUT.DOC_MARGIN + PDF_LAYOUT.LINE_HEIGHT) return y;
    const text = `${label}: ${value ?? '—'}`;
    const shaped = reshapeArabic(text);
    const textWidth = font.widthOfTextAtSize(shaped, PDF_LAYOUT.BODY_SIZE);
    const xRtl = PDF_LAYOUT.PAGE_WIDTH - PDF_LAYOUT.DOC_MARGIN - textWidth;
    page.drawText(shaped, {
      x: xRtl, y, size: PDF_LAYOUT.BODY_SIZE, font, color: rgb(0.2, 0.2, 0.2),
    });
    y -= PDF_LAYOUT.TABLE_ROW;
  }
  return y - 8;
}

const TABLE_CELL_PAD = 4;
export function drawDataTable(page, font, rgb, headers, rows, y) {
  const colCount = headers.length;
  const colWidth = (PDF_LAYOUT.PAGE_WIDTH - 2 * PDF_LAYOUT.DOC_MARGIN) / colCount;
  const headY = y;
  page.drawRectangle({
    x: PDF_LAYOUT.DOC_MARGIN, y: headY - 20, width: PDF_LAYOUT.PAGE_WIDTH - 2 * PDF_LAYOUT.DOC_MARGIN, height: 20, color: rgb(0.11, 0.16, 0.29),
  });
  headers.forEach((h, i) => {
    const xRtl = PDF_LAYOUT.PAGE_WIDTH - PDF_LAYOUT.DOC_MARGIN - (i + 1) * colWidth + TABLE_CELL_PAD;
    page.drawText(reshapeArabic(String(h)), {
      x: xRtl, y: headY - 14, size: PDF_LAYOUT.TABLE_HEADER_SIZE, font, color: rgb(1, 1, 1),
    });
  });
  y -= 24;
  for (const row of rows) {
    if (y < PDF_LAYOUT.DOC_MARGIN + 14) return y;
    row.forEach((cell, i) => {
      const xRtl = PDF_LAYOUT.PAGE_WIDTH - PDF_LAYOUT.DOC_MARGIN - (i + 1) * colWidth + TABLE_CELL_PAD;
      page.drawText(reshapeArabic(String(cell ?? '—')), {
        x: xRtl, y: y - 10, size: PDF_LAYOUT.TABLE_CELL_SIZE, font, color: rgb(0.2, 0.2, 0.2),
      });
    });
    y -= PDF_LAYOUT.TABLE_ROW;
  }
  return y - 10;
}

export async function buildDocumentPdf({ title, subtitle, sections, footer }) {
  const { PDFDocument, rgb, fontkit } = await getPdfDeps();
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const fontBytes = await loadArabicFontBytes();
  const font = await pdfDoc.embedFont(fontBytes);

  let page = pdfDoc.addPage([PDF_LAYOUT.PAGE_WIDTH, PDF_LAYOUT.PAGE_HEIGHT]);
  let y = PDF_LAYOUT.PAGE_HEIGHT - PDF_LAYOUT.DOC_MARGIN;

  const titleShaped = reshapeArabic(title);
  const titleW = font.widthOfTextAtSize(titleShaped, PDF_LAYOUT.TITLE_SIZE);
  page.drawText(titleShaped, {
    x: PDF_LAYOUT.PAGE_WIDTH - PDF_LAYOUT.DOC_MARGIN - titleW, y, size: PDF_LAYOUT.TITLE_SIZE, font, color: rgb(0.11, 0.16, 0.29),
  });
  y -= 22;
  if (subtitle) {
    const subShaped = reshapeArabic(subtitle);
    const subW = font.widthOfTextAtSize(subShaped, PDF_LAYOUT.SUBTITLE_SIZE);
    page.drawText(subShaped, {
      x: PDF_LAYOUT.PAGE_WIDTH - PDF_LAYOUT.DOC_MARGIN - subW, y, size: PDF_LAYOUT.SUBTITLE_SIZE, font, color: rgb(0.4, 0.4, 0.4),
    });
    y -= PDF_LAYOUT.LINE_HEIGHT;
  }
  y -= 10;

  for (const sec of sections) {
    if (y < PDF_LAYOUT.DOC_MARGIN + 80) {
      page = pdfDoc.addPage([PDF_LAYOUT.PAGE_WIDTH, PDF_LAYOUT.PAGE_HEIGHT]);
      y = PDF_LAYOUT.PAGE_HEIGHT - PDF_LAYOUT.DOC_MARGIN;
    }
    y = drawSectionTitle(page, font, rgb, sec.sectionTitle, y);
    if (sec.infoRows?.length) y = drawInfoTable(page, font, rgb, sec.infoRows, y);
    if (sec.headers && sec.rows) y = drawDataTable(page, font, rgb, sec.headers, sec.rows, y);
  }

  if (footer) {
    if (y < PDF_LAYOUT.DOC_MARGIN + 30) {
      page = pdfDoc.addPage([PDF_LAYOUT.PAGE_WIDTH, PDF_LAYOUT.PAGE_HEIGHT]);
      y = PDF_LAYOUT.PAGE_HEIGHT - PDF_LAYOUT.DOC_MARGIN;
    }
    const footerShaped = reshapeArabic(footer);
    const footerW = font.widthOfTextAtSize(footerShaped, PDF_LAYOUT.FOOTER_SIZE);
    page.drawText(footerShaped, {
      x: PDF_LAYOUT.PAGE_WIDTH - PDF_LAYOUT.DOC_MARGIN - footerW, y: PDF_LAYOUT.DOC_MARGIN + 10, size: PDF_LAYOUT.FOOTER_SIZE, font, color: rgb(0.5, 0.5, 0.5),
    });
  }
  return pdfDoc.save();
}

/** Logo paths for PDF header. */
const PDF_LOGO_PATHS = ['/logo.png', '/logo.jpg', '/logo.jpeg'];
const PDF_LOGO_MAX_WIDTH = 120;
const PDF_LOGO_MAX_HEIGHT = 56;

export async function drawPdfLogo(pdfDoc, page, w, yStart) {
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
    } catch (_) {}
  }
  return null;
}
