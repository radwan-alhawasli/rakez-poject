# تدقيق ربط واجهة RAKEZ مع API (V2)

مرجع: `docs/v2_rakez_api_summary.json` — 262 endpoint في 14 وحدة + Chat + Inventory.

---

## 1. المصادقة والمستخدمين (01 - Authentication & Users)

| API (الوثيقة) | الطريقة | الخدمة / المكوّن | الصفحة / الإجراء | الحالة |
|---------------|---------|-------------------|-------------------|--------|
| `POST /login` | POST | `authService.login()` | `LoginPage.vue` — زر تسجيل الدخول | مربوط |
| `GET /user` | GET | `authService.fetchCurrentUser()` | `MainLayout.vue` — عند التحميل للمستخدم المصادق | مربوط |
| `POST /logout` | POST | `authService.logout()` | `MainLayout` → `handleLogout` | مربوط |
| `GET /admin/employees/roles` | GET | `adminEmployeeService.getRoles()` | واجهة إدارة الموظفين (Admin) | مربوط |
| `POST /admin/employees/add_employee` | POST | `adminEmployeeService.addEmployee()` | إضافة موظف (Admin) | مربوط |
| `GET /admin/employees/list_employees` | GET | `adminEmployeeService.listEmployees()` | قائمة الموظفين (Admin) | مربوط |
| `GET/PUT/DELETE/PATCH .../show_employee|update_employee|delete_employee|restore` | - | `adminEmployeeService` | عرض/تعديل/حذف/استعادة موظف | مربوط |

---

## 2. العقود (02 - Contracts Management)

| API | الخدمة / المستودع | الصفحة / التبويب | الحالة |
|-----|-------------------|-------------------|--------|
| `GET /contracts/index` | `contractRepository.fetchContracts()` | `ContractsView` — قائمة العقود | مربوط |
| `POST /contracts/store` | `contractRepository.create()` | إنشاء عقد — `ContractFormView` | مربوط |
| `GET /contracts/show/:id` | `contractRepository.getById()` | عرض عقد | مربوط |
| `PUT /contracts/update/:id` | `contractRepository.update()` | تحديث عقد | مربوط |
| `PATCH /contracts/update-status/:id` | `contractRepository.updateStatus()` | تحديث حالة العقد | مربوط |
| `GET /contracts/units/show/:id` | `contractRepository.getUnits()` | وحدات العقد | مربوط |
| Second-party, units CSV, units CRUD | `editorService`, عقود/وحدات | `EditorView`, `ContractFormView` | مربوط |
| `GET/POST/PUT .../boards-department/*` | `boardsDepartmentService` | `EditorView` — تبويب البواردز | مربوط |
| `GET/POST/PUT/PATCH .../photography-department/*` | `photographyDepartmentService`, `editorService` | تبويب التصوير | مربوط |
| `GET /admin/contracts/adminIndex`, `PATCH adminUpdateStatus` | إن وُجدت واجهة عقود للمشرف | تحقق من الاستخدام | يحتاج تحقق |

---

## 3. إدارة المشاريع والفرق (03 - Project Management)

| API | الخدمة | الصفحة / التبويب | الحالة |
|-----|--------|-------------------|--------|
| `GET /project_management/dashboard` | `teamService.getDashboard()` | `ProjectManagementView` | مربوط |
| `GET /project_management/dashboard/units-statistics` | `teamService.getUnitsStatistics()` | إحصائيات الوحدات | مربوط |
| `GET/POST/PUT/DELETE /project_management/teams/*` | `teamService` | `TeamsView`, `TeamManagementView` | مربوط |
| `GET .../teams/contracts/:id`, `.../contracts/locations/:id` | `teamService.getTeamContracts()`, `getTeamContractLocations()` | تفاصيل الفريق | مربوط |
| `POST .../teams/add/:contractId`, `.../remove/:contractId` | `teamService.addContractToTeam()`, `removeContractFromTeam()` | إضافة/إزالة عقد من فريق | مربوط |

---

## 4. المبيعات (04 - Sales Department)

