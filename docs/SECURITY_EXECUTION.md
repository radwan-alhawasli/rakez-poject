# تنفيذ أمان المحتوى الغني وـ `v-html` (قابل للتدقيق)

هذا المستند يكمّل [`SECURITY.md`](SECURITY.md): **سياسة** في `SECURITY.md`، **إجراء تنفيذ وجرد ومراجعات** هنا.

## تعريف «محتوى غني من API أو يُعرض كـ HTML»

- أي حقل استجابة يُمرَّر إلى `v-html`، أو يُحوَّل عبر `marked` ثم يُعرض.
- أي HTML مخزَّن في الجلسة/التاريخ يُعاد عرضه في الواجهة دون إعادة تنقية (يُراجع مسار `useChatbot` عند إضافة حقول).

**لا يُعدّ من هذا النوع:** مخرجات مكوّنات Vue المُرسَخة برمجياً فقط (مثل تلميحات المخطط من `createApp().mount`) طالما لا يُحقَن فيها نص مستخدم/API خام عبر `valueFormatter` / `customTooltip` دون تنقية — انظر جدول المسارات أدناه.

## متى تُجرى المراجعة اليدوية

| المحفّز | الإجراء |
|---------|---------|
| إصدار رئيسي للعميل | مراجعة كاملة لجدول الجرد + تشغيل `npm run check:v-html` و `npm run check:dangerous-dom` و `npm run test:run` (يشمل اختبارات `sanitizeMarkdown`). |
| ربع سنوي | تحديث عمود «آخر مراجعة» للصفوف التي لمسها تغيير في آخر 90 يوماً؛ التأكد من عدم إضافة حقول عرض HTML جديدة دون صف في الجدول. |
| أي PR يغيّر [`src/utils/safeHtml.js`](../src/utils/safeHtml.js) أو يضيف `v-html` / `innerHTML` / استيراد `dompurify` أو `marked` | مراجعة ثنائية؛ تحديث الجدول والسكربتات في CI إن لزم. |

## قائمة تحقق سريعة للمراجع

1. هل المصدر حقلاً من API أو مستخدم؟ إن كان ثابتاً في الكود فقط، هل ما زال يمر عبر `sanitizeNavIconSvg` / مسار آخر موثّق؟
2. هل تغيّر `RICH_CHAT_HTML_OPTIONS` أو `sanitizeHtml` الافتراضي؟ راجع السمات والوسوم المسموحة (روابط، `class`, إلخ).
3. هل أُضيف استثناء في [`scripts/check-dangerous-dom.mjs`](../scripts/check-dangerous-dom.mjs)؟ وثّق السبب في هذا الملف أو في `SECURITY.md`.
4. شغّل: `npm run check:v-html`, `npm run check:dangerous-dom`, `npm run test:run`.

## جرد مسارات API → تنقية → عرض (يُحدَّث مع كل تغيير ذي صلة)

| مصدر البيانات (مسار / حقول) | المعالجة | مكوّن العرض | أداة التنقية | مرجع الكود | آخر مراجعة |
|-----------------------------|----------|-------------|--------------|------------|------------|
| `POST /ai/v2/chat`, `POST /ai/chat`؛ بث/تدفق؛ أجزاء `content`, `answer_markdown`, إلخ | `useChatbot` يبني `contentHtml` | [`ChatbotPanel.vue`](../src/components/ChatbotPanel.vue) (`v-html` عبر `safeChatHtml`) | `sanitizeMarkdown` / `sanitizeHtml(..., RICH_CHAT_HTML_OPTIONS)` | [`useChatbot.js`](../src/composables/useChatbot.js), [`ChatbotPanel.vue`](../src/components/ChatbotPanel.vue) | — |
| تحميل تاريخ المحادثة (`getConversation` + حقول الرسالة) | نفس المسار أعلاه | نفسه | `sanitizeMarkdown` على `content` / `answer_markdown` / … | `useChatbot.js` (`loadHistory`) | — |
| أيقونات التنقل (ملفات التوجيه فقط) | — | [`AppSidebar.vue`](../src/layouts/components/AppSidebar.vue) | `sanitizeNavIconSvg` | `AppSidebar.vue` | — |
| أيقونات التنبيه (أنواع ثابتة) | `safeToastIcon` | [`ToastContainer.vue`](../src/components/ToastContainer.vue) | `sanitizeNavIconSvg` عبر `safeToastIcon` | `ToastContainer.vue` | — |
| تلميح/خطوط المخطط | `createApp` + مكوّن Vue؛ **ليس** HTML من API مباشرة | [`ChartSingleTooltip.vue`](../src/components/ui/chart/ChartSingleTooltip.vue), [`ChartCrosshair.vue`](../src/components/ui/chart/ChartCrosshair.vue) | `innerHTML` لمخرجات المكوّن فقط؛ قيود `valueFormatter` في `SECURITY.md` | الملفان تحت `components/ui/chart/` | — |

**عمود «آخر مراجعة»:** اكتب تاريخ ISO (`YYYY-MM-DD`) عند إتمام مراجعة يدوية للصف.

## التحقق الآلي (مرتبط بالتنفيذ)

| أمر | الغرض |
|-----|--------|
| `npm run check:v-html` | يسمح بـ `v-html` داخل `<template>` فقط عندما يحتوي **تعبير** السمة على `sanitizeNavIconSvg` أو `safeToastIcon` أو `safeChatHtml` (بما في ذلك التعبيرات متعددة الأسطر). |
| `npm run check:dangerous-dom` | يمنع `marked.parse` / استيراد `dompurify` / `DOMPurify.sanitize` خارج `safeHtml.js`، و`insertAdjacentHTML` / `document.write` تحت `src`، و`innerHTML` في `.vue` خارج مجلد المخططات المسموح. |

التفاصيل الإضافية للسياسة: [`SECURITY.md`](SECURITY.md).
