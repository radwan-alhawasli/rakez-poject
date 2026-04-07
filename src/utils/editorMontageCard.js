/**
 * Helpers for editor project cards: montage triple (image + video + description)
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

/** لا نعرض مسار تطبيق Vue كوصف نصي */
function sanitizeDescriptionText(s) {
  const t = pickTrim(s);
  if (!t) return '';
  if (/\/editor\/projects/i.test(t) && /^https?:\/\//i.test(t)) return '';
  return t;
}

/**
 * @param {Record<string, unknown>|null|undefined} p
 * @returns {{ image: string, video: string, description: string }}
 */
function firstPick(obj, keys) {
  if (!obj || typeof obj !== 'object') return '';
  for (const k of keys) {
    const v = pickTrim(obj[k]);
    if (v) return v;
  }
  return '';
}

export function getMontageTripletFromContract(p) {
  if (!p || typeof p !== 'object') return { image: '', video: '', description: '' };
  const mont = /** @type {Record<string, unknown>} */ (p.montage_department) || {};
  const photo = /** @type {Record<string, unknown>} */ (p.photography_department) || {};
  const imageRaw = firstPick(mont, ['image_url', 'image_link', 'photo_url']) ||
    firstPick(photo, ['image_url', 'image_link', 'photo_url']) ||
    pickTrim(p.image_url ?? p.montage_image_url ?? p.montage_image_link ?? p.photography_link);
  const image = sanitizeMediaUrl(imageRaw);
  const videoRaw =
    firstPick(mont, ['video_url', 'video_link', 'montage_video_url']) ||
    firstPick(photo, ['video_url', 'video_link', 'montage_video_url']) ||
    pickTrim(
      p.montage_video_url ??
        p.video_url ??
        p.montage_video_link ??
        p.video_link ??
        p.montage?.video_url
    );
  const video = sanitizeMediaUrl(videoRaw);
  const description = sanitizeDescriptionText(
    firstPick(mont, ['description', 'notes', 'note']) ||
      firstPick(photo, ['description', 'notes']) ||
      pickTrim(p.montage_description ?? p.description ?? p.desc)
  );
  return { image, video, description };
}

/**
 * After-montage tab: require صورة + فيديو + وصف (from contract show / merged montage).
 * @param {Record<string, unknown>|null|undefined} p
 */
export function contractHasCompleteMontageTriplet(p) {
  const { image, video, description } = getMontageTripletFromContract(p);
  return !!(image && video && description);
}
