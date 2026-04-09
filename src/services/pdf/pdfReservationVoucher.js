// @ts-nocheck — voucher field shapes vary by API version.
import { buildDocumentPdf } from './pdfDocumentBuilder.js';

/**
 * @param {any} reservation
 */
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
        ['سعر الوحدة (ريال) / Price', unit?.price != null ? Number(unit.price).toLocaleString('ar-SA', { minimumFractionDigits: 2, numberingSystem: 'latn' }) : 'N/A'],
      ],
    },
    {
      sectionTitle: '◆ بيانات الدفع',
      infoRows: [
        ['طريقة الدفع / Payment Method', paymentLabels[res.payment_method] ?? res.payment_method],
        ['مبلغ الدفعة المقدمة (ريال)', res.down_payment_amount != null ? Number(res.down_payment_amount).toLocaleString('ar-SA', { minimumFractionDigits: 2, numberingSystem: 'latn' }) : '—'],
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
    subtitle: `مستلم من: ${res.client_name ?? ''} | رقم الجوال: ${res.client_mobile ?? ''} | النوع: ${typeLabel} | المبلغ: ${Number(res.down_payment_amount ?? 0).toLocaleString('ar-SA', { numberingSystem: 'latn' })} | التاريخ: ${contractDate}`,
    sections,
    footer: 'يعتبر اعتماد الحجز بتوقيع العميل والإقرار بالموافقة وقراءة الشروط. تم إنشاؤه آلياً بواسطة نظام راكز.',
  });
}
