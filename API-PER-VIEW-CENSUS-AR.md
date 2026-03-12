# إحصاء الـ API حسب الواجهة — لتجنّب 403

**الهدف:** عند منح مستخدم صلاحية وصول لواجهة معيّنة، امنحه في الباكند صلاحيات وصول لـ **كل** الـ APIs المدرجة تحت هذه الواجهة حتى لا يضرب 403 في أي مكان.

**مرجع الباكند:** لربط كل واجهة بمسارات الـ API الفعلية في الباكند والصلاحيات/الأدوار المطلوبة، راجع [BACKEND-PERMISSIONS-PER-VIEW-AR.md](BACKEND-PERMISSIONS-PER-VIEW-AR.md).

**ملاحظة:** المسارات كما تظهر في الكود (غالباً مع baseURL مثل `/api` في الـ apiClient). صلاحيات الباكند الفعلية قد تختلف؛ يُفضّل مطابقة الـ endpoints مع توثيق الـ API أو الباكند.

---

## 1. واجهات مستقلة (صفحة واحدة = مجموعة APIs)

### تسجيل الدخول — `LoginView`  
- **الـ APIs المستدعاة:**  
  - `POST /login`  
  - (التحقق من الجلسة قد يستخدم `GET /user`)

---

### لوحة التحكم العامة — `DashboardView`  
- **الـ APIs المستدعاة:**  
  - `GET /user`  
  - `GET /contracts/admin-index`  
  - `GET /editor/contracts/index`  
  - `GET /contracts/index`

---

### المساعد الذكي — `AiAssistantView`  
- **الـ APIs المستدعاة:**  
  - `GET /ai/v2/conversations`  
  - `GET /ai/sections`  
  - `DELETE /ai/v2/conversations/:id`  
  - (الدردشة قد تستدعي `POST /ai/chat` أو `POST /ai/ask`)

---

### الدردشة — `ChatView`  
- **الـ APIs المستدعاة:**  
  - `GET /chat/conversations`  
  - `GET /chat/conversations/:userId`  
  - `PATCH /chat/conversations/:id/read`  
  - `GET /chat/conversations/:id/messages`  
  - `POST /chat/conversations/:id/messages`  
  - `DELETE /chat/messages/:messageId`  
  - `GET /hr/users` (أو مسار قائمة الموظفين للبحث)

---

### إدارة المعرفة — `KnowledgeManagementView`  
- **الـ APIs المستدعاة:**  
  - `GET /ai/assistant/knowledge`  
  - `POST /ai/assistant/knowledge`  
  - `PUT /ai/assistant/knowledge/:id`  
  - `DELETE /ai/assistant/knowledge/:id`

---

### العقود — `ContractsView`  
- **الـ APIs المستدعاة:**  
  - `GET /user`  
  - `GET /contracts/admin-index`  
  - `GET /editor/contracts/index`  
  - `GET /contracts/index`  
  - `GET /editor/contracts/show/:id`  
  - `GET /contracts/show/:id`  
  - `PATCH /admin/contracts/adminUpdateStatus/:id` (قبول/رفض)

---

### نموذج العقد — `ContractFormView`  
- **الـ APIs المستدعاة:**  
  - `GET /contracts/show/:id`  
  - `POST /contracts/store/info/:id`

---

### المطورين — `DevelopersView`  
- **الـ APIs المستدعاة:**  
  - `GET /developers`

---

### تفاصيل المطور — `DeveloperDetailView`  
- **الـ APIs المستدعاة:**  
  - `GET /developers/:id`  
  - `GET /second-party-data/contracts-by-email`

---

### وحدات مشروع المطور — `DeveloperProjectUnitsView`  
- **الـ APIs المستدعاة:**  
  - `GET /accounting/claim-files/sold-units`  
  - `GET /accounting/claim-files/candidates`  
  - `GET /accounting/claim-files/download-for-reservation/:id`  
  - `POST /credit/claim-files/combined` (أو ما يعادله في accounting)  
  - `POST /credit/claim-files/generate-bulk` (أو ما يعادله)  
  - `GET /developers/:id`

---

