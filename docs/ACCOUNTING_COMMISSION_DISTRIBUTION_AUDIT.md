# فحص توزيع العمولات – قسم المحاسبة (بدون تعديل)

تقرير فحص يربط واجهة توزيع العمولات مع الـ API والبيانات المتوقعة في الباك إند والسيدر والترابط.

---

## 1. نطاق الفحص

- **الفرونت إند:** صفحة الوحدات المباعة (`/accounting/sold-units`) + تفاصيل الوحدة + توزيع العمولة (ملخص، جدول توزيعات، حفظ، تأكيد دفع).
- **الباك إند:** غير موجود في هذا الريبو (مشروع Vue فقط). التقرير يحدد ما يجب أن يوفره الباك إند والسيدر والترابط حتى يكون التوزيع «كامل».

---

## 2. الـ API المستخدمة من الفرونت

| الطريقة | المسار | الاستخدام |
|--------|--------|-----------|
| GET | `/accounting/sold-units` | قائمة الوحدات المباعة (مع commission_id إن وُجد). |
| GET | `/accounting/sold-units/:reservation_id` | تفاصيل وحدة مباعة (للتفاصيل + إنشاء عمولة). |
| GET | `/accounting/marketers` | قائمة المسوقين للقائمة المنسدلة (id, name). |
| POST | `/accounting/sold-units/:reservation_id/commission` | إنشاء عمولة يدوية للوحدة. |
| GET | `/accounting/commissions/:commission_id/summary` | ملخص العمولة (إجمالي، ضريبة، مصاريف، صافي، توزيعات). |
| PUT | `/accounting/commissions/:commission_id/distributions` | تحديث توزيعات العمولة (حفظ التوزيعات). |
| POST | `/accounting/commissions/:commission_id/distributions/:distribution_id/confirm` | تأكيد دفع توزيعة واحدة (زر «تأكيد»). |
| POST | `/accounting/commissions/:commission_id/distributions/:distribution_id/approve` | اعتماد توزيعة. |
| POST | `/accounting/commissions/:commission_id/distributions/:distribution_id/reject` | رفض توزيعة. |

---

## 3. شكل البيانات المتوقعة من الباك إند

### 3.1 GET `/accounting/sold-units`

- **Response:** `{ data: { data: [...], meta: { total } } }` أو `{ items, total }`.
- **كل عنصر:** `id`, `reservation_id`, `contract_unit_id`, `unit_number`, `project_name`, `commission_id` (إن وُجدت عمولة), `commission_percentage`, `commission_source`, `final_sale_price` / `total_value`, إلخ.

### 3.2 GET `/accounting/commissions/:id/summary`

- **Response:**  
  `total_before_tax` (أو `gross_amount`), `vat`, `marketing_expenses`, `bank_fees`, `net_amount`, `distributions: []`.
- **كل توزيعة في `distributions`:**  
  `id`, `type` أو `commission_type` (انظر أنواع التوزيع أدناه), `user_id`, `percentage`, `amount`, `confirmed` أو `status === 'confirmed'`, واختياريًا `employee_name`, `user_name`, `bank_account`, `external_name` (للمسوق الخارجي).

**ملاحظة:** الفرونت يستدعي `(Number(percentage) || 0).toFixed(2)` لعرض النسبة؛ الباك إند يفضّل إرجاع `percentage` كـ **number** لتجنب أخطاء من نوع `toFixed is not a function` إذا رُجع كنص.

### 3.3 PUT `/accounting/commissions/:id/distributions`

- **Body:** `{ distributions: [{ type, user_id?, percentage, external_name?, bank_account? }] }`.
- **أنواع `type` المعتمدة في الفرونت:**  
  `lead_generation`, `persuasion`, `closing`, `team_leader`, `assistant_pm`, `project_manager`, `owner`, `sales_manager`, `projects_department`, `management`, `ceo`, `external_marketer`, `other`.

---

## 4. أنواع التوزيع (للسيدر والترابط)

الفرونت يعرض ويحفظ التوزيعات حسب الأنواع التالية (نفس القيم يجب أن تدعمها جداول الباك إند والسيدر):

| type (API) | وصف بالواجهة |
|------------|----------------|
| lead_generation | عمولة الجلب |
| persuasion | عمولة الإقناع |
| closing | عمولة الإقفال |
| team_leader | قائد الفريق |
| assistant_pm | مساعد مدير مشروع |
| project_manager | مدير مشروع |
| owner | المالك |
| sales_manager | مدير المبيعات |
| projects_department | قسم المشاريع |
| management | الإدارة |
| ceo | CEO |
| external_marketer | مسوق خارجي / المالك |
| other | أخرى |

