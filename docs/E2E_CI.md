# E2E والثقة في CI

## طبقات التحقق

| الطبقة | أين تُشغَّل | ماذا تغطي | أسرار |
|--------|-------------|-----------|--------|
| **Playwright على PR** | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — مهمة `e2e-smoke` (اسم العرض: E2E (preview, seeded auth)) | `vite build` + `preview` على `127.0.0.1:4173` ثم **كل** الاختبارات تحت [`e2e/`](../e2e/) (تسجيل الدخول، الجلسة، RBAC، صفحات رئيسية). الجلسة تُبذَر عبر `localStorage` في الاختبار — لا حاجة لخادم حقيقي لمعظم المسارات. | لا |
| **تكامل API (اختياري)** | نفس الـ workflow — مهمة `api-integration` | [`tests/integration/api-integration.test.js`](../tests/integration/api-integration.test.js) ضد `STAGING_API_BASE_URL`. | `STAGING_API_BASE_URL`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD` |
| **Staging / إنتاج** | يدوي أو pipeline لاحق | سيناريوهات تعتمد على بيانات حية أو تسجيل دخول حقيقي عبر API. يمكن إضافة job لاحقاً يشغّل `playwright test e2e/staging/...` مع `PLAYWRIGHT_BASE_URL` من سرّ المستودع. | حسب الإعداد |

## تشغيل محلي يطابق CI

1. مرة واحدة (أو بعد ترقية `@playwright/test`): `npx playwright install chromium`
2. `npm run build`
3. في طرفية منفصلة: `npm run preview -- --host 127.0.0.1 --port 4173`
4. في طرفية أخرى: `npm run test:e2e:ci`

السكربت `test:e2e:ci` يضبط `PLAYWRIGHT_SKIP_WEBSERVER=1` و`PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173` (عبر `cross-env` ليعمل على Windows وLinux).

## الملفات تحت `e2e/`

- `login.spec.js`, `auth.spec.js` — صفحة الدخول والحارس.
- `rbac.spec.js` — صلاحيات المسارات حسب نوع المستخدم.
- `reservations.spec.js`, `projects.spec.js`, `commissions.spec.js` — تحميل واجهات رئيسية؛ كثير من التحققات تتحمل غياب بيانات API (حالات فارغة أو شروط `if`).

راجع [`playwright.config.js`](../playwright.config.js) للخيارات العامة و`retries` في CI.
