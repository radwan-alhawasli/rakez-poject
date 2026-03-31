# أمان الواجهة الأمامية (Rakez SPA)

## النطاق

- يغطي هذا المستند **تطبيق Vue/Vite في هذا المستودع** (العميل فقط).
- لا يغطي أمان الـ API أو الخادم أو قاعدة البيانات؛ تُوثَّق المتطلبات التي يفترضها العميل من الخادم حيث يلزم.

## سياسة XSS وعرض HTML

- **ممنوع** ربط `v-html` مباشرة بنص قادم من API أو من المستخدم دون المرور عبر طبقة التنقية في [`src/utils/safeHtml.js`](../src/utils/safeHtml.js).
- أي إضافة لـ `v-html` أو عرض HTML جديد تتطلب: مراجعة ثنائية، وتحديث **جدول الجرد** أدناه و[**جدول التنفيذ**](SECURITY_EXECUTION.md)، ويفضّل اختبار لمسار `sanitizeMarkdown` / `sanitizeHtml` عند تغيير خيارات DOMPurify.

### جرد مسارات HTML / `innerHTML`

| الموقع | الغرض | التنقية / المصدر الموثوق | ملاحظات |
|--------|--------|---------------------------|---------|
| [`AppSidebar.vue`](../src/layouts/components/AppSidebar.vue) | أيقونات قائمة SVG | `sanitizeNavIconSvg` من `safeHtml.js` | ملفات التنقل فقط؛ لا نص مستخدم |
| [`ToastContainer.vue`](../src/components/ToastContainer.vue) | أيقونة نوع التنبيه | `sanitizeNavIconSvg` عبر `safeToastIcon` | SVG ثابت حسب النوع |
| [`ChatbotPanel.vue`](../src/components/ChatbotPanel.vue) | فقاعات المحادثة | `sanitizeHtml(..., RICH_CHAT_HTML_OPTIONS)` | المحتوى يأتي من composable مُنقّى |
| [`useChatbot.js`](../src/composables/useChatbot.js) | تدفق API → HTML | `sanitizeMarkdown` / `sanitizeHtml` | مسار المساعد والبث |
| [`ChartSingleTooltip.vue`](../src/components/ui/chart/ChartSingleTooltip.vue) | تلميح المخطط | `innerHTML` من `createApp` + مكوّن Vue (`ChartTooltip`) | ليس HTML من API؛ بيانات سلسلة/أرقام مُنسَّقة. **لا** تمرّر نصوص مستخدم خام عبر `valueFormatter` أو `customTooltip` دون تنقية |
| [`ChartCrosshair.vue`](../src/components/ui/chart/ChartCrosshair.vue) | نفس نموذج التلميح | مثل أعلاه | نفس القيود |

### Markdown والمساعد الذكي

- التحويل: `marked` ثم `sanitizeHtml` ضمن [`sanitizeMarkdown`](../src/utils/safeHtml.js).
- خيارات الدردشة الغنية: `RICH_CHAT_HTML_OPTIONS` — أي توسيع للوسوم أو السمات يتطلب مراجعة أمنية.

## CSRF

- التهيئة والاعتراضات: [`src/utils/csrf.js`](../src/utils/csrf.js).
- التفعيل يعتمد على `appConfig.enableCSRF`؛ عند غياب نقطة `/csrf-token` (404) أو في التطوير قد يُعطّل الطلب تلقائياً — السلوك موثّق في الكود.

## الجلسة والرموز (`secureStorage`)

- التخزين: [`src/utils/secureStorage.js`](../src/utils/secureStorage.js) يستخدم **localStorage** مع حزم JSON وانتهاء صلاحية للجلسة (مهلة عدم النشاط).
- **ليس** تخزيناً آمناً أمام XSS كامل الصفحة: أي سكربت ضار في نفس الأصل يمكنه قراءة الرموز من `localStorage`. التخفيف الأساسي هو **منع** XSS عبر سياسة HTML أعلاه + تشغيل التطبيق على **HTTPS** في الإنتاج.
- الرموز في المتصفح **لا** يمكن جعلها HttpOnly بنفس نموذج SPA الحالي دون الانتقال إلى جلسة تعتمد على كوكي HttpOnly من الخادم.
- يفترض العميل من الخادم: نقل آمن (TLS)، وسياسات كوكي مناسبة للـ refresh إن وُجدت، وعدم تسريب الرموز في روابط قابلة للتسجيل.

## التحقق الآلي

- `npm run check:v-html` — يفحص محتوى `<template>` فقط: يجب أن يحتوي **تعبير** سمة `v-html` (بما فيه متعدد الأسطر) على `sanitizeNavIconSvg` أو `safeToastIcon` أو `safeChatHtml`. يُشغَّل في CI بعد `lint`. عند إضافة مسار آمن جديد، حدّث [`scripts/check-v-html-allowlist.mjs`](../scripts/check-v-html-allowlist.mjs) وهذا المستند و[`SECURITY_EXECUTION.md`](SECURITY_EXECUTION.md).
- `npm run check:dangerous-dom` — يمنع `marked.parse` واستيراد `dompurify` و`DOMPurify.sanitize` خارج [`src/utils/safeHtml.js`](../src/utils/safeHtml.js)، و`insertAdjacentHTML` و`document.write` تحت `src`، وأي `.innerHTML` في ملفات `.vue` خارج [`src/components/ui/chart/`](../src/components/ui/chart/). يُشغَّل في CI بعد `check:v-html`.

## كيف نُنفّذ (تدقيق منهجي)

- اتبع [**وثيقة التنفيذ**](SECURITY_EXECUTION.md): جرد API → تنقية → عرض، مواعيد المراجعة، وقائمة تحقق.
- عند تغيير سياسة التنقية: راجع [`tests/utils/sanitizeMarkdown.integration.test.js`](../tests/utils/sanitizeMarkdown.integration.test.js).

## عملية للمطورين

1. قبل الـ PR: ابحث عن `v-html` و `innerHTML` في التغييرات؛ شغّل `npm run check:v-html` و `npm run check:dangerous-dom`.
2. أضف سطراً في جدول الجرد أعلاه وفي جدول [`SECURITY_EXECUTION.md`](SECURITY_EXECUTION.md) إذا أُدخل موقع أو مسار API جديد.
3. للنماذج: راجع [`sanitizeFormData`](../src/utils/sanitizer.js) واستخدامها في [`useValidation.js`](../src/composables/useValidation.js) حيث ينطبق.

## مراجع

- [`docs/SECURITY_EXECUTION.md`](SECURITY_EXECUTION.md) — تنفيذ، جرد تفصيلي، ومراجعات.
- [`docs/TYPECHECK_SCOPE.md`](TYPECHECK_SCOPE.md) — نطاق فحص الأنواع في CI.
- [`TEN_OF_TEN_BACKLOG.txt`](../TEN_OF_TEN_BACKLOG.txt) — بند الأمان والـ UX.
