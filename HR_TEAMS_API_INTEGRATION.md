# تكامل APIs إدارة الفرق في قسم الموارد البشرية

## نظرة عامة
تم تكامل جميع APIs الخاصة بإدارة الفرق في تبويبة "إدارة الفرق" ضمن قسم الموارد البشرية (HR).

## الـ APIs المستخدمة

### 1. فلترة وعرض الفرق (Teams → filter & Show)

#### GET /teams/index?search={name}
- **الغرض**: جلب قائمة الفرق مع إمكانية البحث بالاسم
- **الاستخدام في الواجهة**: 
  - عرض جميع الفرق في شبكة البطاقات
  - البحث عن فريق معين عبر حقل البحث
  - يتم حفظ `id` و `name` لكل فريق لاستخدامها في الطلبات اللاحقة
- **الموقع في الكود**: `hrService.getTeams(params)`

```javascript
// مثال للاستخدام
const teams = await hrService.getTeams({ search: 'اسم الفريق' })
// يعيد: [{ id: 1, name: 'فريق المبيعات', ... }, ...]
```

#### GET /teams/show/:id
- **الغرض**: عرض تفاصيل فريق محدد
- **الاستخدام**: للحصول على معلومات كاملة عن فريق معين
- **الموقع في الكود**: `hrService.getTeamById(teamId)`

---

### 2. العقود والمشاريع (GET_BY_TEAM)

#### GET /hr/teams/contracts/:id
- **الغرض**: الحصول على جميع العقود (المشاريع) المرتبطة بفريق معين
- **الاستخدام في الواجهة**:
  - عرض عدد المشاريع في بطاقة الفريق
  - فتح modal بقائمة المشاريع عند النقر على "المشاريع المرتبطة"
  - يظهر اسم المشروع، الموقع، عدد الوحدات، اسم المطور، السعر الإجمالي
- **الموقع في الكود**: `hrService.getTeamContracts(teamId)`

```javascript
// مثال للاستخدام في openProjectsModal
const contracts = await hrService.getTeamContracts(team.id)
// يعيد: [{ id: 1, project_name: 'مشروع الياسمين', city: 'الرياض', ... }, ...]
```

#### GET /hr/teams/contracts/locations/:id
- **الغرض**: الحصول على مواقع العقود الخاصة بفريق معين (المدينة، الحي)
- **الاستخدام في الواجهة**:
  - عرض موقع كل مشروع في modal المشاريع
  - عرض ملخص المواقع في بطاقة الفريق
- **الموقع في الكود**: `hrService.getTeamContractLocations(teamId)`

```javascript
// مثال للاستخدام
const locations = await hrService.getTeamContractLocations(team.id)
// يعيد: [{ city: 'الرياض', district: 'حي الياسمين', ... }, ...]
```

---

### 3. متوسط مبيعات الفريق

#### GET /hr/teams/sales-average/:id
- **الغرض**: الحصول على متوسط مبيعات الفريق
- **الاستخدام في الواجهة**:
  - عرض متوسط مبيع الفريق في بطاقة الفريق بدلاً من "متوسط تحقيق الأهداف"
  - يستخدم هذا الرقم لحساب تقدم الفريق نحو أهدافه
- **الموقع في الكود**: `hrService.getTeamSalesAverage(teamId)`

```javascript
// مثال للاستخدام
const salesAvg = await hrService.getTeamSalesAverage(team.id)
// يعيد: { average: 2.5 } أو رقم مباشر
```

---

## سير العمل في الواجهة

### 1. تحميل الفرق (loadTeams)
```javascript
async loadTeams() {
  // 1. جلب قائمة الفرق من /teams/index
  const teams = await hrService.getTeams({ search: teamSearchQuery })
  
  // 2. لكل فريق، جلب البيانات الإضافية بشكل متوازي
  for (team of teams) {
    // 2.1 عدد العقود/المشاريع
    const contracts = await hrService.getTeamContracts(team.id)
    team.soldProjects = contracts.length
    
    // 2.2 متوسط المبيعات
    const salesAvg = await hrService.getTeamSalesAverage(team.id)
    team.salesAverage = salesAvg
    
    // 2.3 المواقع
    const locations = await hrService.getTeamContractLocations(team.id)
    team.locations = locations.map(loc => `${loc.city} ${loc.district}`).join('، ')
  }
}
```