يُستحسن أن يكون في الباك إند جدول أو enum ثابت لهذه الأنواع (مثلاً `commission_distribution_types`) ويتم ملؤه من السيدر حتى يكون التوزيع والترابط «كامل» مع نفس القيم المستخدمة في الواجهة.

---

## 5. الترابط والكيانيات المتوقعة في الباك إند

حتى يكون توزيع العمولات كاملًا مع الداتا والسيدر والترابط، يُفترض وجود ما يلي (بدون تعديل على الكود الحالي، كمرجع للباك إند):

1. **عمولة (commission)**  
   - مرتبطة بـ reservation (أو contract_unit) و contract_unit_id.  
   - حقول مثل: إجمالي العمولة، نسبة السعي، مصدر العمولة (owner/buyer)، ضريبة، مصاريف تسويق، رسوم بنك، صافي للتوزيع.

2. **توزيعة عمولة (commission_distribution)**  
   - مرتبطة بـ commission.  
   - حقول: نوع التوزيع (type)، user_id (اختياري)، percentage، amount (محسوب أو مخزّن)، حالة (pending/confirmed/approved/rejected)، وللمسوق الخارجي: external_name، bank_account.

3. **ربط المستخدمين والمسوقين**  
   - `/accounting/marketers` يجب أن يرجع مستخدمين يمكن تعيينهم كـ user_id في التوزيعات (مثلاً دور مسوق أو مبيعات).  
   - الربط: توزيعة → user ← جدول users (أو employees).

4. **السيدر (Seed)**  
   - أنواع التوزيع: إما جدول ثابت (مثل `commission_distribution_types`) يُملأ بالسيدر بالقيم أعلاه، أو enum في الكود يطابقها.  
   - إن وُجدت قيم افتراضية لنسب (مثلاً 25% جلب، 30% إقناع، …) فيمكن أن تكون في سيدر أو config دون تغيير سلوك الفرونت الحالي.

5. **الحسابات**  
   - صافي المبلغ للتوزيع = إجمالي قبل الضريبة − ضريبة − مصاريف − رسوم بنك.  
   - مبلغ كل توزيعة = (صافي × نسبة التوزيعة) / 100.  
   - الفرونت يتحقق أن مجموع النسب = 100% قبل الحفظ؛ الباك إند يفضّل أن يتحقق أيضاً ويُرجع خطأ واضح إن لم يتطابق.

---

## 6. ملخص الفحص

| البند | الحالة |
|-------|--------|
| الفرونت: قائمة الوحدات المباعة + تفاصيل وحدة | مرتبط بـ GET sold-units و GET sold-units/:id |
| الفرونت: إنشاء عمولة يدوية | مرتبط بـ POST sold-units/:id/commission |
| الفرونت: ملخص العمولة (إجمالي، ضريبة، صافي، توزيعات) | مرتبط بـ GET commissions/:id/summary |
| الفرونت: حفظ توزيعات (نسب + أنواع) | مرتبط بـ PUT commissions/:id/distributions |
| الفرونت: تأكيد دفع توزيعة | مرتبط بـ POST .../distributions/:id/confirm |
| الفرونت: عرض المسوقين في القائمة المنسدلة | مرتبط بـ GET accounting/marketers |
| أنواع التوزيع (13 نوعاً) | محددة في الفرونت؛ يُستحسن توافقها مع جدول/سيدر في الباك إند |
| معالجة `percentage` كنص أو رقم | تم في الفرونت (استخدام Number قبل toFixed)؛ الباك إند يفضّل إرجاع number |

**خلاصة:** توزيع العمولات في قسم المحاسبة من جهة الفرونت **كامل** مع الـ API المتوقعة. ليكون «كامل مع الداتا بالسيدر والترابط» يلزم في الباك إند: جداول العمولة والتوزيعات، ربطها بالحجوزات/الوحدات والمستخدمين، وسيدر لأنواع التوزيع (والقيم الافتراضية إن وُجدت)، مع إرجاع `percentage` كـ number في summary/distributions.

---

## 7. تحديثات الباك إند والسيدر (ربط الأسماء والرواتب)

التوثيق التالي يلخص سلوك الباك إند بعد التعديلات على `AccountingSeeder` وما يتصل بها، لضمان توافق الواجهة مع الداتا.

### 7.1 عرض اسم الموظف المستفيد في الجدول

- **قائمة المستفيدين:** يُبنى في السيدر من مستخدمين فعليين (نوع: sales, marketing, project_management). إن كانت فارغة تُستخدم أي مستخدمين نشطين غير الأدمن.
- **تعيين user_id:** لأي توزيعة نوعها **ليس** `external_marketer` أو `other` يُعيّن دائماً `user_id` من هذه القائمة، حتى يظهر اسم الموظف المستفيد في الواجهة عبر العلاقة `user`.
- **وسيط خارجي / أخرى:** فقط التوزيعات من نوع `external_marketer` أو `other` تبقى بدون `user_id` وتستخدم `external_name` و `bank_account`.

