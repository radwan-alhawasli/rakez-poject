// @ts-nocheck — report row shapes from multiple endpoints.
import { buildDocumentPdf } from './pdfDocumentBuilder.js';

/** Project management contract summary (from resources/views/pdfs/project_management_contract) */
/**
 * @param {any} contract
 */
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
  return buildDocumentPdf({
    title: 'تفاصيل العقد',
    subtitle: (contract?.project_name ?? 'Contract') + ' | Contract Summary',
    sections,
    footer: `هذا المستند تم إنشاؤه آلياً بواسطة نظام راكز | ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
  });
}

/** Commission claim (from resources/views/pdfs/commission-claim) */
/**
 * @param {any} commission
 */
export async function generateCommissionClaimPdf(commission, distributions = []) {
  const statusMap = { pending: 'معلق', approved: 'معتمد', paid: 'مدفوع', rejected: 'مرفوض' };
  const sections = [
    {
      sectionTitle: '◆ معلومات العمولة',
      infoRows: [
        ['سعر البيع النهائي', commission ? `${Number(commission.final_selling_price ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2, numberingSystem: 'latn' })} ريال` : null],
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
        `${Number(d.amount ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2, numberingSystem: 'latn' })} ريال`,
        statusMap[d.status] ?? d.status ?? '—',
      ]),
    },
    {
      sectionTitle: '◆ الإجماليات',
      infoRows: [
        ['المبلغ الإجمالي', commission ? `${Number(commission.total_amount ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2, numberingSystem: 'latn' })} ريال` : null],
        ['ضريبة القيمة المضافة (15%)', commission ? `${Number(commission.vat ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2, numberingSystem: 'latn' })} ريال` : null],
        ['مصاريف التسويق', commission ? `${Number(commission.marketing_expenses ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2, numberingSystem: 'latn' })} ريال` : null],
        ['رسوم البنك', commission ? `${Number(commission.bank_fees ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2, numberingSystem: 'latn' })} ريال` : null],
        ['صافي العمولة', commission ? `${Number(commission.net_amount ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 2, numberingSystem: 'latn' })} ريال` : null],
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

/** Deposit claim (from resources/views/pdfs/deposit-claim) */
/**
 * @param {any} deposit
 */
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
  if (deposit?.confirmedBy) {
    infoRows.push(['تم التأكيد بواسطة', deposit.confirmedBy.name], ['تاريخ التأكيد', deposit.confirmed_at]);
  }
  if (deposit?.refund_reason) {
    infoRows.push(['سبب الاسترداد', deposit.refund_reason], ['تاريخ الاسترداد', deposit.refunded_at]);
  }
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

/** Marketer performance report (from resources/views/pdfs/marketer_performance_report) */
/**
 * @param {any} report
 * @param {any} generatedAt
 */
export async function generateMarketerPerformanceReportPdf(report, generatedAt) {
  const marketers = report?.marketers ?? [];
  /** @type {Array<{ sectionTitle: string, infoRows?: string[][], headers?: string[], rows?: string[][] }>} */
  const sections = [
    {
      sectionTitle: '◆ أداء المسوقين',
      headers: ['الاسم', 'البريد الإلكتروني', 'الفريق', 'نسبة تحقيق الهدف %', 'عدد الودائع', 'عدد الإنذارات', 'فترة التجربة'],
      /**
       * @param {any} r
       */
      rows: marketers.map(r => [
        r.name ?? '-',
        r.email ?? '-',
        r.team_name ?? '-',
        typeof r.target_achievement_rate === 'number' ? r.target_achievement_rate.toFixed(1) : (r.target_achievement_rate ?? '-'),
        String(r.deposits_count ?? 0),
        String(r.warnings_count ?? 0),
        r.is_in_probation ? 'نعم' : 'لا',
      ]),
    },
  ];
  if (report?.totals) {
    sections.push({
      sectionTitle: '◆ الملخص',
      infoRows: [
        ['عدد المسوقين', String(report.totals.marketers_count ?? 0)],
        ['متوسط تحقيق الهدف %', report.totals.avg_achievement != null ? Number(report.totals.avg_achievement).toFixed(1) : '—'],
        ['إجمالي الودائع', String(report.totals.total_deposits ?? 0)],
        ['إجمالي الإنذارات', String(report.totals.total_warnings ?? 0)],
      ],
    });
  }
  const period = report?.period ? `${report.period.year ?? ''} / ${report.period.month ?? ''}` : '';
  return buildDocumentPdf({
    title: 'تقرير أداء المسوقين',
    subtitle: `الفترة: ${period} | تاريخ التقرير: ${generatedAt ?? new Date().toISOString().slice(0, 10)}`,
    sections,
    footer: `هذا المستند تم إنشاؤه آلياً بواسطة نظام راكز | ${generatedAt ?? new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
  });
}

