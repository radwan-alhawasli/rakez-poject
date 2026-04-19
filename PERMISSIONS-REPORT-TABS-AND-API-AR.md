# تقرير إحصائي: التابات وما يستخدمه كل نوع — وجميع الصلاحيات المطلوبة لتفادي 403

**الهدف:** إحصاء كل تاب وكل أمر (قائمة، زر، استدعاء API) يستخدمه، وتعداد **كل** الصلاحيات التي يجب تضمينها حتى يعمل الـ API بشكل صحيح ضمن التاب دون ظهور 403 رغم امتلاك الصلاحية الرئيسة.

**ملاحظة:** التقرير من القراءة فقط للكود (بدون تعديل). الباكند قد يستخدم أسماء صلاحيات أو endpoints مختلفة — يُفضّل مطابقتها مع الـ API الفعلي.

---

## سيناريو نموذجي (مثل طلب المشروع الحصري)

| السيناريو | ما يحدث في الواجهة | استدعاء الـ API | صلاحية الدخول للصفحة | صلاحية إضافية مطلوبة لتفادي 403 |
|-----------|---------------------|------------------|------------------------|-----------------------------------|
| **طلب مشروع حصري** | المستخدم يفتح `/exclusive-request` ويختار "مطور" من قائمة منسدلة. | عند تحميل الصفحة: **GET /developers** (أو احتياطياً GET /second-party-data/second-parties) لملء القائمة. عند الإرسال: **POST /contracts/store**. | لا يوجد في الـ router (الصفحة متاحة لأي مصادق). | **(1)** صلاحية تسمح بـ **عرض قائمة المطورين** (الـ API الذي يسمح بـ GET /developers أو GET /second-party-data/second-parties) — غالباً مرتبطة بدور Admin/PM/Accounting أو صلاحية مثل `projects.view` / عقود. **(2)** صلاحية إنشاء عقد/طلب حصري: `contracts.create` أو ما يعادلها في الباكند لـ POST /contracts/store. |

**الخلاصة:** من يملك فقط "طلب مشروع حصري" في الواجهة دون صلاحية **عرض المطورين** سيواجه 403 عند تحميل القائمة؛ لذلك يجب **تضمين صلاحية عرض المطورين** (أو فتح endpoint قائمة المطورين لهذا الدور) لكل من يُسمح له بطلب مشروع حصري.

---

## ١. إحصاء عام: مصدر 403

- **403** يحدث عندما الباكند يرفض الطلب لأن المستخدم لا يملك الصلاحية المطلوبة لهذا الـ **endpoint**.
- الصلاحية **الرئيسة** (التي تظهر التاب أو تسمح بدخول الصفحة) قد تكون كافية للـ **router** فقط، بينما **داخل التاب** تُستدعى endpoints إضافية (قوائم، تفاصيل، موافقات، تحويل، إلخ) لكل منها صلاحية قد تكون مستقلة في الباكند.
- التقرير يعدد لكل تاب: **ما الذي يستخدمه التاب** (قوائم، أزرار، استدعاءات) و**كل الصلاحيات التي يجب تضمينها** حتى لا يظهر 403.

---

## ٢. الصفحات/التابات حسب القسم مع الاستدعاءات والصلاحيات المطلوبة

### ٢.١ طلب مشروع حصري (`/exclusive-request`)

| ما يستخدمه التاب | استدعاء API / الإجراء | الصلاحية/الصلاحيات التي يجب تضمينها |
|-------------------|------------------------|--------------------------------------|
| قائمة اختيار المطور | GET /developers (أو GET /second-party-data/second-parties) | صلاحية تسمح بعرض قائمة المطورين (غالباً نفس ما يُمنح لصفحة "المطورين" — أدوار Admin, PM, Accounting أو صلاحية من الباكند لهذا الـ endpoint). |
| إرسال الطلب | POST /contracts/store | صلاحية إنشاء عقد/طلب (مثل `contracts.create` أو ما يعادلها في الباكند). |

**مجموع صلاحيات يُنصح بتضمينها لمن يفتح هذه الصفحة:**  
(1) صلاحية عرض المطورين (GET /developers أو /second-party-data/second-parties)، (2) صلاحية إنشاء عقد (POST /contracts/store).

---

### ٢.٢ طلباتي (`/my-requests`)

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| قائمة العقود/الطلبات | GET /contracts (أو index مع فلتر) | `contracts.view` (أو ما يعادلها). |
| تفاصيل عقد عند النقر | GET /contracts/:id | `contracts.view`. |