| API | الخدمة / Composable | الصفحة / التبويب / الزر | الحالة |
|-----|---------------------|--------------------------|--------|
| `GET /sales/dashboard` | `salesService.getDashboard()` | `SalesDashboardTab` | مربوط |
| `GET /sales/projects*`, `.../units` | `salesService` | `SalesProjectsTab`, بحث الوحدات | مربوط |
| `GET /sales/team/projects`, `.../members` | `salesService` | `SalesTeamTab` | مربوط |
| `GET/POST /sales/reservations*`, confirm, cancel | `salesService` | `ReservationsView`, تأكيد/إلغاء حجز | مربوط |
| `GET .../reservations/:id/voucher` | `salesService` | فاتورة الحجز | مربوط |
| `GET/POST/PATCH /sales/targets/*` | `salesService` | `SalesTargetsTab` | مربوط |
| `GET/POST /sales/attendance/*` | `salesService` | `SalesAttendanceTab` | مربوط |
| `GET/POST .../waiting-list*` | `salesService` | قائمة الانتظار | مربوط |
| `GET/POST .../negotiations/*` | `salesService` | تفاوض، اعتماد، رفض | مربوط |
| `GET/POST/PUT/DELETE .../payment-plan`, `payment-installments` | `salesService` | خطط الدفع — `SalesPaymentPlansTab` | مربوط |
| `GET /sales/tasks/projects*`, `.../marketing-tasks` | `salesService` | `SalesTasksTab` | مربوط |
| `GET /admin/sales/project-assignments`, `GET /sales/assignments/my` | `salesService` | `SalesAssignmentsTab` | مربوط |
| `GET /sales/units/search`, `.../filters` | `useUnitSearch` | `SalesUnitSearchTab` | مربوط |
| `GET /sales/sold-units*`, `.../deposits/*`, `.../analytics/*` | `salesService` | Sold Units, Deposits, Analytics تبويبات | مربوط |

---

## 5. المحاسبة (08 - Accounting Department)

| API | الخدمة | الصفحة / التبويب | الحالة |
|-----|--------|-------------------|--------|
| `GET /accounting/dashboard` | `accountingService.getDashboard()` | `AccountingDashboardTab` | مربوط |
| `GET/POST .../notifications*`, read, read-all | `accountingService`, `notificationService` | `AccountingNotificationsTab`, الهيدر | مربوط |
| `GET /accounting/sold-units*`, `POST .../commission` | `accountingService` | `AccountingSoldUnitsTab` | مربوط |
| `GET/PUT .../commissions/:id/distributions*`, approve, reject, confirm, summary | `accountingService` | عمولات وتوزيعات | مربوط |
| `GET /accounting/deposits/pending`, `.../follow-up` | `accountingService` | `AccountingDepositsTab` | مربوط |
| `POST .../deposits/:id/confirm`, `.../refund` | `accountingService` | تأكيد استلام / استرداد | مربوط |
| `GET /accounting/salaries*`, `POST .../distribute`, approve, paid | `accountingService` | `AccountingSalariesTab` | مربوط |
| `GET .../pending-confirmations`, `POST .../confirm*`, `GET .../confirmations/history` | `accountingService` | تأكيدات (Legacy) — `useAccountingConfirmations` | مربوط |

---

## 6. الموارد البشرية (05 - HR Department)

| API | الخدمة | الصفحة / التبويب | الحالة |
|-----|--------|-------------------|--------|
| `GET /hr/dashboard` | `hrService.getDashboardMetrics()` | `HRDashboardTab` | مربوط |
| `POST /hr/dashboard/refresh` | `hrService.refreshDashboard()` | زر تحديث لوحة التحكم | مربوط |
| `GET/POST/PUT/DELETE /hr/teams*` | `hrService` | `HRTeamsTab`, `TeamManagementView` | مربوط |
| `GET /hr/teams/:id/members`, `POST .../members`, `DELETE .../members/:userId` | `hrService` | أعضاء الفريق | مربوط |
| `GET /hr/marketers/performance*` | `hrService` | `HRPerformanceTab`, `HREmployeePerformanceTab` | مربوط |
| `GET/POST/PUT/DELETE/PATCH .../hr/users*` | `hrService`, `userService` | `HRUsersTab` (UserManagement مع `use-hr-api="true"`) | مربوط |
| `GET /hr/list_employees*`, `.../show_employee`, `add_employee`, إلخ | `hrService` | `UserManagement` عند useHrApi=false (مثلاً من `UsersView`) | مربوط |
| تقارير HR (team-performance, marketer-performance, إلخ) | `hrService` | `HRReportsTab`, `ReportsTab` | مربوط |

---

## 7. التسويق (06 - Marketing Department)

