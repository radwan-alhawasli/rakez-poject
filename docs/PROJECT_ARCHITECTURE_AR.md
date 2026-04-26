# توثيق بنية مشروع RAKEZ

هذا المستند يشرح البنية الحالية للمشروع كما هي في المستودع. الهدف أن يستطيع أي مطور جديد فهم حدود الطبقات، نقاط الدخول، أماكن إضافة الميزات، وكيفية تشغيل وفحص المشروع بثقة.

## 1. التصنيف العام للمشروع

المشروع هو واجهة أمامية لتطبيق ERP/CRM عقاري مبنية باستخدام:

- Vue 3 كتطبيق SPA.
- Vite للبناء والتشغيل المحلي.
- Vue Router للمسارات.
- Pinia لإدارة الحالة لبعض المجالات.
- Axios للتواصل مع API خلفي، غالبا Laravel حسب متغيرات البيئة والتوثيق.
- Vitest لاختبارات الوحدة والتكامل الخفيفة.
- Playwright لاختبارات E2E.
- Tailwind CSS v4 وRadix Vue/shadcn-vue لمكونات واجهة مشتركة.

وحدة التخزين الرئيسية هي مستودع Frontend واحد. لا توجد طبقة Backend داخل هذا المستودع؛ الاتصال بالخلفية يتم عبر `src/api/apiClient.js` وخدمات `src/services`.

## 2. خريطة الجذر

```text
rakez-poject/
|-- src/                         # كود التطبيق الفعلي
|-- tests/                       # اختبارات Vitest
|-- e2e/                         # اختبارات Playwright
|-- docs/                        # توثيق وتحليلات API/اختبارات/أمان
|-- scripts/                     # أدوات تحليل وفحص محلية
|-- public/                      # ملفات عامة ثابتة تنسخ كما هي للبناء
|-- postman/                     # مجموعات Postman للـ API
|-- .github/workflows/           # CI وDeploy وE2E
|-- dist/                        # مخرجات build، لا تعدل يدويا
|-- node_modules/                # تبعيات محلية، لا تعدل يدويا
|-- playwright-report/           # مخرجات Playwright
|-- test-results/                # نتائج اختبارات E2E
|-- package.json                 # السكربتات والتبعيات
|-- vite.config.js               # تهيئة Vite والبناء والتقسيم
|-- vitest.config.js             # تهيئة اختبارات الوحدة
|-- playwright.config.js         # تهيئة E2E
|-- eslint.config.js             # قواعد lint
|-- tsconfig.checkjs.json        # فحص TypeScript على ملفات JS
|-- components.json              # إعداد shadcn-vue
|-- .env.example                 # نموذج متغيرات البيئة
`-- README.md                    # تعليمات تشغيل مختصرة وقديمة نسبيا
```

تصنيف مجلدات الجذر:

| التصنيف | العناصر | الدور |
|---|---|---|
| كود المصدر | `src` | كل منطق التطبيق والواجهات والمسارات والخدمات. |
| اختبارات | `tests`, `e2e` | Vitest وPlaywright. |
| توثيق وتدقيق | `docs`, ملفات تقارير `*.md` في الجذر | تقارير API، صلاحيات، أمان، أداء، تغطية. |
| إعدادات وتشغيل | `package.json`, `vite.config.js`, `vitest.config.js`, `playwright.config.js`, `eslint.config.js`, `tsconfig*.json` | تشغيل، بناء، جودة، فحص أنواع. |
| أصول عامة | `public`, `src/assets` | صور، خطوط، CSS، قوالب PDF. |
| أدوات مساعدة | `scripts` | تحليل endpoints، فحص DOM، ميزانية bundle، استخراج Postman. |
| مخرجات مولدة | `dist`, `node_modules`, `playwright-report`, `test-results`, `build_*.log`, `typecheck_*.txt` | مخرجات أو سجلات، لا تعتبر مصدرا للميزات. |

## 3. خريطة `src`

```text
src/
|-- main.js                      # نقطة دخول Vue
|-- App.vue                      # جذر التطبيق وToast teleport
|-- api/                         # عميل HTTP المركزي
|-- assets/                      # CSS عام وثيمات وأصول
|-- components/                  # مكونات مشتركة ومكونات UI مولدة/مستعملة
|-- composables/                 # منطق واجهة قابل لإعادة الاستخدام
|-- config/                      # إعدادات التطبيق من env
|-- constants/                   # أدوار، صلاحيات، رسائل، أكواد HTTP
|-- core/                        # الراوتر وi18n ونواة التطبيق
|-- directives/                  # Vue directives مثل v-permission
|-- factories/                   # مصانع خدمات مثل serviceFactory
|-- i18n/                        # ملفات ترجمة
|-- layouts/                     # MainLayout وEditorLayout
|-- lib/                         # أدوات واجهة منخفضة المستوى
|-- modules/                     # الوحدات الوظيفية حسب المجال
|-- plugins/                     # تكاملات مثل Pusher
|-- repositories/                # طبقة Repository محدودة
|-- router/                      # إعادة تصدير للراوتر من core
|-- services/                    # طبقة API/domain services
|-- stores/                      # Pinia stores
|-- strategies/                  # استراتيجيات أدوار
|-- utils/                       # أدوات مشتركة: RBAC، تخزين، أخطاء، تحقق، PDF
`-- validation/                  # مخططات Zod
```

