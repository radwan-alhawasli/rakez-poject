import {
  getPdfDeps,
  loadArabicFontBytes,
  PDF_LAYOUT,
  DEVELOPER_PLAN_TEMPLATE_PATHS,
  DEVELOPER_PLAN_TEMPLATE_TABLE,
  widthOfLogicalText,
  drawTextRtl,
} from './pdfCore.js';
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

