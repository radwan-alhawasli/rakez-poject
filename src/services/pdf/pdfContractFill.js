// @ts-nocheck — PDF draw helpers: dynamic API shapes; checked at runtime.
import logger from '@/utils/logger';
import { getPdfDeps, loadArabicFontBytes, reshapeArabic } from './pdfCore.js';

/** Single contract template used 100%: all pages preserved, only variable data drawn on top. */
const CONTRACT_TEMPLATE_PATH = '/contract_template_v2.pdf';

/**
 * @param {any} dateString
 */
function getDayName(dateString) {
  if (!dateString) return '';
  try {
    let date;
    if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
      date = new Date(dateString + 'T00:00:00');
    } else {
      date = new Date(dateString);
    }

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

/**
 * @param {any} dateString
 */
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

/**
 * @param {any} days
 */
function daysToMonths(days) {
  if (!days) return '';
  const months = Math.ceil(parseInt(days) / 30);
  return months.toString();
}

/**
 * @param {any} value
 */
function getCommissionFromArabic(value) {
  const map = {
    owner: 'المالك',
    partner: 'المشتري',
  };
  return map[value] || value || '';
}

/**
 * @param {any} contractData
 */
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

    const FIELDS = [
      {
        key: 'units_count',
        locations: [
          { x: 15.5, y: 10.2, page: 0 },
          { x: 13.7, y: 15.0, page: 0 },
          { x: 13.6, y: 16.0, page: 0 },
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
          { x: 23.8, y: 18.2, page: 0 },
          { x: 10.6, y: 31.7, page: 0 },
        ],
      },
      { key: 'gregorian_date', locations: [{ x: 5.0, y: 16.9, page: 0 }], type: 'date' },
      { key: 'hijri_date', locations: [{ x: 15.2, y: 16.9, page: 0 }] },
      { key: 'contract_day', locations: [{ x: 21.7, y: 16.9, page: 0 }] },
      { key: 'contract_city', locations: [{ x: 23.5, y: 18.2, page: 0 }] },
      { key: 'second_party_cr_number', locations: [{ x: 5.5, y: 31.2, page: 0 }] },
      { key: 'second_party_id', locations: [{ x: 19.7, y: 31.2, page: 0 }] },
      {
        key: 'second_party_name',
        locations: [
          { x: 26.2, y: 31.2, page: 0 },
          { x: 8.9, y: 32.9, page: 0 },
        ],
      },
      { key: 'second_party_address', locations: [{ x: 24.2, y: 31.2, page: 0 }] },
      { key: 'second_party_signatory', locations: [{ x: 12.5, y: 34.1, page: 0 }] },
      {
        key: 'second_party_role',
        locations: [
          { x: 7.6, y: 36.1, page: 0 },
          { x: 9.5, y: 36.1, page: 0 },
        ],
      },
      { key: 'second_party_phone', locations: [{ x: 15.8, y: 36.1, page: 0 }] },
      { key: 'agreement_duration_months', locations: [{ x: 18.5, y: 36.1, page: 0 }] },
      { key: 'second_party_id_2', locations: [{ x: 25.7, y: 36.1, page: 0 }] },
      { key: 'commission_from', locations: [{ x: 7.7, y: 40.5, page: 0 }] },
      { key: 'commission_percent', locations: [{ x: 21.1, y: 40.5, page: 0 }] },
    ];

    const scaleX = 14.5;
    const scaleY = 14.5;
    const offsetX = 20;

    /**
     * @param {any} text
     * @param {any} loc
     */
    const drawText = (text, loc, size = 11) => {
      if (!text) return;
      const pageIndex = loc.page ?? 0;
      const page = pages[pageIndex] ?? firstPage;
      const { height } = page.getSize();

      const textWidth = arabicFont.widthOfTextAtSize(reshapeArabic(text), size);
      const textHeight = size + 4;

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

    const preparedData = {
      ...contractData,
      contract_day: getDayName(contractData.gregorian_date),
      gregorian_date: formatDate(contractData.gregorian_date),
      commission_from: getCommissionFromArabic(contractData.commission_from),
      agreement_duration_months: daysToMonths(contractData.agreement_duration_days),
      second_party_id_2: contractData.second_party_id,
    };

    FIELDS.forEach(field => {
      const value = preparedData[field.key];
      if (value) {
        field.locations.forEach(loc => {
          drawText(String(value), loc);
        });
      }
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    logger.error('PDF Generation Error:', error);
    throw error;
  }
};
