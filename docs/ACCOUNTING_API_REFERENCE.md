# Accounting API — Frontend Fetch & Request Reference

**Base URL:** `/api`  
**Auth:** All requests require `Authorization: Bearer <token>` (Laravel Sanctum).  
**Roles:** `accounting` or `admin`.

**Response shape (success):** `{ success: true, message: string, data?: T, meta?: PaginationMeta }`  
**Response shape (error):** `{ success: false, message: string, errors?: Record<string, string[]> }`  
**Pagination meta:** `{ total, per_page, current_page, last_page }`

---

## 1. Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/accounting/dashboard` | Get dashboard metrics |

**Query (optional):** `from_date`, `to_date` (YYYY-MM-DD)

---

## 2. Notifications

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/accounting/notifications` | List notifications (paginated) |
| POST | `/api/accounting/notifications/{id}/read` | Mark one as read |
| POST | `/api/accounting/notifications/read-all` | Mark all as read |

**GET query (optional):** `from_date`, `to_date`, `status` (pending|read), `type`, `per_page`, `page`

---

## 3. Sold Units & Commissions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/accounting/marketers` | List marketers for dropdown |
| GET | `/api/accounting/sold-units` | List sold units (paginated) |
| GET | `/api/accounting/sold-units/{id}` | Single unit + distributions + available_marketers |
| POST | `/api/accounting/sold-units/{id}/commission` | Create manual commission |
| PUT | `/api/accounting/commissions/{id}/distributions` | Update distributions |
| POST | `/api/accounting/commissions/{id}/distributions/{distId}/approve` | Approve distribution |
| POST | `/api/accounting/commissions/{id}/distributions/{distId}/reject` | Reject distribution |
| GET | `/api/accounting/commissions/{id}/summary` | Commission summary |
| POST | `/api/accounting/commissions/{id}/distributions/{distId}/confirm` | Confirm payment |

**GET sold-units query (optional):** `project_id`, `from_date`, `to_date`, `commission_source` (owner|buyer), `commission_status` (pending|approved|paid), `per_page`

---

## 4. Deposits

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/accounting/deposits/pending` | Pending deposits (paginated) |
| POST | `/api/accounting/deposits/{id}/confirm` | Confirm deposit receipt |
| GET | `/api/accounting/deposits/follow-up` | Follow-up list (paginated) |
| POST | `/api/accounting/deposits/{id}/refund` | Process refund |
| POST | `/api/accounting/deposits/claim-file/{reservationId}` | Generate claim file |

---

## 5. Salaries

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/accounting/salaries` | Salaries for period (requires **month**, **year**) |
| GET | `/api/accounting/salaries/{userId}` | Employee detail + commissions by project |
| POST | `/api/accounting/salaries/{userId}/distribute` | Create salary distribution |
| POST | `/api/accounting/salaries/distributions/{distributionId}/approve` | Approve distribution |
| POST | `/api/accounting/salaries/distributions/{distributionId}/paid` | Mark as paid |

**GET salaries query (required):** `month` (1–12), `year`. Optional: `type`, `team_id`, `commission_eligible`.

**GET salaries/{userId} query (required):** `month`, `year`.

**GET salaries/{userId} response (تفاصيل الموظف + عمولة كل مشروع بشكل مفصل):**

- `data.employee` — id, name, employee_name, job_title, department, team_name, phone, email, base_salary, commission_eligibility
- `data.period` — month, year
- `data.salary_distribution` — إن وُجد: id, base_salary, total_commissions, total_amount, status
- `data.commissions_by_project` — قائمة بمشروع؛ كل عنصر:
  - `project_name`, `total_commission`
  - `details` — مصفوفة سطور: `unit_number`, `commission_type`, `commission_type_label` (عربي)، `percentage`, `amount`, `status`
- `data.commissions_total` — إجمالي العمولات للشهر
- `data.sold_units` — الوحدات المباعة
- `data.summary` — units_sold, total_sales_value, total_commissions, base_salary, total_amount

**POST salaries/{userId}/distribute body:** `{ month, year }` (واختياري base_salary, total_commissions حسب الباك إند)

---

## 6. Down Payment Confirmations (Legacy)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/accounting/pending-confirmations` | Pending confirmations |
| POST | `/api/accounting/confirm/{reservationId}` | Confirm reservation |
| GET | `/api/accounting/confirmations/history` | Confirmation history |

---

## استخدام الفرونت إند

- **قائمة الرواتب:** استخدم `employee_name` أو `name`، `job_title`، `department` أو `team_name`، و`distribution` (إن وُجد) للحصول على الحقول من الاستجابة.
- **مودال تفاصيل الراتب:** استخدم `data.employee` لبيانات الموظف، و`data.commissions_by_project` لعرض تفصيل العمولات حسب المشروع (مع `details` لكل مشروع)، و`data.salary_distribution` لتوزيع الراتب للشهر، و`data.commissions_total` لإجمالي العمولات.
