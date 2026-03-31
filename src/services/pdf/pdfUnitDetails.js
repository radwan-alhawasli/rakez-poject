// @ts-nocheck — unit detail blobs from API.
import logger from '@/utils/logger';
import { getPdfDeps, loadArabicFontBytes, reshapeArabic, PDF_LAYOUT } from './pdfCore.js';

/**
 * @param {any} unit
 */
export const generateUnitDetailsPdf = async (unit, options = {}) => {
  try {
    const { PDFDocument, rgb, fontkit } = await getPdfDeps();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = await loadArabicFontBytes();
    const font = await pdfDoc.embedFont(fontBytes);

    const { PAGE_WIDTH, PAGE_HEIGHT, DOC_MARGIN, TITLE_SIZE, FOOTER_SIZE, STANDARD_FOOTER } = PDF_LAYOUT;
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const { height } = page.getSize();
    const lineHeight = 22;
    let y = height - DOC_MARGIN;

    /**
     * @param {any} label
     * @param {any} value
     */
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
