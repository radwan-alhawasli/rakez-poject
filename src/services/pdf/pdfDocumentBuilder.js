// @ts-nocheck — PDF table/layout helpers: dynamic cell shapes.
import { PDF_LAYOUT, getPdfDeps, loadArabicFontBytes, drawTextRtl } from './pdfCore.js';

const { PAGE_WIDTH, PAGE_HEIGHT, DOC_MARGIN, LINE_HEIGHT, TABLE_ROW } = PDF_LAYOUT;
const TABLE_CELL_PAD = 4;
const CONTENT_RIGHT = PAGE_WIDTH - DOC_MARGIN;

/**
 * @param {any} page
 * @param {any} font
 * @param {any} rgb
 * @param {any} title
 * @param {any} y
 */
function drawSectionTitle(page, font, rgb, title, y) {
  drawTextRtl(
    page,
    font,
    title,
    CONTENT_RIGHT,
    y,
    PDF_LAYOUT.SECTION_TITLE_SIZE,
    rgb(0.11, 0.16, 0.29)
  );
  return y - LINE_HEIGHT;
}

/**
 * @param {any} page
 * @param {any} font
 * @param {any} rgb
 * @param {any} rows
 * @param {any} y
 */
function drawInfoTable(page, font, rgb, rows, y) {
  for (const [label, value] of rows) {
    if (y < DOC_MARGIN + LINE_HEIGHT) return y;
    const text = `${label}: ${value ?? '—'}`;
    drawTextRtl(page, font, text, CONTENT_RIGHT, y, PDF_LAYOUT.BODY_SIZE, rgb(0.2, 0.2, 0.2));
    y -= TABLE_ROW;
  }
  return y - 8;
}

/**
 * @param {any} page
 * @param {any} font
 * @param {any} rgb
 * @param {any} headers
 * @param {any} rows
 * @param {any} y
 */
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
  /**
   * @param {any} h
   * @param {any} i
   */
  headers.forEach((h, i) => {
    const xRight = PAGE_WIDTH - DOC_MARGIN - i * colWidth - TABLE_CELL_PAD;
    drawTextRtl(page, font, String(h), xRight, headY - 14, PDF_LAYOUT.TABLE_HEADER_SIZE, rgb(1, 1, 1));
  });
  y -= 24;
  for (const row of rows) {
    if (y < DOC_MARGIN + 14) return y;
    /**
     * @param {any} cell
     * @param {any} i
     */
    row.forEach((cell, i) => {
      const xRight = PAGE_WIDTH - DOC_MARGIN - i * colWidth - TABLE_CELL_PAD;
      drawTextRtl(
        page,
        font,
        String(cell ?? '—'),
        xRight,
        y - 10,
        PDF_LAYOUT.TABLE_CELL_SIZE,
        rgb(0.2, 0.2, 0.2)
      );
    });
    y -= TABLE_ROW;
  }
  return y - 10;
}

/**
 * Build a report-style PDF from unified shape (title, subtitle, sections, footer). Exported for API-driven PDF.
 * @param {{ title: string, subtitle?: string, sections: Array<{ sectionTitle: string, infoRows?: string[][], headers?: string[], rows?: unknown[][] }>, footer?: string }} opts
 */
export async function buildDocumentPdf({ title, subtitle, sections, footer }) {
  const { PDFDocument, rgb, fontkit } = await getPdfDeps();
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const fontBytes = await loadArabicFontBytes();
  const font = await pdfDoc.embedFont(fontBytes);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - DOC_MARGIN;

  drawTextRtl(page, font, title, CONTENT_RIGHT, y, PDF_LAYOUT.TITLE_SIZE, rgb(0.11, 0.16, 0.29));
  y -= 22;
  if (subtitle) {
    drawTextRtl(page, font, subtitle, CONTENT_RIGHT, y, PDF_LAYOUT.SUBTITLE_SIZE, rgb(0.4, 0.4, 0.4));
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
    drawTextRtl(
      page,
      font,
      footer,
      CONTENT_RIGHT,
      DOC_MARGIN + 10,
      PDF_LAYOUT.FOOTER_SIZE,
      rgb(0.5, 0.5, 0.5)
    );
  }

  return pdfDoc.save();
}
