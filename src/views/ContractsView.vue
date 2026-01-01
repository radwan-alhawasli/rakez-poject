<template>
  <div class="contracts-view">
    <!-- عنوان الصفحة -->
    <div class="page-header">
      <h1 class="page-title">إدارة العقود والطلبات</h1>
      <p class="page-subtitle">مراجعة واعتماد عقود المشاريع الجديدة والطلبات الحصرية.</p>
    </div>

    <!-- فلتر العرض الحديث -->
    <div class="controls-Modern-area">
      <div class="modern-tabs">
        <button :class="['tab-item', { active: activeFilter === 'all' }]" @click="activeFilter = 'all'">
          كل السجلات <span class="tab-count">{{ totalCount }}</span>
        </button>
        
        <button :class="['tab-item', { active: activeFilter === 'pending' }]" @click="activeFilter = 'pending'">
          المعلقة <span class="tab-count">{{ pendingCount }}</span>
        </button>

        <button :class="['tab-item', { active: activeFilter === 'approved' }]" @click="activeFilter = 'approved'">
          العقود المقبولة <span class="tab-count">{{ approvedCount }}</span>
        </button>

        <button :class="['tab-item', { active: activeFilter === 'archive' }]" @click="activeFilter = 'archive'">
          الأرشيف <span class="tab-count">{{ archiveCount }}</span>
        </button>
      </div>
      
      <!-- حقل البحث -->
      <div class="search-container">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input v-model="searchQuery" type="text" class="search-input" placeholder="البحث برقم العقد أو اسم المشروع..." />
      </div>
    </div>

    <!-- حالة التحميل -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">جاري تحميل العقود...</p>
    </div>

    <!-- حالة الخطأ -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p class="error-text">{{ error }}</p>
      <button class="retry-btn" @click="fetchContracts">إعادة المحاولة</button>
    </div>
    
    <!-- جدول البيانات -->
    <div v-else class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>النوع</th>
            <th>رقم العقد/الطلب</th>
            <th>المطور</th>
            <th>تاريخ الإنشاء</th>
            <th>الحالة</th>
            <th>الإجراء</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contract in filteredContracts" :key="contract.id">
            <td><span class="badge-type">{{ contract.type }}</span></td>
            <td class="font-bold">{{ contract.number }}</td>
            <td class="dev-name">{{ contract.developer }}</td>
            <td class="dir-ltr">{{ contract.createdDate }}</td>
            <td>
              <span :class="['status-badge-custom', { 'pending': contract.status === 'Pending', 'rejected': contract.status === 'Refused', 'approved': contract.status === 'Approved' }]">
                {{ contract.status }}
              </span>
            </td>
            <td><button class="view-link" @click="viewContract(contract)">عرض</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- مودال تفاصيل العقد -->
    <ContractModal v-if="showModal" :contract="selectedContract" @close="closeModal" @approve="handleApprove" @reject="handleReject" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import ContractModal from '../components/ContractModal.vue'
import contractService from '../services/contractService'
import authService from '../services/authService'

