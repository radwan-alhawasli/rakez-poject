# 🎯 وثائق قسم التسويق - Marketing Module Documentation

## 📋 نظرة عامة

تم إعادة بناء قسم التسويق بشكل احترافي ومتكامل بناءً على الـ API المخصصة لـ Marketing من Postman Collection، مع مراعاة التصميم الفاخر والمتفق عليه للموقع.

---

## 🏗️ البنية الهندسية

### 1. الملفات المُنشأة

#### `src/services/marketingService.js`
**الوصف:** خدمة متكاملة لجميع عمليات API الخاصة بالتسويق.

**الوظائف المتاحة:**
```javascript
// Dashboard
- getDashboard() // جلب إحصائيات لوحة التحكم

// Projects
- getProjects() // جلب قائمة المشاريع التسويقية
- getProjectById(id) // جلب تفاصيل مشروع محدد
- calculateBudget({ contract_id, unit_price }) // حساب الميزانية التسويقية

// Plans
- getDeveloperPlan(id) // جلب خطة المطور
- storeDeveloperPlan(payload) // إنشاء خطة مطور جديدة
- getEmployeePlans(projectId) // جلب خطط الموظفين لمشروع معين
- autoGenerateEmployeePlan(payload) // توليد خطة موظف تلقائياً

// Tasks
- getTasks() // جلب قائمة المهام التسويقية
- updateTaskStatus(taskId, status) // تحديث حالة مهمة

// Leads
- getLeads() // جلب قائمة العملاء المحتملين
- storeLead(payload) // إضافة عميل محتمل جديد
```

#### `src/views/MarketingView.vue`
**الوصف:** الواجهة الرئيسية لقسم التسويق مع 4 تبويبات رئيسية.

**التبويبات:**
1. **Dashboard** - لوحة التحكم التسويقية
2. **Projects** - المشاريع التسويقية
3. **Tasks** - المهام التسويقية
4. **Leads** - العملاء المحتملون

---

## 🎨 التصميم والـ UI

### لوحة التحكم - Dashboard

#### مؤشرات الأداء الرئيسية (KPIs)
```
┌─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┐
│  إجمالي المشاريع    │  العملاء المحتملون  │    المهام النشطة    │   إجمالي الميزانية   │
│  Total Projects     │    Total Leads      │   Active Tasks      │   Total Budget      │
│                     │                     │                     │                     │
│       🏠 12         │       👥 48         │       ✅ 7          │   💰 350,000 ريال   │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘
```

#### مخطط بياني
- عرض توزيع العملاء المحتملين حسب المصدر
- المشاريع النشطة والمكتملة

### المشاريع التسويقية - Projects

#### خصائص كل مشروع:
- **اسم المشروع** (Project Name)
- **المطور** (Developer Name)
- **الموقع** (Location/City)
- **الميزانية التسويقية** (Marketing Budget)
- **الحالة** (Status): نشط / مكتمل / معلق / ملغي

#### الإجراءات المتاحة:
- 👁️ **عرض التفاصيل** - View project details
- 📋 **إدارة الخطة** - Manage marketing plan
- 💰 **حساب الميزانية** - Calculate budget

### المهام التسويقية - Tasks

#### خصائص كل مهمة:
- **العنوان** (Title)
- **الوصف** (Description)
- **المشروع المرتبط** (Associated Project)
- **تاريخ الاستحقاق** (Due Date)
- **الحالة** (Status): مكتملة / قيد التنفيذ / معلقة

#### الإجراءات المتاحة:
- ✅ تحديد كمكتملة (Mark as completed)
- تغيير الحالة بنقرة واحدة

### العملاء المحتملون - Leads

#### جدول شامل يعرض:
| الاسم | معلومات الاتصال | المصدر | المشروع | التاريخ | الإجراءات |
|------|----------------|--------|---------|---------|-----------|
| أحمد | ahmed@mail.com | Snapchat | مشروع A | 26/01/2026 | 👁️ |

#### المصادر المدعومة:
- 📸 **Snapchat** (سناب شات)
- 📷 **Instagram** (إنستجرام)
- 🐦 **Twitter/X** (تويتر)
- 📘 **Facebook** (فيسبوك)
- 🔍 **Google Ads** (إعلانات جوجل)
- 🌐 **Website** (الموقع الإلكتروني)
- 🤝 **Referral** (إحالة)
- ⚫ **Other** (آخر)

---

## 🔗 API Integration

### Base URL
```
{{base_url}}/api/marketing/
```

### Endpoints

#### 1. Dashboard
```http
GET /marketing/dashboard
Authorization: Bearer {{token}}

Response:
{
  "data": {
    "total_projects": 12,
    "total_leads": 48,
    "active_tasks": 7,
    "total_budget": 350000
  }
}
```

