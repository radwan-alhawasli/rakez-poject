import { buildDocumentPdf } from './pdfCore';

export async function generateMarketerPerformanceReportPdf(report, generatedAt) {
  const marketers = report?.marketers ?? [];
  const sections = [
    {
      sectionTitle: '◆ أداء المسوقين',
      headers: ['الاسم', 'البريد الإلكتروني', 'الفريق', 'نسبة تحقيق الهدف %', 'عدد الودائع', 'عدد الإنذارات', 'فترة التجربة'],
      rows: marketers.map(r => [
        r.name ?? '-', r.email ?? '-', r.team_name ?? '-',
        typeof r.target_achievement_rate === 'number' ? r.target_achievement_rate.toFixed(1) : (r.target_achievement_rate ?? '-'),
        String(r.deposits_count ?? 0), String(r.warnings_count ?? 0), r.is_in_probation ? 'نعم' : 'لا',
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

export async function generateExpiringContractsReportPdf(report, days = 30) {
  const expiring = report?.expiring_contracts ?? [];
  const probation = report?.probation_ending ?? [];
  const sections = [
    {
      sectionTitle: '◆ عقود قريبة من الانتهاء',
      headers: ['رقم العقد', 'اسم الموظف', 'البريد الإلكتروني', 'تاريخ الانتهاء', 'الأيام المتبقية'],
      rows: expiring.map(r => [r.contract_id ?? '-', r.employee_name ?? '-', r.employee_email ?? '-', r.end_date ?? '-', String(r.days_remaining ?? '-')]),
    },
    {
      sectionTitle: '◆ موظفون قرب انتهاء فترة التجربة',
      headers: ['الاسم', 'البريد الإلكتروني', 'تاريخ انتهاء التجربة', 'الأيام المتبقية'],
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
    title: 'تقرير العقود القريبة من الانتهاء',
    subtitle: `الفترة: خلال ${days} يوماً | تاريخ التقرير: ${report?.generated_at ?? new Date().toISOString().slice(0, 10)}`,
    sections,
    footer: `هذا المستند تم إنشاؤه آلياً بواسطة نظام راكز | ${report?.generated_at ?? ''}`,
  });
}

export async function generateMarketingPlanExportPdf(plan) {
  const projectName = plan?.marketingProject?.contract?.project_name ?? plan?.marketing_project_name ?? '-';
  const sections = [{
    sectionTitle: '◆ معلومات الخطة',
    infoRows: [
      ['المشروع / Project', projectName], ['الموظف / User', plan?.user?.name ?? '-'],
      ['قيمة العمولة / Commission', plan?.commission_value != null ? Number(plan.commission_value).toFixed(2) : '-'],
      ['قيمة التسويق / Marketing', plan?.marketing_value != null ? Number(plan.marketing_value).toFixed(2) : '-'],
    ],
  }];
  const dist = plan?.platform_distribution ?? {};
  if (Object.keys(dist).length) {
    sections.push({
      sectionTitle: '◆ توزيع المنصات / Platform Distribution',
      headers: ['المنصة / Platform', 'النسبة / Percentage'],
      rows: Object.entries(dist).map(([p, pct]) => [p, `${pct}%`]),
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

/** Platform distribution weekly — uses template دوم_12[1].pdf when available, else builds from scratch */
const WEEKLY_PLAN_PLATFORM_LABELS = ['منصة انستغرام', 'منصة سناب', 'منصة تيك توك', 'منصة تويتر X', 'منصة جوجل (تضمن يوتيوب)', 'منصات اخرى (بيوت - سكني - حراج ....)', 'منصة عقار'];
const DEVELOPER_PLAN_TEMPLATE_PATHS = ['/%D8%AF%D9%88%D9%85_12%5B1%5D.pdf', '/developer_plan_template.pdf'];
const DEVELOPER_PLAN_TEMPLATE_TABLE = { startY: null, rowHeight: 24, colLefts: null, cellPadding: 6 };

function fmtNum(n) { return Number(n ?? 0).toLocaleString('en-US'); }

function getWeeklyPlanTableData(distribution) {
  const rows = distribution?.rows ?? [];
  if (rows.length > 0) {
    const totalC = Number(distribution?.total_clicks ?? rows.reduce((s, r) => s + Number(r.clicks ?? 0), 0));
    const totalI = Number(distribution?.total_impressions ?? rows.reduce((s, r) => s + Number(r.impressions ?? 0), 0));
    const tableRows = rows.map((r, i) => [String((i + 1).toString().padStart(2, '0')), r.platform_ar ?? r.platform ?? WEEKLY_PLAN_PLATFORM_LABELS[i] ?? '', fmtNum(r.clicks ?? 0), fmtNum(r.impressions ?? 0)]);
    return { tableRows, totalClicks: totalC, totalImpressions: totalI };
  }
  const dist = distribution?.platform_distribution ?? distribution ?? {};
  const order = ['instagram', 'snapchat', 'tiktok', 'x', 'google_youtube', 'other', 'aqar'];
  const labels = { instagram: 'منصة انستغرام', snapchat: 'منصة سناب', tiktok: 'منصة تيك توك', x: 'منصة تويتر X', google_youtube: 'منصة جوجل (تضمن يوتيوب)', other: 'منصات اخرى (بيوت - سكني - حراج ....)', aqar: 'منصة عقار' };
  const totalCBase = Number(distribution?.total_clicks) || 0;
  const totalIBase = Number(distribution?.total_impressions) || 0;
  const tableRows = []; let totalC = 0, totalI = 0;
  order.forEach((key, i) => {
    const pct = dist[key] ?? 0;
    const clicks = dist[`${key}_clicks`] ?? (totalCBase > 0 ? Math.round(totalCBase * (pct / 100)) : 0);
    const imps = dist[`${key}_impressions`] ?? (totalIBase > 0 ? Math.round(totalIBase * (pct / 100)) : 0);
    tableRows.push([(i + 1).toString().padStart(2, '0'), labels[key] ?? key, fmtNum(clicks), fmtNum(imps)]);
    totalC += clicks; totalI += imps;
  });
  return { tableRows, totalClicks: totalCBase > 0 ? totalCBase : totalC, totalImpressions: totalIBase > 0 ? totalIBase : totalI };
}

async function loadDeveloperPlanTemplate() {
  const { getPdfDeps, loadArabicFontBytes } = await import('./pdfCore');
  const { PDFDocument, fontkit } = await getPdfDeps();
  for (const path of DEVELOPER_PLAN_TEMPLATE_PATHS) {
    try {
      const res = await fetch(path); if (!res.ok) continue;
      const pdfDoc = await PDFDocument.load(await res.arrayBuffer()); pdfDoc.registerFontkit(fontkit);
      const font = await pdfDoc.embedFont(await loadArabicFontBytes());
      const pages = pdfDoc.getPages(); if (!pages.length) continue;
      const page = pages[0]; const { width: w, height: h } = page.getSize();
      return { pdfDoc, page, font, w, h };
    } catch (_) {}
  }
  return null;
}

export async function generatePlatformDistributionPdf(distribution) {
  const core = await import('./pdfCore');
  const { PDFDocument, rgb, fontkit } = await core.getPdfDeps();
  const brown = rgb(0.42, 0.33, 0.27);
  let pdfDoc, page, font, w, h;
  const useTemplate = await loadDeveloperPlanTemplate();
  if (useTemplate) { ({ pdfDoc, page, font, w, h } = useTemplate); }
  else {
    pdfDoc = await PDFDocument.create(); pdfDoc.registerFontkit(fontkit);
    font = await pdfDoc.embedFont(await core.loadArabicFontBytes());
    w = core.PDF_LAYOUT.PAGE_WIDTH; h = core.PDF_LAYOUT.PAGE_HEIGHT; page = pdfDoc.addPage([w, h]);
  }

  const margin = core.PDF_LAYOUT.DOC_MARGIN; const rowAlt = rgb(0.98, 0.98, 0.97); let y = h - margin;
  const drawR = (text, x, yPos, size = 10, color = rgb(0.2, 0.2, 0.2)) => {
    if (/[\u0600-\u06FF]/.test(text)) { core.drawTextRtl(page, font, text, x + core.widthOfLogicalText(font, text, size), yPos, size, color); }
    else { page.drawText(text, { x, y: yPos, size, font, color }); }
  };

  if (!useTemplate) {
    const logoEndY = await core.drawPdfLogo(pdfDoc, page, w, y);
    if (logoEndY != null) y = logoEndY;
    else {
      const tw = core.widthOfLogicalText(font, 'راكز', 22); core.drawTextRtl(page, font, 'راكز', (w + tw) / 2, y, 22, brown); y -= 22;
      const tw2 = font.widthOfTextAtSize('RAKEZ', 14); page.drawText('RAKEZ', { x: (w - tw2) / 2, y, size: 14, font, color: brown }); y -= 36;
    }
  } else { y = h - margin - 80; }

  const { tableRows, totalClicks, totalImpressions } = getWeeklyPlanTableData(distribution);
  const lefts = (useTemplate && DEVELOPER_PLAN_TEMPLATE_TABLE.colLefts) || [margin, margin + w * 0.08, margin + w * 0.5, margin + w * 0.75];
  const rowH = (useTemplate && DEVELOPER_PLAN_TEMPLATE_TABLE.rowHeight) || 24; const pad = 6;
  const headers = ['م', 'المنصة الإعلانية', 'النقرات', 'المشاهدات'];

  if (useTemplate && DEVELOPER_PLAN_TEMPLATE_TABLE.startY) y = DEVELOPER_PLAN_TEMPLATE_TABLE.startY;
  if (!useTemplate) page.drawRectangle({ x: margin, y: y - rowH, width: w - 2 * margin, height: rowH, color: brown });

  headers.forEach((hdr, i) => {
    const tw = core.widthOfLogicalText(font, hdr, 10);
    core.drawTextRtl(page, font, hdr, lefts[i] + pad + tw, y - 16, 10, useTemplate ? rgb(0.2, 0.2, 0.2) : rgb(1, 1, 1));
  });
  y -= rowH;

  tableRows.forEach((row, idx) => {
    if (y < margin + rowH) return;
    if (!useTemplate && idx % 2 === 1) page.drawRectangle({ x: margin, y: y - rowH, width: w - 2 * margin, height: rowH, color: rowAlt });
    row.forEach((cell, i) => {
      const cStr = String(cell ?? '—'); const isNum = i >= 2; const cY = y - 16;
      if (isNum) page.drawText(cStr, { x: lefts[i] + pad, y: cY, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
      else { const tw = core.widthOfLogicalText(font, cStr, 9); core.drawTextRtl(page, font, cStr, lefts[i] + pad + tw, cY, 9, rgb(0.2, 0.2, 0.2)); }
    });
    y -= rowH;
  });

  if (!useTemplate) page.drawRectangle({ x: margin, y: y - rowH, width: w - 2 * margin, height: rowH, color: brown });
  const twTot = core.widthOfLogicalText(font, 'الإجمالي', 10);
  core.drawTextRtl(page, font, 'الإجمالي', lefts[1] + pad + twTot, y - 16, 10, useTemplate ? rgb(0.2, 0.2, 0.2) : rgb(1, 1, 1));
  page.drawText(fmtNum(totalClicks), { x: lefts[2] + pad, y: y - 16, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  page.drawText(fmtNum(totalImpressions), { x: lefts[3] + pad, y: y - 16, size: 10, font, color: rgb(0.2, 0.2, 0.2) });

  return pdfDoc.save();
}