### الإشعارات — `NotificationsView`  
- **الـ APIs المستدعاة:**  
  - `GET /notifications` أو `GET /accounting/notifications` (حسب الدور)  
  - `GET /admin/notifications` (للمسؤول)  
  - `POST /notifications/:id/read` أو `POST /accounting/notifications/:id/read`  
  - `POST /notifications/read-all` أو `POST /accounting/notifications/read-all`

---

### طلب المشروع الحصري — `ExclusiveProjectView`  
- **الـ APIs المستدعاة:**  
  - `GET /developers`  
  - `GET /second-party-data/second-parties`  
  - `POST /contracts/store`  
  - (إشعار: قد يستخدم `POST /notifications` أو خدمة إشعارات)

---

### طلباتي — `MyRequestsView`  
- **الـ APIs المستدعاة:**  
  - `GET /contracts/index`  
  - `GET /contracts/show/:id`

---

### متتبع المشروع — `ProjectTrackerView`  
- **الـ APIs المستدعاة:**  
  - `GET /user`  
  - `GET /editor/contracts/show/:id`  
  - `GET /sales/projects/:id`  
  - `GET /contracts/show/:id`  
  - `GET /editor/contracts/index`  
  - `GET /contracts/index`  
  - `GET /second-party-data/show/:id`

---

### الحجوزات — `ReservationsView`  
- **الـ APIs المستدعاة:**  
  - `GET /sales/reservations`  
  - `GET /sales/waiting-list`  
  - `GET /sales/negotiations/pending`  
  - `GET /sales/reservations/:id/voucher`  
  - `POST /sales/reservations/:id/confirm`  
  - `POST /sales/reservations/:id/cancel`  
  - `POST /sales/waiting-list/:id/convert`  
  - `DELETE /sales/waiting-list/:id`  
  - `POST /sales/negotiations/:id/approve`  
  - `POST /sales/negotiations/:id/reject`

---

### الملف الشخصي — `ProfileView`  
- **الـ APIs المستدعاة:**  
  - `GET /user`  
  - `POST /logout`

---

### المهام — `TasksView`  
- **الـ APIs المستدعاة:**  
  - `GET /user`  
  - `GET /tasks/sections`  
  - `GET /tasks/sections/:section/users`  
  - `GET /project_management/teams/index` (أو /teams)  
  - `GET /hr/users` (قائمة الموظفين)  
  - `GET /my-tasks`  
  - `GET /requested-tasks`  
  - `POST /tasks`  
  - `PATCH /my-tasks/:id/status`

---

### الفرق — `TeamsView`  
- **الـ APIs المستدعاة:**  
  - `GET /hr/users` (أو مسار قائمة الموظفين)

---

### إدارة الفرق — `TeamManagementView`  
- **الـ APIs المستدعاة:**  
  - `GET /project_management/teams/index`  
  - `POST /project_management/teams/store`  
  - `PUT /project_management/teams/update/:id`  
  - `DELETE /project_management/teams/delete/:id`  
  - `GET /hr/teams/:teamId/members`  
  - `GET /hr/teams/contracts/:id`  
  - `GET /hr/list_employees`  
  - `POST /hr/teams/:teamId/members`  
  - `DELETE /hr/teams/:teamId/members/:userId`

---

### اعتماد الصور — `ImageApprovalView`  
- **الـ APIs المستدعاة:**  
  - `GET /contracts/index`  
  - `GET /photography-department/show/:id`  
  - `POST /photography-department/approve/:id` أو `PATCH /photography-department/approve/:id`

---

### عمولات والودائع — `CommissionDepositsView`  
- **الـ APIs المستدعاة:**  
  - `GET /user`  
  - `GET /sales/commissions`  
  - `GET /sales/deposits`  
  - (تفاصيل عمولة: `GET /sales/commissions/:id` عند فتح تفاصيل)

---

### اللوحات — `BoardsView`  
- **الـ APIs المستدعاة:**  
  - `GET /contracts/index`

---

