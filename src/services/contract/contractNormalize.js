/** استخراج رابط الصورة من أي حقل متوقع من الـ API. يعرض الصورة سواء معتمدة أو قيد المراجعة. */
function getContractImageUrl(p) {
  if (!p || typeof p !== 'object') return null;
  const photo = p.photography_department;
  const url =
    p.project_image_url ??
    (photo && (photo.image_url ?? photo.image)) ??
    p.image ??
    p.image_url ??
    p.main_image ??
    p.cover_image ??
    p.photo ??
    (typeof p.project_image === 'string' ? p.project_image : null);
  return typeof url === 'string' && url.trim() ? url.trim() : null;
}

/** Normalize a contract from GET /contracts/index or /contracts/show to the same details shape we use everywhere. */
export function normalizeContractItem(p) {
  if (!p || typeof p !== 'object') return p;
  const imageUrl = getContractImageUrl(p);
  return {
    ...p,
    id: p.id ?? p.contract_id,
    contract_id: p.contract_id ?? p.id,
    name: p.project_name ?? p.name ?? (p.id != null ? `مشروع #${p.id}` : ''),
    project_name: p.project_name ?? p.name,
    notes: p.notes ?? null,
    project_progress: p.project_progress ?? null,
    image: imageUrl ?? null,
    project_image_url: imageUrl,
  };
}

/**
 * جسم إنشاء/تحديث العقد — يطابق GET /contracts/show (commission_percent وليس commission_percentage).
 * يدعم المفتاحين للتوافق مع كود قديم ثم يُخرج شكلاً واحداً للخادم.
 */
export function normalizeContractWritePayload(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const out = { ...raw };
  const pct = out.commission_percent ?? out.commission_percentage;
  if (pct !== undefined && pct !== null && pct !== '') {
    const n = Number(pct);
    out.commission_percent = Number.isFinite(n) ? n : pct;
  }
  delete out.commission_percentage;
  if (Array.isArray(out.units)) {
    out.units = out.units.map(u => ({
      type: u.type != null ? String(u.type) : '',
      count: Number(u.count) || 0,
      price: Number(u.price) || 0,
    }));
  }
  return out;
}

/** فك طبقات استجابة GET /contracts/show/:id إن وُجدت (مثل data.contract أو غلاف success). */
export function unwrapContractShowPayload(raw) {
  if (raw == null || typeof raw !== 'object') return null;
  let o = raw;
  if (o.contract && typeof o.contract === 'object') {
    o = { ...o, ...o.contract };
  }
  if (o.contract_data && typeof o.contract_data === 'object') {
    o = { ...o, ...o.contract_data };
  }
  return o;
}

/** دمج حقول المشروع المضمّنة (project / exclusive_project) في الجذر حتى تُقرأ note وurl وغيرها من GET /contracts/show */
export function mergeNestedProjectIntoRoot(raw) {
  if (raw == null || typeof raw !== 'object') return raw;
  const nested = raw.project ?? raw.exclusive_project;
  if (!nested || typeof nested !== 'object') return raw;
  return { ...nested, ...raw };
}

export function normalizeContractShowResponse(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const imageUrl = getContractImageUrl(raw) || (raw.photography_department?.image_url ?? raw.photography_department?.image) || null;
  const imageUrlTrimmed = typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : null;
  return {
    ...raw,
    id: raw.id ?? raw.contract_id,
    contract_id: raw.contract_id ?? raw.id,
    name: raw.project_name ?? raw.name ?? (raw.id != null ? `مشروع #${raw.id}` : ''),
    project_name: raw.project_name ?? raw.name,
    notes: raw.notes ?? raw.note ?? null,
    project_progress: raw.project_progress ?? null,
    image: imageUrlTrimmed ?? imageUrl ?? null,
    project_image_url: imageUrlTrimmed ?? imageUrl ?? raw.project_image_url,
    commission_percentage: raw.commission_percent ?? raw.commission_percentage ?? null,
    commission_percent: raw.commission_percent ?? raw.commission_percentage ?? null,
    created_by_name: raw.user?.name ?? raw.created_by_name ?? null,
    unit_count: raw.unit_count ?? (Array.isArray(raw.units) ? raw.units.reduce((s, u) => s + (parseInt(u.count) || 0), 0) : null),
    total_price: raw.total_price ?? null,
    user: raw.user ?? null,
    info: raw.info ?? null,
    second_party_data: raw.second_party_data ?? null,
    photography_department: raw.photography_department ?? null,
    boards_department: raw.boards_department ?? null,
    montage_department: raw.montage_department ?? null,
  };
}
