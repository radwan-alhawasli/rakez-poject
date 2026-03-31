export async function ensurePdfBlob(response) {
  const status = response?.status ?? 0;
  if (status < 200 || status >= 300) {
    const blob = response?.data;
    let msg = 'فشل إنشاء التقرير.';
    if (blob instanceof Blob) {
      try {
        const text = await blob.text();
        try {
          const j = JSON.parse(text);
          msg = j?.message || msg;
        } catch (_) {
          if (text && text.length < 300) msg = text;
        }
      } catch (_) {
        void 0; // blob.text() failed; keep default msg
      }
    }
    throw new Error(msg);
  }
  const blob = response?.data;
  if (!(blob instanceof Blob)) return blob;
  const type = (blob.type || '').toLowerCase();
  // Reject only when Content-Type clearly indicates an error body (not PDF)
  if (type && !type.includes('pdf')) {
    if (
      type.includes('json') ||
      type.includes('html') ||
      (type.includes('text/plain') && blob.size < 500)
    ) {
      throw new Error('الخادم لم يُرجع ملف PDF صالح.');
    }
  }
  return blob;
}
