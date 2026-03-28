import logger from '@/utils/logger';
import { getPdfDeps, loadArabicFontBytes, reshapeArabic, PDF_LAYOUT } from './pdfCore';

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

    const drawLine = (label, value, size = PDF_LAYOUT.SECTION_TITLE_SIZE) => {
      if (y < DOC_MARGIN + lineHeight) return;
      const text = value != null && value !== '' ? `${label}: ${value}` : `${label}: —`;
      const shaped = reshapeArabic(text);
      const textW = font.widthOfTextAtSize(shaped, size);
      page.drawText(shaped, { x: PAGE_WIDTH - DOC_MARGIN - textW, y, size, font, color: rgb(0.2, 0.2, 0.2) });
      y -= lineHeight;
    };

    const title = options.projectName ? `تفاصيل الوحدة — ${options.projectName}` : 'تفاصيل الوحدة';
    const titleShaped = reshapeArabic(title);
    const titleW = font.widthOfTextAtSize(titleShaped, TITLE_SIZE);
    page.drawText(titleShaped, { x: PAGE_WIDTH - DOC_MARGIN - titleW, y, size: TITLE_SIZE, font, color: rgb(0.11, 0.16, 0.29) });
    y -= lineHeight * 1.5;

    drawLine('رقم الوحدة', `#${unit?.unit_number ?? unit?.id ?? '—'}`, 14);
    const statusMap = { available: 'متاحة', reserved: 'محجوزة', sold: 'مباعة', pending: 'قيد التفاوض' };
    drawLine('الحالة', statusMap[unit?.status] || unit?.status || '—');
    drawLine('الدور', unit?.floor != null ? String(unit.floor) : null);
    drawLine('المساحة', unit?.area != null ? `${unit.area} م²` : null);
    drawLine('الغرف', unit?.bedrooms != null ? String(unit.bedrooms) : null);
    drawLine('الواجهة', unit?.facade || unit?.view || null);
    const priceVal = unit?.price ?? unit?.total_price;
    drawLine('السعر', priceVal != null ? `${Number(priceVal).toLocaleString('en-US')} ر.س` : null);

    const footerText = `${STANDARD_FOOTER} | ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`;
    const footerShaped = reshapeArabic(footerText);
    const footerW = font.widthOfTextAtSize(footerShaped, FOOTER_SIZE);
    page.drawText(footerShaped, { x: PAGE_WIDTH - DOC_MARGIN - footerW, y: DOC_MARGIN + 10, size: FOOTER_SIZE, font, color: rgb(0.5, 0.5, 0.5) });

    return await pdfDoc.save();
  } catch (error) { logger.error('Unit PDF error', error); throw error; }
};
