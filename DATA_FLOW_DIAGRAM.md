# 📊 رسم تدفق البيانات - تكامل APIs إدارة الفرق

## المخطط الكامل

```
┌─────────────────────────────────────────────────────────────────────┐
│                         المستخدم (HR User)                          │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    فتح تبويبة "إدارة الفرق"                         │
│                  watch(activeTab) → loadTeams()                     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  GET /teams/index?search={query}                    │
│                     (جلب قائمة الفرق)                               │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Response Data  │
                    │  [{id, name}]   │
                    └────────┬────────┘
                             │
                 ┌───────────┴───────────┐
                 │  Promise.all() Loop   │
                 │  (لكل فريق بشكل متوازي)│
                 └───────────┬───────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ GET /hr/teams/   │ │ GET /hr/teams/   │ │ GET /hr/teams/  │
│ contracts/:id    │ │ contracts/       │ │ sales-average/  │
│                  │ │ locations/:id    │ │ :id             │
│ (جلب المشاريع)   │ │ (جلب المواقع)    │ │ (متوسط المبيعات)│
└────────┬─────────┘ └────────┬─────────┘ └────────┬────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    [contracts]           [locations]          {average}
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Enrich Team   │
                    │   Data Object   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  team: {        │
                    │   id: 1,        │
                    │   name: "...",  │
                    │   soldProjects, │
                    │   salesAverage, │
                    │   locations     │
                    │  }              │
                    └────────┬────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       عرض بطاقات الفرق                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                          │
│  │ Team 1   │  │ Team 2   │  │ Team 3   │                          │
│  │ متوسط: 2.5│  │ متوسط: 1.8│  │ متوسط: 3.2│                          │
│  │ 12 مشروع │  │ 4 مشاريع │  │ 24 مشروع │                          │
│  └──────────┘  └──────────┘  └──────────┘                          │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                   المستخدم ينقر على │
                     "12 مشروع"      │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  openProjectsModal(team)                            │
│                  showProjectsModal = true                           │
│                  isLoadingDetails = true                            │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│              عرض Modal مع Spinner                                    │
│              "جاري تحميل المشاريع من الخادم..."                      │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌─────────────────────┐               ┌─────────────────────┐
│ GET /hr/teams/      │               │ GET /hr/teams/      │
│ contracts/:id       │               │ contracts/          │
│                     │               │ locations/:id       │
│ (جلب عقود الفريق)   │               │ (جلب مواقع العقود)  │
└──────────┬──────────┘               └──────────┬──────────┘
           │                                     │
           ▼                                     ▼
    [contracts]                            [locations]
           │                                     │
           └─────────────┬───────────────────────┘
                         │
                         ▼
                ┌────────────────┐
                │  Merge Data    │
                │  (contract +   │
                │   location)    │
                └────────┬───────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  enrichedContracts: [  │
            │   {                    │
            │     project_name,      │
            │     city,              │
            │     district,          │
            │     unit_count,        │
            │     developer_name,    │
            │     total_price        │
            │   }                    │
            │  ]                     │
            └────────┬───────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│               isLoadingDetails = false                              │
│               عرض قائمة المشاريع في Modal                            │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  ℹ️ البيانات محملة من: GET /hr/teams/contracts/:id و      │   │
│  │     GET /hr/teams/contracts/locations/:id                   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  📍 مشروع الياسمين                                         │   │
│  │  🏠 الرياض - حي الياسمين                                   │   │
│  │  🏘️ 50 وحدات | 👤 شركة البناء | 💰 5,000,000 ريال       │   │
│  │                                            [✅ نشط]          │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  📍 مشروع النرجس                                           │   │
│  │  🏠 جدة - أبحر الشمالية                                   │   │
│  │  🏘️ 30 وحدات | 👤 مؤسسة التطوير | 💰 3,200,000 ريال     │   │
│  │                                            [✅ نشط]          │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## التفاصيل التقنية

### 1. مرحلة تحميل الفرق (loadTeams)

```javascript
// الخطوة 1: جلب قائمة الفرق الأساسية
const teams = await hrService.getTeams({ search: teamSearchQuery })
// يعيد: [{ id: 1, name: 'فريق المبيعات' }, ...]