### المحرر — `EditorView`  
- **الـ APIs المستدعاة:**  
  - `GET /editor/contracts/index`  
  - `GET /editor/contracts/show/:id`  
  - `GET /editor/developers`  
  - `GET /editor/developers/:id`  
  - `GET /editor/second-party-data/show/:id`  
  - `GET /editor/contracts/units/show/:contractId`  
  - `GET /editor/montage-department/show/:id`  
  - `POST /editor/montage-department/store/:id`  
  - `PUT /editor/montage-department/update/:id`  
  - `GET /editor/photography-department/show/:id`  
  - `POST /editor/photography-department/store/:id`  
  - `PUT /editor/photography-department/update/:id`  
  - `PATCH /editor/photography-department/approve/:id`  
  - `GET /editor/boards-department/show/:id`  
  - `POST /editor/boards-department/store/:id`  
  - `PUT /editor/boards-department/update/:id`

---

### تفاصيل المحرر — `EditorDetailView`  
- **الـ APIs المستدعاة:**  
  - `GET /editor/contracts/show/:id`  
  - `GET /editor/developers/:id`

---

### الوكلاء (Agents) — `AgentsView`  
- **الـ APIs المستدعاة:**  
  - لا استدعاء API خادم (البيانات من localStorage عبر agentService).

---

## 2. واجهات بتبويبات (الاستدعاءات من التبويبات والمكونات الفرعية)

### الموارد البشرية — `HRView`  
الاستدعاءات تتم عبر التبويبات والـ composables (مثل useHRDashboard، hrService).  
**جميع الـ APIs التي قد تُستدعى من أي تاب في HR:**

- `GET /user`  
- `GET /hr/dashboard`  
- `GET /hr/list_employees`  
- `GET /hr/show_employee/:id`  
- `POST /hr/add_employee`  
- `PUT /hr/update_employee/:id`  
- `DELETE /hr/delete_employee/:id`  
- `GET /hr/teams` أو `GET /project_management/teams/index`  
- `GET /hr/teams/:teamId/members`  
- `GET /teams/show/:teamId`  
- `POST /project_management/teams/store`  
- `PUT /project_management/teams/update/:id`  
- `DELETE /project_management/teams/delete/:id`  
- `POST /hr/teams/:teamId/members`  
- `DELETE /hr/teams/:teamId/members/:userId`  
- `GET /hr/teams/contracts/:id`  
- `GET /hr/teams/locations/:id`  
- `GET /hr/users/...` (قائمة المستخدمين، عرض، إنشاء، تحديث، حذف، تعطيل، استعادة)

**توصية:** امنح صلاحيات لكل تاب حسب الوثيقة TABS-AND-PERMISSIONS-BY-ROLE-AR (مثلاً hr.dashboard.view، hr.teams.manage، hr.performance.view، hr.users.create، hr.reports.view، hr.reports.print، hr.contracts.manage، hr.warnings.manage).

---

### التسويق — `MarketingView`  
الاستدعاءات تتم عبر التبويبات والـ composables (useMarketingDashboard، useMarketingProjects، useMarketingDeveloperPlan، إلخ).  
**جميع الـ APIs التي قد تُستدعى من أي تاب في التسويق:**

- `GET /marketing/dashboard`  
- `GET /marketing/projects`  
- `GET /marketing/projects/:id`  
- `GET /marketing/projects/.../recommend-employee`  
- `POST /marketing/projects/calculate-budget`  
- `GET /marketing/developer-plans/...`  
- `POST /marketing/developer-plans/...`  
- `GET /marketing/users`  
- `GET /marketing/employee-plans/...`  
- `POST /marketing/employee-plans/...` (إنشاء، اقتراح، توليد تلقائي)  
- `GET /marketing/expected-sales`  
- `POST /marketing/expected-sales`  
- `GET /marketing/tasks/...`  
- `POST /marketing/tasks`  
- `PUT /marketing/tasks/:id`  
- `PATCH /marketing/tasks/...`  
- `GET /marketing/leads/...`  
- `POST /marketing/leads/...` (إنشاء، تعيين، تحويل)  
- `GET /marketing/teams`  
- `POST /marketing/teams/assign`  
- `GET /marketing/projects/:id/team`  
- `POST /marketing/projects/:id/team`  
- `GET /marketing/reports/...` (أداء، ميزانية، حجوزات متوقعة، أداء موظفين)  
- `GET /marketing/reports/...` (تصدير توزيع، خطة موظف، خطة مطور — blob)

