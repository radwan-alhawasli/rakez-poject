# إدارة الحجوزات — الإجراءات والـ API وتدفق المستخدم

**مرجع الـ API:** مجموعة Postman «RAKEZ ERP - Credit Module (Complete)» — 31 طلباً (1 Login + 2 Dashboard + 4 Notifications منها proxy + 2 Confirmed + 6 Negotiation/Waiting/Sold/Cancelled/Cancel + 5 Financing + 6 Title Transfer + 5 Claim Files + 4 Payment Plan).

## 1. إجراءات الجدول (عمود الإجراءات)

| التبويب | الزر | الـ API المستخدم | الملاحظات |
|--------|-----|------------------|-----------|
| الكل / الحجوزات المؤكدة / حجوزات التفاوض / حجوزات الانتظار | **عرض التفاصيل** | `GET /credit/bookings/:booking_id` + `GET /credit/bookings/:booking_id/financing` | يفتح لوحة التفاصيل بجانب الجدول (بدون مودال). |
| حجوزات التفاوض فقط | **تحديث** | `PUT /credit/bookings/negotiation/:booking_id` | لا يُستدعى أبداً عندما يكون معرف الحجز undefined؛ الواجهة تتحقق وتستخدم id أو reservation_id. |
| حجوزات الانتظار فقط | **معالجة** | `POST /credit/bookings/waiting/:booking_id/process` | يفتح مودال المعالجة ثم يرسل البيانات. |

- **البحث:** يُمرَّر إلى `GET /credit/bookings/confirmed` كـ `search` إن كان الـ Backend يدعمه. إن لم يدعمه، يمكن تطبيق فلترة من جهة العميل أو إضافة دعم البحث في الـ API.

---

## 2. إجراءات لوحة التفاصيل (بعد الضغط على «عرض التفاصيل»)

| الإجراء | الـ API | متى يظهر |
|---------|--------|----------|
| **حذف** | `POST /credit/bookings/:booking_id/cancel` | دائماً |
| **تعديل** | يفتح مودال التفاوض ثم `PUT /credit/bookings/negotiation/:booking_id` | دائماً |
| **تم الإفراغ** | إنشاء: `POST /credit/bookings/:booking_id/title-transfer` ثم إكمال: `POST /credit/title-transfer/:transfer_id/complete` | عندما الحالة ليست «مباع» |
| **تحديد موعد الإفراغ** | إنشاء إن لزم: `POST .../title-transfer` ثم `PATCH /credit/title-transfer/:transfer_id/schedule` | دائماً |
| **إلغاء** | `POST /credit/bookings/:booking_id/cancel` | دائماً |
| **الانتقال للمرحلة التالية** | `POST /credit/bookings/:booking_id/financing/advance` | عند وجود مراحل غير مكتملة |
| **رفض التمويل** | `POST /credit/bookings/:booking_id/financing/reject` (Body: `reason` مطلوب). التمويل يعتمد على **booking_id** فقط (لا tracker_id). | عند بدء إجراءات التمويل للحجز (`data.financing` موجود) |

كل الإجراءات أعلاه مربوطة بالـ API الحقيقي؛ النص أو التسميات فقط في الواجهة.

---

## 3. تدفق المستخدم (User Flow)

1. **الدخول إلى إدارة الحجوزات**  
   المستخدم يختار «إدارة الحجوزات» من القائمة الجانبية للائتمان.

2. **اختيار التبويب**  
   الكل / الحجوزات المؤكدة / حجوزات التفاوض / حجوزات الانتظار / مباعة / مرفوضة أو ملغاة.

3. **من الجدول:**
   - **عرض التفاصيل:** يظهر لوحة التفاصيل (وحدة، مشروع، عميل، مالية، عقار، تسويق + متابعة إجراءات الائتمان + أزرار الإجراءات).
   - **تحديث (تبويب التفاوض):** فتح مودال → تعديل بيانات التفاوض → حفظ → `PUT` تفاوض.
   - **معالجة (تبويب الانتظار):** فتح مودال → إدخال بيانات المعالجة → حفظ → `POST` معالجة.

