# RAKEZ_LAST_SYSTEM — مرجع API (Postman collection overview)

## Metadata

| Field | Value |
|--------|--------|
| Collection name | RAKEZ_LAST_SYSTEM |
| Postman UID | `53088089-59a63125-d84f-45a6-8769-9d5925765378` |
| Collection-level auth | None (configure per environment / request) |
| Total requests | 312 |
| Total folders | 104 (including nested) |
| Top-level folders | 19 |
| Last documented (this file) | 2025-03-25 |

This document summarizes the Postman collection for **AI assistants and developers**. It is **not** a substitute for verifying paths against the running backend or against this repo’s service modules.

---

## ربط البيئة مع الواجهة الأمامية (Environment binding)

| Postman variable | Meaning | This Vue app (`VITE`) |
|------------------|---------|------------------------|
| `{{base_url}}` | Primary base for most requests | Should match **`VITE_APP_API_BASE_URL`**: API root **including** `/api`, e.g. `http://localhost:8000/api` or `https://api.rakez.com.sa/api` (no trailing slash). See [`src/config/appConfig.js`](../src/config/appConfig.js). |
| `{{baseUrl}}` | Alternate base (inventory, manager, chat-style APIs in collection) | May point at the same host with different path prefix; align manually with your deployment. |
| `{{server}}` | Legacy / older server base | Prefer migrating calls to `{{base_url}}` / `VITE_APP_API_BASE_URL`. |
| `{{local}}` | Local development server | Same intent as dev `VITE_APP_API_BASE_URL`. |

**Path rule (axios `apiClient`):** `baseURL` is `appConfig.apiBaseUrl` (ends with `/api`). Request paths are **relative to that base** and must **not** repeat `/api` (e.g. `GET '/hr/teams'`, not `GET '/api/hr/teams'`). See [`src/api/apiClient.js`](../src/api/apiClient.js).

**Tables below** list paths in the form **`/api/...`** (full path after the host) so they match common Laravel + Postman documentation. To call from this codebase, strip the leading `/api` when `apiBaseUrl` already includes `/api`.

---

## المصادقة (Authentication)

- No collection-level Auth in Postman; requests that need login typically use:
  - **`Authorization: Bearer {{token}}`**
- Backend is Laravel-oriented; session/CSRF may apply to web routes — follow your environment and [`src/utils/csrf`](../src/utils/csrf.js) / token refresh behavior for the SPA.

---

## الأدوار والصلاحيات (Roles)

| Role | Access (summary) |
|------|------------------|
| `admin` | Broad access across modules |
| `hr` | HR module |
| `sales` | Sales |
| `sales_leader` | Sales team lead |
| `accounting` | Accounting |
| `credit` | Credit department |
| `marketing` | Marketing |
| `project_management` | Project management |
| `manager` | Manager APIs (e.g. reviews/tasks) where documented |

Always enforce role checks before calling an endpoint from integrations or AI-driven flows.

---

## الوحدات والـ Endpoints (summary tables)

Paths below use the **`/api/...`** convention. Adjust for `apiClient` as described above.

### 1. HR — الموارد البشرية

Base concept: `/api/hr/`

| Method | Path (after host) | Roles (from collection notes) |
|--------|-------------------|-------------------------------|
| POST | `/api/hr/users` | hr, admin |
| POST | `/api/hr/users/{{user_id}}/files` | hr, admin |
| DELETE | `/api/hr/delete_employee/{{id}}` | hr, admin |
| GET | `/api/hr/teams` | hr, admin |
| GET | `/api/hr/teams/{{team_id}}/members` (and member operations as in collection) | hr, admin |
| DELETE | `/api/hr/teams/{{team_id}}/members/{{user_id}}` | hr, admin |
| GET | `/api/hr/attendance` | hr, admin |
| GET | `/api/hr/salaries?month=&year=` | hr, admin |
| GET | `/api/hr/contracts/{{contract_id}}/pdf` | hr, admin |
| POST | `/api/hr/contracts/{{contract_id}}/activate` | hr, admin |
| GET | `/api/hr/warnings` | hr, admin |
| GET | `/api/hr/reports/marketer-performance` | hr, admin |
| GET | `/api/hr/dashboard` | hr, admin |

**Related in repo:** HR flows may also appear under [`docs/BACKEND_MARKETING_HR_USERS_VIEW.md`](BACKEND_MARKETING_HR_USERS_VIEW.md).

