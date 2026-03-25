/**
 * Whether manager has already approved/rejected montage for this contract (no further action).
 */
function norm(v) {
  if (v == null || v === '') return '';
  return String(v).toLowerCase().trim();
}

export function isMontageDecisionFinal(project, statusLabelFromParent = '') {
  if (!project || typeof project !== 'object') return false;
  if (statusLabelFromParent === 'معتمد' || statusLabelFromParent === 'مرفوض') return true;

  const candidates = [
    project.montage_status,
    project.approval_status,
    project.montage_approval_status,
    project.montage_department?.status,
    project.montage_department?.approval_status,
    project.montage?.status,
  ];
  for (const c of candidates) {
    const s = norm(c);
    if (['approved', 'rejected', 'refused'].includes(s)) return true;
  }
  return false;
}