**الفرونت:** عمود «اسم المستفيد» في جدول توزيع العمولة الصافية يعرض `employee_name` أو `user_name` أو `external_name` (من الـ API). الباك إند يرجّع اسم المستخدم المرتبط بـ `user_id` في الحقل `employee_name` أو `user_name` حتى تظهر الأسماء بشكل صحيح.

### 7.2 ربط العمولات بالشهر (لاحتساب الرواتب)

- **تواريخ الاعتماد:** جزء من العمولات يُسند لها `approved_at` داخل الشهر الحالي أو الشهر الماضي حتى تحتسب في رواتب نفس الشهر.
- **حالة التوزيعات:** إذا كانت العمولة معتمدة (`approved_at` غير null) فإن توزيعاتها تُسند بشكل عشوائي إلى `approved` أو `paid` حتى تدخل في مجموع عمولة الموظف للشهر (نفس منطق `AccountingSalaryService::getEmployeeCommissionsForMonth`).

### 7.3 ربط الرواتب بالعمولات الفعلية

- **استبدال الدالة:** تم استبدال `seedSalaryDistributions` بدالة جديدة: `seedSalaryDistributionsFromCommissions`.
- **المنطق:**  
  للأشهر المعنية (الشهر الحالي + الشهر الماضي)، ولكل موظف لديه راتب أساسي (`salary > 0`) في جدول المستخدمين:  
  `total_commissions` = مجموع مبالغ توزيعات العمولة المعتمدة (`status = approved`) لذلك الموظف (`user_id`) في ذلك الشهر، حسب `commission.approved_at` (نفس معيار السيرفس).  
  `base_salary` = من حقل `User.salary`.  
  `total_amount` = `base_salary` + `total_commissions`.  
  يتم إنشاء/تحديث سجل في `accounting_salary_distributions` لكل (موظف، شهر، سنة) بهذه القيم.
- **النتيجة:** جدول الرواتب يعكس فعلياً مجموع العمولات المعتمدة لكل موظف في كل شهر، ومرتبط بنفس بيانات توزيع العمولات التي تظهر في الواجهة (بما فيها اسم الموظف المستفيد).

### 7.4 الملف المعدّل (الباك إند)

`database/seeders/AccountingSeeder.php`:

- **seedCommissions:** إضافة منطق `approved_at` ضمن الشهر الحالي/السابق.
- **seedCommissionDistributions:** بناء قائمة مستفيدين وتعيين `user_id` دائماً (ما عدا external/other)، ومزامنة حالة التوزيع مع اعتماد العمولة.
- **seedSalaryDistributionsFromCommissions:** إنشاء توزيعات الرواتب من مجموع العمولات المعتمدة لكل موظف لكل شهر، مع استخدام `User.salary` كراتب أساسي.

بعد تشغيل السيدر: في جدول توزيع العمولات يظهر اسم الموظف المستفيد (من `user_id` عبر العلاقة user)، وفي جدول الرواتب يكون إجمالي العمولات والمجموع الكلي مرتبطين فعلياً بتوزيعات العمولة المعتمدة لكل شهر.

### 7.5 إشعار الموظف عند صرف العمولة

- **الترابط المطلوب:** عند نزول العمولة من الإدارة (تأكيد دفع التوزيعة أو اعتمادها)، يُرسل للموظف المستفيد (`user_id` في التوزيعة) إشعاراً بأنه تمت إرسال/صرف عمولة له.
- **التوقيت:** في نفس اللحظة التي يتم فيها تأكيد الدفع (مثلاً استدعاء `POST .../distributions/:id/confirm` أو تغيير الحالة إلى `paid`/`approved` في الباك إند).
- **تنفيذ الباك إند:** في معالج تأكيد الدفع أو اعتماد التوزيعة، بعد تحديث الحالة، إنشاء سجل إشعار (notification) مرتبط بالمستخدم `user_id` مع نص واضح (مثل «تم صرف عمولة لك» أو «تم إرسال عمولة») حتى يظهر في واجهة الإشعارات للموظف.
- **عرض موظف المحاسبة:** واجهة المحاسبة تعرض قائمة الرواتب وتفاصيل الراتب (اسم الموظف، عمولة من كل مشروع، إجمالي العمولات)؛ إشعار الموظف نفسه يُعرض في قسم إشعارات الموظف (و/أو في لوحة المحاسبة إن كان هناك تبويب إشعارات).
