# تقرير شامل لجميع نقاط النهاية (API)

- التاريخ: 2026-03-13
- البيئة: Localhost `http://localhost:8000`
- المصادر:
  - `Rakez.postman_collection.json`
  - `Rakez.AI.postman_collection.json`
  - اختبارات API فعلية بالحسابات المزودة

## 1) الملخص الرقمي

- إجمالي نقاط النهاية الفريدة: **343**
- توزيع حسب الطريقة:
  - `DELETE`: 17
  - `GET`: 175
  - `PATCH`: 20
  - `POST`: 109
  - `PUT`: 22
- توزيع حسب المجال (prefix):
  - `sales`: 87
  - `hr`: 43
  - `marketing`: 40
  - `credit`: 37
  - `accounting`: 26
  - `project_management`: 17
  - `ai`: 16
  - `contracts`: 13
  - `admin`: 8
  - `exclusive-projects`: 7
  - `chat`: 7
  - `inventory`: 6
  - `second-party-data`: 5
  - `user`: 5
  - `editor`: 5
  - `photography-department`: 4
  - `boards-department`: 3
  - `notifications`: 3
  - `teams`: 2
  - `my-tasks`: 2
  - `developers`: 2
  - `logout`: 1
  - `tasks`: 1
  - `login`: 1
  - `storage`: 1
  - `health`: 1

## 2) نتائج التحقق الفعلي (Runtime Validation)

- فحوصات صلاحية الدور للواجهات المخصصة:
  - sales@rakez.com -> /api/sales/dashboard = **200**
  - marketing@rakez.com -> /api/marketing/dashboard = **200**
  - hr@rakez.com -> /api/hr/dashboard = **200**
  - credit@rakez.com -> /api/credit/dashboard = **200**
  - accounting@rakez.com -> /api/accounting/dashboard = **200**
  - pm@rakez.com -> /api/project_management/dashboard = **200**
  - editor@rakez.com -> /api/editor/contracts/index = **200**
  - admin@rakez.com -> /api/admin/employees/roles = **200**
- فحوصات حساسة إضافية:
  - `POST /api/ai/v2/chat` = **404**
  - `POST /api/ai/v2/search` = **404**
  - `POST /api/ai/v2/explain-access` = **404**
  - `GET /api/ai/assistant/knowledge` = **404**
  - `POST /api/ai/assistant/chat` = **200**
  - `POST /api/project_management/teams/update/0` = **405**
  - `PUT /api/project_management/teams/update/0` = **404 (id غير موجود)**
  - `GET /api/sales/reservations/1/payment-plan (admin)` = **200**
  - `POST /api/sales/reservations/1/payment-plan (admin)` = **422 (validation)**

## 3) ملاحظات توافق مهمة

- مسارات `ai/v2/*` و`ai/assistant/knowledge` غير متاحة حاليًا محليًا (404).
- مسار `ai/assistant/chat` متاح ويعمل (200).
- `project_management/teams/update/{id}` يقبل `PUT` وليس `POST`.
- يوجد تعارض تسمية محتمل بين `sales.payment-plan.manage` (frontend) و `sales.payment_plan.manage` (backend).

## 4) القائمة الكاملة لجميع نقاط النهاية الفريدة