#### 2. Projects
```http
GET /marketing/projects
Authorization: Bearer {{token}}

Response:
{
  "data": [
    {
      "id": 1,
      "project_name": "مشروع النرجس",
      "developer_name": "شركة التطوير",
      "city": "الرياض",
      "marketing_budget": 35000,
      "status": "active"
    }
  ]
}
```

#### 3. Calculate Budget
```http
POST /marketing/projects/calculate-budget
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "contract_id": 1,
  "unit_price": 1000000
}

Response:
{
  "data": {
    "calculated_budget": 35000,
    "average_cpm": 25,
    "average_cpc": 2.5
  }
}
```

#### 4. Tasks
```http
GET /marketing/tasks
Authorization: Bearer {{token}}

Response:
{
  "data": [
    {
      "id": 1,
      "title": "إطلاق حملة سناب شات",
      "description": "حملة إعلانية على سناب شات",
      "project_name": "مشروع النرجس",
      "status": "in-progress",
      "due_date": "2026-02-01",
      "created_at": "2026-01-26"
    }
  ]
}
```

#### 5. Update Task Status
```http
PATCH /marketing/tasks/:id/status
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "status": "completed"
}
```

#### 6. Leads
```http
GET /marketing/leads
Authorization: Bearer {{token}}

Response:
{
  "data": [
    {
      "id": 1,
      "name": "أحمد محمد",
      "contact_info": "ahmed@example.com",
      "source": "Snapchat",
      "project_name": "مشروع النرجس",
      "created_at": "2026-01-26"
    }
  ]
}
```

#### 7. Store Lead
```http
POST /marketing/leads
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "أحمد محمد",
  "contact_info": "ahmed@example.com",
  "source": "Snapchat",
  "project_id": 1
}
```

---

## 🚀 كيفية الاستخدام

### 1. تسجيل الدخول كمسوق (Marketing Role)

```javascript
// Role ID: 0 (Marketing)
localStorage.setItem('userRole', '0')
localStorage.setItem('userType', 'marketing')
```

### 2. الوصول إلى لوحة التحكم

عند تسجيل الدخول كمسوق، سيتم توجيهك تلقائياً إلى:
```
/marketing/dashboard
```

### 3. التنقل بين التبويبات

#### عبر الـ Sidebar:
- **لوحة التحكم**: `/marketing/dashboard`
- **المشاريع التسويقية**: `/marketing/projects`
- **المهام التسويقية**: `/marketing/tasks`
- **العملاء المحتملون**: `/marketing/leads`

#### عبر الكود:
```javascript
// Vue Router
this.$router.push('/marketing/projects')

// Composition API
import { useRouter } from 'vue-router'
const router = useRouter()
router.push('/marketing/tasks')
```

---

## 🎯 الميزات الرئيسية

### 1. Dashboard التفاعلي
✅ 4 KPI Cards فاخرة التصميم
✅ Animations سلسة عند التحميل (staggered animations)
✅ Icons ملونة مع تأثيرات blur خلفية
✅ أرقام إنجليزية (Western numerals) حسب المتفق عليه

### 2. إدارة المشاريع
✅ عرض شبكي (Grid View) متجاوب
✅ حساب الميزانية التسويقية تلقائياً
✅ حالات متعددة للمشاريع (نشط، مكتمل، معلق، ملغي)
✅ تكامل كامل مع API

### 3. إدارة المهام
✅ قائمة مهام تفاعلية
✅ تحديث الحالة بنقرة واحدة
✅ Checkbox فاخر التصميم
✅ عرض تاريخ الاستحقاق

### 4. إدارة العملاء المحتملين
✅ جدول فاخر قابل للفرز
✅ إضافة عملاء جدد عبر Modal
✅ مصادر متعددة مع ألوان مميزة
✅ ربط العملاء بالمشاريع

