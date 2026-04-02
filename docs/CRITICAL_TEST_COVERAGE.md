# تغطية الاختبارات للمسارات الحرجة

مرجع خفيف يطابق بند **D)** في [`TEN_OF_TEN_BACKLOG.txt`](../TEN_OF_TEN_BACKLOG.txt): التركيز على **سلوك مكوّنات منطقية حرجة** (قشرة التطبيق وتبويبات التسويق)، وليس على عدد الملفات المغطاة في المستودع بالكامل.

## العلاقة بـ E2E

اختبارات [Playwright وCI](E2E_CI.md) تتحقق من تدفقات المستخدم والحارس والـ RBAC على بِناء حقيقي. **لا تغني** عن اختبارات وحدة للـ composables المعقّدة (حسابات، حالات تحميل/خطأ، تكامل خدمات). العكس صحيح: الوحدة لا تغني عن E2E للمسارات عبر الصفحات.

## الجدول

| المسار (مصدر) | لماذا حرج | ملف الاختبار | الحالة |
|-----------------|-----------|----------------|--------|
| `src/layouts/composables/useMainLayout.js` | جلسة، إشعارات، تسجيل خروج، تسمية الدور، تكامل المسار | `tests/layouts/useMainLayout.spec.js` | مغطى (جزئي على فروع نادرة) |
| `src/composables/marketing/useMarketingDashboard.js` | لوحة التسويق | `tests/composables/marketing/useMarketingDashboard.spec.js` | مغطى |
| `src/composables/marketing/useMarketingTasks.js` | مهام التسويق | `tests/composables/marketing/useMarketingTasks.spec.js` | مغطى |
| `src/composables/marketing/useMarketingReports.js` | تقارير وتصدير | `tests/composables/marketing/useMarketingReports.spec.js` | مغطى (جزئي) |
| `src/composables/marketing/useMarketingEmployeePlans.js` | خطط الموظفين، PDF/AI | `tests/composables/marketing/useMarketingEmployeePlans.spec.js` | جزئي |
| `src/composables/marketing/useMarketingDeveloperPlan.js` | خطة المطور والحسابات | `tests/composables/marketing/useMarketingDeveloperPlan.spec.js` | جزئي |
| `src/composables/marketing/useMarketingExpectedSales.js` | مبيعات متوقعة | `tests/composables/marketing/useMarketingExpectedSales.spec.js` | مغطى |
| `src/composables/marketing/useMarketingAiAssistant.js` | مساعد AI | `tests/composables/marketing/useMarketingAiAssistant.spec.js` | جزئي |
| `src/composables/marketing/useMarketingLeads.js` | عملاء محتملون | `tests/composables/marketing/useMarketingLeads.spec.js` | مغطى (سابقاً) |
| `src/composables/marketing/useMarketingProjects.js` | مشاريع التسويق | `tests/composables/marketing/useMarketingProjects.spec.js` | جزئي (سابقاً) |

**مفقود من الجدول أعلاه:** لا يوجد؛ كل ملف تحت `src/composables/marketing/*.js` له spec مقابل تحت `tests/composables/marketing/`.

## بوابة CI

- الأمر: `npm run test:coverage:critical`
- الإعداد: [`vitest.coverage-critical.config.js`](../vitest.coverage-critical.config.js) — يشغّل فقط اختبارات `useMainLayout` و`tests/composables/marketing/**/*.spec.js` ويقيس التغطية على `useMainLayout.js` و`src/composables/marketing/**/*.js`.
- العتبات الحالية **إجمالية** على تلك المجموعة فقط (ليس `perFile`: ملفات مثل `useMarketingEmployeePlans` ما زالت منخفضة الفروع وستفشل عتبة لكل ملف دون خفض غير واقعي).

## التحقق المحلي

```bash
npm run test:run
npm run test:coverage:critical
npm run build
```