| API | الخدمة / Composable | الصفحة / التبويب | الحالة |
|-----|---------------------|-------------------|--------|
| `GET /marketing/dashboard` | `marketingService` | `MarketingDashboardTab` | مربوط |
| `GET/POST /marketing/projects*` | `marketingService` | `MarketingProjectsTab` | مربوط |
| `GET/POST /marketing/developer-plans*` | `useMarketingDeveloperPlan` | تبويب خطط المطور | مربوط |
| `GET/POST /marketing/employee-plans*` | `useMarketingEmployeePlans` | `MarketingEmployeePlansTab` | مربوط |
| `GET/POST/PUT/PATCH /marketing/tasks*` | `marketingService` | `MarketingTasksTab` | مربوط |
| `GET/POST /marketing/leads*` | `marketingService` | `MarketingLeadsTab` | مربوط |
| `GET/POST /marketing/teams*`, `.../projects/:id/team` | `marketingService` | فرق التسويق | مربوط |
| `GET/POST /marketing/expected-sales*` | `useMarketingExpectedSales` | Expected Sales | مربوط |
| `GET /marketing/reports/*` | `useMarketingReports` | `MarketingReportsTab` | مربوط |
| `GET /marketing/users` | `marketingService.getUsers()` | قائمة مستخدمين للخطط (بديل عن /hr/users) | مربوط |

---

## 8. الائتمان (07 - Credit Department)

| API | الخدمة / Composable | الصفحة / التبويب | الحالة |
|-----|---------------------|-------------------|--------|
| `GET /credit/dashboard`, `POST .../refresh` | `creditService` | `CreditDashboardTab` | مربوط |
| `GET /credit/notifications`, `POST .../read`, `.../read-all` | `creditService`, `useCreditNotifications` | `CreditNotificationsTab` | مربوط |
| `GET /credit/bookings*` (قوائم متعددة) | `creditService` | `CreditBookingsTab` | مربوط |
| تفاوض، انتظار، معالجة، تمويل | `creditService` | أزرار التبويب | مربوط |
| `GET/PUT /credit/financing*` | `useCreditFinancing` | `CreditFinancingTab` | مربوط |
| `POST .../title-transfer*`, `PATCH .../schedule|unschedule`, `POST .../complete` | `useCreditTitleTransfer` | `CreditTitleTransferTab` | مربوط |
| خطط دفع، أقساط | `creditService` | أزرار ذات صلة | مربوط |
| `GET /credit/sold-projects*` | `useCreditSoldProjects` | `CreditSoldProjectsTab` | مربوط |
| `GET/POST .../claim-files*` | `useCreditClaimFiles` | `CreditClaimFilesTab` | مربوط |

---

## 9. العمولات والودائع (12 - Commission & Deposits)

| API | الخدمة | الصفحة / التبويب | الحالة |
|-----|--------|-------------------|--------|
| `/sales/commissions*`, `/sales/deposits*` | `commissionService` | `CommissionDepositsView` — تبويبات العمولات والودائع | مربوط |

---

## 10. الإشعارات (10 - Notifications)

| API | الخدمة | الصفحة / المكوّن | الحالة |
|-----|--------|-------------------|--------|
| `GET /notifications` | `notificationService.fetchAll()` | `NotificationsView`, الهيدر | مربوط |
| `POST /notifications/:id/read` | `notificationService.markAsRead()` | زر تعيين كمقروء | مربوط |
| `POST /notifications/read-all` | `notificationService.markAllAsRead()` | تعيين الكل كمقروء | مربوط |
| `DELETE /notifications/:id` | `notificationService.deleteNotification()` | حذف إشعار | مربوط |
| `GET /notifications/public` | `notificationService.getPublicNotifications()` | إشعارات عامة | مربوط |
| `GET/POST .../accounting/notifications*` | `accountingService`, `notificationService` | تبويب إشعارات المحاسبة | مربوط |
| `GET/POST .../credit/notifications*` | `creditService` | `CreditNotificationsTab` | مربوط |
| Admin: send, send-to-role, send-to-user, list | `notificationService` | إرسال وإدارة (Admin) | مربوط |

---

## 11. المشاريع الحصرية (11 - Exclusive Projects)

| API | الخدمة | الصفحة | الحالة |
|-----|--------|--------|--------|
| `GET/POST/PUT/DELETE /exclusive-projects*` | `exclusiveProjectService` | `ExclusiveProjectView` | مربوط |
| `POST .../approve`, `.../reject`, `PUT .../contract` | `exclusiveProjectService` | أزرار الموافقة/الرفض/ربط العقد | مربوط |
| `GET /exclusive-projects/statistics` | `exclusiveProjectService` | إحصائيات | مربوط |

---

## 12. المساعد الذكي (09 - AI Assistant)

| API | الخدمة | الصفحة | الحالة |
|-----|--------|--------|--------|
| `POST /ai/ask`, `POST /ai/chat` | `aiService` | `AiAssistantView` | مربوط |
| `GET/DELETE /ai/v2/conversations*` | `aiService` | محادثات AI | مربوط |
| `GET /ai/sections` | `aiService` | أقسام المعرفة | مربوط |
| `POST /ai/assistant/chat`, `GET/POST/PUT/DELETE .../knowledge` | `aiService` | `KnowledgeManagementView` | مربوط |