**توصية:** امنح صلاحيات حسب التاب (marketing.dashboard.view، marketing.projects.view، marketing.budgets.manage، marketing.tasks.view، marketing.teams.view، marketing.reports.view، marketing.plans.create، use-ai-assistant).

---

### الائتمان — `CreditView`  
الاستدعاءات تتم عبر التبويبات (CreditDashboardTab، CreditBookingsTab، CreditFinancingTab، CreditTitleTransferTab، CreditClaimFilesTab، إلخ).  
**جميع الـ APIs التي قد تُستدعى من أي تاب في الائتمان:**

- `GET /credit/dashboard`  
- `GET /credit/notifications`  
- `POST /credit/notifications/:id/read`  
- `POST /credit/notifications/read-all`  
- `GET /credit/bookings`  
- `GET /credit/bookings/confirmed`  
- `GET /credit/bookings/:id`  
- `POST /credit/bookings/:id/cancel`  
- `GET /credit/bookings/negotiation`  
- `PATCH /credit/bookings/negotiation/:id`  
- `GET /credit/bookings/waiting`  
- `POST /credit/bookings/waiting/:id/process`  
- `GET /credit/bookings/sold`  
- `GET /credit/bookings/cancelled`  
- `POST /credit/bookings/:id/financing/...` (تقدم، تهيئة، إكمال، رفض)  
- `GET /credit/bookings/:id/payment-plan`  
- `POST /credit/bookings/:id/payment-plan`  
- `POST /credit/title-transfer/...` (تهيئة، جدولة، إلغاء جدولة، إكمال)  
- `GET /credit/claim-files/...`  
- `POST /credit/claim-files/...` (إنشاء، توليد جماعي، PDF)

**توصية:** امنح صلاحيات حسب التاب (credit.dashboard.view، credit.bookings.view، credit.financing.manage، credit.title_transfer.manage، credit.claim_files.generate).

---

### المحاسبة — `AccountingView`  
الاستدعاءات تتم عبر التبويبات والمكونات (AccountingDashboardTab، AccountingNotificationsTab، AccountingSoldUnitsTab، AccountingDepositsTab، AccountingSalariesTab، SoldUnitDetailView، CommissionDistributionModal، ConfirmationHistoryModal).  
**جميع الـ APIs التي قد تُستدعى من أي تاب في المحاسبة:**

- `GET /user`  
- `GET /accounting/dashboard`  
- `GET /accounting/notifications`  
- `POST /accounting/notifications/:id/read`  
- `POST /accounting/notifications/read-all`  
- `GET /accounting/claim-files/candidates`  
- `GET /accounting/claim-files/sold-units`  
- `GET /accounting/claim-files/download-for-reservation/:id`  
- `GET /accounting/sold-units`  
- `GET /accounting/marketers`  
- `GET /accounting/sold-units/:id`  
- `POST /accounting/sold-units/:id/commission`  
- `GET /accounting/commissions/:id/summary`  
- `PUT /accounting/...` (تحديث توزيعات)  
- `POST /accounting/...` (تأكيد دفع)  
- `GET /accounting/confirmations/history`

**توصية:** امنح صلاحيات حسب التاب (accounting.dashboard.view، accounting.notifications.view، accounting.sold-units.view، accounting.sold-units.manage، accounting.commissions.approve، accounting.commissions.create، accounting.deposits.view، accounting.deposits.manage، accounting.salaries.view، accounting.salaries.distribute، accounting.down_payment.confirm).

---

### المبيعات — `SalesViewExtended`  
الاستدعاءات تتم عبر التبويبات (SalesDashboardTab، SalesTargetsTab، ReservationsView، PaymentPlanModal، إلخ).  
**جميع الـ APIs التي قد تُستدعى من أي تاب في المبيعات:**