توزيع الملفات داخل `src` حاليا: مكونات Vue هي الأكبر، ثم JavaScript، ثم CSS. هذا يؤكد أن المشروع Frontend كثيف الواجهة، مع منطق أعمال موزع بين `composables` و`services`.

## 4. نقاط الدخول الرئيسية

| نقطة الدخول | الملف | المسؤولية |
|---|---|---|
| HTML | `index.html` | يحتوي عنصر mount الرئيسي `#app` وتهيئة تحميل التطبيق. |
| Vue app | `src/main.js` | إنشاء Vue app، Pinia، Router، i18n، directive الصلاحيات، معالجة أخطاء عامة، تهيئة Sentry اختياريا، mount. |
| جذر الواجهة | `src/App.vue` | يعرض `router-view`، يثبت `ToastContainer` عبر `Teleport`، ويضبط اتجاه RTL وثيم عام. |
| الراوتر | `src/core/router/index.js` | إنشاء `createRouter`، اختيار history حسب بيئة Vitest/Browser، وتسجيل guards. |
| تخطيط التطبيق | `src/layouts/MainLayout.vue` | الغلاف الرئيسي بعد تسجيل الدخول: header، sidebar، offline banner، content router-view، footer. |
| تخطيط المحرر | `src/layouts/EditorLayout.vue` | غلاف بسيط لمسارات editor. |
| API client | `src/api/apiClient.js` | Axios instance، token، CSRF، refresh، cache، تحويل الأخطاء، redirect عند 401. |

## 5. الراوتر والمسارات

الراوتر منظم داخل `src/core/router/routes`:

```text
core/router/
|-- index.js                     # إنشاء الراوتر
|-- guards.js                    # حراسة المصادقة والصلاحيات
|-- config.js                    # ثوابت مسارات
|-- viewDomainMap.js             # مرجع ربط views بالمجالات
`-- routes/
    |-- index.js                 # تجميع المسارات
    |-- public.js                # /login
    |-- mainChildren.js          # صفحات عامة داخل MainLayout
    |-- domainHr.js
    |-- domainMarketing.js
    |-- domainSales.js
    |-- domainCredit.js
    |-- domainAccounting.js
    |-- domainEditor.js
    |-- domainInventory.js
    `-- domainManager.js
```

نمط المسارات:

- `public.js`: مسارات لا تتطلب مصادقة، حاليا `/login`.
- `routes/index.js`: يضع كل مسارات التطبيق داخل `MainLayout`، ثم يضيف catch-all redirect.
- `mainChildren.js`: صفحات رئيسية مثل dashboard، AI، chat، projects، contracts، users، reservations، profile.
- ملفات `domain*.js`: مسارات مجال وظيفي كامل تحت مسار أب مثل `/sales`, `/marketing`, `/hr`.
- المسارات تستخدم dynamic imports، وهذا يساعد على lazy loading وتقليل الحمل الأولي.