---

## 13. المحرر (13 - Editor Department)

| API | الخدمة | الصفحة / التبويب | الحالة |
|-----|--------|-------------------|--------|
| عقود، طرف ثانٍ، وحدات | `editorService` | `EditorView`, `EditorDetailView` | مربوط |
| مونتاج، تصوير، بواردز | `editorService`, `photographyDepartmentService`, `boardsDepartmentService` | تبويبات Montage, Photography, Boards | مربوط |

---

## 14. المهام (Tasks)

| API | الخدمة | الصفحة | الحالة |
|-----|--------|--------|--------|
| `POST /tasks`, `GET /tasks/sections` | `taskService` | `TasksView` | مربوط |
| `GET /tasks/sections/:section/users` | `taskService` | مستخدمي القسم | مربوط |
| `GET /my-tasks`, `GET /requested-tasks` | `taskService` | مهامي / المطلوبة | مربوط |
| `PATCH /my-tasks/:id/status` | `taskService` | تحديث حالة المهمة | مربوط |

---

## 15. الدردشة (Chat System API)

| API | الخدمة | الصفحة / الإجراء | الحالة |
|-----|--------|-------------------|--------|
| `GET /chat/conversations` | `chatService.getConversations()` | `ChatView` — قائمة المحادثات | مربوط |
| `GET /chat/conversations/:userId` | `chatService.getOrCreateConversation()` | فتح/إنشاء محادثة | مربوط |
| `GET /chat/conversations/:id/messages` | `chatService.getMessages()` | تحميل الرسائل، تحميل المزيد | مربوط |
| `POST /chat/conversations/:id/messages` | `chatService.sendMessage()` | إرسال رسالة | مربوط |
| `PATCH /chat/conversations/:id/read` | `chatService.markAsRead()` | تعيين المحادثة كمقروءة | مربوط |
| `DELETE /chat/messages/:id` | `chatService.deleteMessage()` | حذف رسالة | مربوط |
| `GET /chat/unread-count` | `chatService.getUnreadCount()` | عداد غير مقروء | مربوط |

ملاحظة: مسارات الوثيقة تستخدم `baseUrl/api/chat`؛ لأن `apiClient` baseURL ينتهي بـ `/api` فإن استدعاء `/chat/...` يعطي المسار الصحيح.

---

## 16. المخزون (Inventory API)

| API | الخدمة | الصفحة | الحالة |
|-----|--------|--------|--------|
| `GET /inventory/contracts/show/:id` | `inventoryService.getContract()` | — | خدمة موجودة، لا View مرتبط حالياً |
| `GET /inventory/contracts/admin-index` | `inventoryService.getContractsAdminIndex()` | — | نفس ما سبق |
| `GET /inventory/contracts/units/show/:id` | `inventoryService.getContractUnit()` | — | نفس ما سبق |
| `GET /inventory/contracts/locations` | `inventoryService.getContractsLocations()` | — | نفس ما سبق |

**توصية:** إما إضافة صفحة/مسار للمخزون يستدعي `inventoryService` أو ترك الخدمة جاهزة للاستخدام لاحقاً.

---

## ملخص النقاط الحرجة

- **UsersView و useHrApi:** `UsersView` يعرض `UserManagement` بدون `use-hr-api`. القيمة الافتراضية لـ `useHrApi` هي `false`، فيُستخدم `hrService.getEmployees` (مسارات مثل `/hr/list_employees`). مسار `/hr/users` يستخدم `UserManagement` مع `use-hr-api="true"` من `HRUsersTab`. لكل من المسارين ربط صحيح مع API حسب الحاجة.
- **AgentsView:** يعرض وكلاء المحادثة (AI/إعدادات). مصدر البيانات حالياً `agentService` (محلي — localStorage) وليس API. عند توفير API للوكلاء من الخادم يمكن استبدال استدعاءات `agentService` بطلب HTTP.
- **userRepository** (`/users`): غير مستورد في أي ملف. الوثيقة لا تذكر `GET/POST /users` صراحة. للاستخدام المستقبلي أو خادم بديل؛ لا ربط واجهة به دون تأكيد من الخادم.

---

تم إعداد هذا التدقيق ليكون مرجعاً لربط كل صفحة وتبويب وزر مع الـ API. يُنصح بتحديثه عند إضافة endpoints أو واجهات جديدة.