---

### 2. Sales — المبيعات

Base concept: `/api/sales/` and top-level resources as in Postman.

| Method | Path (after host) | Roles (from collection notes) |
|--------|-------------------|-------------------------------|
| GET | `/api/sales/reservations` | sales, admin |
| POST | `/api/sales/waiting-list/{{waiting_list_id}}/convert` | sales, sales_leader, admin |
| GET | `/api/sales/assignments/my` | sales_leader, sales |
| POST | `/api/sales/marketing-tasks` | sales_leader, admin |
| GET | `/api/manager/tasks?status=...` | manager |
| GET | `/api/sales/tasks/projects` | sales_leader, admin |
| GET | `/api/sales/projects/{{contract_id}}/units` | sales, sales_leader, admin |
| GET | `/api/exclusive-projects` | sales, project_management, admin |
| POST | `/api/exclusive-projects/{{project_id}}/reject` | admin |
| GET | `/api/sales/team/members` | sales_leader, admin |

**Related in repo:** [`docs/sales-api-collection.md`](sales-api-collection.md), [`docs/sales-leader-permission-api-matrix.md`](sales-leader-permission-api-matrix.md).

---

### 3. Accounting — المحاسبة

Base concept: `/api/accounting/` and commission routes as documented in Postman.

| Method | Path (after host) | Roles (from collection notes) |
|--------|-------------------|-------------------------------|
| GET | `/api/accounting/commissions` | sales, accounting, admin (Postman may label `/commissions` — verify) |
| DELETE | `/api/commissions/{{commission_id}}` (Postman); confirm whether backend aliases under `/api/accounting/...` | accounting, admin |
| PUT | `/api/accounting/commissions/{{commission_id}}/distributions` | accounting, admin |
| GET | `/api/accounting/deposits` | accounting, admin |
| GET | `/api/accounting/deposits/follow-up` | accounting, admin |
| GET | `/api/accounting/salaries?month=&year=` | accounting, admin |
| POST | `/api/accounting/salaries/distributions/{{distribution_id}}/approve` | accounting, admin |
| GET | `/api/accounting/confirmations/history` | accounting, admin |
| POST | `/api/accounting/notifications/read-all` | accounting, admin |

**Source of truth for this frontend:** [`docs/ACCOUNTING_API_REFERENCE.md`](ACCOUNTING_API_REFERENCE.md) and [`src/services/accountingService.js`](../src/services/accountingService.js) (paths may use `/accounting/...` prefixes consistently).

---

### 4. Credit Department — قسم الائتمان

Base concept: `/api/credit/`

| Method | Path (after host) | Roles (from collection notes) |
|--------|-------------------|-------------------------------|
| GET | `/api/credit/bookings/confirmed` | credit, admin |
| GET | `/api/credit/financing/{{financing_id}}` | credit, admin |
| POST | `/api/credit/claim-files` | credit, admin |
| GET | `/api/credit/claim-files` | credit, admin |
| GET | `/api/credit/title-transfer` | credit, admin |

**Related in repo:** [`docs/credit-bookings-actions-and-api.md`](credit-bookings-actions-and-api.md).

---

### 5. Marketing — التسويق

Base concept: `/api/marketing/`

| Method | Path (after host) | Roles (from collection notes) |
|--------|-------------------|-------------------------------|
| GET | `/api/marketing/teams` | marketing, admin |
| GET | `/api/marketing/leads` | marketing, sales, admin |
| POST | `/api/marketing/plans/employee` | marketing, admin |
| POST | `/api/marketing/plans/developer` | marketing, admin |

**Related in repo:** [`docs/MARKETING_MODULE_API.md`](MARKETING_MODULE_API.md).

---

### 6. Project Management — إدارة المشاريع

Postman mixes `{{server}}` paths; conceptually under project management and teams.

| Method | Path (after host) | Roles (from collection notes) |
|--------|-------------------|-------------------------------|
| GET | `/api/project_management/dashboard` | project_management, admin |
| POST | `/api/project_management/teams/store` | project_management, admin |
| POST | `/api/project_management/teams/remove/{{id}}` | project_management, admin |
| GET | `/api/teams/{{team_id}}/contracts` | sales, project_management, admin |
| GET | `/api/teams/{{team_id}}/sales-average` | sales, project_management, admin |

---

### 7. Notifications — الإشعارات

