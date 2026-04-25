import { unref } from 'vue';

/** @param {any} opts */
export async function downloadProjectUnitPdf(opts) {
  const {
    getSelectedUnit,
    projectName,
    generateUnitDetailsPdf,
    salesService,
    notificationService,
    getApiErrorMessage,
    logger,
  } = opts;
  const unit = /** @type {any} */ (getSelectedUnit());
  if (!unit) {
    notificationService.addNotification('لا توجد وحدة محددة للتحميل', 'info');
    return;
  }
  const nameStr = String(unref(projectName) ?? '');
  const unitId = unit.id ?? unit.contract_unit_id ?? unit.unit_id;

  try {
    try {
      const { getUnitPdfData } = await import('@/services/pdfApi');
      const data = /** @type {any} */ (await getUnitPdfData(unitId));
      if (data?.unit != null) {
        const pdfBytes = await generateUnitDetailsPdf(data.unit, {
          projectName: (data.projectName ?? data.project_name ?? nameStr) || '',
        });
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `unit_${data.unit?.unit_number ?? data.unit?.id ?? unitId ?? 'details'}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        notificationService.addNotification('تم تحميل ملف PDF بنجاح', 'success');
        return;
      }
    } catch (_) {
      void 0;
    }

    const { blob, filename } = await salesService.downloadUnitPdf(unitId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `unit_${unit.unit_number ?? unitId ?? 'details'}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
    notificationService.addNotification('تم تحميل ملف PDF بنجاح', 'success');
  } catch (e) {
    const message = getApiErrorMessage(e, 'تحميل PDF غير متوفر لهذه الوحدة حالياً');
    logger.error('Unit PDF download failed', e);
    notificationService.addNotification(message, 'error');
    try {
      const pdfBytes = await generateUnitDetailsPdf(unit, { projectName: nameStr || '' });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unit_${unit.unit_number ?? unit.id ?? 'details'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      notificationService.addNotification('تم تحميل ملف PDF (نسخة محلية)', 'success');
    } catch (fallbackErr) {
      logger.error('Unit PDF fallback failed', fallbackErr);
    }
  }
}
