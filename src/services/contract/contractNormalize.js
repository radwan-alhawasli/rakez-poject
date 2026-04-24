// @ts-check

/** 
 * استخراج رابط الصورة من أي حقل متوقع من الـ API. يعرض الصورة سواء معتمدة أو قيد المراجعة.
 * @param {Record<string, any>} p
 */
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

/** 
 * Normalize a contract from GET /contracts/index or /contracts/show to the same details shape we use everywhere.
 * @param {Record<string, any>} p
 */
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
 * @param {Record<string, any>} raw
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
    out.units = out.units.map(/** @param {any} u */ u => ({
      type: u.type != null ? String(u.type) : '',
      count: Number(u.count) || 0,
      price: Number(u.price) || 0,
    }));
  }
  if (out.city_id != null && out.city_id !== '') {
    out.city_id = String(out.city_id);
  }
  if (out.district_id != null && out.district_id !== '') {
    out.district_id = String(out.district_id);
  }
  return out;
}

/** 
 * فك طبقات استجابة GET /contracts/show/:id إن وُجدت (مثل data.contract أو غلاف success).
 * @param {Record<string, any>} raw
 */
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

/**
 * حقل «الوصف» في استكمال العقد: يفضّل `description` من أي مسار، ثم notes/note فقط.
 * لا يخلط متطلبات المطور (developer_requiment) ولا requirements مع الوصف.
 * @param {Record<string, any>} raw
 */
export function pickContractCompletionNotes(raw) {

  if (!raw || typeof raw !== 'object') return '';
  const info = raw.info && typeof raw.info === 'object' ? raw.info : {};
  const attrs = raw.attributes && typeof raw.attributes === 'object' ? raw.attributes : {};
  const proj = raw.project ?? raw.exclusive_project;
  const sp = raw.second_party_data && typeof raw.second_party_data === 'object' ? raw.second_party_data : {};

  const descriptionPaths = [
    raw.description,
    info.description,
    attrs.description,
    proj?.description,
    sp?.description,
  ];
  for (let i = 0; i < descriptionPaths.length; i += 1) {
    const v = descriptionPaths[i];
    if (v === undefined || v === null) continue;
    const t = String(v).trim();
    if (t !== '') return t;
  }

  const noteFallback = [
    raw.notes,
    raw.note,
    info.notes,
    info.note,
    attrs.notes,
    attrs.note,
    proj?.notes,
    proj?.note,
    raw.project_description,
    raw.memo,
    raw.remarks,
  ];
  for (let j = 0; j < noteFallback.length; j += 1) {
    const v = noteFallback[j];
    if (v === undefined || v === null) continue;
    const t = String(v).trim();
    if (t !== '') return t;
  }
  return '';
}

/**
 * @deprecated استخدم pickContractCompletionNotes — كان يدمج developer_requiment في الوصف بالخطأ.
 * @param {Record<string, any>} raw
 */
export function pickContractDescriptionText(raw) {

  return pickContractCompletionNotes(raw);
}

/**
 * نفس مصادر الوصف لكن دون `developer_requiment` / `requirements` — لنماذج فيها حقل «متطلبات المطور» منفصل عن «الوصف».
 * @param {Record<string, any>} raw
 */
export function pickDescriptionOrNotesText(raw) {

  if (!raw || typeof raw !== 'object') return '';
  const info = raw.info && typeof raw.info === 'object' ? raw.info : {};
  const attrs = raw.attributes && typeof raw.attributes === 'object' ? raw.attributes : {};
  const proj = raw.project ?? raw.exclusive_project;
  const candidates = [
    raw.description,
    raw.notes,
    raw.note,
    info.description,
    info.notes,
    info.note,
    attrs.description,
    attrs.notes,
    attrs.note,
    proj?.description,
    proj?.notes,
    proj?.note,
    raw.project_description,
    raw.memo,
    raw.remarks,
  ];
  for (let i = 0; i < candidates.length; i += 1) {
    const v = candidates[i];
    if (v === undefined || v === null) continue;
    const t = String(v).trim();
    if (t !== '') return t;
  }
  return '';
}

/** 
 * دمج حقول المشروع المضمّنة (project / exclusive_project) في الجذر حتى تُقرأ note وurl وغيرها من GET /contracts/show
 * @param {Record<string, any>} raw
 */
export function mergeNestedProjectIntoRoot(raw) {

  if (raw == null || typeof raw !== 'object') return raw;
  const nested = raw.project ?? raw.exclusive_project;
  if (!nested || typeof nested !== 'object') return raw;
  return { ...nested, ...raw };
}

/**
 * @param {Record<string, any>} raw
 */
export function normalizeContractShowResponse(raw) {

  if (!raw || typeof raw !== 'object') return raw;
  const imageUrl = getContractImageUrl(raw) || (raw.photography_department?.image_url ?? raw.photography_department?.image) || null;
  const imageUrlTrimmed = typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : null;
  const completionNotes = pickContractCompletionNotes(raw);
  return {
    ...raw,
    id: raw.id ?? raw.contract_id,
    contract_id: raw.contract_id ?? raw.id,
    name: raw.project_name ?? raw.name ?? (raw.id != null ? `مشروع #${raw.id}` : ''),
    project_name: raw.project_name ?? raw.name,
    notes: completionNotes || null,
    description: completionNotes || null,
    project_progress: raw.project_progress ?? null,
    image: imageUrlTrimmed ?? imageUrl ?? null,
    project_image_url: imageUrlTrimmed ?? imageUrl ?? raw.project_image_url,
    commission_percentage: raw.commission_percent ?? raw.commission_percentage ?? null,
    commission_percent: raw.commission_percent ?? raw.commission_percentage ?? null,
    created_by_name: raw.user?.name ?? raw.created_by_name ?? null,
    unit_count:
      raw.unit_count ??
      (Array.isArray(raw.units)
        ? raw.units.reduce(
            /** @type {(s: number, u: any) => number} */
            ((s, u) => s + (parseInt(u.count, 10) || 0)),
            0
          )
        : null),
    total_price: raw.total_price ?? null,
    user: raw.user ?? null,
    info: raw.info ?? null,
    second_party_data: raw.second_party_data ?? null,
    photography_department: raw.photography_department ?? null,
    boards_department: raw.boards_department ?? null,
    montage_department: raw.montage_department ?? null,
  };
}