export default {
  name: 'ContractsView',
  components: { ContractModal },
  setup() {
    const activeFilter = ref('all')
    const searchQuery = ref('')
    const isLoading = ref(false)
    const error = ref(null)
    const contracts = ref([])
    const showModal = ref(false)
    const selectedContract = ref(null)
    
    const user = ref(authService.getCurrentUser())
    const userRole = computed(() => {
      const type = user.value?.type
      if (type === 1 || type === 'admin' || user.value?.role === 'admin') return 1
      // Check for Project Management (3)
      if (type == 3 || type === 'project_management') return 3
      return type ?? 0
    })

    const fetchContracts = async () => {
      isLoading.value = true
      error.value = null
      try {
        // Dynamic service call based on role
        // Role 1 (Admin) uses adminIndex
        // Role 3 (Project Manager) and others use contracts/index
        const serviceCall = (userRole.value == 1)
          ? contractService.getAllContracts() 
          : contractService.getContracts()
          
        const data = await serviceCall
        
        contracts.value = data.map(c => {
          let statusRaw = c.status ? c.status.toLowerCase() : 'pending'
          let status = 'Pending'
          if (statusRaw === 'approved') status = 'Approved'
          else if (statusRaw === 'rejected' || statusRaw === 'refused') status = 'Refused'
          
          return {
            ...c,
            id: c.id,
            type: c.type || (c.project_name ? 'Exclusive' : 'Full Contract'),
            number: c.developer_number || c.id,
            developer: c.project_name || c.name || 'غير محدد',
            createdDate: c.created_at?.split('T')[0] || '-',
            status: status,
            marketer: c.marketer || c.created_by_name || 'System'
          }
        })
      } catch (err) {
        console.error('Error fetching contracts:', err)
        error.value = 'فشل تحميل العقود. يرجى التأكد من الصلاحيات.'
      } finally { isLoading.value = false }
    }

    const filteredContracts = computed(() => {
      let filtered = contracts.value
      
      if (activeFilter.value === 'pending') filtered = filtered.filter(c => c.status === 'Pending')
      else if (activeFilter.value === 'approved') filtered = filtered.filter(c => c.status === 'Approved')
      else if (activeFilter.value === 'archive') filtered = filtered.filter(c => c.status === 'Refused')
      else if (activeFilter.value === 'marketer_contracts') filtered = filtered.filter(c => c.type === 'Full Contract' || !c.type)
      else if (activeFilter.value === 'exclusive_requests') filtered = filtered.filter(c => c.type === 'Exclusive')
      else if (activeFilter.value === 'my_requests') filtered = filtered.filter(c => c.marketer === user.value?.name)
      
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        filtered = filtered.filter(c => c.number?.toString().includes(q) || c.developer?.toLowerCase().includes(q))
      }
      return filtered
    })

    const totalCount = computed(() => contracts.value.length)
    const pendingCount = computed(() => contracts.value.filter(c => c.status === 'Pending').length)
    const approvedCount = computed(() => contracts.value.filter(c => c.status === 'Approved').length)
    const archiveCount = computed(() => contracts.value.filter(c => c.status === 'Refused').length)
    const marketerCount = computed(() => contracts.value.filter(c => c.type === 'Full Contract' || !c.type).length)
    const exclusiveCount = computed(() => contracts.value.filter(c => c.type === 'Exclusive').length)
    const myRequestsCount = computed(() => contracts.value.filter(c => c.marketer === user.value?.name).length)

    const viewContract = async (c) => {
      try {
        // جلب تفاصيل العقد الكاملة من API
        const fullDetails = await contractService.getContractById(c.id)
        selectedContract.value = {
          ...c,
          ...fullDetails
        }
        showModal.value = true
      } catch (error) {
        console.error('Error fetching contract details:', error)
        // في حالة الخطأ، استخدم البيانات الأساسية
        selectedContract.value = c
        showModal.value = true
      }
    }
    const closeModal = () => { showModal.value = false; selectedContract.value = null }

    const handleApprove = async (c) => { 
      try {
        if (userRole.value == 3) {
          await contractService.updateContractStatusProjectManager(c.id, 'approved')
        } else {
          await contractService.approveContract(c.id)
        }
        fetchContracts()
        closeModal()
      } catch (err) {
        console.error('Error approving contract:', err)
        alert('حدث خطأ أثناء اعتماد العقد')
      }
    }

    const handleReject = async (c) => { 
      try {
        if (userRole.value == 3) {
          await contractService.updateContractStatusProjectManager(c.id, 'rejected')
        } else {
          await contractService.rejectContract(c.id)
        }
        fetchContracts()
        closeModal()
      } catch (err) {
        console.error('Error rejecting contract:', err)
        alert('حدث خطأ أثناء رفض العقد')
      }
    }

    onMounted(fetchContracts)

    return {
      activeFilter, searchQuery, isLoading, error, filteredContracts,
      totalCount, pendingCount, approvedCount, archiveCount,
      marketerCount, exclusiveCount, myRequestsCount,
      showModal, selectedContract, viewContract, closeModal,
      handleApprove, handleReject, fetchContracts, userRole
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@400;700&family=Tajawal:wght@300;400;500;700&display=swap');

.contracts-view { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header {
  text-align: right;
  margin-bottom: 30px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e3a5f;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  color: #64748b;
  font-size: 16px;
}

/* Modern Controls */
.controls-Modern-area {
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.modern-tabs {
    display: flex;
    background: #f1f5f9;
    padding: 6px;
    border-radius: 12px;
    gap: 8px;
}

.tab-item {
    padding: 10px 24px;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
}

.tab-item.active {
    background: white;
    color: #1e3a5f;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.tab-count {
    background: #e2e8f0;
    color: #475569;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 12px;
}

.tab-item.active .tab-count {
    background: #a18b5c;
    color: white;
}

.search-container {
    position: relative;
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    min-width: 300px;
}

.search-icon {
    position: absolute;
    right: 14px;
    width: 18px;
    height: 18px;
    color: #94a3b8;
    pointer-events: none;
    z-index: 1;
}

.search-input {
    width: 100%;
    padding: 10px 40px 10px 14px;
    font-size: 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: white;
    font-family: 'Tajawal', sans-serif;
    color: #1e293b;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    direction: rtl;
}

.search-input:focus {
    outline: none;
    border-color: #a18b5c;
    box-shadow: 0 0 0 3px rgba(161, 139, 92, 0.1);
}

/* Table container */
.table-container {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.custom-table {
    width: 100%;
    border-collapse: collapse;
}

.custom-table th {
    text-align: right;
    padding: 20px;
    color: #94a3b8;
    font-weight: 500;
    font-size: 14px;
    border-bottom: 1px solid #f1f5f9;
}

.custom-table td {
    padding: 24px 20px;
    vertical-align: middle;
    color: #334155;
    font-size: 14px;
    border-bottom: 1px solid #f1f5f9;
}

.badge-type {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    color: #475569;
    font-weight: 600;
}

.font-bold {
    font-weight: 700;
    color: #1e293b;
}

.dev-name { font-weight: 600; }

.dir-ltr { direction: ltr; text-align: right; display: inline-block; width: 100%; }

.status-badge-custom {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
    min-width: 100px;
    text-align: center;
    display: inline-block;
}

.status-badge-custom.approved { background: #dcfce7 !important; color: #166534 !important; border: 1px solid #bbf7d0 !important; }
.status-badge-custom.pending { background: #fef9c3 !important; color: #854d0e !important; border: 1px solid #fde047 !important; }
.status-badge-custom.rejected { background: #fee2e2 !important; color: #b91c1c !important; border: 1px solid #fecdd3 !important; }

.view-link {
    background: none; border: none; color: #1e293b; font-weight: 700; cursor: pointer; font-size: 14px;
}

.view-link:hover { text-decoration: underline; }

.loading-state, .error-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 40px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.loading-spinner {
  width: 50px; height: 50px; border: 4px solid #f1f5f9; border-top-color: #a18b5c;
  border-radius: 50%; animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.retry-btn {
  padding: 10px 24px; background: linear-gradient(135deg, #a18b5c 0%, #8c7851 100%);
  color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
}
</style>
