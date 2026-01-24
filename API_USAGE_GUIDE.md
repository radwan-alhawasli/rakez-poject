# دليل استخدام HR APIs - Professional Integration Guide

## نظرة عامة
تم ربط جميع الـ APIs بشكل احترافي في الخدمات التالية:
- `hrService.js` - إدارة الموظفين والعقود والفرق
- `teamService.js` - البحث والتصفية في الفرق

---

## 1. Employee Management APIs

### 1.1 إنشاء موظف جديد (مع رفع الملفات)

```javascript
import { createEmployee } from '@/services/hrService'

// مثال عملي من AddUserModal.vue
const handleSubmit = async () => {
  // إنشاء FormData object
  const formData = new FormData()
  
  // إضافة البيانات الأساسية
  formData.append('name', 'أحمد علي')
  formData.append('email', 'ahmed@example.com')
  formData.append('password', 'securepassword123')
  formData.append('phone', '0501234567')
  formData.append('type', '3') // Marketing = 0, Admin = 1, Acquisition = 2, HR = 3
  formData.append('is_manager', '1') // 1 or 0
  formData.append('team', '2') // Team ID
  formData.append('identity_number', '1234567890')
  formData.append('contract_type', 'SAS') // أو 'full_time'
  formData.append('birthday', '12-10-2002') // DD-MM-YYYY
  formData.append('date_of_works', '12-10-2025') // DD-MM-YYYY
  
  // رفع السيرة الذاتية (File object)
  if (cvFile) {
    formData.append('cv', cvFile)
  }
  
  // رفع العقد (File object)
  if (contractFile) {
    formData.append('contract', contractFile)
  }
  
  try {
    const response = await createEmployee(formData)
    console.log('Employee created:', response)
    // عرض رسالة نجاح
    alert('تم إنشاء الموظف بنجاح!')
  } catch (error) {
    console.error('Error:', error)
    alert('حدث خطأ أثناء إنشاء الموظف')
  }
}
```

### 1.2 جلب قائمة الموظفين (مع البحث)

```javascript
import { getEmployees } from '@/services/hrService'

// مثال 1: جلب جميع الموظفين
const loadAllEmployees = async () => {
  try {
    const employees = await getEmployees()
    console.log('All employees:', employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
  }
}

// مثال 2: البحث عن موظف
const searchEmployees = async (searchTerm) => {
  try {
    const employees = await getEmployees({ search: searchTerm })
    console.log('Search results:', employees)
  } catch (error) {
    console.error('Error searching employees:', error)
  }
}

// مثال 3: استخدام في مكون Vue
export default {
  data() {
    return {
      employees: [],
      searchQuery: '',
      loading: false
    }
  },
  methods: {
    async fetchEmployees() {
      this.loading = true
      try {
        const params = this.searchQuery ? { search: this.searchQuery } : {}
        this.employees = await getEmployees(params)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.fetchEmployees()
  }
}
```

### 1.3 عرض بيانات موظف محدد

```javascript
import { getEmployeeById } from '@/services/hrService'

const viewEmployeeDetails = async (employeeId) => {
  try {
    const employee = await getEmployeeById(employeeId)
    console.log('Employee details:', employee)
    // عرض البيانات في modal أو صفحة
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### 1.4 تحديث بيانات موظف

```javascript
import { updateEmployee } from '@/services/hrService'

const updateEmployeeData = async (employeeId, updatedData) => {
  try {
    const response = await updateEmployee(employeeId, updatedData)
    console.log('Employee updated:', response)
    alert('تم تحديث بيانات الموظف بنجاح!')
  } catch (error) {
    console.error('Error:', error)
    alert('حدث خطأ أثناء التحديث')
  }
}

// مثال استخدام:
updateEmployeeData(5, {
  name: 'أحمد محمد (محدث)',
  phone: '0501111111',
  salary: 5000
})
```

### 1.5 حذف موظف

```javascript
import { deleteEmployee } from '@/services/hrService'

const removeEmployee = async (employeeId) => {
  if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return
  
  try {
    await deleteEmployee(employeeId)
    alert('تم حذف الموظف بنجاح!')
    // تحديث القائمة
    fetchEmployees()
  } catch (error) {
    console.error('Error:', error)
    alert('حدث خطأ أثناء الحذف')
  }
}
```

---

## 2. Team Management APIs

### 2.1 البحث في الفرق

```javascript
import { searchTeams, filterTeams } from '@/services/teamService'