/** Expiring contracts report (from resources/views/pdfs/expiring_contracts_report) */
/**
 * @param {any} report
 */
export async function generateExpiringContractsReportPdf(report, days = 30) {
  const expiring = report?.expiring_contracts ?? [];
  const probation = report?.probation_ending ?? [];
  /** @type {Array<{ sectionTitle: string, infoRows?: string[][], headers?: string[], rows?: string[][] }>} */
  const sections = [
    {
      sectionTitle: '◆ عقود قريبة من الانتهاء',
      headers: ['رقم العقد', 'اسم الموظف', 'البريد الإلكتروني', 'تاريخ الانتهاء', 'الأيام المتبقية'],
      /**
       * @param {any} r
       */
      rows: expiring.map(r => [r.contract_id ?? '-', r.employee_name ?? '-', r.employee_email ?? '-', r.end_date ?? '-', String(r.days_remaining ?? '-')]),
    },
    {
      sectionTitle: '◆ موظفون قرب انتهاء فترة التجربة',
      headers: ['الاسم', 'البريد الإلكتروني', 'تاريخ انتهاء التجربة', 'الأيام المتبقية'],
      /**
       * @param {any} r
       */
      rows: probation.map(r => [r.name ?? '-', r.email ?? '-', r.probation_end_date ?? '-', String(r.days_remaining ?? '-')]),
    },
  ];
  if (report?.summary) {
    sections.push({
      sectionTitle: '◆ الملخص',
      infoRows: [
        ['عدد العقود القريبة من الانتهاء', String(report.summary.contracts_expiring_count ?? 0)],
        ['عدد الموظفين قرب انتهاء التجربة', String(report.summary.probation_ending_count ?? 0)],
        ['الفترة المعتمدة (أيام)', String(report.summary.days_checked ?? days)],
      ],
    });
  }
  return buildDocumentPdf({
    title: 'تقرير العقود القريبة من الانتهاء وقرب انتهاء فترة التجربة',
    subtitle: `الفترة: خلال ${days} يوماً | تاريخ التقرير: ${report?.generated_at ?? new Date().toISOString().slice(0, 10)}`,
    sections,
    footer: `هذا المستند تم إنشاؤه آلياً بواسطة نظام راكز | ${report?.generated_at ?? ''}`,
  });
}

/** Marketing plan export (from resources/views/marketing/plan_export) */
/**
 * @param {any} plan
 */
export async function generateMarketingPlanExportPdf(plan) {
  const projectName = plan?.marketingProject?.contract?.project_name ?? plan?.marketing_project_name ?? '-';
  /** @type {Array<{ sectionTitle: string, infoRows?: string[][], headers?: string[], rows?: string[][] }>} */
  const sections = [
    {
      sectionTitle: '◆ معلومات الخطة',
      infoRows: [
        ['المشروع / Project', projectName],
        ['الموظف / User', plan?.user?.name ?? '-'],
        ['قيمة العمولة / Commission', plan?.commission_value != null ? Number(plan.commission_value).toFixed(2) : '-'],
        ['قيمة التسويق / Marketing', plan?.marketing_value != null ? Number(plan.marketing_value).toFixed(2) : '-'],
      ],
    },
  ];
  const dist = plan?.platform_distribution ?? {};
  if (Object.keys(dist).length) {
    sections.push({
      sectionTitle: '◆ توزيع المنصات / Platform Distribution',
      headers: ['المنصة / Platform', 'النسبة / Percentage'],
      rows: Object.entries(dist).map(([platform, pct]) => [platform, `${pct}%`]),
    });
  }
  const campaign = plan?.campaign_distribution ?? {};
  if (Object.keys(campaign).length) {
    sections.push({
      sectionTitle: '◆ توزيع الحملات / Campaign Distribution',
      headers: ['الحملة / Campaign', 'النسبة / Percentage'],
      rows: Object.entries(campaign).map(([c, pct]) => [c, `${pct}%`]),
    });
  }
  return buildDocumentPdf({
    title: 'خطة تسويق',
    subtitle: `Marketing Plan #${plan?.id ?? ''}`,
    sections,
    footer: 'هذا المستند تم إنشاؤه آلياً بواسطة نظام راكز العقاري',
  });
}
