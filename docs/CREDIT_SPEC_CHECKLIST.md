# Credit Module – Spec vs Implementation Checklist

تبويبة = tab in Credit sidebar. This document maps the specification (التبويبات الرئيسية) to the current implementation.

---

## Sidebar tabs (التبويبات الرئيسية)

| # | Spec (تبويبة) | Route | Implementation status |
|---|----------------|--------|------------------------|
| 1 | لوحة التحكم | `/credit/dashboard` | Done – KPIs: confirmed bookings, pending negotiations, waiting, active financing, title transfers, pending claims |
| 2 | الإشعارات | `/credit/notifications` | Done – Tab added; list shows credit notification types (حجز تفاوض جديد، تأكيد العربون، اكتمال الإفراغ، etc.). Backend `creditService.getNotifications()` can be wired when API exists |
| 3 | إدارة الحجوزات | `/credit/bookings` | Done – Sub-tabs: الحجوزات المؤكدة (3.1), حجوزات التفاوض (4), حجوزات الانتظار (5) |
| — | متتبع التمويل | `/credit/financing` | Done – Financing tracker (3.2 مراحل المتتبع) |
| — | نقل الملكية | `/credit/title-transfer` | Done |
| — | المشاريع المباعة | `/credit/sold-projects` | Done – (3.4 إتمام الإفراغ → تنتقل إلى المشاريع المباعة) |
| 5 (spec) | إصدار ملف المطالبة والإفراغات | `/credit/claim-files` | Done – Sidebar label: "ملفات المطالبة والإفراغات"; spec 5.1 data (اسم المشروع، رقم الوحدة، نوع الوحدة، نسبة السعي، قيمة الضريبة) can be added to claim list/detail when API provides them |

---

## Tab 2: الإشعارات (Notifications)

**Spec:** استقبال إشعارات: حجز تفاوض جديد، الموافقة أو الرفض على السعر، تأكيد العربون، انتقال الحجز إلى مؤكد، انتهاء مهلة أي إجراء، اكتمال الإفراغ.

**Implementation:** Credit Notifications tab and route added. Placeholder table (تاريخ، نوع الإشعار، العنوان، الحالة). Call `creditService.getNotifications()` when backend exposes it.

---

## Tab 3: إدارة الحجوزات – Confirmed booking detail (3.1)

**Spec – When clicking a reservation:**

- **3.1.1 بيانات المشروع:** اسم المشروع، رقم الوحدة، الحي، نوع العقار، قيمة العقار  
- **3.1.2 بيانات العميل:** اسم العميل، رقم الهاتف، البريد الإلكتروني، جنسية العميل، رقم IBAN  
- **3.1.3 التفاصيل المالية:** قيمة العربون، تاريخ دفع العربون، نسبة السعي (من المالك أو المشتري)، طريقة دفع العربون (كاش / تحويل بنكي أو دفع إلكتروني + تأكيد المحاسبة)  
- **3.1.4 تفاصيل التسويق:** اسم الفريق، اسم المسوق  

**Implementation:** `BookingDetailModal` updated with sections 3.1.1–3.1.4 and fields bound to `booking.*` (e.g. `project_name`, `unit_number`, `customer_name`, `deposit_amount`, `payment_method`, `team_name`, `marketer_name`). Backend should return these from `getConfirmedBookingById` or list payload.

---

## Sub-tabs under إدارة الحجوزات

- **3.1 الحجوزات المؤكدة** – List + "عرض التفاصيل" opens modal (3.1.1–3.1.4).  
- **3.2 سيناريوهات** (كاش 7 أيام، بنك متتبع) – Logic/UI in financing tracker and booking flow; cash vs bank and tracker stages can be extended as needed.  
- **3.3 المشاريع على الخارطة** – خطة دفعات / موعد إفراغ – Not in current scope; can be added when map and payment-plan features exist.  
- **3.4 إتمام الإفراغ** – "تم الإفراغ" → المشاريع المباعة – Conceptual; sold-projects tab exists.  
- **3.5 إلغاء الحجز** – Cancel/delete – Can be added as action in booking detail or list.  
- **4. حجوزات التفاوض** – Sub-tab with negotiation list and update (سبب التفاوض، السعر المقترح، إشعار لمدير المبيعات، مدة 48 ساعة، تحويل إلى مؤكد).  
- **5. حجوزات الانتظار** – Sub-tab view-only for credit.  

---

## Tab 5 (spec): إصدار ملف المطالبة والإفراغات (5.1)

**Spec 5.1 البيانات المعروضة:** اسم المشروع، رقم الوحدة، نوع الوحدة، نسبة السعي، قيمة الضريبة، معلومات المشروع.

**Implementation:** Claim-files tab and form exist. Table columns: رقم الملف، رقم العقد، مبلغ المطالبة، الحالة. To align with 5.1, add columns or detail view for: project name, unit number, unit type, commission %, tax value when API provides them.

---

## Summary

- **Tab order and labels** aligned with spec: Dashboard, Notifications, إدارة الحجوزات (with sub-tabs), متتبع التمويل, نقل الملكية, المشاريع المباعة, ملفات المطالبة والإفراغات.  
- **Booking detail modal** includes all spec sections 3.1.1–3.1.4; backend fields may use different keys (e.g. `customer_phone` vs `phone`) – already covered with fallbacks.  
- **Notifications** and **claim-files 5.1** data can be completed once the credit APIs expose the relevant fields.
