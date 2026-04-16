# Sales Targets API — ملخص شامل

## معلومات عامة
- **Backend:** Laravel
- **Base URL:** `{{base_url}}`
- **Auth:** Bearer Token (يُستخرج من Login)
- **بيانات تجريبية:**
  - Leader: `sales.leader@rakez.com` / `password`
  - Marketer: `sales@rakez.com` / `password`

---

## 📁 1. Auth

| الاسم | الميثود | المسار | الوصف |
| :-- | :-- | :-- | :-- |
| Login - Sales Leader | POST | `/api/login` | تسجيل دخول القائد، يُعيد Bearer Token |
| Login - Sales Marketer | POST | `/api/login` | تسجيل دخول المسوّق، يُعيد Bearer Token |
| Get Authenticated User | GET | `/api/user` | جلب بيانات المستخدم الحالي من التوكن |
| Logout - Active Token | POST | `/api/logout` | إلغاء التوكن الحالي |

---

## 📁 2. Sales Target Setup (Leader Team)
يُستخدم من قِبل القائد لإعداد الأهداف وتعيينها للمسوّقين.

| الاسم | الميثود | المسار | الوصف |
| :-- | :-- | :-- | :-- |
| Get Team Projects | GET | `/api/sales/team/projects?per_page={{per_page}}` | جلب المشاريع المكتملة المرتبطة بفريق القائد عبر `contract_team`. المصدر الأساسي لـ `contract_id` |
| Get Team Members | GET | `/api/sales/team/members?with_ratings=true` | جلب أعضاء الفريق المتاحين للتعيين (مسوّقون فقط، ليس مديرين). المصدر الأساسي لـ `assignee_marketer_id` |
| Get Project Units | GET | `/api/sales/projects/{{contract_id}}/units?per_page={{per_page}}` | جلب وحدات مشروع معين. يُستخدم بعد اختيار `contract_id` |
| Get My Targets - Leader View | GET | `/api/sales/targets/my?per_page={{per_page}}` | عرض بطاقات المشاريع من منظور القائد (مصدرها `contract_team`، ليست صفوف `SalesTarget`) |
| Get Targets By Project | GET | `/api/sales/targets/by-project/{{contract_id}}` | جلب الأهداف المعيّنة لمسوّقي الفريق في مشروع محدد |
| Create Target - Single Unit | POST | `/api/sales/targets` | إنشاء هدف أداء لوحدة واحدة (`must_sell_units_count` + `assigned_target_value` اختياري) |
| Create Target - Multi Units | POST | `/api/sales/targets` | إنشاء هدف أداء لعدد N من الوحدات |
| Create Target - Project Level (No Unit)| POST | `/api/sales/targets` | إنشاء هدف على مستوى المشروع كاملاً دون تحديد وحدة. الرد يتضمن `project_location` |

> **ملاحظة:** جميع عمليات الإنشاء تذهب لنفس المسار `POST /api/sales/targets` بـ body مختلف. الـ API لا تُعيّن inventory، بل تُحدد أهداف أداء فقط.

---

## 📁 3. Sales Target Actions (Assigned Marketer)
يُستخدم من قِبل المسوّق لعرض وتحديث أهدافه.

| الاسم | الميثود | المسار | الوصف |
| :-- | :-- | :-- | :-- |
| Get My Targets - Marketer View | GET | `/api/sales/targets/my?per_page={{per_page}}` | جلب الأهداف المعيّنة للمسوّق شخصياً فقط |
| Get Targets By Project - Marketer | GET | `/api/sales/targets/by-project/{{contract_id}}` | جلب أهداف مشروع معين من منظور المسوّق |
| Update Target Status - In Progress | PATCH | `/api/sales/targets/{{target_id}}` | تحديث حالة الهدف إلى "قيد التنفيذ" |
| Update Target Status - Completed | PATCH | `/api/sales/targets/{{target_id}}` | تحديث حالة الهدف إلى "مكتمل" |

---

## تدفق العمل الكامل (Suggested Workflow)
1. **Login - Sales Leader** -> الحصول على Bearer Token للقائد
2. **Get Team Projects** -> الحصول على `contract_id`
3. **Get Team Members** -> الحصول على `assignee_marketer_id`
4. **Get Project Units** -> (اختياري) تفاصيل الوحدات
5. **Create Target** -> إنشاء الهدف (Single / Multi / Project Level)
6. **Get Targets By Project** -> التحقق من الأهداف من منظور القائد
7. **Login - Sales Marketer** -> الحصول على Bearer Token للمسوّق
8. **Get My Targets - Marketer** -> عرض الأهداف المعيّنة للمسوّق
9. **Update Target Status** -> تحديث حالة الهدف

---

## المتغيرات المستخدمة

| المتغير | الوصف |
| :-- | :-- |
| `{{base_url}}` | عنوان الـ API الأساسي |
| `{{contract_id}}` | معرّف المشروع (من `Get Team Projects`) |
| `{{target_id}}` | معرّف الهدف (من `Create Target`) |
| `{{per_page}}` | عدد النتائج في الصفحة |
| `{{assignee_marketer_id}}` | معرّف المسوّق المُعيَّن (من `Get Team Members`) |
| `{{marketer_id}}` | معرّف المسوّق الاحتياطي |

---

## قواعد العمل (Business Rules)
- القائد يرى فقط المشاريع المكتملة المرتبطة بفريقه عبر `contract_team`.
- القائد يُعيّن الأهداف فقط لمسوّقين في نفس فريقه (ليس مديرين).
- المسوّق يرى فقط الأهداف المعيّنة له شخصياً.
- الربط بين الفريق والمشاريع يتم من نظام إدارة المشاريع (Project Management).