| Method | Path (after host) | Roles (from collection notes) |
|--------|-------------------|-------------------------------|
| GET | `/api/notifications` | authenticated users |
| GET | `/api/notifications/{{notification_id}}/read` | authenticated users |
| PATCH | `/api/user/notifications/mark-all-read` | authenticated users |
| PATCH | `/api/user/notifications/{{id}}/read` | authenticated users |
| GET | `/api/admin/notifications` | admin |
| POST | `/api/admin/notifications/send-to-role` | admin |

---

### 8. AI Conversations — محادثات الذكاء الاصطناعي

| Method | Path (after host) | Roles (from collection notes) |
|--------|-------------------|-------------------------------|
| GET | `/api/ai/conversations` | authenticated users |
| GET | `/api/ai/conversations/{{conversation_id}}` | authenticated users |

---

### 9. Inventory / Editor — المخزون والتصوير

Collection uses `{{baseUrl}}` for some routes.

| Method | Path (after host) | Notes |
|--------|-------------------|--------|
| GET | `/api/inventory/contracts/locations?status=...` | Inventory |
| GET | `/api/editor/photography-department/show/{{id}}` | Editor / photography |
| PUT | `/api/photography-department/update/{{id}}` | Verify prefix against backend (`/editor/...` vs `/api/...`) |

---

### 10. Chat — المحادثات

| Method | Path (after host) | Roles (from collection notes) |
|--------|-------------------|-------------------------------|
| DELETE | `/api/chat/messages/{{messageId}}` | Own messages only |

---

### 11. Manager — مراجعات الموظفين

| Method | Path (after host) | Roles (from collection notes) |
|--------|-------------------|-------------------------------|
| GET | `/api/manager/employees/{{employeeId}}/reviews/{{reviewId}}` | manager |
| DELETE | `/api/manager/employees/{{employeeId}}/reviews/{{reviewId}}` | Creator manager only |

---

## متغيرات المسار الشائعة (Common path variables)

| Variable | Meaning |
|----------|---------|
| `contract_id` | Contract identifier |
| `team_id` | Team identifier |
| `user_id` | User identifier |
| `commission_id` | Commission identifier |
| `financing_id` | Financing record identifier |
| `distribution_id` | Salary/commission distribution identifier |
| `notification_id` | Notification identifier |
| `conversation_id` | AI conversation identifier |
| `project_id` | Project identifier |
| `waiting_list_id` | Waiting list entry identifier |
| `employeeId` | Employee identifier (manager API) |
| `reviewId` | Review identifier |
| `messageId` | Chat message identifier |

Query parameters such as `status`, `city`, `district`, `task_status`, `assigned_to`, `section`, `per_page` appear across the collection — pass them as documented per request in Postman.

---

## تنبيه الاتساق (Consistency caveat)

- Postman evolved with multiple bases (`base_url`, `baseUrl`, `server`, `local`) and **312** requests; **labels and paths may shorthand** real routes (e.g. `/commissions` vs `/accounting/commissions`).
- For **implementation in this repository**, prefer:
  - **[`src/services/*.js`](../src/services)** and existing **[`docs/*_REFERENCE.md`](.)** as the **source of truth** for paths and payloads.
- Use **this file** as a **collection-level map**: modules, roles, variables, and environment binding for AI tools.

---

## مراجع إضافية في المستودع (Further reading)

| Document | Topic |
|----------|--------|
| [`ACCOUNTING_API_REFERENCE.md`](ACCOUNTING_API_REFERENCE.md) | Accounting API (frontend-aligned) |
| [`MARKETING_MODULE_API.md`](MARKETING_MODULE_API.md) | Marketing module |
| [`credit-bookings-actions-and-api.md`](credit-bookings-actions-and-api.md) | Credit / bookings |
| [`sales-api-collection.md`](sales-api-collection.md) | Sales collection notes |
| [`websocket-reverb.md`](websocket-reverb.md) | Realtime / Pusher-Reverb |

---

## ملاحظات للمساعد الذكي (AI assistant notes)

1. Send **`Authorization: Bearer {{token}}`** when the endpoint requires authentication.
2. Check **role** against the matrix before suggesting or calling an endpoint.
3. Prefer **`VITE_APP_API_BASE_URL`** (with `/api`) and **relative paths** in code as in `apiClient`.
4. Treat **IDs as dynamic** — obtain them from prior API responses or route params.
5. **`admin`** is described in the collection as having broad access; still confirm route policies on the backend.
