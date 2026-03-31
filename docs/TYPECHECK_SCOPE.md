# نطاق فحص الأنواع (checkJs)



## الأمر



`npm run typecheck` — يشغّل `tsc -p tsconfig.checkjs.json` على:



- `src/api/**/*.js`

- `src/services/**/*.js`

- `src/vite-env.d.ts` و `src/shims-checkjs.d.ts`

- أي ملفات `.js` تُستورد من المسارات أعلاه (سلسلة الاستيراد)، بما فيها أدوات مثل `src/utils/serviceErrorHandler.js`، `src/utils/caughtError.js`، `src/utils/paginationUtils.js`، `src/utils/csrf.js`، `src/utils/tokenRefresh.js`، إلخ.



## إعدادات المترجم



- `checkJs: true` مع `strict: true`.

- `noImplicitAny: true` — المعاملات الضمنية تُغطّى بـ JSDoc (`@param {any}`، `@typedef`، أنماط `@type` على القيم) أو بتضييق صريح.

- `useUnknownInCatchVariables: true` — متغيّر `catch` من نوع `unknown`؛ يُفضّل تمريره إلى `handleServiceError` أو استخدام مساعدات `src/utils/caughtError.js` (`getCaughtStatus`, `getCaughtMessage`, `getCaughtRequestUrl`, `toThrowable`, …) قبل الوصول إلى `.response` / `.message`.

- توسيع `Error` في `src/vite-env.d.ts` لخصائص أخطاء axios/API الشائعة (`response`, `status`, `code`, …).

- تعريف الوحدة `arabic-reshaper` في `src/shims-checkjs.d.ts` (لا توجد `@types` رسمية).



## استثناءات مقصودة



- بعض ملفات PDF تحت `src/services/pdf/` تستخدم `// @ts-nocheck` لأن بيانات الرسم والحقول قادمة من الـ API بأشكال مرنة؛ المنطق يُتحقق عند التشغيل.



## CI



- خطوة إلزامية في `.github/workflows/ci.yml` قبل `lint`.

