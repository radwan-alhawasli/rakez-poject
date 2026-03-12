# تابات كل مستخدم والصلاحيات المرتبطة بكل تاب (لتفادي 403)

**هدف الوثيقة:** عند منح صلاحية لتاب معين، يجب منح **كل** الصلاحيات المذكورة تحت هذا التاب حتى لا يضرب الباكند 403. الفرونت يتحقق من صلاحية الدخول (route) فقط؛ الباكند قد يتحقق من صلاحيات إضافية لكل endpoint.

**ملاحظة:** تمت القراءة من الكود فقط (router، permissions، sidebar، composables، مكونات) — بدون تعديل. صلاحيات الباكند الفعلية قد تختلف؛ يفضّل مطابقتها مع توثيق الـ API أو الباكند.

---

## ١. من أين تأتي صلاحيات المستخدم؟

- إذا الـ **API يرجع** `user.permissions` عند تسجيل الدخول أو `GET /user`، المستخدم يأخذ فقط هذه الصلاحيات.
- إذا الـ API **لا يرجع** صلاحيات، الفرونت يستخدم **BOOTSTRAP_ROLE_MAP** حسب `user.type` (ودور السيلز قائد = type 5 + is_leader أو is_manager).
- **403** يحدث عندما طلب API يُرفض من الباكند — غالباً لأن صلاحية مطلوبة للـ endpoint غير موجودة عند المستخدم. لذلك يجب أن يكون للمستخدم **كل** الصلاحيات المدرجة تحت التاب (دخول + أي عملية داخل التاب).

---

## ٢. المسارات بدون صلاحيات في الـ router (عامة للمصادقين)

هذه المسارات **لا تحتوي على meta.roles أو meta.permissions** في الـ router، فيسمح بها لأي مستخدم مصادق:

- `/dashboard` — لوحة التحكم العامة  
- `/ai-assistant` — المساعد الذكي  
- `/chat` — المحادثة  
- `/profile` — الملف الشخصي  
- `/exclusive-request` — طلب مشروع حصري  
- `/my-requests` — طلباتي  
- `/contract-form/:id` — نموذج عقد  
- `/project-tracker/:id` — متتبع مشروع  
- `/reservations` — الحجوزات (بدون كونك تحت /sales)  
- `/cancelled-reservations` — الحجوزات الملغاة  
- `/tasks` — المهام  
- `/teams` — الفرق  
- `/team-management` — إدارة الفرق  
- `/image-approval` — الموافقة على الصور  

**ملاحظة:** الباكند قد يفرض صلاحيات على الـ endpoints الخاصة بهذه الصفحات؛ إذا حصل 403 فغالباً تحتاج صلاحيات مثل `contracts.view`, `second_party.view`, `sales.reservations.view`, إلخ حسب الصفحة.

---

## ٣. صلاحية دخول كل مسار (من router meta)

| المسار | صلاحية/دور الدخول (meta) |
|--------|---------------------------|
| `/knowledge-management` | `manage-ai-knowledge` |
| `/project-management` | أدوار: Admin, PM |
| `/developers`, `/developers/:id`, `/developers/:id/project/:projectId` | أدوار: Admin, PM, Accounting |
| `/notifications` | `notifications.view` |
| `/contracts` | `contracts.view` |
| `/users` | أدوار: Admin, HR + `hr.users.create` |
| `/agents` | دور: Admin + `agents.manage` |
| **HR** `/hr/*` | دور HR + حسب التاب أدناه |
| **Marketing** `/marketing/*` | دور Marketing + حسب التاب أدناه |
| **Sales** `/sales/*` | دور Sales + حسب التاب أدناه |
| **Credit** `/credit/*` | دور Credit + حسب التاب أدناه |
| **Accounting** `/accounting/*` | دور Accounting + حسب التاب أدناه |
| **Commission-deposits** `/commission-deposits/*` | أدوار: Admin, Accounting, HR (بدون meta.permissions للتابات) |
| **Editor** `/editor/*` | دور Editor (بدون صلاحيات فرعية في الـ router للتابات) |

---

## ٤. تفصيل التابات والصلاحيات المترابطة (لتفادي 403)

### ٤.١ المبيعات (Sales) — `/sales/*`

التاب يظهر في القائمة فقط إذا كانت الصلاحية المطلوبة متوفرة (useSalesRouting + AppSidebar). لدخول المسار الفرعي يلزم صلاحية الـ route أيضاً.

