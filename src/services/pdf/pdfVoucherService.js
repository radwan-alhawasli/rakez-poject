import { buildDocumentPdf } from './pdfCore';

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

export async function generateReservationVoucherPdf(reservation, project = {}, unit = {}, employee = {}) {
  const res = reservation ?? {};
  const typeLabel = res.reservation_type === 'confirmed_reservation' ? 'حجز مؤكد' : 'حجز للتفاوض';
  const paymentLabels = { bank_transfer: 'تحويل بنكي', cash: 'نقداً', bank_financing: 'تمويل بنكي' };
  const contractDate = res.contract_date ? new Date(res.contract_date).toISOString().slice(0, 10) : '—';
  const sections = [
    {
      sectionTitle: '◆ بيانات المشروع والوحدة',
      infoRows: [
        ['اسم المشروع / Project Name', project?.name ?? 'N/A'],
        ['رقم الوحدة / Unit No', unit?.number ?? unit?.unit_number ?? 'N/A'],
        ['سعر الوحدة (ريال) / Price', unit?.price != null ? Number(unit.price).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) : 'N/A'],
      ],
    },
    {
      sectionTitle: '◆ بيانات الدفع والعميل',
      infoRows: [
        ['طريقة الدفع / Payment Method', paymentLabels[res.payment_method] ?? res.payment_method],
        ['اسم العميل / Client Name', res.client_name],
        ['اسم الموظف / Employee', employee?.name ?? 'N/A'],
      ],
    },
  ];
  return buildDocumentPdf({
    title: `سند حجز - ${res.id ?? ''}`,
    subtitle: `مستلم من: ${res.client_name ?? ''} | النوع: ${typeLabel} | التاريخ: ${contractDate}`,
    sections,
    footer: 'تم إنشاؤه آلياً بواسطة نظام راكز.',
  });
}