- `GET /user`  
- `GET /sales/dashboard`  
- `GET /sales/projects`  
- `GET /sales/projects/:id`  
- `GET /sales/projects/:id/units`  
- `GET /sales/units/:id/reservation-context`  
- `POST /sales/reservations`  
- `GET /sales/reservations`  
- `GET /sales/reservations/:id`  
- `POST /sales/reservations/:id/confirm`  
- `POST /sales/reservations/:id/cancel`  
- `GET /sales/reservations/:id/voucher`  
- `GET /sales/targets/...`  
- `POST /sales/targets`  
- `PATCH /sales/targets/...`  
- `GET /sales/attendance/...`  
- `POST /sales/attendance/...`  
- `GET /sales/team/projects`  
- `GET /sales/assignments/my`  
- `GET /admin/sales/project-assignments`  
- `GET /sales/team/members/...`  
- `PATCH /sales/team/members/...`  
- `POST /admin/sales/project-assignments` (تعيين مشروع، تقييم، إزالة)  
- `GET /sales/tasks/...`  
- `POST /sales/marketing-tasks/...`  
- `PATCH /sales/.../status`  
- `GET /sales/waiting-list/...`  
- `POST /sales/waiting-list`  
- `POST /sales/waiting-list/:id/convert`  
- `DELETE /sales/waiting-list/:id`  
- `GET /sales/negotiations/pending`  
- `POST /sales/negotiations/:id/approve`  
- `POST /sales/negotiations/:id/reject`  
- `GET /sales/reservations/:id/payment-plan`  
- `POST /sales/reservations/:id/payment-plan`  
- `GET /sales/sold-units/...`  
- `GET /sales/deposits/...`  
- `GET /sales/analytics/...`  
- `GET /sales/attendance/project/:id`  
- `POST /sales/attendance/bulk`

**توصية:** امنح صلاحيات حسب التاب (راجع TABS-AND-PERMISSIONS-BY-ROLE-AR و useSalesRouting): sales.dashboard.view، sales.targets.view، sales.targets.update، sales.projects.view، sales.units.view، sales.units.book، sales.reservations.view، sales.reservations.confirm، sales.attendance.view، sales.attendance.manage، sales.team.manage، sales.tasks.manage، sales.tasks.create_for_marketing، sales.projects.allocate_shifts، sales.negotiation.approve، sales.payment-plan.manage، sales.sold_units.view، sales.deposits.view، sales.analytics.view، sales.waiting_list.create، sales.waiting_list.convert، إلخ.

---

## 3. إدارة المستخدمين (UserManagement) والمكونات المشتركة

- **UserManagement** (مثلاً من مسار /users):  
  - `GET /hr/users/...`  
  - `POST /hr/users/...`  
  - `PUT /hr/users/...`  
  - `PATCH /hr/users/...` (تعطيل)  
  - `DELETE /hr/users/...`  
  - `GET /hr/users/roles`  
  - `POST /hr/users/.../restore`  

- **AddUserModal / LinkMarketersModal:**  
  - استدعاءات hrService أو userService (قائمة أدوار، إنشاء مستخدم، ربط مسوقين).

---

## 4. خلاصة للاستخدام

1. **للواجهة X:** امنح المستخدم في الباكند صلاحيات وصول لـ **كل** الـ endpoints المدرجة تحت "الـ APIs المستدعاة" لهذه الواجهة.  
2. **لل واجهات بتبويبات (HR، Marketing، Credit، Accounting، Sales):** إما منح كل صلاحيات القسم دفعة واحدة، أو ربط كل تاب بصلاحيات الـ endpoints الخاصة بذلك التاب فقط (أنسب لتقليل 403).  
3. **مطابقة الباكند:** تأكد أن أسماء الصلاحيات أو الأدوار في الباكند تطابق ما يتحقق منه الـ middleware (مثلاً صلاحية لكل endpoint أو مجموعة endpoints لكل صلاحية).

---

*تم إعداد هذا الإحصاء من قراءة: src/services/*، src/views/*، src/components (accounting، sales، hr، marketing، credit)، وملف TABS-AND-PERMISSIONS-BY-ROLE-AR.md.*