| التاب | مسار/اسم المسار | صلاحية الدخول (route meta) | صلاحيات إضافية مستخدمة داخل التاب (واجهة + منطق) |
|-------|------------------|----------------------------|--------------------------------------------------|
| لوحة التحكم | dashboard | `sales.dashboard.view` | — |
| الأهداف | targets | `sales.targets.view` | `sales.team.manage` (عرض أهداف الفريق، إنشاء هدف)، `sales.targets.update` (تحديث حالة الهدف) |
| المشاريع | projects | `sales.projects.view` | — |
| بحث الوحدات | unit-search | `sales.projects.view` | قد تحتاج `sales.units.view`, `sales.units.book` للعمليات على الوحدات |
| الحجوزات | reservations | `sales.reservations.view` | `sales.reservations.confirm`, `sales.waiting_list.convert`, `sales.negotiation.approve` (أزرار تأكيد/تحويل/موافقة في ReservationsView) |
| الدوام | attendance | `sales.attendance.view` | `sales.attendance.manage` (إدارة دوام الفريق وإظهار أعمدة إضافية) |
| المفاوضات | negotiations | نفس صفحة الحجوزات (redirect) | نفس صلاحيات الحجوزات + `sales.negotiation.approve` |
| قائمة الانتظار | waiting-list | نفس صفحة الحجوزات (redirect) | `sales.waiting_list.create` أو `sales.waiting_list.convert` (واحد من الاثنين يكفي لظهور التاب) |
| الفريق | team | `sales.team.manage` | `sales.team.manage` (قسم التقييم والإجراءات) |
| المهام | tasks | `sales.tasks.manage` | `sales.tasks.create_for_marketing` (زر إنشاء مهمة من التسويق) |
| التعيينات | assignments | `sales.projects.allocate_shifts` | — |
| خطط الدفع | payment-plans | `sales.payment-plan.manage` | — |
| دوام المشاريع | project-schedules | `sales.attendance.manage` (أي `sales.project_schedules.manage`) | `sales.attendance.manage` |
| الوحدات المباعة | sold-units | `sales.sold_units.view` | — |
| الودائع | deposits | `sales.deposits.view` | — |
| التحليلات | analytics | `sales.analytics.view` | — |

**توصية للمبيعات:** لمنع 403 في تاب معين، امنح المستخدم: **صلاحية الدخول** + **كل** الصلاحيات الإضافية المذكورة في عمود "صلاحيات إضافية" لهذا التاب. قائد المبيعات يأخذ افتراضياً SALES_BASE + SALES_LEADER_EXTRA من BOOTSTRAP؛ إذا الـ API يرسل permissions محدودة، تأكد أن الباكند يعيد كل هذه الصلاحيات لقائد المبيعات.

---

### ٤.٢ الموارد البشرية (HR) — `/hr/*`

| التاب | مسار الاسم | صلاحية الدخول | صلاحيات إضافية مستخدمة داخل الواجهة |
|-------|------------|----------------|--------------------------------------|
| لوحة التحكم | HRDashboard | `hr.dashboard.view` | — |
| إدارة الفرق | HRTeams | `hr.teams.manage` | — |
| أداء الفريق | HRTeamPerformance | `hr.performance.view` | — |
| أداء الموظف | HREmployeePerformance | `hr.performance.view` | — |
| إدارة المستخدمين | HRUsers | `hr.users.create` | — |
| التقارير | HRReports | `hr.reports.view` | — |

الباكند قد يفصل صلاحيات مثل `hr.reports.print`, `hr.contracts.manage`, `hr.warnings.manage` حسب الـ endpoint؛ إذا حصل 403 في تاب التقارير أو المستخدمين أو العقود، راجع صلاحيات الـ API لهذه الـ endpoints.

---

### ٤.٣ التسويق (Marketing) — `/marketing/*`

| التاب | مسار الاسم | صلاحية الدخول | صلاحيات إضافية مستخدمة داخل الواجهة |
|-------|------------|----------------|--------------------------------------|
| لوحة التحكم | MarketingDashboard | `marketing.dashboard.view` | — |
| المشاريع | MarketingProjects | `marketing.projects.view` | `marketing.plans.create`, **`marketing.budget.calculate`** (مستخدم في الزر؛ غير معرف في constants كـ PERMISSIONS — قد يكون خطأ والمقصود `marketing.budgets.manage`) |
| المهام | MarketingTasks | `marketing.tasks.view` | — |
| العملاء المحتملين | MarketingLeads | `marketing.teams.view` | — |
| المبيعات المتوقعة | MarketingExpectedSales | `marketing.reports.view` | — |
| التقارير | MarketingReports | `marketing.reports.view` | — |
| الخطط / خطة المطور | MarketingPlans, DeveloperPlan | `marketing.plans.create` | `marketing.plans.create` (حفظ الخطة) |
| خطط الموظفين | MarketingEmployeePlans | `marketing.plans.create` | — |
| المساعد الذكي | MarketingAiAssistant | `use-ai-assistant` | — |

**تنبيه:** في `MarketingProjectsTab.vue` يُستخدم `hasPermission('marketing.budget.calculate')` بينما في `permissions.js` المعرّف هو `marketing.budgets.manage`. إن كان الباكند يتوقع `marketing.budget.calculate` أو صلاحية أخرى لـ endpoint حساب الميزانية، يجب إضافتها للمستخدم أو توحيد الاسم بين الفرونت والباكند.

---

### ٤.٤ الائتمان (Credit) — `/credit/*`

