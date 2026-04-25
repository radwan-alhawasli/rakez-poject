/**
 * Helpers for editor project cards: photography (source) vs montage (output) triplets,
 * and safe display URLs (ignore SPA routes mistaken for media).
 */

/**
 * @param {unknown} s
 * @returns {string}
 */
export function pickTrim(s) {
  if (s == null) return '';
  const t = String(s).trim();
  if (!t || t.toLowerCase() === 'null' || t.toLowerCase() === 'undefined') return '';
  return t;
}

/**
 * @param {unknown} url
 * @returns {string}
 */
export function sanitizeMediaUrl(url) {
  const t = pickTrim(url);
  if (!t) return '';
  const low = t.toLowerCase();
  if (low.includes('/editor/projects') && !/\.(mp4|webm|mov|mkv|m3u8)(\?|$)/i.test(t)) {
    return '';
  }
  if (/^https?:\/\/localhost(?::\d+)?\/editor\//i.test(t) && !/\.(mp4|webm|mov|mkv)(\?|$)/i.test(t)) {
    return '';
  }
  return t;
}

/** لا نعرض مسار تطبيق Vue كوصف نصي (التصوير الأصلي فقط) 
 * @param {any} s
*/
function sanitizeDescriptionText(s) {
  const t = pickTrim(s);
  if (!t) return '';
  if (/\/editor\/projects/i.test(t) && /^https?:\/\//i.test(t)) return '';
  return t;
}

/**
 * روابط مخرجات المونتاج (مُدخلة يدوياً): نحتفظ بعناوين http(s) كما هي.
 * إن أعادت التصفية الصارمة فراغاً نعرض النص الأصلي (اختبار محلي، روابط بلا مخطط، إلخ).
 * @param {unknown} url
 * @returns {string}
 */
function montageOutputUrl(url) {
  const t = pickTrim(url);
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  const strict = sanitizeMediaUrl(t);
  if (strict) return strict;
  return t;
}

/** وصف المونتاج: نص المستخدم كما هو (قد يكون رابطاً نصياً) 
 * @param {any} s
*/
function montageOutputDescription(s) {
  return pickTrim(s);
}

/**
 * @param {any} obj
 * @param {string[]} keys
 * @returns {string}
 */
function firstPick(obj, keys) {
  if (!obj || typeof obj !== 'object') return '';
  for (const k of keys) {
    const v = pickTrim(obj[k]);
    if (v) return v;
  }
  return '';
}

/**
 * بيانات التصوير الأصلية فقط (قبل المونتاج) — من photography_department دون دمج المونتاج.
 * @param {any} p
 * @returns {{ image: string, video: string, description: string }}
 */
export function getPhotographyTripletFromContract(p) {
  if (!p || typeof p !== 'object') return { image: '', video: '', description: '' };
  const photo = /** @type {any} */ (p).photography_department || {};
  const imageRaw =
    firstPick(photo, ['image_url', 'image_link', 'photo_url', 'image']) ||
    pickTrim(p.photography_link ?? p.photography_url);
  const image = sanitizeMediaUrl(imageRaw);
  const videoRaw =
    firstPick(photo, ['video_url', 'video_link', 'montage_video_url']) ||
    pickTrim(p.photography_video_url ?? p.video_photo_url);
  const video = sanitizeMediaUrl(videoRaw);
  const description = sanitizeDescriptionText(
    firstPick(photo, ['description', 'notes', 'note']) || pickTrim(p.photography_description)
  );
  return { image, video, description };
}

/**
 * روابط قسم المونتاج فقط — من الحقل `montage_department` دون حقول جذرية (لتصفية تبويب «بعد المونتاج»).
 */
const MONTAGE_IMAGE_KEYS = ['image_url', 'image_link', 'photo_url', 'image', 'montage_image_url', 'link'];
const MONTAGE_VIDEO_KEYS = ['video_url', 'video_link', 'montage_video_url', 'video', 'montage_video'];
const MONTAGE_DESC_KEYS = ['description', 'notes', 'note', 'desc', 'content', 'text'];

/**
 * @param {any} p
 * @returns {{ image: string, video: string, description: string }}
 */
export function getMontageDepartmentTripletOnly(p) {
  if (!p || typeof p !== 'object') return { image: '', video: '', description: '' };
  const mont = /** @type {any} */ (p).montage_department || {};
  const imageRaw = firstPick(mont, MONTAGE_IMAGE_KEYS);
  const image = montageOutputUrl(imageRaw);
  const videoRaw = firstPick(mont, MONTAGE_VIDEO_KEYS);
  const video = montageOutputUrl(videoRaw);
  const description = montageOutputDescription(firstPick(mont, MONTAGE_DESC_KEYS));
  return { image, video, description };
}

/**
 * مخرجات المونتاج للعرض — يفضّل `montage_department` ثم حقول احتياطية على العقد (بطاقات، إلخ).
 * @param {any} p
 * @returns {{ image: string, video: string, description: string }}
 */
export function getMontageOutputTripletFromContract(p) {
  if (!p || typeof p !== 'object') return { image: '', video: '', description: '' };
  const mont = /** @type {any} */ (p).montage_department || {};
  const imageRaw =
    firstPick(mont, MONTAGE_IMAGE_KEYS) ||
    pickTrim(p.montage_image_url ?? p.montage_image_link);
  const image = montageOutputUrl(imageRaw);
  const videoRaw =
    firstPick(mont, MONTAGE_VIDEO_KEYS) ||
    pickTrim(p.montage_video_url ?? p.montage_video_link ?? p.montage?.video_url);
  const video = montageOutputUrl(videoRaw);
  const description = montageOutputDescription(
    firstPick(mont, MONTAGE_DESC_KEYS) || pickTrim(p.montage_description)
  );
  return { image, video, description };
}

/**
 * @deprecated استخدم getMontageOutputTripletFromContract — كان يدمج التصوير والمونتاج.
 * @param {any} p
 */
export function getMontageTripletFromContract(p) {
  return getMontageOutputTripletFromContract(p);
}

/**
 * ثلاثي مكتمل من حقول `montage_department` فقط (تصفية تبويب «بعد المونتاج»).
 * @param {any} p
 */
export function contractHasCompleteMontageDepartmentTriplet(p) {
  const { image, video, description } = getMontageDepartmentTripletOnly(p);
  return !!(image && video && description);
}

/**
 * بعد المونتاج: إكمال الثلاثي من مخرجات المونتاج (يشمل حقول احتياطية على العقد لسيناريوهات العرض).
 * @param {any} p
 */
export function contractHasCompleteMontageTriplet(p) {
  const { image, video, description } = getMontageOutputTripletFromContract(p);
  return !!(image && video && description);
}

/**
 * رفض المدير لمخرجات المونتاج → يُعاد المشروع إلى «قبل المونتاج» حتى التحديث.
 * @param {any} p
 * @returns {boolean}
 */
export function isMontageManagerRejected(p) {
  if (!p || typeof p !== 'object') return false;
  const md = /** @type {any} */ (p).montage_department;
  if (md && typeof md === 'object') {
    const ap = md.approved;
    if (ap === '0' || ap === 0 || ap === false) return true;
    if (String(ap ?? '').trim() === '0') return true;
    const stRaw = String(md.status ?? '');
    const stLow = stRaw.toLowerCase();
    if (
      stRaw.includes('مرفوض') ||
      stRaw.includes('رفض') ||
      stLow.includes('reject') ||
      stLow.includes('refus')
    ) {
      return true;
    }
  }
  const candidates = [p.montage_status, p.approval_status, p.montage_approval_status];
  for (const status of candidates) {
    if (status === 'rejected' || status === 'refused') return true;
    const raw = String(status ?? '');
    if (raw.includes('مرفوض') || raw.includes('رفض')) return true;
    const s = raw.toLowerCase();
    if (s.includes('reject') || s.includes('refus')) return true;
  }
  return false;
}

/**
 * تبويب «بعد المونتاج»: روابط مونتاج كاملة (من `montage_department` أو حقول المونتاج على العقد) وليست مرفوضة.
 * يُستخدم الثلاثي الواسع حتى تنتقل المشاريع من «قبل» إلى «بعد» حتى لو كان الفهرس بدون تداخل كامل لـ `montage_department`.
 * @param {any} p
 * @returns {boolean}
 */
export function isAfterMontageListProject(p) {
  if (!p || typeof p !== 'object') return false;
  if (isMontageManagerRejected(p)) return false;
  return contractHasCompleteMontageTriplet(p);
}

/**
 * @param {any} p
 * @returns {{ label: string, class: string, empty?: boolean }}
 */
export function getPhotographyApprovalSummary(p) {
  const ph = p && typeof p === 'object' ? (/** @type {any} */ (p)).photography_department : null;
  if (!ph || typeof ph !== 'object') {
    return { label: '—', class: 'status-pending', empty: true };
  }
  const approved = ph.approved;
  const statusRaw = ph.status != null ? String(ph.status) : '';
  const slo = statusRaw.toLowerCase();
  if (approved === '1' || approved === 1 || approved === true || slo.includes('معتمد') || slo.includes('approv')) {
    return { label: 'معتمد', class: 'status-approved' };
  }
  if (
    approved === '0' ||
    approved === 0 ||
    approved === false ||
    slo.includes('مرفوض') ||
    slo.includes('رفض') ||
    slo.includes('reject')
  ) {
    return { label: 'مرفوض', class: 'status-rejected' };
  }
  return { label: 'قيد الانتظار', class: 'status-pending' };
}