// مثال 1: البحث في الفرق
const searchForTeams = async (query) => {
  try {
    const teams = await searchTeams(query)
    console.log('Search results:', teams)
    return teams
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

// مثال 2: تصفية الفرق
const filterTeamsByName = async (filter) => {
  try {
    const teams = await filterTeams(filter)
    console.log('Filter results:', teams)
    return teams
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

// مثال 3: في مكون Vue مع search bar
export default {
  data() {
    return {
      teams: [],
      searchQuery: ''
    }
  },
  watch: {
    searchQuery(newQuery) {
      this.searchTeamsDebounced(newQuery)
    }
  },
  methods: {
    async searchTeamsDebounced(query) {
      // إضافة debounce لتحسين الأداء
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(async () => {
        if (query) {
          this.teams = await searchTeams(query)
        } else {
          this.teams = await getAllTeams()
        }
      }, 300)
    }
  }
}
```

---

## 3. Contract-Team Integration APIs

### 3.1 جلب مواقع عقود الفريق

```javascript
import { getTeamContractLocations } from '@/services/hrService'

const loadTeamContractLocations = async (teamId) => {
  try {
    const locations = await getTeamContractLocations(teamId)
    console.log('Contract locations:', locations)
    // عرض المواقع على خريطة أو قائمة
  } catch (error) {
    console.error('Error:', error)
  }
}

// مثال استخدام في صفحة الفريق:
loadTeamContractLocations(1) // Team ID = 1
```

### 3.2 جلب الفرق المرتبطة بعقد

```javascript
import { getTeamsForContract } from '@/services/hrService'

const loadContractTeams = async (contractId) => {
  try {
    const teams = await getTeamsForContract(contractId)
    console.log('Teams for contract:', teams)
    // عرض قائمة الفرق
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### 3.3 جلب عقود الفريق

```javascript
import { getTeamContracts } from '@/services/hrService'

const loadTeamContracts = async (teamId) => {
  try {
    const contracts = await getTeamContracts(teamId)
    console.log('Team contracts:', contracts)
    // عرض قائمة العقود
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### 3.4 جلب فرق المشروع

```javascript
import { getProjectTeams } from '@/services/hrService'

const loadProjectTeams = async (projectId) => {
  try {
    const teams = await getProjectTeams(projectId)
    console.log('Project teams:', teams)  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

## 4. مثال تطبيقي كامل: صفحة إدارة الموظفين

```vue
<template>
  <div class="employees-page">
    <div class="page-header">
      <h1>إدارة الموظفين</h1>
      <button @click="showAddModal = true" class="btn-primary">
        + إضافة موظف جديد
      </button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        @input="handleSearch"
        type="text"
        placeholder="ابحث عن موظف..."
        class="search-input"
      />
    </div>

    <!-- Employees Table -->
    <div v-if="loading" class="loading">جاري التحميل...</div>
    <table v-else class="employees-table">
      <thead>
        <tr>
          <th>الاسم</th>
          <th>البريد الإلكتروني</th>
          <th>القسم</th>
          <th>الفريق</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="employee in employees" :key="employee.id">
          <td>{{ employee.name }}</td>
          <td>{{ employee.email }}</td>
          <td>{{ getDepartmentName(employee.type) }}</td>
          <td>{{ employee.team }}</td>
          <td>
            <button @click="viewEmployee(employee.id)" class="btn-view">عرض</button>
            <button @click="editEmployee(employee)" class="btn-edit">تعديل</button>
            <button @click="deleteEmployeeConfirm(employee.id)" class="btn-delete">حذف</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Add/Edit Modal -->
    <AddUserModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @submit="handleEmployeeSubmit"
      :isLoading="isSaving"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getEmployees, createEmployee, deleteEmployee } from '@/services/hrService'
import AddUserModal from '@/components/AddUserModal.vue'

export default {
  name: 'EmployeesPage',
  components: { AddUserModal },
  setup() {
    const employees = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const showAddModal = ref(false)
    const isSaving = ref(false)

    const fetchEmployees = async () => {
      loading.value = true
      try {
        const params = searchQuery.value ? { search: searchQuery.value } : {}
        employees.value = await getEmployees(params)
      } catch (error) {
        console.error('Error fetching employees:', error)
        alert('حدث خطأ أثناء جلب البيانات')
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      clearTimeout(handleSearch.timeout)
      handleSearch.timeout = setTimeout(() => {
        fetchEmployees()
      }, 300)
    }

    const handleEmployeeSubmit = async (employeeData) => {
      isSaving.value = true
      try {
        // إنشاء FormData
        const formData = new FormData()
        Object.keys(employeeData).forEach(key => {
          if (employeeData[key] !== null && employeeData[key] !== undefined) {
            formData.append(key, employeeData[key])
          }
        })

        await createEmployee(formData)
        alert('تم إنشاء الموظف بنجاح!')
        showAddModal.value = false
        fetchEmployees()
      } catch (error) {
        console.error('Error:', error)
        alert('حدث خطأ أثناء إنشاء الموظف')
      } finally {
        isSaving.value = false
      }
    }

    const deleteEmployeeConfirm = async (employeeId) => {
      if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return

      try {
        await deleteEmployee(employeeId)
        alert('تم حذف الموظف بنجاح!')
        fetchEmployees()
      } catch (error) {
        console.error('Error:', error)
        alert('حدث خطأ أثناء الحذف')
      }
    }

    const getDepartmentName = (type) => {
      const departments = {
        0: 'التسويق',
        1: 'الإدارة',
        2: 'العقود',
        3: 'HR',
        4: 'المونتاج',
        5: 'المبيعات',
        6: 'المحاسبة',
        7: 'الائتمان',
        8: 'الموارد البشرية'
      }
      return departments[type] || 'غير محدد'
    }

    onMounted(() => {
      fetchEmployees()
    })

    return {
      employees,
      loading,
      searchQuery,
      showAddModal,
      isSaving,
      handleSearch,
      handleEmployeeSubmit,
      deleteEmployeeConfirm,
      getDepartmentName
    }
  }
}
</script>
```

---

## 5. معالجة الأخطاء (Error Handling)

```javascript
import { getEmployees } from '@/services/hrService'

const fetchEmployeesWithErrorHandling = async () => {
  try {
    const employees = await getEmployees()
    return employees
  } catch (error) {
    // التعامل مع أنواع الأخطاء المختلفة
    if (error.response) {
      // الخادم أرجع خطأ
      if (error.response.status === 401) {
        console.error('Unauthorized - الرجاء تسجيل الدخول')
        // إعادة توجيه للتسجيل
      } else if (error.response.status === 404) {
        console.error('Not found - لم يتم العثور على البيانات')
      } else {
        console.error('Server error:', error.response.data)
      }
    } else if (error.request) {
      // الطلب تم إرساله لكن لم يتم استلام رد
      console.error('Network error - تحقق من اتصال الإنترنت')
    } else {
      // خطأ في إعداد الطلب
      console.error('Error:', error.message)
    }
    return []
  }
}
```

---

## 6. Best Practices أفضل الممارسات

### 6.1 استخدام Loading States

```javascript
const MyComponent = {
  data() {
    return {
      loading: false,
      data: null
    }
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        this.data = await getEmployees()
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    }
  }
}
```

### 6.2 Debouncing للبحث

```javascript
let searchTimeout
const searchWithDebounce = (query) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    const results = await searchTeams(query)
    // معالجة النتائج
  }, 300)
}
```

### 6.3 التحقق من البيانات قبل الإرسال

```javascript
const validateEmployeeData = (data) => {
  if (!data.name || !data.email || !data.phone) {
    throw new Error('الرجاء ملء جميع الحقول المطلوبة')
  }
  if (!data.email.includes('@')) {
    throw new Error('البريد الإلكتروني غير صحيح')
  }
  return true
}
```

---

## 7. الخلاصة

تم ربط جميع الـ APIs بشكل احترافي، ويمكنك الآن:

✅ إدارة الموظفين (إنشاء، تعديل، حذف، عرض، بحث)
✅ رفع الملفات (CV والعقود) باستخدام FormData
✅ البحث والتصفية في الفرق
✅ ربط الفرق بالعقود والمواقع
✅ جلب فرق المشاريع

**جميع الـ APIs جاهزة للاستخدام المباشر في المكونات!** 🎉