| التاب | مسار الاسم | صلاحية الدخول | ملاحظات |
|-------|------------|----------------|---------|
| لوحة التحكم | CreditDashboard | `credit.dashboard.view` | — |
| الإشعارات | CreditNotifications | `credit.dashboard.view` | — |
| الحجوزات | CreditBookings | `credit.bookings.view` | — |
| التمويل | CreditFinancing | `credit.financing.manage` | — |
| نقل الملكية | CreditTitleTransfer | `credit.title_transfer.manage` | — |
| المشاريع المباعة | CreditSoldProjects | `credit.bookings.view` | — |
| ملف المطالبة | CreditClaimFiles | `credit.claim_files.generate` | — |

إذا حصل 403 في أحد التابات، تأكد أن المستخدم يملك صلاحية الدخول المذكورة وأن الباكند يسمح لدور الائتمان بهذه الصلاحية على الـ endpoints المستدعاة.

---

### ٤.٥ المحاسبة (Accounting) — `/accounting/*`

| التاب | مسار الاسم | صلاحية الدخول | ملاحظات |
|-------|------------|----------------|---------|
| لوحة التحكم | AccountingDashboard | `accounting.dashboard.view` | — |
| الإشعارات | AccountingNotifications | `accounting.notifications.view` | — |
| الوحدات المباعة | AccountingSoldUnits | `accounting.sold-units.view` | الباكند قد يفرض `accounting.sold-units.manage` لبعض العمليات |
| الودائع | AccountingDeposits | `accounting.deposits.view` | الباكند قد يفرض `accounting.deposits.manage` للتأكيد/الاسترداد |
| الرواتب | AccountingSalaries | `accounting.salaries.view` | الباكند قد يفرض `accounting.salaries.distribute` للتوزيع |

---

### ٤.٦ العمولات والودائع (Commission-Deposits) — `/commission-deposits/*`

الأدوار: Admin, Accounting, HR. **لا يوجد في الـ router meta صلاحيات فرعية لكل تاب** (dashboard, commissions, deposits). الباكند قد يتحقق من صلاحيات مثل:

- `accounting.commissions.approve`
- `accounting.commissions.create`
- `accounting.deposits.view` / `accounting.deposits.manage`

عند منح الوصول لهذا القسم، يفضّل منح كل الصلاحيات المرتبطة بالعمولات والودائع في المحاسبة حتى لا يضرب 403 داخل التابات.

---

### ٤.٧ المحرر (Editor) — `/editor/*`

الدخول بالدور فقط (ROLE_EDITOR). التابات الفرعية (contracts, second-party, units, developers, montage, photography, boards, media) **لا تحتوي على meta.permissions** في الـ router. الباكند عادة يتحقق من صلاحيات مثل:

- `contracts.view`, `contracts.view_all`
- `second_party.view`, `second_party.edit`
- `units.view`
- `departments.boards.view`, `departments.boards.edit`
- `departments.photography.view`, `departments.photography.edit`
- `departments.montage.view`, `departments.montage.edit`
- `editing.projects.view`, `editing.media.upload`

من BOOTSTRAP_ROLE_MAP دور `editor` يأخذ هذه الصلاحيات. إذا الـ API يرجع permissions محدودة، يجب أن تتضمن كل ما تحتاجه التابات التي يفتحها المحرر.

---

### ٤.٨ العقود (Contracts) — `/contracts` و ContractModal

- دخول الصفحة: `contracts.view`
- في **ContractModal** (موافقة/رفض): `contracts.approve`

إذا المستخدم يرى العقود لكن عند الموافقة يضرب 403، تأكد من منحه `contracts.approve` أيضاً.

---

## ٥. ملخص: ماذا نمنح حتى لا يضرب 403؟

1. **لدخول صفحة/تاب:** المستخدم يحتاج **صلاحية الدخول** (الموجودة في route meta أو في useSalesRouting للتاب).
2. **لعمليات داخل التاب (أزرار، استدعاءات API):** المستخدم يحتاج **كل** الصلاحيات التي:
   - تظهر في الواجهة تحت `hasPermission(...)` أو `hasAnyPermission(...)` داخل هذا التاب،
   - و/أو يتوقعها الباكند لكل endpoint يُستدعى من هذا التاب.
3. **التوافق مع الباكند:** إذا الباكند يرسل `user.permissions` عند تسجيل الدخول، تأكد أن هذه القائمة تحتوي على **كل** صلاحيات التابات التي يسمح له بفتحها. إذا الباكند لا يرسل صلاحيات، الفرونت يستخدم BOOTSTRAP_ROLE_MAP حسب الدور — عندها تأكد أن BOOTSTRAP_ROLE_MAP لهذا الدور يحتوي على كل الصلاحيات المذكورة أعلاه للتابات التي يراها هذا الدور.
4. **حالة خاصة — تسويق:** صلاحية `marketing.budget.calculate` مستخدمة في الكود لكن غير معرّفة في PERMISSIONS؛ راجع الباكند وإما تضيف الصلاحية في constants أو تستبدلها بـ `marketing.budgets.manage` في المكون.

---

*تم إعداد الوثيقة بالقراءة فقط من: src/router/index.js، src/constants/permissions.js، src/constants/roles.js، src/composables/sales/useSalesRouting.js، src/layouts/components/AppSidebar.vue، ومكونات التابات والـ composables المذكورة.*
