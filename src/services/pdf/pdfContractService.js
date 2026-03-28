import logger from '@/utils/logger';
import { getPdfDeps, loadArabicFontBytes, reshapeArabic } from './pdfCore';

const CONTRACT_TEMPLATE_PATH = '/contract_template_v2.pdf';

function getDayName(dateString) {
  if (!dateString) return '';
  try {
    let date = dateString.includes('-') && dateString.split('-')[0].length === 4 ? new Date(dateString + 'T00:00:00') : new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  } catch (e) { return ''; }
}

function formatDateAr(dateString) {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateString;
  } catch (_) { return dateString; }
}

function daysToMonths(days) {
  if (!days) return '';
  return Math.ceil(parseInt(days) / 30).toString();
}

function getCommissionFromArabic(value) {
  const map = { owner: 'المالك', partner: 'المشتري' };
  return map[value] || value || '';
}

export const downloadFilledContract = async contractData => {
  try {
    const { PDFDocument, rgb, fontkit } = await getPdfDeps();
    const existingPdfBytes = await fetch(CONTRACT_TEMPLATE_PATH).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await loadArabicFontBytes();
    const arabicFont = await pdfDoc.embedFont(fontBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const FIELDS = [
      { key: 'units_count', locations: [{ x: 15.5, y: 10.2, page: 0 }, { x: 13.7, y: 15.0, page: 0 }, { x: 13.6, y: 16.0, page: 0 }, { x: 13.7, y: 18.2, page: 0 }] },
      { key: 'district', locations: [{ x: 7.9, y: 15.0, page: 0 }, { x: 7.9, y: 16.0, page: 0 }, { x: 7.8, y: 18.2, page: 0 }] },
      { key: 'unit_type', locations: [{ x: 19.5, y: 15.0, page: 0 }, { x: 19.4, y: 16.9, page: 0 }, { x: 19.4, y: 18.2, page: 0 }] },
      { key: 'project_name', locations: [{ x: 23.8, y: 15.0, page: 0 }, { x: 23.8, y: 16.9, page: 0 }, { x: 23.8, y: 18.2, page: 0 }, { x: 10.6, y: 31.7, page: 0 }] },
      { key: 'gregorian_date', locations: [{ x: 5.0, y: 16.9, page: 0 }], type: 'date' },
      { key: 'hijri_date', locations: [{ x: 15.2, y: 16.9, page: 0 }] },
      { key: 'contract_day', locations: [{ x: 21.7, y: 16.9, page: 0 }] },
      { key: 'contract_city', locations: [{ x: 23.5, y: 18.2, page: 0 }] },
      { key: 'second_party_cr_number', locations: [{ x: 5.5, y: 31.2, page: 0 }] },
      { key: 'second_party_id', locations: [{ x: 19.7, y: 31.2, page: 0 }] },
      { key: 'second_party_name', locations: [{ x: 26.2, y: 31.2, page: 0 }, { x: 8.9, y: 32.9, page: 0 }] },
      { key: 'second_party_address', locations: [{ x: 24.2, y: 31.2, page: 0 }] },
      { key: 'second_party_signatory', locations: [{ x: 12.5, y: 34.1, page: 0 }] },
      { key: 'second_party_role', locations: [{ x: 7.6, y: 36.1, page: 0 }, { x: 9.5, y: 36.1, page: 0 }] },
      { key: 'second_party_phone', locations: [{ x: 15.8, y: 36.1, page: 0 }] },
      { key: 'agreement_duration_months', locations: [{ x: 18.5, y: 36.1, page: 0 }] },
      { key: 'second_party_id_2', locations: [{ x: 25.7, y: 36.1, page: 0 }] },
      { key: 'commission_from', locations: [{ x: 7.7, y: 40.5, page: 0 }] },
      { key: 'commission_percent', locations: [{ x: 21.1, y: 40.5, page: 0 }] },
    ];

    const scaleX = 14.5; const scaleY = 14.5; const offsetX = 20;
    const drawT = (text, loc, size = 11) => {
      if (!text) return;
      const page = pages[loc.page ?? 0] ?? firstPage;
      const { height } = page.getSize();
      const shaped = reshapeArabic(text);
      const tw = arabicFont.widthOfTextAtSize(shaped, size);
      page.drawRectangle({ x: loc.x * scaleX + offsetX - 2, y: height - loc.y * scaleY - 22, width: tw + 4, height: size + 4, color: rgb(1, 1, 1) });
      page.drawText(shaped, { x: loc.x * scaleX + offsetX, y: height - loc.y * scaleY - 20, size, font: arabicFont, color: rgb(0, 0, 0) });
    };

    const data = { ...contractData, contract_day: getDayName(contractData.gregorian_date), gregorian_date: formatDateAr(contractData.gregorian_date), commission_from: getCommissionFromArabic(contractData.commission_from), agreement_duration_months: daysToMonths(contractData.agreement_duration_days), second_party_id_2: contractData.second_party_id };
    FIELDS.forEach(f => { const val = data[f.key]; if (val) f.locations.forEach(l => drawT(String(val), l)); });
    return await pdfDoc.save();
  } catch (error) { logger.error('Contract PDF error', error); throw error; }
};

/** Project management contract summary */
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
  return import('./pdfCore').then(core => core.buildDocumentPdf({
    title: 'تفاصيل العقد',
    subtitle: (contract?.project_name ?? 'Contract') + ' | Contract Summary',
    sections,
    footer: `هذا المستند تم إنشاؤه آلياً بواسطة نظام راكز | ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
  }));
}