// الخطوة 2: إثراء بيانات كل فريق (بالتوازي)
const enrichedTeams = await Promise.all(
  teams.map(async (team) => {
    // 2.1 جلب العقود
    const contracts = await hrService.getTeamContracts(team.id)
    const projectsCount = contracts.length

    // 2.2 جلب متوسط المبيعات
    const salesAvg = await hrService.getTeamSalesAverage(team.id)

    // 2.3 جلب المواقع
    const locations = await hrService.getTeamContractLocations(team.id)
    const locationsText = locations.map(loc => 
      `${loc.city} ${loc.district}`
    ).join('، ')

    return {
      ...team,
      soldProjects: projectsCount,
      salesAverage: salesAvg,
      locations: locationsText
    }
  })
)
```

**الوقت التقديري:**
- جلب قائمة الفرق: ~200ms
- إثراء كل فريق (بالتوازي): ~300-500ms
- **الإجمالي: ~500-700ms لـ 3-5 فرق**

---

### 2. مرحلة عرض المشاريع (openProjectsModal)

```javascript
// الخطوة 1: جلب العقود
const contractsResponse = await hrService.getTeamContracts(team.id)
const contracts = contractsResponse.data || contractsResponse || []
// يعيد: [
//   { id: 1, project_name: 'مشروع الياسمين', unit_count: 50, ... },
//   ...
// ]

// الخطوة 2: جلب المواقع
const locationsResponse = await hrService.getTeamContractLocations(team.id)
const locations = locationsResponse.data || locationsResponse || []
// يعيد: [
//   { contract_id: 1, city: 'الرياض', district: 'حي الياسمين' },
//   ...
// ]

// الخطوة 3: دمج البيانات
const enrichedContracts = await Promise.all(
  contracts.map(async (contract) => {
    const contractLocation = locations.find(
      loc => loc.contract_id === contract.id
    ) || locations[0] || {}

    return {
      ...contract,
      city: contractLocation.city || contract.city,
      district: contractLocation.district || contract.district
    }
  })
)

// الخطوة 4: عرض النتائج
teamProjects.value = enrichedContracts
isLoadingDetails.value = false
```

**الوقت التقديري:**
- جلب العقود: ~150ms
- جلب المواقع: ~150ms
- دمج البيانات: ~50ms
- **الإجمالي: ~350ms**

---

## مخطط استجابة APIs

### API 1: GET /teams/index

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "فريق المبيعات الرياض",
      "members": [...],
      "created_at": "2024-01-15",
      ...
    },
    {
      "id": 2,
      "name": "فريق التطوير العقاري",
      ...
    }
  ]
}
```

---

### API 2: GET /hr/teams/contracts/:id

```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "project_name": "مشروع الياسمين",
      "contract_name": "عقد رقم 2024-001",
      "unit_count": 50,
      "developer_name": "شركة البناء المتقدمة",
      "total_price": 5000000,
      "status": "active",
      "status_label": "نشط",
      ...
    },
    {
      "id": 102,
      "project_name": "مشروع النرجس",
      ...
    }
  ]
}
```

---

### API 3: GET /hr/teams/contracts/locations/:id

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "contract_id": 101,
      "city": "الرياض",
      "district": "حي الياسمين",
      "location": "شارع الأمير سلطان",
      "address": "رقم 123",
      ...
    },
    {
      "id": 2,
      "contract_id": 102,
      "city": "جدة",
      "district": "أبحر الشمالية",
      ...
    }
  ]
}
```

---

### API 4: GET /hr/teams/sales-average/:id

```json
{
  "success": true,
  "data": {
    "team_id": 1,
    "average": 2.5,
    "total_sales": 25,
    "team_members": 10,
    ...
  }
}
```

أو بشكل مباشر:
```json
2.5
```

---

## مخطط معالجة الأخطاء

```
┌─────────────────┐
│  API Call       │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Success?│
    └────┬────┘
         │
    ┌────▼────┬───────────┐
    │         │           │
   YES       NO          │
    │         │           │
    ▼         ▼           │
