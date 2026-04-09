/**
 * Helpers for server-provided voucher files (PDF/image blob or JSON with URL/base64).
 */
import apiClient from '@/api/apiClient';
import appConfig from '@/config/appConfig';

/**
 * @param {string|number} reservationId
 * @param {Blob} blob
 * @returns {string}
 */
export function guessVoucherFilename(reservationId, blob) {
  const id = reservationId != null ? String(reservationId) : 'voucher';
  const t = (blob.type || '').toLowerCase();
  if (t.includes('png')) return `voucher-${id}.png`;
  if (t.includes('jpeg') || t.includes('jpg')) return `voucher-${id}.jpg`;
  if (t.includes('webp')) return `voucher-${id}.webp`;
  if (t.includes('gif')) return `voucher-${id}.gif`;
  if (t.includes('pdf')) return `voucher-${id}.pdf`;
  return `voucher-${id}.bin`;
}

/**
 * @param {string} urlOrPath
 * @returns {string}
 */
function resolveApiAssetUrl(urlOrPath) {
  const u = String(urlOrPath).trim();
  if (/^https?:\/\//i.test(u)) return u;
  const base = String(appConfig.apiBaseUrl || '').replace(/\/$/, '');
  const path = u.startsWith('/') ? u : `/${u}`;
  return `${base}${path}`;
}

/**
 * Detect image/PDF asset descriptor from voucher-data JSON (backend shapes vary).
 * @param {Record<string, unknown>|null|undefined} payload
 * @returns {{ type: 'url'; url: string } | { type: 'dataUrl'; dataUrl: string } | { type: 'base64'; mime: string; base64: string } | null}
 */
export function pickVoucherAssetDescriptor(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;

  const dataUrl =
    typeof payload.voucher_image === 'string' && /^data:(image|application)\//i.test(payload.voucher_image)
      ? payload.voucher_image
      : typeof payload.image === 'string' && /^data:(image|application)\//i.test(payload.image)
        ? payload.image
        : null;
  if (dataUrl) return { type: 'dataUrl', dataUrl };

  const candidates = [
    typeof payload.voucher_image === 'string' && !/^data:/i.test(payload.voucher_image)
      ? payload.voucher_image
      : null,
    payload.voucher_image_url,
    payload.image_url,
    payload.imageUrl,
    payload.voucher_url,
    payload.voucher_file_url,
    payload.file_url,
    payload.url,
    payload.preview_url,
    payload.download_url,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 4) {
      const t = c.trim();
      if (/^https?:\/\//i.test(t) || t.startsWith('/')) return { type: 'url', url: resolveApiAssetUrl(t) };
    }
  }

  const mime = typeof payload.mime_type === 'string' ? payload.mime_type : 'image/png';
  const b64 =
    typeof payload.voucher_image_base64 === 'string'
      ? payload.voucher_image_base64
      : typeof payload.image_base64 === 'string'
        ? payload.image_base64
        : typeof payload.base64 === 'string' && !payload.base64.trim().startsWith('{')
          ? payload.base64
          : null;
  if (typeof b64 === 'string' && b64.replace(/\s/g, '').length > 40) {
    return { type: 'base64', mime, base64: b64.replace(/\s/g, '') };
  }

  return null;
}

/**
 * @param {{ type: 'url'; url: string } | { type: 'dataUrl'; dataUrl: string } | { type: 'base64'; mime: string; base64: string }} desc
 * @returns {Promise<Blob>}
 */
export async function blobFromVoucherAssetDescriptor(desc) {
  if (!desc) throw new Error('وصف الأصل غير صالح');
  if (desc.type === 'dataUrl') {
    const res = await fetch(desc.dataUrl);
    if (!res.ok) throw new Error('فشل قراءة الصورة');
    return res.blob();
  }
  if (desc.type === 'base64') {
    const bin = atob(desc.base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: desc.mime || 'image/png' });
  }
  if (desc.type === 'url') {
    const base = String(appConfig.apiBaseUrl || '').replace(/\/$/, '');
    const u = desc.url;
    try {
      if (base && u.startsWith(base)) {
        let path = u.slice(base.length);
        if (!path.startsWith('/')) path = `/${path}`;
        const r = await apiClient.get(path || '/', { responseType: 'blob' });
        if (r?.data instanceof Blob) return r.data;
      }
      if (u.startsWith('/') && !u.startsWith('//')) {
        const r = await apiClient.get(u, { responseType: 'blob' });
        if (r?.data instanceof Blob) return r.data;
      }
    } catch (_) {
      // fall through to fetch
    }
    const res = await fetch(u, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error('فشل تحميل ملف السند من الخادم');
    return res.blob();
  }
  throw new Error('نوع أصل غير معروف');
}