---

### ٢.٣ لوحة التحكم العامة (`/dashboard`)

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| قائمة عقود (حسب الدور) | GET /contracts/admin-index أو GET /contracts أو getEditorContracts | حسب الدور: Admin عقود كاملة، PM عقود، مستخدم عادي عقوده — يحتاج `contracts.view` أو `contracts.view_all` أو صلاحية المحرر حسب الباكند. |

---

### ٢.٤ الحجوزات / تاب الحجوزات (`/reservations` أو `/sales/reservations`)

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| قائمة الحجوزات | GET reservations (salesService.getReservations) | `sales.reservations.view` |
| قائمة قائمة الانتظار | GET waiting list | `sales.waiting_list.create` أو `sales.waiting_list.convert` (للقائد) |
| قائمة المفاوضات | GET pending negotiations | `sales.negotiation.approve` (للموافقة/الرفض) أو عرض القائمة |
| تأكيد حجز | POST confirm reservation | `sales.reservations.confirm` |
| إلغاء حجز | POST cancel reservation | `sales.reservations.cancel` |
| تحويل من قائمة انتظار إلى حجز | POST convert | `sales.waiting_list.convert` |
| موافقة/رفض تفاوض | POST approve/reject negotiation | `sales.negotiation.approve` |
| تحميل فoucher | GET download voucher | صلاحية عرض الحجوزات/التحميل حسب الباكند |

**مجموع صلاحيات التاب:** `sales.reservations.view` + عند الحاجة: `sales.reservations.confirm`, `sales.reservations.cancel`, `sales.waiting_list.convert`, `sales.negotiation.approve`.

---

### ٢.٥ تاب الأهداف (المبيعات) (`/sales/targets`)

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| عرض الأهداف | GET targets by project / my | `sales.targets.view` (راجع [SALES_TARGETS_API_SUMMARY.md](docs/SALES_TARGETS_API_SUMMARY.md)) |
| إنشاء هدف (قائد) | POST create target | `sales.team.manage` (مفاتيح: `assignee_marketer_id`, `assigned_target_value`) |
| تحديث حالة الهدف | PATCH update target status | `sales.targets.update` |
| قائمة أعضاء الفريق (لتعيين هدف) | GET team members | `sales.team.manage` |

**مجموع صلاحيات التاب:** `sales.targets.view`, `sales.targets.update`, وإذا كان قائد: `sales.team.manage`. لمزيد من التفاصيل حول مفاتيح البيانات، راجع ملخص الـ API.

---

### ٢.٦ تاب الدوام / دوام المشاريع (المبيعات)

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| سجل الدوام (دوامي) | GET attendance | `sales.attendance.view` |
| جداول دوام الفريق / المشاريع | GET project schedules, إدارة | `sales.attendance.manage` (أي `sales.project_schedules.manage`) |

---

### ٢.٧ تاب المهام (المبيعات) (`/sales/tasks`)

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| قائمة المهام | GET tasks | `sales.tasks.manage` |
| إنشاء مهمة من التسويق | POST create task for marketing | `sales.tasks.create_for_marketing` |

---

### ٢.٨ إدارة الفرق (`/team-management`) — PM / Admin

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| قائمة الفرق | teamService.getTeams | صلاحية إدارة الفرق (مثل projects.team أو فريق العقود). |
| أعضاء الفريق وعقود الفريق | hrService.getHRTeamMembers, teamService.getTeamContracts | `hr.teams.manage` أو ما يعادلها، وربما `contracts.view` للعقود. |
| قائمة موظفين (لتعيين عضو) | hrService.getEmployees | صلاحية عرض الموظفين (مثل `hr.users.view` أو `employees.manage`). |
| تعيين/إزالة عضو | hrService.assignTeamMember, removeTeamMember | `hr.teams.manage`. |
| إنشاء/تحديث/حذف فريق | teamService.createTeam, updateTeam, deleteTeam | صلاحية إنشاء/تعديل فرق العقود حسب الباكند. |

**مجموع صلاحيات التاب:** صلاحية فرق العقود + عرض الموظفين للقائمة + صلاحيات HR للفرق إن كانت الـ API تستخدمها.

---

