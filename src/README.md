# هيكل مجلدات المصدر (src)

هذا الملف يوضح دور كل مجلد رئيسي تحت `src` دون تغيير في سلوك أو تصميم التطبيق.

| المجلد | الغرض |
|--------|--------|
| **api** | عميل HTTP الموحد (مثل `apiClient.js`) — إرفاق التوكن، CSRF، ومعالجة الاستجابة. |
| **core** | تهيئة التطبيق: `router` (Vue Router مُقسّم إلى وحدات)، `i18n`، `config`، `directives`، `plugins`. |

**هيكل الراوتر (core/router):** مسارات منظمة حسب النطاق — `config.js` (ثوابت المسارات)، `guards.js` (حراسة التنقل)، `routes/` (public، mainChildren، domainHr، domainMarketing، domainSales، domainCredit، domainAccounting، domainCommissionDeposits، domainEditor). نقطة الدخول: `core/router/index.js`.
| **services** | طبقة استدعاء الـ API: كل خدمة تتواصل مع الخلفية وتستخدم `handleServiceError` للمعالجة الموحدة. |
| **composables** | منطق قابل لإعادة الاستخدام حسب النطاق (مثل `accounting`، `sales`، `credit`، `editor`). |
| **views** | صفحات/شاشات التطبيق (مكونات تُعرض عبر الـ router). |
| **components** | مكونات Vue قابلة لإعادة الاستخدام، منظمة حسب النطاق عند الحاجة. |
| **layouts** | تخطيطات الصفحات (مثل MainLayout، EditorLayout). |
| **stores** | مخازن Pinia. |
| **utils** | أدوات عامة: معالجة أخطاء، تخزين آمن، تسجيل، تحقق، إلخ. |
| **constants** | ثوابت التطبيق: أدوار، صلاحيات، أكواد HTTP، إلخ. |
| **validation** | مخططات التحقق (مثلاً Zod). |
| **directives** | توجيهات Vue (مثل `v-permission`). |
| **shared** | مكونات ومشاركات مشتركة (مثل واجهة الـ UI المشتركة). |
| **assets** | موارد ثابتة (CSS، صور). |

**اتفاقية المسارات:** يُفضّل استيراد الوحدات من جذر `src` عبر alias `@/` (مثال: `@/services/authService`، `@/core/router`).

**البناء والاختبار:** المشروع يعتمد على Vite للبناء و Vitest للاختبارات الوحدة. تشغيل `npm run build` و `npm run test:run` للتحقق.
