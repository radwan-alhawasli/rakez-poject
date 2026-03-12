# PDF Fonts — خطوط المستندات

جميع خطوط الـ PDF المستخدمة في الفرونت إند (عربي واتجاه RTL) مع روابط التحميل.

## الخطوط المثبتة في المشروع

| الملف | الوصف | الاستخدام في pdfService |
|--------|--------|---------------------------|
| `public/fonts/Amiri-Regular.ttf` | Amiri (عربي + لاتيني) — TTF | **الأساسي**؛ pdf-lib/fontkit يعتمد عليه بشكل موثوق |
| `public/fonts/amiri-arabic-400-normal.woff2` | Amiri — WOFF2 | احتياطي (قد لا يُعرض بشكل صحيح في بعض الحالات) |

الترتيب في الكود: يُجرّب TTF المحلي أولاً، ثم WOFF2 المحلي، ثم روابط CDN.

## روابط تحميل إضافية (للتنزيل اليدوي أو السكربتات)

- **Amiri TTF (مستقر للـ PDF):**  
  https://mirrors.ctan.org/fonts/amiri/Amiri-Regular.ttf  
- **Amiri WOFF2 (من jsDelivr):**  
  https://cdn.jsdelivr.net/npm/@fontsource/amiri@5.0.0/files/amiri-arabic-400-normal.woff2  

## إضافة خطوط جديدة

1. وضع ملف الخط (يفضّل **TTF** للـ PDF) داخل `public/fonts/`.
2. إضافة المسار إلى `ARABIC_FONT_URLS` في [src/services/pdfService.js](src/services/pdfService.js)، أو توسيع خريطة الخطوط إذا تم إضافة دعم خطوط متعددة بالاسم.

## ملاحظة

- **WOFF/WOFF2** قد لا تُعرض بشكل صحيح مع pdf-lib/fontkit؛ يُفضّل **TTF** لجميع الخطوط العربية في الـ PDF.
