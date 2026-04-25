/**
 * Whether manager has already approved/rejected montage for this contract (no further action).
 */
/**
 * @param {any} v
 * @returns {string}
 */
function norm(v) {
  if (v == null || v === '') return '';
  return String(v).toLowerCase().trim();
}

/**
 * Derive list-row fields from GET /editor/montage-department/show/:id (status may be top-level, Arabic, or approved "0"/"1").
 * @param {any} raw - API body (data or root)
 * @returns {any} Patch: { montage_department?, montage_status?, approval_status?, montage_approval_status? }
 */
export function buildContractPatchFromMontageShow(raw) {
  if (!raw || typeof raw !== 'object') return {};
  /** @type {any} */
  const r = raw;
  const nested =
    r.montage_department && typeof r.montage_department === 'object'
      ? { ...r.montage_department }
      : {};
  const statusRaw = r.status ?? nested.status;
  const approvedIn = r.approved ?? nested.approved;

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
    r.comment ??
    r.rejection_reason ??
    nested.comment ??
    nested.rejection_reason;
  const md = {
    ...nested,
    status: statusRaw ?? nested.status,
    approved: approved ?? nested.approved,
    image_url:
      r.image_url ??
      r.image_link ??
      nested.image_url ??
      nested.image_link,
    video_url:
      r.video_url ??
      r.video_link ??
      nested.video_url ??
      nested.video_link,
    description: r.description ?? nested.description,
  };
  if (comment != null && String(comment).trim()) {
    const t = String(comment).trim();
    md.comment = t;
    md.rejection_reason = nested.rejection_reason || r.rejection_reason || t;
  }

  /** @type {any} */
  const patch = { montage_department: md };
  if (approved === '1') {
    patch.montage_status = 'approved';
    patch.approval_status = 'approved';
    patch.montage_approval_status = 'approved';
  } else if (approved === '0') {
    patch.montage_status = 'rejected';
    patch.approval_status = 'rejected';
    patch.montage_approval_status = 'rejected';
  } else {
    const stLow = statusStr.toLowerCase();
    const looksPending =
      !statusStr ||
      stLow.includes('pending') ||
      stLow.includes('review') ||
      stLow.includes('انتظار') ||
      stLow.includes('مراجعة');
    if (looksPending || (approvedIn == null && !statusStr)) {
      patch.montage_status = 'pending';
      patch.approval_status = 'pending';
      patch.montage_approval_status = 'pending';
    }
  }
  return patch;
}

/**
 * @param {any} project
 * @param {string} [statusLabelFromParent]
 * @returns {boolean}
 */
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
