# Sales API Collection – مرجع واجهات مبيعات

مرجع سريع لواجهات API الخاصة بقطاع المبيعات واستخدامها من الواجهة الأمامية.

---

## 2.6 تعيين الدوام (الحضور) باليوم والتاريخ والساعات

### 2.6.1 تعيين فردي

**الطريقة:** `POST /api/sales/attendance/schedules`

يديرها مدير المبيعات لتعيين دوام عضو لفترة معيّنة.

**الطلب (StoreAttendanceScheduleRequest):**

| الحقل           | النوع   | مطلوب | الوصف                                      |
|-----------------|--------|-------|---------------------------------------------|
| `contract_id`   | number | نعم   | معرف العقد/المشروع                          |
| `user_id`       | number | نعم   | معرف المستخدم (العضو)                       |
| `schedule_date` | string | نعم   | تاريخ الدوام بصيغة **Y-m-d** (مثال: 2026-03-01) |
| `start_time`    | string | نعم   | وقت البداية (انظر صيغ الوقت أدناه)         |
| `end_time`      | string | نعم   | وقت النهاية (انظر صيغ الوقت أدناه)         |

**اليوم (اسم اليوم):**  
لا يُرسل في الطلب؛ يُستنتج من `schedule_date` ويُرجع في الاستجابة في الحقل `day_name_ar` (مثل: الأحد، الخميس).

---

### 2.6.2 قبول الساعات بصيغتين

في **StoreAttendanceScheduleRequest** و **BulkAttendanceRequest**:

- يمكن إرسال الوقت كـ **"08:00"** (H:i) أو **"08:00:00"** (H:i:s).
- يتم تحويل القيم داخلياً إلى **H:i:s** قبل الحفظ.

مثال طلب:

```json
{
  "contract_id": 23,
  "user_id": 5,
  "schedule_date": "2026-03-01",
  "start_time": "08:00",
  "end_time": "17:00"
}
```

أو:

```json
{
  "start_time": "08:00:00",
  "end_time": "17:00:00"
}
```

---

### 2.6.3 استجابة تعيين الدوام (SalesAttendanceResource)

الاستجابة تحتوي على الحقول التالية (من بين ما يُرجَع عادة):

| الحقل            | النوع   | الوصف                              |
|------------------|--------|-------------------------------------|
| `schedule_date`  | string | تاريخ الدوام (Y-m-d)               |
| `day_name_ar`    | string | اسم اليوم بالعربية (مثل: الخميس)  |
| `day_of_week`    | string | اسم اليوم بالإنجليزية             |
| `start_time`     | string | وقت البداية                        |
| `end_time`       | string | وقت النهاية                        |
| `user_id`        | number | معرف المستخدم                      |
| `user_name`      | string | اسم المستخدم                       |
| `project_id`     | number | معرف المشروع                      |
| `project_name`   | string | اسم المشروع                       |
| `project_location` | string | موقع المشروع (إن وُجد)          |

**مثال استجابة:**

```json
{
  "data": {
    "schedule_date": "2026-03-01",
    "day_name_ar": "الخميس",
    "day_of_week": "Thursday",
    "start_time": "08:00:00",
    "end_time": "17:00:00",
    "user_id": 5,
    "user_name": "أحمد محمد",
    "project_id": 23,
    "project_name": "مشروع النخيل",
    "project_location": "الرياض"
  }
}
```

بهذا يمكن للواجهة عرض جملة مثل:

**«تم تعيين الدوام: الخميس 2026-03-01 من 08:00 إلى 17:00».**

---

### 2.6.4 الحفظ الجماعي (Bulk)

**الطريقة:** `POST /api/sales/attendance/project/{contract_id}/bulk`

- **الطلب:** `date` (Y-m-d)، ومصفوفة `schedules[]` حيث كل عنصر يحتوي على: `user_id`, `present`, `start_time`, `end_time`.
- **صيغ الوقت:** نفس القاعدة أعلاه: يمكن إرسال **"08:00"** أو **"08:00:00"**.
- الاستجابة قد تحتوي على عناصر بنفس شكل **SalesAttendanceResource** (بما فيها `day_name_ar`, `schedule_date`, `start_time`, `end_time`) لاستخدامها في رسالة النجاح في الواجهة.

---

---

## 2.7 أهداف المبيعات (Sales Targets)

إدارة أهداف المبيعات للمسوقين والمشاريع.

### 2.7.1 إنشاء هدف جديد (Leader)

**الطريقة:** `POST /api/sales/targets`

**الطلب:**

| الحقل | الشرح |
|-------|-------|
| `assignee_marketer_id` | معرف المسوق (User ID من نوع sales) |
| `contract_id` | معرف المشروع/العقد |
| `contract_unit_id` | معرف الوحدة (اختياري، null للمشروع بالكامل) |
| `contract_unit_ids` | مصفوفة معرفات الوحدات (للأهداف المتعددة) |
| `must_sell_units_count` | عدد الوحدات المطلوب بيعها |
| `assigned_target_value` | قيمة الهدف المطلوبة بالريال |
| `start_date` / `end_date` | فترة الهدف |

**ملاحظة:** لمعاينة جميع التفاصيل والمسارات، راجع [SALES_TARGETS_API_SUMMARY.md](SALES_TARGETS_API_SUMMARY.md).

---

## استخدام من الواجهة الأمامية

- **تعيين فردي:** `salesService.createSchedule({ contract_id, user_id, schedule_date, start_time, end_time })`.
- **حفظ جماعي:** `salesService.saveProjectSchedules(projectId, schedules, date)`.
- **إدارة الأهداف:** يتم استخدام `useSalesTargets` الذي يعتمد على `salesService.createTarget` و `salesService.updateTarget`.
