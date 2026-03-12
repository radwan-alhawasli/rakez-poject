# Marketing Module API Documentation

## Overview
The Marketing Module manages marketing campaigns, plans, budgets, and team assignments for real estate projects.

**Base URL:** `/api/marketing`  
**Authentication:** Required (Sanctum Token)  
**Authorization:** Marketing role or Admin

---

## Table of Contents
1. [Dashboard](#dashboard)
2. [Projects](#projects)
3. [Developer Plans](#developer-plans)
4. [Employee Plans](#employee-plans)
5. [Expected Sales](#expected-sales)
6. [Tasks](#tasks)
7. [Team Management](#team-management)
8. [Leads](#leads)
9. [Reports](#reports)
10. [Settings](#settings)

---

## Dashboard

### Get Marketing Dashboard
**Endpoint:** `GET /api/marketing/dashboard`  
**Permission:** `marketing.dashboard.view`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_projects": 15,
    "active_campaigns": 8,
    "total_budget": 500000.00,
    "spent_budget": 320000.00,
    "expected_bookings": 120,
    "actual_bookings": 85,
    "conversion_rate": 2.5,
    "roi": 180.5
  }
}
```

---

## Projects

### List Marketing Projects
**Endpoint:** `GET /api/marketing/projects`  
**Permission:** `marketing.projects.view`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "contract_id": 5,
      "project_name": "مشروع برج الراكز",
      "assigned_team_leader": 3,
      "status": "active",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Get Project Details
**Endpoint:** `GET /api/marketing/projects/{contractId}`  
**Permission:** `marketing.projects.view`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "contract_id": 5,
    "project_name": "مشروع برج الراكز",
    "developer_name": "شركة التطوير",
    "city": "الرياض",
    "total_units": 50,
    "duration_status": {
      "total_days": 180,
      "elapsed_days": 45,
      "remaining_days": 135,
      "percentage": 25
    }
  }
}
```

### Calculate Campaign Budget
**Endpoint:** `POST /api/marketing/projects/calculate-budget`  
**Permission:** `marketing.budgets.manage`

**Request:**
```json
{
  "contract_id": 5,
  "marketing_value": 100000,
  "average_cpm": 15.50,
  "average_cpc": 2.30,
  "conversion_rate": 2.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_budget": 100000,
    "impressions": 6451612,
    "clicks": 43478,
    "expected_conversions": 1087,
    "cost_per_conversion": 92.00
  }
}
```

---

## Developer Plans

### Get Developer Plan (بيانات خطة المطور)
**Endpoint:** `GET /api/marketing/developer-plans/{contractId}`  
**Permission:** `marketing.plans.create`

يعيد دائماً بيانات العقد المستخدمة في "حساب ميزانية الحملة":
- **`data.contract.commission_percent`** — نسبة السعي في العقد (من العقد)
- **`data.contract.average_unit_price`** — متوسط سعر الوحدات (ريال)

**مصدر نسبة السعي في الخادم:** تُقرأ من العقد الفعلي: تفاصيل العقد (`contract_infos.commission_percent`) أولاً، ثم جدول العقود (`contracts.commission_percent`). إذا ظهرت القيمة 0 فالمشكلة من البيانات — يجب تخزين نسبة السعي عند إنشاء/تحديث العقد (مثلاً 2.5 أو 3) في أحد الجدولين.

**Frontend:** عند اختيار رقم العقد، استدعِ هذا الـ endpoint واملأ:
- "نسبة السعي في العقد" من `data.contract.commission_percent`
- "متوسط سعر الوحدات (ريال)" من `data.contract.average_unit_price`
- يمكن إظهار تنبيه عندما `commission_percent === 0` و `average_unit_price > 0` لتنبيه المستخدم أن المشكلة من بيانات العقد.

**Response (مع أو بدون خطة محفوظة):**
```json
{
  "success": true,
  "data": {
    "contract": {
      "commission_percent": 2.5,
      "average_unit_price": 850000
    },
    "plan": null,
    "total_budget": null,
    "expected_impressions": null,
    "expected_clicks": null,
    "marketing_duration": null,
    "marketing_duration_ar": null,
    "expected_impressions_ar": null,
    "expected_clicks_ar": null,
    "raw_plan": null
  }
}
```

عند وجود خطة محفوظة يُعاد أيضاً `plan` و `raw_plan` و `total_budget` و `expected_impressions` وغيرها.

### حساب ميزانية الحملة (لخطة المطور)
**Endpoint:** `POST /api/marketing/developer-plans/calculate-budget`  
**Permission:** `marketing.plans.create`

**قاعدة العمل:** نسبة التسويق (6%-10%) **لازم يدخلها الموظف** قبل ما تنحسب ميزانية الحملة. لا تُحسب الميزانية ولا تُعرض في "قيمة التسويق / ميزانية الحملة" إلا بعد إدخال نسبة التسويق من موظف قسم التسويق.

الصيغة: **عمولة = نسبة السعي في العقد × متوسط سعر الوحدات** ثم **ميزانية الحملة = عمولة × نسبة التسويق (6%-10%)**.

**مصدر نسبة السعي:** الخادم يقرأ نسبة السعي من العقد الفعلي (نفس مصدر `GET developer-plans/{contractId}`: تفاصيل العقد ثم جدول العقود). إن كانت النسبة مخزنة في قاعدة البيانات فستُستخدم في الحساب؛ إن كانت 0 فستكون ميزانية الحملة 0 حتى تُحدَّث بيانات العقد.

**Request:**
```json
{
  "contract_id": 26,
  "marketing_percent": 7.5,
  "unit_price": 850000
}
```
- `marketing_percent` **مطلوب** (6–10) — يدخله موظف التسويق؛ الحساب لا يتم بدونه.
- `unit_price` اختياري؛ إن لم يُرسل يُستخدم متوسط السعر من العقد.

**Response:**
```json
{
  "success": true,
  "data": {
    "commission_percent": 2.5,
    "commission_value": 21250,
    "marketing_percent": 7.5,
    "marketing_value": 1593.75,
    "daily_budget": 53.125,
    "monthly_budget": 53.125
  }
}
```

**Frontend:** عند إدخال "نسبة التسويق (6-10%)" اضغط "تطبيق كميزانية الحملة": استدعِ هذا الـ endpoint ثم اعرض `data.marketing_value` في "ميزانية الحملة (محسوبة)" و/أو في "قيمة التسويق / ميزانية الحملة".

### Create/Update Developer Plan
**Endpoint:** `POST /api/marketing/developer-plans`  
**Permission:** `marketing.plans.create`

**Request:**
```json
{
  "contract_id": 5,
  "marketing_value": 100000,
  "marketing_percent": 7.5,
  "average_cpm": 15.50,
  "average_cpc": 2.30,
  "conversion_rate": 2.5,
  "expected_bookings": 1087,
  "notes": "Campaign targeting Riyadh residents"
}
```
- `marketing_percent` اختياري (6–10)، يُحفظ في الخطة.

**Response:**
```json
{
  "success": true,
  "message": "Developer marketing plan saved successfully",
  "data": {
    "id": 1,
    "contract_id": 5,
    "marketing_value": 100000
  }
}
```

---

## Employee Plans

### Users list (for employee dropdown)
For the employee-plans flow, use this endpoint instead of `GET /api/hr/users` to avoid 403. Returns the same user list as the HR endpoint.

**Endpoint:** `GET /api/marketing/users`  
**Permission:** `marketing.plans.create`

**Query (optional):** `is_active`, `type`, `team_id`, `department`, `search`, `per_page`, `page`

**Frontend:** Call `GET /api/marketing/users` (not `/api/hr/users`) when loading the employees list for marketing employee plans.

---

### List Employee Plans by Project
**Endpoint:** `GET /api/marketing/employee-plans?project_id={projectId}` or `GET /api/marketing/employee-plans/project/{projectId}`  
**Permission:** `marketing.plans.create`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "marketing_project_id": 1,
      "user_id": 5,
      "user": {
        "id": 5,
        "name": "أحمد محمد",
        "email": "ahmed@example.com"
      },
      "daily_target": 10,
      "weekly_target": 50,
      "monthly_target": 200
    }
  ]
}
```

### Get Employee Plan Details
**Endpoint:** `GET /api/marketing/employee-plans/{planId}`  
**Permission:** `marketing.plans.create`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "marketing_project_id": 1,
    "user_id": 5,
    "user": {
      "id": 5,
      "name": "أحمد محمد"
    },
    "campaigns": [
      {
        "id": 1,
        "name": "Facebook Campaign",
        "budget": 5000,
        "status": "active"
      }
    ]
  }
}
```

### Create Employee Plan
**Endpoint:** `POST /api/marketing/employee-plans`  
**Permission:** `marketing.plans.create`

**Request:**
```json
{
  "marketing_project_id": 1,
  "user_id": 5,
  "daily_target": 10,
  "weekly_target": 50,
  "monthly_target": 200
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employee marketing plan created successfully",
  "data": {
    "id": 1,
    "marketing_project_id": 1,
    "user_id": 5
  }
}
```

### Auto-Generate Employee Plan
**Endpoint:** `POST /api/marketing/employee-plans/auto-generate`  
**Permission:** `marketing.plans.create`

**Request:**
```json
{
  "marketing_project_id": 1,
  "user_id": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employee marketing plan auto-generated successfully",
  "data": {
    "id": 1,
    "daily_target": 8,
    "weekly_target": 40,
    "monthly_target": 160
  }
}
```

---

## Expected Sales

### Calculate Expected Sales
**Endpoint:** `GET /api/marketing/expected-sales/{projectId}`  
**Permission:** `marketing.budgets.manage`

**Query Parameters:**
- `marketing_value` (optional): Marketing budget
- `average_cpm` (optional): Average CPM
- `average_cpc` (optional): Average CPC
- `conversion_rate` (optional): Conversion rate percentage

**Response:**
```json
{
  "success": true,
  "data": {
    "project_id": 1,
    "expected_bookings": 1087,
    "total_impressions": 6451612,
    "total_clicks": 43478,
    "conversion_rate": 2.5
  }
}
```

### Update Conversion Rate
**Endpoint:** `PUT /api/marketing/settings/conversion-rate`  
**Permission:** `marketing.budgets.manage`

**Request:**
```json
{
  "value": 2.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversion rate updated successfully",
  "data": {
    "key": "conversion_rate",
    "value": "2.5",
    "description": "Default conversion rate for marketing"
  }
}
```

---

## Tasks

### List Daily Tasks
**Endpoint:** `GET /api/marketing/tasks`  
**Permission:** `marketing.tasks.view`

**Query Parameters:**
- `date` (optional): Date in Y-m-d format (defaults to today)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "contract_id": 5,
      "task_name": "Create Facebook Ad Campaign",
      "marketer_id": 5,
      "due_date": "2026-02-01",
      "priority": "high",
      "status": "in_progress",
      "description": "Launch new campaign for project"
    }
  ]
}
```

### Create Task
**Endpoint:** `POST /api/marketing/tasks`  
**Permission:** `marketing.tasks.confirm`

**Request:**
```json
{
  "contract_id": 5,
  "marketing_project_id": 1,
  "task_name": "Create Facebook Ad Campaign",
  "marketer_id": 5,
  "due_date": "2026-02-01",
  "priority": "high",
  "description": "Launch new campaign for project"
}
```

### Update Task
**Endpoint:** `PUT /api/marketing/tasks/{taskId}`  
**Permission:** `marketing.tasks.confirm`

### Update Task Status
**Endpoint:** `PATCH /api/marketing/tasks/{taskId}/status`  
**Permission:** `marketing.tasks.confirm`

**Valid Status Values:** `new`, `in_progress`, `completed`, `cancelled`

---

## Team Management

### Assign Team to Project
**Endpoint:** `POST /api/marketing/projects/{projectId}/team`

### Get Project Team
**Endpoint:** `GET /api/marketing/projects/{projectId}/team`

### Recommend Employee for Project
**Endpoint:** `GET /api/marketing/projects/{projectId}/recommend-employee`

---

## Leads

### List Leads
**Endpoint:** `GET /api/marketing/leads`

### Create Lead
**Endpoint:** `POST /api/marketing/leads`

### Update Lead
**Endpoint:** `PUT /api/marketing/leads/{leadId}`

---

## Reports

### Project Performance Report
**Endpoint:** `GET /api/marketing/reports/project/{projectId}`

### Budget Report
**Endpoint:** `GET /api/marketing/reports/budget`

### Expected Bookings Report
**Endpoint:** `GET /api/marketing/reports/expected-bookings`

### Employee Performance Report
**Endpoint:** `GET /api/marketing/reports/employee/{userId}`

### Export Plan
**Endpoint:** `GET /api/marketing/reports/export/{planId}`

### Export distribution by project (PDF) — خطة الحملات حسب المشروع فقط
**Endpoint:** `GET /api/marketing/reports/distribution/project/{projectId}`  
**Permission:** `marketing.reports.view`  
**Parameters:** `projectId` = معرّف المشروع التسويقي (marketing_project_id).

**Response:** ملف PDF للتحميل.

---

## Settings

### List Settings
**Endpoint:** `GET /api/marketing/settings`

### Update Setting
**Endpoint:** `PUT /api/marketing/settings/{key}`

---

## Error Responses

- **401 Unauthorized** — Unauthenticated
- **403 Forbidden** — Marketing permission required
- **404 Not Found** — Resource not found
- **422 Validation Error** — Invalid data
- **500 Server Error** — Server error

---

## Notes

- All dates are in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
- All monetary values are in SAR (Saudi Riyal)
- Pagination: `per_page` and `page` query parameters
- Authentication: `Authorization: Bearer {token}` header