### 2. عرض المشاريع (openProjectsModal)
```javascript
async openProjectsModal(team) {
  // 1. جلب العقود
  const contracts = await hrService.getTeamContracts(team.id)
  
  // 2. لكل عقد، جلب تفاصيل الموقع
  const locations = await hrService.getTeamContractLocations(team.id)
  
  // 3. دمج البيانات وعرضها في modal
  teamProjects = contracts.map(contract => ({
    ...contract,
    city: locations.find(loc => loc.contract_id === contract.id)?.city,
    district: locations.find(loc => loc.contract_id === contract.id)?.district
  }))
}
```

---

## التحسينات المضافة

### 1. تصميم بطاقة الفريق
- ✅ عرض "متوسط مبيع الفريق" بدلاً من "متوسط تحقيق الأهداف"
- ✅ عرض "المشاريع المرتبطة" بشكل قابل للنقر مع أيقونة بيت
- ✅ تأثيرات hover فاخرة للعناصر القابلة للنقر
- ✅ عرض ملخص المواقع في بطاقة الفريق

### 2. modal المشاريع
- ✅ لافتة معلومات تُظهر الـ APIs المستخدمة
- ✅ حالة تحميل (spinner) مع رسالة واضحة
- ✅ حالة فارغة إذا لم يكن هناك مشاريع
- ✅ عرض كامل لتفاصيل المشروع:
  - اسم المشروع
  - الموقع (مدينة - حي)
  - عدد الوحدات
  - اسم المطور
  - السعر الإجمالي
- ✅ تأثيرات hover فاخرة لكل عنصر مشروع

### 3. تحسين الأداء
- ✅ استخدام `Promise.all` لتحميل البيانات بشكل متوازي
- ✅ معالجة الأخطاء بشكل آمن (try-catch)
- ✅ fallback إلى بيانات افتراضية في حالة فشل الـ API
- ✅ تحسين UX بحالات التحميل والرسائل الواضحة

### 4. البحث والفلترة
- ✅ حقل بحث لتصفية الفرق بالاسم
- ✅ تحديث تلقائي للبيانات عند تغيير نص البحث
- ✅ استجابة فورية للمستخدم

---

## الملفات المعدلة

### 1. `src/services/hrService.js`
- تحديث تعليقات `getTeams` لتوضيح أنها API التصفية
- إضافة/تحديث جميع الدوال المتعلقة بالفرق والعقود

### 2. `src/views/HRView.vue`
- تحديث `loadTeams()` لجلب البيانات المكثفة
- تحديث `openProjectsModal()` لدمج بيانات المواقع
- إضافة UI جديد لعرض متوسط المبيعات
- إضافة تصميم فاخر للعناصر القابلة للنقر
- إضافة لافتة معلومات API في modal
- إضافة حالات تحميل وفارغة محسّنة

---

## ملاحظات للمطورين

1. **حفظ الـ ID**: يتم حفظ `team.id` لكل فريق لاستخدامه في جميع الطلبات اللاحقة
2. **معالجة الأخطاء**: جميع طلبات API محمية بـ try-catch مع fallback
3. **الأداء**: استخدام `Promise.all` لتحميل البيانات المتعددة بشكل متوازي
4. **UX**: حالات تحميل وفارغة واضحة لتحسين تجربة المستخدم
5. **التصميم**: جميع العناصر متوافقة مع نظام الألوان الفاخر (Navy & Gold)

---

## الاختبار

للتأكد من التكامل الصحيح:

1. ✅ افتح تبويبة "إدارة الفرق" في قسم HR
2. ✅ تحقق من تحميل جميع الفرق مع بياناتهم
3. ✅ جرّب البحث عن فريق معين
4. ✅ اضغط على "المشاريع المرتبطة" لفتح modal
5. ✅ تحقق من عرض جميع تفاصيل المشروع بشكل صحيح
6. ✅ تحقق من عرض متوسط مبيع الفريق

---

## الخطوات المستقبلية (اختياري)

- [ ] إضافة pagination للمشاريع إذا كان العدد كبيراً
- [ ] إضافة فلترة المشاريع حسب الحالة
- [ ] إضافة إحصائيات إضافية للفريق (total value، أفضل مسوق، إلخ)
- [ ] إضافة رسوم بيانية لأداء الفريق عبر الوقت

---

**تم التنفيذ بنجاح ✨**
