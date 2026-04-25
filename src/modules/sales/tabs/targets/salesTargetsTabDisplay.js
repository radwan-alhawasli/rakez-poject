import { getSalesTargetPatchId } from '@/composables/sales/useSalesTargets';

/** @param {any} target @param {number} index */
export function getTargetStableId(target, index = 0) {
  const rawId = getSalesTargetPatchId(target);
  const idPart = rawId != null && rawId !== '' ? String(rawId) : 'noid';
  const c = target?.contract_id ?? '';
  const m = target?.marketer_id ?? '';
  return `${idPart}-${c}-${m}-i${index}`;
}

/** @param {any} target @param {boolean} isSalesLeaderView */
export function getTargetAssigneeLine(target, isSalesLeaderView) {
  if (isSalesLeaderView) return target.marketer_name || '—';
  return target.assigned_by ? `أُسند لك من: ${target.assigned_by}` : 'أُسند لك هذا الهدف';
}

/** @param {any} target @param {boolean} isSalesLeaderView */
export function getAssignedUnitsLine(target, isSalesLeaderView) {
  const units = Array.isArray(target?.units) ? target.units : [];
  const prefix = isSalesLeaderView ? 'نطاق الهدف' : 'المسند لك';
  if (units.length > 0) {
    const unitNumbers = units.map((/** @type {any} */ unit) => unit?.unit_number).filter(Boolean);
    if (unitNumbers.length > 0) return `${prefix}: ${unitNumbers.join('، ')}`;
  }
  if (target?.unit_number) return `${prefix}: ${target.unit_number}`;
  return `${prefix}: كامل المشروع`;
}

/** @param {any} target */
export function isTargetCompleted(target) {
  const status = String(target?.status || '').toLowerCase();
  const label = String(target?.status_label_ar || '').trim();
  return status === 'completed' || status === 'achieved' || status === 'done' || label === 'منجز';
}