حراسة الوصول:

- `guards.js` يستدعي `authService.isAuthenticated()` و`authService.getCurrentUser()`.
- المسارات العامة تمر مباشرة.
- غير المصادق يعاد إلى `/login`.
- `canAccessRoute` في `src/utils/rbac.js` يفحص `meta.roles`, `meta.permissions`, و`meta.requiresManager`.
- عند رفض الوصول يتم توجيه المستخدم إلى dashboard مناسب لدوره عبر `getDashboardPathForUser`.

## 6. الوحدات الوظيفية

الوحدات تعيش تحت `src/modules/<domain>`، وهي المصدر المعتمد لصفحات الراوتر. لا يوجد `src/views` مركزي، حسب `docs/VIEW_PLACEMENT.md`.

```text
src/modules/
|-- accounting/                  # المحاسبة: dashboard، sold units، deposits، salaries
|-- admin/                       # وظائف إدارية مثل locations
|-- app/                         # صفحات عامة داخل التطبيق: dashboard، profile، chat، notifications
|-- auth/                        # LoginView
|-- contracts/                   # العقود ونموذج العقد
|-- credit/                      # الائتمان، الحجوزات، التمويل، نقل الملكية
|-- editor/                      # المحرر، المشاريع، الموافقات، العقود
|-- hr/                          # الموارد البشرية، الفرق، الأداء، المستخدمون
|-- inventory/                   # المخزون، المشاريع، العقود، AI suggestions
|-- knowledge/                   # إدارة معرفة محدودة
|-- manager/                     # مدير الموظفين والمهام
|-- marketing/                   # التسويق، المشاريع، الفرق، الخطط، leads، AI
|-- projects/                    # إدارة المشاريع والمطورين وطلبات الحصرية
`-- sales/                       # المبيعات، أهداف، مشاريع، حجوزات، حضور، فرق، مهام
```

أكبر الوحدات حاليا هي `sales` ثم `accounting`, `editor`, `hr`, `marketing`. هذا يعني أن أي تطوير جديد في هذه المجالات يحتاج غالبا مراجعة ثلاثة أماكن معا: `modules/<domain>`, `composables/<domain>`, `services/<domain>Service.js`.

## 7. نمط بناء وحدة المجال

النمط الشائع:

```text
Route -> Domain View/Shell -> Tabs/Components -> Composables -> Services -> apiClient -> Backend API
```

مثال المبيعات:

- المسارات في `src/core/router/routes/domainSales.js`.
- الغلاف في `src/modules/sales/views/SalesViewExtended.vue`.
- التبويبات في `src/modules/sales/tabs/*`.
- منطق اختيار التبويب والصلاحيات في `src/composables/sales/useSalesRouting.js`.
- منطق البيانات في `src/composables/sales/useSales*.js`.
- API في `src/services/salesService.js` والذي يركب:
  - `src/services/sales/salesEndpointRegistry.js`
  - `src/services/sales/salesServiceCoreMethods.js`
  - `src/services/sales/salesServiceExtendedMethods.js`
  - `src/services/sales/salesNegotiationsApi.js`

نفس الفكرة موجودة في التسويق والمحاسبة والائتمان والموارد البشرية، مع اختلاف درجة التقسيم.

## 8. طبقة الخدمات والاتصال بالخلفية

`src/api/apiClient.js` هو المركز الوحيد تقريبا للاتصال HTTP:

- يقرأ `apiBaseUrl` و`apiTimeout` من `src/config/appConfig.js`.
- يضيف `Authorization: Bearer <token>` من `secureStorage`.
- يجهز CSRF عبر `src/utils/csrf.js`.
- يجهز refresh token عبر `src/utils/tokenRefresh.js`.
- يدعم cache داخلي ومؤقت لبعض GET requests.
- يعيد تشكيل أخطاء Axios إلى `APIError` موحد يحتوي `status`, `data`, `url`, `method`, `userMessage`.
- عند 401 يمسح الجلسة ويعيد المستخدم إلى `/login`.

الخدمات في `src/services` هي واجهة المجال مع الـ API. أمثلة:

- `authService.js`: login/logout/current user/session.
- `userService.js`, `teamService.js`: المستخدمون والفرق.
- `salesService.js`, `marketingService.js`, `hrService.js`: مجالات الأعمال الرئيسية.
- `contractService.js` مع مجلد `services/contracts`: تقسيم وظائف العقود.
- `pdfService.js` و`services/pdf/*`: إنشاء وتعبئة تقارير/مستندات PDF.
- `notificationService.js`, `chatService.js`: الإشعارات والمحادثة.

يوجد `src/factories/serviceFactory.js` كـ registry للخدمات، يسمح بالحصول على خدمة بالاسم أو تسجيل خدمة جديدة.

## 9. المصادقة والصلاحيات

المصادقة:

- `src/services/authService.js` ينفذ login/logout وقراءة المستخدم الحالي.
- `src/utils/secureStorage.js` مسؤول عن token وrefresh token ومعلومات المستخدم وتوقيت الجلسة.
- `src/main.js` يحتوي معالجة عامة لأخطاء 401 حتى لا تظهر كأخطاء runtime عادية.

الصلاحيات:

- `src/constants/roles.js`: تعريف أدوار النظام.
- `src/constants/permissions.js`: مفاتيح الصلاحيات ومصفوفات bootstrap للأدوار.
- `src/utils/rbac.js`: المصدر العملي لفحص الدور/الصلاحية/مسار dashboard.
- `src/directives/permission`: directive لاستخدام الصلاحيات داخل القوالب.
- `src/composables/usePermissions.js`: واجهة Composition API لفحص الصلاحيات داخل المكونات.

النمط المعماري هنا RBAC مختلط: الدور يحدد مجالا عاما، والصلاحيات الدقيقة تضبط التبويبات والإجراءات والمسارات.

## 10. إدارة الحالة والمنطق

يوجد استخدام Pinia محدود في:

```text
src/stores/
|-- accountingStore.js
|-- creditStore.js
|-- hrStore.js
`-- marketingStore.js
```

لكن جزءا كبيرا من حالة الشاشة ومنطق الجلب موجود في composables، مثل:

- `useSalesDashboard`, `useSalesTargets`, `useSalesProjects`.
- `useMarketingDashboard`, `useMarketingTasks`, `useMarketingLeads`.
- `useAccountingCommissions`, `useAccountingDeposits`.
- `useCreditBookings`, `useCreditFinancing`.
- `useHRDashboard`, `useHRTeams`, `useHRPerformance`.

هذا يعني أن التطوير اليومي يجب أن يبدأ من composable الخاص بالشاشة، لا من store دائما.

## 11. الواجهة والمكونات

`src/components` يحتوي نوعين من المكونات:

- مكونات عامة/تطبيقية: modals، pagination، toasts، reports، login، user management، project components.
- مكتبة UI تحت `src/components/ui`: مكونات shadcn-vue/Radix مثل button، card، dialog، sidebar، table، tabs، tooltip، calendar.

`components.json` يثبت أن المشروع يستخدم shadcn-vue بدون TypeScript كامل، مع aliases:

- `@/components`
- `@/components/ui`
- `@/lib/utils`

التصميم RTL، وهذا واضح في `App.vue` وملفات CSS. توجد أيضا ملفات ثيمات في `src/assets`:

- `app.css`
- `tailwind.css`
- `luxury-theme.css`
- `global-luxury-styles.css`
- `erp-dashboard-theme.css`
- ملفات responsive.

## 12. الإعدادات ومتغيرات البيئة

مصدر إعدادات وقت التشغيل هو `src/config/appConfig.js`، ويقرأ من `import.meta.env`:

| المتغير | الدور |
|---|---|
| `VITE_APP_API_BASE_URL` | عنوان API الخلفي. |
| `VITE_APP_ENABLE_CSRF` | تفعيل/تعطيل CSRF. |
| `VITE_APP_SESSION_TIMEOUT` | مدة الجلسة. |
| `VITE_APP_SESSION_WARNING_TIME` | وقت تحذير انتهاء الجلسة. |
| `VITE_APP_PUSHER_KEY` وما يرتبط به | إعداد Reverb/Pusher للمحادثة والإشعارات. |
| `VITE_APP_ENABLE_ANALYTICS` | تفعيل analytics. |
| `VITE_APP_ENABLE_ERROR_REPORTING` | تفعيل error reporting. |
| `VITE_APP_SENTRY_DSN` | تفعيل Sentry في الإنتاج إذا توفر. |
| `VITE_APP_API_TIMEOUT` | timeout للطلبات. |

ملاحظة مهمة: `appConfig.js` يحتوي default API مختلفا حسب البيئة، لكن التعليق بجانبه يبدو معكوسا مقارنة بالقيمة الفعلية. راجع هذا قبل أي نشر جديد.

## 13. البناء والأداء

`vite.config.js` يحتوي:

- Vue plugin.
- Tailwind Vite plugin.
- gzip وbrotli compression.
- image optimizer.
- alias: `@`, `@shared`, `@modules`.
- dev server على port `8080`.
- إسقاط `console` و`debugger` في esbuild.
- manual chunks:
  - `vendor-vue`
  - `vendor-ui`
  - `vendor-charts`
  - `vendor-markdown`
  - `vendor-pdf`
  - `vendor-canvas`
  - `vendor-utils`
- `build:analyze` ينتج `dist/stats.html`.

أوامر مهمة:

```bash
npm run dev
npm run build
npm run build:analyze
npm run build:check-budget
```

## 14. الاختبارات والجودة

Vitest:

- التهيئة في `vitest.config.js`.
- البيئة `jsdom`.
- setup في `tests/setup.js`.
- alias مطابق لـ Vite.
- التغطية تستخدم V8.
- تستثني `src/core/router/**`, `src/components/ui/**`, `src/main.js` وغيرها من التغطية.

Playwright:

- التهيئة في `playwright.config.js`.
- الاختبارات في `e2e`.
- محليا يشغل `npm run dev` على `http://localhost:8080`.
- في preview/CI يمكن استخدام `127.0.0.1:4173`.

ESLint:

- Flat config.
- يطبق على `src/**/*.{js,vue}`.
- حد `max-lines` مضبوط على 600، مع استثناءات.
- `src/components/ui/**` مستثنى لأنه مولد/خارجي النمط.

فحص الأنواع:

- `tsconfig.checkjs.json` يفعل `allowJs`, `checkJs`, `strict`, `noImplicitAny`.
- المشروع JavaScript أساسا، مع بعض ملفات TypeScript في مكونات UI.

أوامر يومية:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run test:coverage
npm run test:e2e
```

## 15. العلاقات بين الطبقات

```text
Browser
  -> index.html
  -> src/main.js
  -> App.vue
  -> core/router
  -> layouts/MainLayout.vue
  -> modules/<domain>/views
  -> modules/<domain>/tabs أو components
  -> composables/<domain>
  -> services/<domain>Service
  -> api/apiClient
  -> Backend API
```

العلاقات العرضية المهمة:

- `router guards` يعتمد على `authService` و`rbac`.
- `MainLayout` يعتمد على composable خاص به وعلى header/sidebar.
- `Sidebar` يعرض الخيارات بناء على المستخدم والصلاحيات.
- `apiClient` يعتمد على `appConfig`, `secureStorage`, `csrf`, `tokenRefresh`, `errorHandler`.
- `services` تعتمد غالبا على `apiClient` و`serviceErrorHandler`.
- `composables` تعتمد على services وتقدم state/actions للمكونات.
- `tests` تعكس هذه الطبقات: api، services، composables، views، router، utils.

## 16. الأنماط المعمارية المستخدمة

| النمط | مكانه | الهدف |
|---|---|---|
| Feature/domain modules | `src/modules/<domain>` | فصل الشاشات حسب مجال العمل. |
| Layered frontend architecture | views/components -> composables -> services -> apiClient | إبقاء الاتصال بالـ API بعيدا عن القوالب. |
| Composition API orchestration | `src/composables` | إعادة استخدام منطق الشاشة والجلب والحالة. |
| Service layer | `src/services` | عزل endpoints وتحويل البيانات والأخطاء. |
| RBAC | `constants/roles`, `constants/permissions`, `utils/rbac`, route meta | ضبط الوصول حسب الدور والصلاحية. |
| Lazy loading | dynamic imports في router و`defineAsyncComponent` | تحسين الأداء وتقليل bundle الأولي. |
| Shell/tabs per domain | مثل SalesViewExtended وMarketingView | صفحة مجال واحدة تختار تبويبا حسب route. |
| Centralized error normalization | `apiClient`, `serviceErrorHandler`, `errorHandler` | جعل أخطاء API قابلة للتعامل الموحد. |
| Generated/shared UI library | `src/components/ui` | توحيد primitives للواجهة. |

## 17. أين تضيف تغييرا جديدا؟

- صفحة route جديدة: أنشئها تحت `src/modules/<domain>/views/` ثم سجلها في `src/core/router/routes`.
- تبويب داخل مجال مثل sales/marketing: أضف tab component تحت `src/modules/<domain>/tabs/` ثم اربطه براوتر المجال وcomposable routing إن وجد.
- استدعاء API جديد: أضفه في service المجال داخل `src/services` أو مجلد service الفرعي، واستخدم `apiClient`.
- منطق شاشة قابل لإعادة الاستخدام: ضعه في `src/composables/<domain>`.
- صلاحية جديدة: أضفها في `src/constants/permissions.js`، ثم اربطها بالراوتر والواجهة و`rbac` عند الحاجة.
- دور جديد: راجع `src/constants/roles.js`, `src/utils/rbac.js`, وroute meta.
- مكون UI عام: إن كان primitive مشترك فضعه في `src/components/ui`; إن كان خاصا بمجال فضعه داخل `src/modules/<domain>/components`.
- اختبار خدمة: أضفه تحت `tests/services`.
- اختبار composable: أضفه تحت `tests/composables/<domain>`.
- اختبار شاشة: أضفه تحت `tests/views`.
- E2E workflow: أضفه تحت `e2e`.

## 18. ملاحظات فنية مهمة

- بعض التعليقات العربية تظهر بترميز غير صحيح في مخرجات الطرفية الحالية. إن ظهرت داخل المحرر أيضا، فالمشروع يحتاج فحص encoding موحد UTF-8.
- توجد ملفات build/typecheck/log كبيرة في الجذر؛ هي مفيدة كأثر تشخيصي لكنها لا يجب أن تقود التصميم.
- يوجد `src/router/index.js` فقط للتوافق العكسي؛ الراوتر الحقيقي في `src/core/router`.
- `README.md` في الجذر يبدو قديما ويشير إلى Vue CLI، بينما المشروع الحالي Vite. الأفضل تحديثه لاحقا ليشير إلى هذا المستند وأوامر Vite.
- توجد تعديلات غير ملتزم بها في عدة ملفات مصدر واختبار وقت كتابة هذا المستند؛ لم يتم تغييرها.

## 19. مسار تعلم سريع لمطور جديد

1. اقرأ `package.json` لمعرفة أوامر التشغيل.
2. افتح `src/main.js` ثم `src/App.vue`.
3. اقرأ `src/core/router/routes/index.js` وملفات `domain*.js`.
4. افهم `src/layouts/MainLayout.vue` لأنه غلاف معظم الصفحات.
5. اختر مجالا واحدا، مثلا `sales`، وتتبع المسار:
   `domainSales.js` -> `SalesViewExtended.vue` -> `tabs/*` -> `composables/sales/*` -> `services/salesService.js`.
6. راجع `src/api/apiClient.js` لفهم شكل الأخطاء والجلسة.
7. راجع `src/utils/rbac.js` و`src/constants/permissions.js` قبل أي تغيير متعلق بالصلاحيات.
8. شغل الفحوص المناسبة قبل تسليم التغيير:
   `npm run lint`, `npm run typecheck`, `npm run test:run`, وأحيانا `npm run test:e2e`.