┌──────┐  ┌──────────┐   │
│Return│  │ Catch    │   │
│ Data │  │ Error    │   │
└──────┘  └────┬─────┘   │
               │         │
               ▼         │
        ┌─────────────┐  │
        │ Log Error   │  │
        │ to Console  │  │
        └──────┬──────┘  │
               │         │
               ▼         │
        ┌─────────────┐  │
        │ Return      │  │
        │ Fallback    │◄─┘
        │ Mock Data   │
        └─────────────┘
```

---

## توقيت الأداء (Performance Timeline)

```
0ms     ┌─────────────────────────────────────────────────────────┐
        │  User opens "إدارة الفرق" tab                           │
        └─────────────┬───────────────────────────────────────────┘
                      │
100ms                 ▼
        ┌─────────────────────────────────────────────────────────┐
        │  GET /teams/index                                       │
        └─────────────┬───────────────────────────────────────────┘
                      │
300ms                 ▼
        ┌─────────────────────────────────────────────────────────┐
        │  Promise.all([                                          │
        │    GET /hr/teams/contracts/1,                           │
        │    GET /hr/teams/contracts/locations/1,                 │
        │    GET /hr/teams/sales-average/1,                       │
        │    ... (for each team)                                  │
        │  ])                                                     │
        └─────────────┬───────────────────────────────────────────┘
                      │
700ms                 ▼
        ┌─────────────────────────────────────────────────────────┐
        │  Render team cards with enriched data                   │
        └─────────────────────────────────────────────────────────┘

        User clicks "12 مشروع"
                      │
750ms                 ▼
        ┌─────────────────────────────────────────────────────────┐
        │  Show modal with spinner                                │
        └─────────────┬───────────────────────────────────────────┘
                      │
800ms                 ▼
        ┌─────────────────────────────────────────────────────────┐
        │  GET /hr/teams/contracts/:id                            │
        │  GET /hr/teams/contracts/locations/:id                  │
        │  (parallel)                                             │
        └─────────────┬───────────────────────────────────────────┘
                      │
1100ms                ▼
        ┌─────────────────────────────────────────────────────────┐
        │  Merge and display projects in modal                    │
        └─────────────────────────────────────────────────────────┘
```

**الوقت الإجمالي:**
- من فتح التبويبة حتى رؤية البطاقات: **~700ms**
- من النقر على المشاريع حتى رؤية القائمة: **~350ms**
- **تجربة مستخدم ممتازة ⚡**

---

## المزايا المعمارية

### 1. التحميل المتوازي (Parallel Loading)
```javascript
// ❌ بدون Promise.all (تسلسلي - بطيء)
for (team of teams) {
  const contracts = await getTeamContracts(team.id)    // 150ms
  const locations = await getTeamContractLocations(id) // 150ms
  const salesAvg = await getTeamSalesAverage(team.id)  // 150ms
  // Total: 450ms × 5 teams = 2250ms
}

// ✅ مع Promise.all (متوازي - سريع)
const enrichedTeams = await Promise.all(
  teams.map(async (team) => {
    const [contracts, locations, salesAvg] = await Promise.all([
      getTeamContracts(team.id),
      getTeamContractLocations(team.id),
      getTeamSalesAverage(team.id)
    ])
    // Total: 450ms (all at once!)
  })
)
```

### 2. التخزين المؤقت الذكي (Smart Caching)
- يتم حفظ `team.id` في كل بطاقة
- عند فتح modal، يُستخدم الـ ID المحفوظ مباشرة
- لا حاجة لإعادة جلب بيانات الفريق الأساسية

### 3. معالجة الأخطاء المتدرجة (Graceful Error Handling)
```javascript
try {
  const data = await hrService.getTeams()
  // Use real data
} catch (error) {
  console.error('Error:', error)
  // Fallback to mock data
  return mockTeamsData
}
```

---

**هذا المخطط يوضح التدفق الكامل للبيانات من بداية التحميل حتى العرض النهائي! 📊✨**
