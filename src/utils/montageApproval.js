/**
 * Whether manager has already approved/rejected montage for this contract (no further action).
 */
function norm(v) {
  if (v == null || v === '') return '';
  return String(v).toLowerCase().trim();
}

/**
 * Derive list-row fields from GET /editor/montage-department/show/:id (status may be top-level, Arabic, or approved "0"/"1").
 * @param {Object} raw - API body (data or root)
 * @returns {Object} Patch: { montage_department?, montage_status?, approval_status?, montage_approval_status? }
 */
export function buildContractPatchFromMontageShow(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const nested =
    raw.montage_department && typeof raw.montage_department === 'object'
      ? { ...raw.montage_department }
      : {};
  const statusRaw = raw.status ?? nested.status;
  const approvedIn = raw.approved ?? nested.approved;

  let approved = null;
  if (approvedIn === '1' || approvedIn === 1 || approvedIn === true) approved = '1';
  else if (approvedIn === '0' || approvedIn === 0 || approvedIn === false) approved = '0';

  const statusStr = statusRaw != null ? String(statusRaw) : '';
  const slo = statusStr.toLowerCase();
  if (!approved) {
    if (
      slo.includes('reject') ||
      slo.includes('refus') ||
      statusStr.includes('مرفوض') ||
      statusStr.includes('رفض')
    ) {
      approved = '0';
    } else if (
      slo.includes('approv') ||
      slo.includes('accept') ||
      statusStr.includes('معتمد')
    ) {
      approved = '1';
    }
  }

  const comment =
    raw.comment ??
    raw.rejection_reason ??
    nested.comment ??
    nested.rejection_reason;
  const md = {
    ...nested,
    status: statusRaw ?? nested.status,
    approved: approved ?? nested.approved,
    image_url: raw.image_url ?? nested.image_url,
    video_url: raw.video_url ?? nested.video_url,
    description: raw.description ?? nested.description,
  };
  if (comment != null && String(comment).trim()) {
    const t = String(comment).trim();
    md.comment = t;
    md.rejection_reason = nested.rejection_reason || raw.rejection_reason || t;
  }

  const patch = { montage_department: md };
  if (approved === '1') {
    patch.montage_status = 'approved';
    patch.approval_status = 'approved';
    patch.montage_approval_status = 'approved';
  } else if (approved === '0') {
    patch.montage_status = 'rejected';
    patch.approval_status = 'rejected';
    patch.montage_approval_status = 'rejected';
  }
  return patch;
}

export function isMontageDecisionFinal(project, statusLabelFromParent = '') {
  if (!project || typeof project !== 'object') return false;
  if (statusLabelFromParent === 'معتمد' || statusLabelFromParent === 'مرفوض') return true;

  const md = project.montage_department;
  if (md && typeof md === 'object') {
    const ap = md.approved;
    if (ap === '1' || ap === 1 || ap === true) return true;
    if (ap === '0' || ap === 0 || ap === false) return true;
  }

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
    const raw = c != null ? String(c) : '';
    if (raw.includes('مرفوض') || raw.includes('رفض')) return true;
    if (raw.includes('معتمد')) return true;
  }
  return false;
}