### ٢.٩ التسويق — تاب التقارير / أدائي (`/marketing/reports`)

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| قائمة موظفين لأداء المسوقين | userService.getEmployees أو hrService | `hr.users.view` (لأن BOOTSTRAP role marketing يحتويها). |
| تقرير أداء الفريق/المسوق | hrService.getMarketerPerformanceReport | صلاحية تقارير HR أو تسويق حسب الباكند (`hr.reports.view` أو ما يعادلها). |

---

### ٢.١٠ التسويق — تاب المشاريع (`/marketing/projects`)

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| قائمة المشاريع | marketingService.getProjects | `marketing.projects.view` |
| حساب الميزانية (زر) | endpoint حساب الميزانية | الواجهة تتحقق من `marketing.budget.calculate` — غير معرفة في constants؛ قد يقابلها في الباكند `marketing.budgets.manage` أو صلاحية أخرى. يجب تضمين الصلاحية التي يتحقق منها الباكند لهذا الـ endpoint. |

---

### ٢.١١ المحاسبة — تاب الوحدات المباعة / العمولات

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| قائمة الوحدات المباعة | accountingService | `accounting.sold-units.view` |
| تفاصيل عمولة وتوزيعات | getCommissionSummary, updateDistributions, confirmPayment | قد يحتاج `accounting.sold-units.manage`, `accounting.commissions.approve` حسب الـ endpoint. |
| قائمة المسوقين (في تفاصيل الوحدة) | accountingService.getMarketers | صلاحية عرض مسوقين/موظفين حسب الباكند. |

---

### ٢.١٢ المحاسبة — تاب الودائع

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| قائمة الودائع | GET deposits | `accounting.deposits.view` |
| تأكيد استلام العربون | POST confirm | غالباً `accounting.deposits.manage`. |

---

### ٢.١٣ المحاسبة — تاب الرواتب

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| قائمة الرواتب | getSalaries, getEmployeeSalary | `accounting.salaries.view` |
| إنشاء توزيع / موافقة / تعيين كمقبوض | createDistribution, approveSalaryDistribution, markSalaryAsPaid | `accounting.salaries.distribute` أو ما يعادلها. |

---

### ٢.١٤ الائتمان — تاب الحجوزات / التمويل / نقل الملكية / ملف المطالبة

كل تاب يستدعي endpoints القسم الائتمان؛ صلاحية الدخول للتاب مذكورة في الـ router. الباكند قد يفصل صلاحيات لكل endpoint (مثلاً تحديث مرحلة تمويل، توليد ملف مطالبة). يجب تضمين الصلاحية التي يتحقق منها الباكند لكل عملية (عرض/تعديل/إنشاء).

---

### ٢.١٥ العقود (`/contracts`) و ContractModal

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| قائمة العقود | GET /contracts/admin-index أو getContracts أو getEditorContracts | `contracts.view` أو `contracts.view_all` حسب الدور. |
| تفاصيل عقد | GET /contracts/:id | `contracts.view`. |
| موافقة/رفض عقد (في الـ modal) | PATCH update status | `contracts.approve`. |

---

### ٢.١٦ متتبع المشروع (`/project-tracker/:id`)

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| تفاصيل العقد/المشروع | getContractById أو getEditorContractById، getProjectDetails | `contracts.view` و/أو صلاحية المشاريع. |
| بيانات الطرف الثاني | getSecondPartyData | `second_party.view` (موجودة في SALES_BASE). |

---

### ٢.١٧ الموافقة على الصور (`/image-approval`)

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| قائمة عقود | getContracts | `contracts.view`. |
| بيانات التصوير لكل مشروع | getPhotography | صلاحية أقسام التصوير (مثل `departments.photography.view` أو `projects.media.approve`). |
| موافقة/رفض صورة | updatePhotography (approve/reject) | `projects.media.approve` أو ما يعادلها. |

---

### ٢.١٨ العمولات والودائع (`/commission-deposits/*`)

الصفحة لا تحدد صلاحيات فرعية في الـ router. التابات تستدعي commission/deposits APIs؛ يُنصح بتضمين: `accounting.commissions.approve`, `accounting.commissions.create`, `accounting.deposits.view` (وإن لزم `accounting.deposits.manage`) حتى لا يضرب 403 داخل التابات.

---

### ٢.١٩ المطورون (`/developers`) وصفحات التفاصيل والوحدات