4. **من لوحة التفاصيل:**  
   المستخدم ينفّذ (حذف، تعديل، تم الإفراغ، تحديد موعد الإفراغ، إلغاء، الانتقال للمرحلة التالية، رفض التمويل) حسب الحاجة؛ كلها تستدعي الـ APIs الموضحة أعلاه.

5. **بعد تنفيذ إجراء (مثل إلغاء أو إكمال):**  
   تُحدَّث القائمة و/أو لوحة التفاصيل وتُعرض رسالة نجاح أو خطأ عبر الـ Toast.

---

## 4. ما قد يكون ناقصاً أو يحتاج تحققاً

| البند | الوضع | التوصية |
|-------|--------|---------|
| **معالجة حجز الانتظار** | الواجهة تستدعي `POST /credit/bookings/waiting/:id/process` | **غير موجود في مجموعة Postman.** إن كان الـ Backend يدعمه، يبقى الاستدعاء؛ وإلا إما إضافة الـ endpoint أو إخفاء زر «معالجة». |
| **تبويب مباعة** | `GET /credit/bookings/sold` (List Sold Bookings – حجوزات ذات credit_status = sold) | مُربوط: الواجهة تستخدم `getSoldBookings()`. قائمة «المشاريع المباعة» في الشريط الجانبي تستخدم `GET /credit/sold-projects` (مكتملة نقل الملكية). |
| **تبويب مرفوضة/ملغاة** | `GET /credit/bookings/cancelled` (List Cancelled Bookings) | مُربوط: الواجهة تستخدم `getCancelledBookings()` مع per_page، from_date، to_date، contract_id حسب الحاجة. |
| **خطة الدفعات (Tab 3.3)** | Postman 08: `GET/POST /credit/bookings/:booking_id/payment-plan`، `PUT/DELETE /credit/payment-installments/:id` | مُربوط في creditService؛ واجهة خطة الدفعات يمكن ربطها لاحقاً عند الحاجة. |
| **بحث في قائمة المؤكدة** | الواجهة ترسل `search` في الطلب | إن كان الـ API لا يدعم معامل `search`، إما إضافة الدعم في الـ Backend أو تنفيذ البحث من جهة العميل على البيانات المحمّلة. |
| **إنشاء ملف مطالبة (Claim File)** | الـ API: `POST /credit/bookings/:booking_id/claim-file` (لحجز مباع) | هذا الإجراء عادة من شاشة «إصدار ملف المطالبة والإفراغات». إن كان الـ Backend يدعم فقط «توليد لحجز مباع» دون create/submit/approve عام، يمكن إخفاء أزرار إرسال/الموافقة أو ربطها عند توفر الـ API. |

---

## 5. ملخص

- **جدول الحجوزات:** أزرار «عرض التفاصيل»، «تحديث» (تفاوض)، «معالجة» (انتظار) مربوطة بالـ API. تبويب **مباعة** يستخدم `GET /credit/bookings/sold`. تبويب **مرفوضة/ملغاة** يستخدم `GET /credit/bookings/cancelled`. تبويب **المشاريع المباعة** (الشريط الجانبي) يستخدم `GET /credit/sold-projects`.
- **لوحة التفاصيل:** حذف، تعديل، تم الإفراغ، تحديد موعد الإفراغ، إلغاء، الانتقال للمرحلة التالية، و**رفض التمويل** (مع `reason` مطلوب و`booking_id` فقط) كلها مربوطة بالـ API.
- **التمويل معتمد على الحجز فقط (booking-centric):** لا يوجد `tracker_id` في الـ URL أو الاستجابة. جميع إجراءات التمويل (advance، reject، complete stage) تستخدم **booking_id** فقط. GET financing يعيد `data = null` عندما لم تبدأ إجراءات التمويل بعد، و`data.financing` مع حالة المراحل عند البدء.
- **Base URL:** بدون شرطة نهائية (مثال: `http://localhost:8000/api`). الواجهة تزيل أي شرطة نهائية تلقائياً.
- **Complete Stage (PATCH .../stage/:n):** للمرحلة 1 حقل `bank_name` مطلوب؛ عند الإرسال بدونه يرجع الـ API **422** مع `errors.bank_name`. نستخدم حالياً «نقل للمرحلة التالية» (advance) فقط.