### 5. التصميم الفاخر
✅ تطابق كامل مع تصميم الموقع
✅ ألوان ذهبية (#B1A28F) وكحلي (#1e3a5f)
✅ Shadows متعددة الطبقات
✅ Glassmorphism effects
✅ Hover animations سلسة
✅ Responsive على جميع الشاشات

---

## 📱 Responsive Design

### Breakpoints

#### Mobile (< 768px)
- Stats Grid: عمود واحد
- Projects Grid: عمود واحد
- Table: Horizontal scroll
- Welcome Title: 24px

#### Tablet (768px - 1024px)
- Stats Grid: عمودين
- Projects Grid: عمودين
- Table: عرض كامل

#### Desktop (> 1024px)
- Stats Grid: 4 أعمدة
- Projects Grid: 3 أعمدة
- Table: عرض كامل مع مساحة إضافية

---

## 🎨 الألوان والأنماط

### Primary Colors
```css
--primary-gold: #B1A28F;
--primary-navy: #1e3a5f;
--secondary-gold: #8c7851;
--secondary-navy: #2d5a8f;
```

### Status Colors
```css
--status-active: #10b981 (Green)
--status-completed: #3b82f6 (Blue)
--status-pending: #f59e0b (Orange)
--status-cancelled: #ef4444 (Red)
```

### Shadows
```css
box-shadow: 
  0 4px 6px -1px rgba(30, 58, 95, 0.03),
  0 10px 20px -5px rgba(30, 58, 95, 0.05),
  0 0 0 1px rgba(177, 162, 143, 0.1);
```

### Hover Effects
```css
.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 12px 24px -4px rgba(30, 58, 95, 0.1),
    0 20px 40px -8px rgba(177, 162, 143, 0.15);
}
```

---

## 🔐 Authentication & Authorization

### Role-Based Access Control

#### Marketing Role (ID: 0)
```javascript
// في router/index.js
if (user && user.type == 0) {
  next('/marketing/dashboard')
}
```

#### Sidebar Visibility
```vue
<!-- في MainLayout.vue -->
<template v-else-if="userRole == 0">
  <!-- Marketing Sidebar Items -->
</template>
```

---

## 🧪 Testing

### 1. Manual Testing

#### Dashboard
- [ ] التحقق من عرض KPIs صحيحة
- [ ] التحقق من Animations عند التحميل
- [ ] التحقق من المخطط البياني (Placeholder)

#### Projects
- [ ] عرض قائمة المشاريع
- [ ] فتح تفاصيل مشروع
- [ ] حساب الميزانية
- [ ] إدارة الخطة

#### Tasks
- [ ] عرض قائمة المهام
- [ ] تحديث حالة مهمة
- [ ] عرض Checkbox بشكل صحيح

#### Leads
- [ ] عرض جدول العملاء
- [ ] إضافة عميل جديد
- [ ] عرض ألوان المصادر
- [ ] ربط عميل بمشروع

### 2. API Testing

استخدم Postman Collection المرفقة:
```
Rakez ERP - Frontend API (Sales, Marketing, AI).postman_collection.json
```

---

## 🐛 Debugging

### Console Logs

جميع API Calls تحتوي على console.log للـ debugging:

```javascript
console.log('📊 Fetching marketing dashboard...')
console.log('✅ Dashboard data:', response.data)
console.log('❌ Error fetching marketing dashboard:', error)
```

### Error Handling

```javascript
try {
  // API Call
} catch (error) {
  console.error('❌ Error:', error)
  // Fallback to mock data or show alert
}
```

---

## 📦 Dependencies

### Required Packages
```json
{
  "vue": "^3.x",
  "vue-router": "^4.x",
  "axios": "^1.x"
}
```

### Imports في MarketingView.vue
```javascript
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import marketingService from '../services/marketingService'
import notificationService from '../services/notificationService'
```

---

## 🚀 Deployment

### Build للإنتاج
```bash
npm run build
```

### Environment Variables
```env
VITE_API_BASE_URL=https://your-api.com/api
```

---

## 📝 Notes

### ملاحظات مهمة:
1. ✅ جميع الأرقام معروضة بالأرقام الإنجليزية (Western numerals)
2. ✅ التصميم متجاوب مع جميع الشاشات
3. ✅ تكامل كامل مع API المخصصة
4. ✅ Error handling شامل مع fallback data
5. ✅ Loading states لكل قسم
6. ✅ Empty states احترافية
7. ✅ Modals فاخرة للإدخال

### المهام المستقبلية (TODO):
- [ ] إضافة مخططات بيانية حقيقية (Charts)
- [ ] إضافة Export to PDF/Excel
- [ ] إضافة Advanced Filters
- [ ] إضافة Bulk Operations
- [ ] إضافة Real-time Notifications (Pusher)

---

## 👤 الدعم والمساعدة

للحصول على المساعدة أو الإبلاغ عن مشكلة:
- استخدم Console للتحقق من الأخطاء
- راجع API Documentation في Postman
- تحقق من Network Tab في DevTools

---

## 📄 License

هذا المشروع محمي بحقوق الملكية © 2026 Rakez Real Estate.

---

**تم إنشاؤه بواسطة:** AI Assistant
**التاريخ:** 26 يناير 2026
**الإصدار:** 1.0.0

🎉 **قسم التسويق جاهز للاستخدام!**