| ما يستخدمه التاب | استدعاء API | الصلاحيات التي يجب تضمينها |
|-------------------|--------------|-----------------------------|
| قائمة المطورين | GET /developers | صلاحية عرض المطورين (الـ router يسمح لأدوار Admin, PM, Accounting). |
| تفاصيل مطور | GET /developers/:id | نفس الصلاحية أو صلاحية التفاصيل. |
| وحدات مشروع مطور (صفحة المحاسبة) | accountingService (claim files, sold units)، creditService (claim files) | صلاحيات المحاسبة/الائتمان للـ claim files والوحدات. |

---

## ٣. جدول إحصائي موجز: صلاحيات يُنصح بتضمينها حسب التاب/الصفحة

| الصفحة/التاب | الصلاحية الرئيسة (لدخول التاب) | صلاحيات إضافية يجب تضمينها لتفادي 403 |
|---------------|----------------------------------|----------------------------------------|
| طلب مشروع حصري | — | **عرض المطورين** (GET /developers أو /second-party-data/second-parties)، **إنشاء عقد** (POST /contracts/store). |
| طلباتي | — | `contracts.view`. |
| لوحة التحكم | — | `contracts.view` (أو ما يعادل عرض العقود حسب الدور). |
| الحجوزات | `sales.reservations.view` | `sales.reservations.confirm`, `sales.reservations.cancel`, `sales.waiting_list.convert`, `sales.negotiation.approve` (حسب الإجراءات المستخدمة). |
| تاب الأهداف (مبيعات) | `sales.targets.view` | `sales.targets.update`, `sales.team.manage`, `sales.goals.create`. |
| تاب الدوام/دوام المشاريع | `sales.attendance.view` / `sales.attendance.manage` | نفسها لجميع استدعاءات التاب. |
| تاب المهام (مبيعات) | `sales.tasks.manage` | `sales.tasks.create_for_marketing`. |
| إدارة الفرق | (دور PM/Admin) | عرض الموظفين (`hr.users.view` أو ما يعادلها)، `hr.teams.manage`، صلاحيات فرق العقود. |
| التسويق — التقارير | `marketing.reports.view` | `hr.users.view` (للقوائم)، صلاحية تقارير الأداء. |
| التسويق — المشاريع | `marketing.projects.view` | صلاحية حساب الميزانية (توحيد اسم الصلاحية مع الباكند). |
| المحاسبة — الوحدات المباعة | `accounting.sold-units.view` | `accounting.sold-units.manage`, `accounting.commissions.approve` للعمليات. |
| المحاسبة — الودائع | `accounting.deposits.view` | `accounting.deposits.manage` للتأكيد. |
| المحاسبة — الرواتب | `accounting.salaries.view` | `accounting.salaries.distribute`. |
| العقود + موافقة | `contracts.view` | `contracts.approve`. |
| متتبع المشروع | — | `contracts.view`, `second_party.view`. |
| الموافقة على الصور | — | `contracts.view`, `departments.photography.view` / `projects.media.approve`. |
| العمولات والودائع | (أدوار) | `accounting.commissions.*`, `accounting.deposits.view` (و manage إن لزم). |
| المطورون (قائمة + تفاصيل) | (أدوار) | صلاحية تسمح بـ GET /developers و GET /developers/:id. |

---

## ٤. خلاصة تنفيذية

- **الصلاحية الرئيسة** تكفي عادة لـ **إظهار التاب** أو **دخول الصفحة** فقط.
- **داخل التاب** تُستدعى قوائم (مطورين، موظفين، فرق، عقود، حجوزات، إلخ) وعمليات (موافقة، تحويل، إنشاء، تأكيد). كل استدعاء قد يتحقق منه الباكند بصلاحية مستقلة.
- **مثال طلب المشروع الحصري:** بدون صلاحية **عرض المطورين** (الـ API الذي يملأ القائمة) سيظهر 403 عند تحميل الصفحة؛ لذلك يجب **تضمين صلاحية عرض المطورين** مع صلاحية إنشاء العقد لكل من يُسمح له بهذه الصفحة.
- التقرير أعلاه يعدّ **إحصاءً** لكل تاب والأمور التي يستخدمها و**كل الصلاحيات التي يُنصح بتضمينها** حتى يعمل الـ API بشكل صحيح دون 403. يُفضّل مطابقة أسماء الصلاحيات مع الباكند أو توثيق الـ API.

---

*تم إعداد التقرير بالقراءة فقط من: router، permissions، views، components، services، composables — بدون تعديل أي كود.*
