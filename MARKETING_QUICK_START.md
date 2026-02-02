# 🚀 دليل البدء السريع - Marketing Quick Start

## ⚡ 3 خطوات للبدء

### 1️⃣ تشغيل التطبيق

```bash
# تثبيت المكتبات (إذا لم يتم بعد)
npm install

# تشغيل بيئة التطوير
npm run dev
```

### 2️⃣ تسجيل الدخول كمسوق

**عبر واجهة تسجيل الدخول:**
```
Email: marketing@rakez.com
Password: password
```

**أو تعديل localStorage مباشرة (للاختبار):**
```javascript
localStorage.setItem('token', 'your-token-here')
localStorage.setItem('userName', 'محمد التسويقي')
localStorage.setItem('userRole', '0') // Marketing role
localStorage.setItem('userType', 'marketing')
```

### 3️⃣ الانتقال للوحة التحكم

سيتم التوجيه تلقائياً إلى:
```
http://localhost:5173/marketing/dashboard
```

---

## 🎯 العمليات الأساسية

### ✅ عرض المشاريع التسويقية

1. **انقر على "المشاريع التسويقية" في Sidebar**
2. **أو انتقل إلى:** `/marketing/projects`
3. **سترى:** قائمة المشاريع في Grid View

### ✅ حساب الميزانية

1. **اضغط على زر "حساب الميزانية"**
2. **أدخل:**
   - رقم العقد (Contract ID)
   - سعر الوحدة (Unit Price)
3. **اضغط "حساب"**
4. **ستظهر:** الميزانية المحسوبة

### ✅ إضافة عميل محتمل جديد

1. **انتقل إلى تبويب "العملاء المحتملون"**
2. **اضغط زر "+ إضافة عميل محتمل"**
3. **املأ البيانات:**
   - الاسم (مطلوب)
   - معلومات الاتصال (مطلوب)
   - المصدر (مطلوب)
   - المشروع (اختياري)
4. **اضغط "حفظ"**

### ✅ تحديث حالة مهمة

1. **انتقل إلى تبويب "المهام التسويقية"**
2. **اضغط على Checkbox بجانب المهمة**
3. **ستتغير الحالة تلقائياً**

---

## 🎨 التنقل في الواجهة

### Sidebar (القائمة الجانبية)

```
┌─────────────────────────┐
│  📊 لوحة التحكم          │
│  🔔 الإشعارات           │
│  🏠 المشاريع التسويقية  │
│  ✅ المهام التسويقية    │
│  👥 العملاء المحتملون   │
│  📋 طلباتي              │
│  👤 الملف الشخصي         │
└─────────────────────────┘
```

### Dashboard Tabs

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Dashboard   │   Projects   │    Tasks     │    Leads     │
│  (Default)   │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 🔍 استكشاف الأخطاء

### ❌ المشروع: "لا توجد مشاريع تسويقية حالياً"

**الحل:**
1. تحقق من Console (F12)
2. ابحث عن:
   ```
   📋 Fetching marketing projects...
   ✅ Projects loaded: X projects
   ```
3. إذا كان 0، تحقق من API connection
4. أو استخدم Mock data للاختبار

### ❌ التوجيه: لا يتم التوجيه إلى `/marketing/dashboard`

**الحل:**
1. تحقق من `userRole` في localStorage:
   ```javascript
   console.log(localStorage.getItem('userRole')) // يجب أن يكون "0"
   ```
2. إذا لم يكن 0، قم بتعديله:
   ```javascript
   localStorage.setItem('userRole', '0')
   ```
3. أعد تحميل الصفحة

### ❌ Sidebar: لا يظهر Marketing items

**الحل:**
1. تحقق من `userRole` في MainLayout.vue
2. يجب أن يكون الشرط:
   ```vue
   <template v-else-if="userRole == 0">
   ```
3. إذا لم يظهر، تحقق من قيمة `userRole` في Component:
   ```javascript
   console.log('User Role:', this.userRole)
   ```

---

## 🧪 اختبار البيانات

### Mock Data للاختبار

إذا لم تكن API متصلة، استخدم Mock data:

```javascript
// في marketingService.js - getDashboard()
const mockData = {
  total_projects: 12,
  total_leads: 48,
  active_tasks: 7,
  total_budget: 350000
}
```

---

## 📱 التجربة على أجهزة مختلفة

### Desktop (1920x1080)
```
✅ Full sidebar with text
✅ 4-column KPI grid
✅ 3-column projects grid
✅ Full table view
```

### Tablet (768x1024)
```
✅ Collapsible sidebar
✅ 2-column KPI grid
✅ 2-column projects grid
✅ Full table view
```

### Mobile (375x667)
```
✅ Hidden sidebar (toggle button)
✅ 1-column KPI grid
✅ 1-column projects grid
✅ Horizontal scroll table
```

---

## 🎯 نصائح مفيدة

### 1. استخدم Console للـ Debugging
```javascript
// افتح Console (F12)
// ستجد logs مفيدة:
📊 Fetching marketing dashboard...
✅ Dashboard loaded
📋 Loading marketing projects...
✅ Projects loaded: 3 projects
```

### 2. استخدم Vue DevTools
```
تثبيت Vue DevTools Extension للمتصفح
لمراقبة State و Components
```

### 3. استخدم Network Tab
```
افتح Network Tab (F12)
راقب API calls و responses
تحقق من Status codes
```

---

## 🔐 الصلاحيات

### Marketing Role (0)

**يمكنه:**
- ✅ عرض Dashboard التسويقي
- ✅ إدارة المشاريع التسويقية
- ✅ إدارة المهام التسويقية
- ✅ إدارة العملاء المحتملين
- ✅ حساب الميزانيات
- ✅ إضافة Leads جديدة

**لا يمكنه:**
- ❌ إدارة المستخدمين (Admin only)
- ❌ إدارة الفرق (HR only)
- ❌ إدارة العقود (PM only)

---

## 📞 الحصول على المساعدة

### 1. Documentation
```
📄 MARKETING_MODULE_DOCUMENTATION.md
```

### 2. API Specs
```
📄 Rakez ERP - Frontend API (Sales, Marketing, AI).postman_collection.json
```

### 3. Code Comments
```javascript
// جميع الملفات تحتوي على comments توضيحية
```

---

## ✅ Checklist - التأكد من التثبيت الصحيح

- [ ] ✅ تم تشغيل `npm install`
- [ ] ✅ تم تشغيل `npm run dev`
- [ ] ✅ يمكن الوصول إلى `/marketing/dashboard`
- [ ] ✅ Sidebar يظهر Marketing items
- [ ] ✅ Dashboard يعرض KPIs
- [ ] ✅ Projects tab يعمل
- [ ] ✅ Tasks tab يعمل
- [ ] ✅ Leads tab يعمل
- [ ] ✅ Modals تفتح وتغلق بشكل صحيح
- [ ] ✅ Responsive على Mobile
- [ ] ✅ Console لا يحتوي على أخطاء

---

## 🎉 مبروك!

أنت الآن جاهز لاستخدام قسم التسويق! 🚀✨

**وقت القراءة:** 5 دقائق
**وقت التطبيق:** 2 دقائق
**مستوى الصعوبة:** ⭐ سهل

---

**تاريخ الإنشاء:** 26 يناير 2026
**الإصدار:** 1.0.0