```text
[DELETE] /ai/assistant/knowledge/{{knowledge_id}}
[DELETE] /ai/conversations/{{session_id}}
[DELETE] /chat/messages/{{message_id}}
[DELETE] /contracts/{{contract_id}}
[DELETE] /contracts/units/delete/{{unit_id}}
[DELETE] /credit/payment-installments/{{installment_id}}
[DELETE] /hr/teams/{{team_id}}
[DELETE] /hr/teams/{{team_id}}/members/{{user_id}}
[DELETE] /hr/users/{{employee_id}}
[DELETE] /hr/warnings/{{warning_id}}
[DELETE] /project_management/teams/delete/{{team_id}}
[DELETE] /sales/attendance/schedules/{{schedule_id}}
[DELETE] /sales/commissions/distributions/{{distribution_id}}
[DELETE] /sales/deposits/{{deposit_id}}
[DELETE] /sales/marketing-tasks/{{task_id}}
[DELETE] /sales/payment-installments/{{installment_id}}
[DELETE] /sales/waiting-list/{{waiting_id}}
[GET] /accounting/commissions/{{commission_id}}/summary
[GET] /accounting/confirmations/history
[GET] /accounting/dashboard
[GET] /accounting/deposits/follow-up
[GET] /accounting/deposits/pending
[GET] /accounting/marketers
[GET] /accounting/notifications
[GET] /accounting/pending-confirmations
[GET] /accounting/salaries
[GET] /accounting/salaries/{{user_id}}
[GET] /accounting/sold-units
[GET] /accounting/sold-units/{{unit_id}}
[GET] /admin/contracts/adminIndex
[GET] /admin/notifications
[GET] /admin/notifications/public
[GET] /admin/notifications/user/{{user_id}}
[GET] /ai/assistant/knowledge
[GET] /ai/assistant/knowledge?per_page=15&module=&page_key=&language=&is_active=&search=
[GET] /ai/conversations
[GET] /ai/conversations?per_page=20&section=
[GET] /ai/sections
[GET] /boards-department/show/{{contract_id}}
[GET] /chat/conversations
[GET] /chat/conversations/{{conversation_id}}/messages
[GET] /chat/conversations/{{target_user_id}}
[GET] /chat/unread-count
[GET] /contracts/admin-index
[GET] /contracts/index
[GET] /contracts/show/{{contract_id}}
[GET] /contracts/units/show/{{contract_id}}
[GET] /credit/bookings
[GET] /credit/bookings/{{booking_id}}
[GET] /credit/bookings/{{booking_id}}/financing
[GET] /credit/bookings/{{booking_id}}/payment-plan
[GET] /credit/bookings/cancelled
[GET] /credit/bookings/confirmed
[GET] /credit/bookings/negotiation
[GET] /credit/bookings/sold
[GET] /credit/bookings/waiting
[GET] /credit/claim-files
[GET] /credit/claim-files/{{claim_file_id}}
[GET] /credit/claim-files/{{claim_file_id}}/pdf
[GET] /credit/claim-files/candidates
[GET] /credit/dashboard
[GET] /credit/notifications
[GET] /credit/sold-projects
[GET] /credit/title-transfers/pending
[GET] /developers
[GET] /developers/{{developer_number}}
[GET] /editor/contracts/index
[GET] /editor/contracts/show/{{contract_id}}
[GET] /editor/montage-department/show/{{contract_id}}
[GET] /exclusive-projects
[GET] /exclusive-projects/{{exclusive_project_id}}
[GET] /exclusive-projects/{{exclusive_project_id}}/export
[GET] /health
[GET] /hr/contracts/{{employee_contract_id}}
[GET] /hr/contracts/{{employee_contract_id}}/pdf
[GET] /hr/dashboard
[GET] /hr/marketers/{{user_id}}/performance
[GET] /hr/marketers/performance
[GET] /hr/reports/employee-count
[GET] /hr/reports/ended-contracts
[GET] /hr/reports/expiring-contracts
[GET] /hr/reports/expiring-contracts/pdf
[GET] /hr/reports/marketer-performance
[GET] /hr/reports/marketer-performance/pdf
[GET] /hr/reports/team-performance
[GET] /hr/teams
[GET] /hr/teams/{{team_id}}
[GET] /hr/teams/{{team_id}}/members
[GET] /hr/teams/contracts/{{team_id}}
[GET] /hr/teams/contracts/locations/{{team_id}}
[GET] /hr/teams/getTeamsForContract/{{contract_id}}
[GET] /hr/teams/sales-average/{{team_id}}
[GET] /hr/users
[GET] /hr/users/{{employee_id}}
[GET] /hr/users/{{employee_id}}/contracts
[GET] /hr/users/{{employee_id}}/warnings
[GET] /hr/users/roles
[GET] /inventory/contracts/admin-index
[GET] /inventory/contracts/agency-overview
[GET] /inventory/contracts/locations
[GET] /inventory/contracts/show/{{contract_id}}
[GET] /inventory/contracts/units/show/{{contract_id}}
[GET] /inventory/second-party-data/show/{{contract_id}}
[GET] /marketing/budget-distributions/{{distribution_id}}/results
[GET] /marketing/budget-distributions/{{project_id}}
[GET] /marketing/dashboard
[GET] /marketing/developer-plans/{{contract_id}}
[GET] /marketing/employee-plans/{{plan_id}}
[GET] /marketing/employee-plans/project/{{project_id}}
[GET] /marketing/expected-sales
[GET] /marketing/expected-sales/{{project_id}}
[GET] /marketing/leads
[GET] /marketing/projects
[GET] /marketing/projects/{{contract_id}}
[GET] /marketing/projects/{{project_id}}/recommend-employee
[GET] /marketing/projects/{{project_id}}/team
[GET] /marketing/reports/budget
[GET] /marketing/reports/developer-plan/export/{{contract_id}}
[GET] /marketing/reports/employee/{{user_id}}
[GET] /marketing/reports/expected-bookings
[GET] /marketing/reports/export/{{plan_id}}
[GET] /marketing/reports/project/{{project_id}}
[GET] /marketing/settings
[GET] /marketing/tasks
[GET] /marketing/teams
[GET] /my-tasks
[GET] /notifications
[GET] /photography-department/show/{{contract_id}}
[GET] /project_management/contracts/{{contract_id}}
[GET] /project_management/contracts/{{contract_id}}/export
[GET] /project_management/dashboard
[GET] /project_management/dashboard/units-statistics
[GET] /project_management/projects
[GET] /project_management/teams/contracts/{{team_id}}
[GET] /project_management/teams/contracts/locations/{{team_id}}
[GET] /project_management/teams/index
[GET] /project_management/teams/index/{{contract_id}}
[GET] /project_management/teams/show/{{team_id}}
[GET] /sales/analytics/commissions/monthly-report
[GET] /sales/analytics/commissions/stats/employee/{{user_id}}
[GET] /sales/analytics/dashboard
[GET] /sales/analytics/deposits/stats/project/{{contract_id}}
[GET] /sales/analytics/sold-units
[GET] /sales/assignments/my
[GET] /sales/attendance/my
[GET] /sales/attendance/team
[GET] /sales/commissions
[GET] /sales/commissions/{{commission_id}}
[GET] /sales/commissions/{{commission_id}}/summary
[GET] /sales/dashboard
[GET] /sales/deposits
[GET] /sales/deposits/{{deposit_id}}
[GET] /sales/deposits/{{deposit_id}}/can-refund
[GET] /sales/deposits/by-reservation/{{reservation_id}}
[GET] /sales/deposits/follow-up
[GET] /sales/deposits/legacy-follow-up
[GET] /sales/deposits/management
[GET] /sales/deposits/refundable/project/{{contract_id}}
[GET] /sales/deposits/stats/project/{{contract_id}}
[GET] /sales/marketing-tasks
[GET] /sales/marketing-tasks/{{task_id}}
[GET] /sales/negotiations/pending
[GET] /sales/projects
[GET] /sales/projects/{{contract_id}}
[GET] /sales/projects/{{contract_id}}/units
[GET] /sales/reservations
[GET] /sales/reservations/{{reservation_id}}
[GET] /sales/reservations/{{reservation_id}}/payment-plan
[GET] /sales/reservations/{{reservation_id}}/voucher
[GET] /sales/sold-units
[GET] /sales/sold-units/{{unit_id}}/commission-summary
[GET] /sales/targets
[GET] /sales/targets/{{target_id}}
[GET] /sales/targets/my
[GET] /sales/targets/team
[GET] /sales/tasks/projects
[GET] /sales/tasks/projects/{{contract_id}}
[GET] /sales/team/members
[GET] /sales/team/projects
[GET] /sales/units/{{unit_id}}/reservation-context
[GET] /sales/waiting-list
[GET] /sales/waiting-list/{{waiting_id}}
[GET] /sales/waiting-list/unit/{{unit_id}}
[GET] /second-party-data/contracts-by-email
[GET] /second-party-data/second-parties
[GET] /second-party-data/show/{{contract_id}}
[GET] /storage/{{file_path}}
[GET] /teams/index
[GET] /teams/show/{{team_id}}
[GET] /user
[GET] /user/notifications/private
[GET] /user/notifications/public
[PATCH] /admin/contracts/adminUpdateStatus/{{contract_id}}
[PATCH] /chat/conversations/{{conversation_id}}/read
[PATCH] /contracts/update-status/{{contract_id}}
[PATCH] /credit/bookings/{{booking_id}}/financing/stage/{{stage_number}}
[PATCH] /credit/bookings/negotiation/{{booking_id}}
[PATCH] /credit/title-transfer/{{transfer_id}}/schedule
[PATCH] /credit/title-transfer/{{transfer_id}}/unschedule
[PATCH] /hr/users/{{employee_id}}/restore
[PATCH] /hr/users/{{employee_id}}/status
[PATCH] /marketing/tasks/{{task_id}}/status
[PATCH] /my-tasks/{{task_id}}/status
[PATCH] /photography-department/approve/{{contract_id}}
[PATCH] /project_management/contracts/{{contract_id}}/project-link
[PATCH] /project_management/contracts/{{contract_id}}/stages/{{stage_number}}
[PATCH] /sales/attendance/schedules/{{schedule_id}}
[PATCH] /sales/marketing-tasks/{{task_id}}
[PATCH] /sales/projects/{{contract_id}}/emergency-contacts
[PATCH] /sales/targets/{{target_id}}
[PATCH] /user/notifications/{{notification_id}}/read
[PATCH] /user/notifications/mark-all-read
[POST] /accounting/commissions/{{commission_id}}/distributions/{{distribution_id}}/approve
[POST] /accounting/commissions/{{commission_id}}/distributions/{{distribution_id}}/confirm
[POST] /accounting/commissions/{{commission_id}}/distributions/{{distribution_id}}/reject
[POST] /accounting/confirm/{{reservation_id}}
[POST] /accounting/deposits/{{deposit_id}}/confirm
[POST] /accounting/deposits/{{deposit_id}}/refund
[POST] /accounting/deposits/claim-file/{{reservation_id}}
[POST] /accounting/notifications/{{notification_id}}/read
[POST] /accounting/notifications/read-all
[POST] /accounting/salaries/{{user_id}}/distribute
[POST] /accounting/salaries/distributions/{{distribution_id}}/approve
[POST] /accounting/salaries/distributions/{{distribution_id}}/paid
[POST] /accounting/sold-units/{{unit_id}}/commission
[POST] /admin/notifications/send-public
[POST] /admin/notifications/send-to-user
[POST] /admin/sales/project-assignments
[POST] /ai/ask
[POST] /ai/assistant/chat
[POST] /ai/assistant/knowledge
[POST] /ai/chat
[POST] /ai/v2/chat
[POST] /ai/v2/chat/stream
[POST] /ai/v2/explain-access
[POST] /ai/v2/search
[POST] /boards-department/store/{{contract_id}}
[POST] /chat/conversations/{{conversation_id}}/messages
[POST] /contracts/store
[POST] /contracts/store/info/{{contract_id}}
[POST] /contracts/units/store/{{contract_id}}
[POST] /contracts/units/upload-csv/{{contract_id}}
[POST] /credit/bookings/{{booking_id}}/cancel
[POST] /credit/bookings/{{booking_id}}/claim-file
[POST] /credit/bookings/{{booking_id}}/financing
[POST] /credit/bookings/{{booking_id}}/financing/advance
[POST] /credit/bookings/{{booking_id}}/financing/reject
[POST] /credit/bookings/{{booking_id}}/payment-plan
[POST] /credit/bookings/{{booking_id}}/title-transfer
[POST] /credit/bookings/waiting/{{booking_id}}/process
[POST] /credit/claim-files/{{claim_file_id}}/pdf
[POST] /credit/claim-files/generate-bulk
[POST] /credit/dashboard/refresh
[POST] /credit/notifications/{{notification_id}}/read
[POST] /credit/notifications/read-all
[POST] /credit/title-transfer/{{transfer_id}}/complete
[POST] /editor/montage-department/store/{{contract_id}}
[POST] /exclusive-projects
[POST] /exclusive-projects/{{exclusive_project_id}}/approve
[POST] /exclusive-projects/{{exclusive_project_id}}/reject
[POST] /hr/contracts/{{employee_contract_id}}/activate
[POST] /hr/contracts/{{employee_contract_id}}/pdf
[POST] /hr/contracts/{{employee_contract_id}}/terminate
[POST] /hr/dashboard/refresh
[POST] /hr/teams
[POST] /hr/teams/{{team_id}}/members
[POST] /hr/users
[POST] /hr/users/{{employee_id}}/contracts
[POST] /hr/users/{{employee_id}}/files
[POST] /hr/users/{{employee_id}}/warnings
[POST] /login
[POST] /logout
[POST] /marketing/budget-distributions
[POST] /marketing/budget-distributions/{{distribution_id}}/calculate
[POST] /marketing/developer-plans
[POST] /marketing/employee-plans
[POST] /marketing/employee-plans/auto-generate
[POST] /marketing/expected-sales
[POST] /marketing/leads
[POST] /marketing/leads/{{lead_id}}/assign
[POST] /marketing/leads/{{lead_id}}/convert
[POST] /marketing/projects/{{project_id}}/team
[POST] /marketing/projects/calculate-budget
[POST] /marketing/tasks
[POST] /marketing/teams/assign
[POST] /notifications/{{notification_id}}/read
[POST] /notifications/read-all
[POST] /photography-department/store/{{contract_id}}
[POST] /project_management/teams/add/{{contract_id}}
[POST] /project_management/teams/remove/{{contract_id}}
[POST] /project_management/teams/store
[POST] /sales/attendance/schedules
[POST] /sales/commissions
[POST] /sales/commissions/{{commission_id}}/approve
[POST] /sales/commissions/{{commission_id}}/distribute/closing
[POST] /sales/commissions/{{commission_id}}/distribute/lead-generation
[POST] /sales/commissions/{{commission_id}}/distribute/management
[POST] /sales/commissions/{{commission_id}}/distribute/persuasion
[POST] /sales/commissions/{{commission_id}}/distributions
[POST] /sales/commissions/{{commission_id}}/mark-paid
[POST] /sales/commissions/distributions/{{distribution_id}}/approve
[POST] /sales/commissions/distributions/{{distribution_id}}/reject
[POST] /sales/deposits
[POST] /sales/deposits/{{deposit_id}}/confirm-receipt
[POST] /sales/deposits/{{deposit_id}}/generate-claim
[POST] /sales/deposits/{{deposit_id}}/mark-received
[POST] /sales/deposits/{{deposit_id}}/refund
[POST] /sales/deposits/bulk-confirm
[POST] /sales/marketing-tasks
[POST] /sales/negotiations/{{negotiation_id}}/approve
[POST] /sales/negotiations/{{negotiation_id}}/reject
[POST] /sales/reservations
[POST] /sales/reservations/{{reservation_id}}/actions
[POST] /sales/reservations/{{reservation_id}}/cancel
[POST] /sales/reservations/{{reservation_id}}/confirm
[POST] /sales/reservations/{{reservation_id}}/payment-plan
[POST] /sales/targets
[POST] /sales/waiting-list
[POST] /sales/waiting-list/{{waiting_id}}/convert
[POST] /second-party-data/store/{{contract_id}}
[POST] /tasks
[PUT] /accounting/commissions/{{commission_id}}/distributions
[PUT] /ai/assistant/knowledge/{{knowledge_id}}
[PUT] /boards-department/update/{{contract_id}}
[PUT] /contracts/units/update/{{unit_id}}
[PUT] /contracts/update/{{contract_id}}
[PUT] /credit/payment-installments/{{installment_id}}
[PUT] /editor/montage-department/update/{{contract_id}}
[PUT] /exclusive-projects/{{exclusive_project_id}}/contract
[PUT] /hr/contracts/{{employee_contract_id}}
[PUT] /hr/teams/{{team_id}}
[PUT] /hr/users/{{employee_id}}
[PUT] /marketing/leads/{{lead_id}}
[PUT] /marketing/settings/{{setting_key}}
[PUT] /marketing/settings/conversion-rate
[PUT] /marketing/tasks/{{task_id}}
[PUT] /photography-department/update/{{contract_id}}
[PUT] /project_management/teams/update/{{team_id}}
[PUT] /sales/commissions/{{commission_id}}/expenses
[PUT] /sales/commissions/distributions/{{distribution_id}}
[PUT] /sales/deposits/{{deposit_id}}
[PUT] /sales/payment-installments/{{installment_id}}
[PUT] /second-party-data/update/{{contract_id}}
```
