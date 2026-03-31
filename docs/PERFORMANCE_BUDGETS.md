# ميزانيات الحزم (Performance budgets)

## الغرض

- منع نمو الحزم دون قصد بعد دمج ميزات أو مكتبات.
- ربط الفحص بـ `npm run build` عبر `scripts/check-bundle-budget.mjs` والجدول `scripts/performance-budgets.json`.

## القياس

- يُقاس كل ملف `dist/assets/*.js` بحجم **gzip** (تقريب لما ينقله الشبكة عند ضغط gzip).
- القواعد في `performance-budgets.json`: حقل `match` يطابق **جزءاً من اسم الملف** (مثل `vendor-pdf` يطابق `vendor-pdf-xxxxx.js`).
- أي ملف لا يطابق قاعدة يخضع لـ `defaultMaxGzipBytes`.

## تعديل الميزانية

1. شغّل `npm run build` ثم `npm run build:analyze` عند الحاجة لفهم مصدر الحجم (`dist/stats.html` في وضع analyze).
2. إن كان النمو مقصوداً، حدّث الأرقام في `scripts/performance-budgets.json` في نفس PR مع اختصار سبب التذكرة.

## CI

- Workflow `CI` يشغّل `npm run build:check-budget` بعد البناء.

## كسل التحميل

- استخدم `defineAsyncComponent` أو `import()` على مستوى التبويبات/المسارات عندما يظهر تحليل الحزم أن مكوّناً كبيراً يُحمّل بلا حاجة؛ لا تحذف المكوّنات، فقط أخر تحميلها.
