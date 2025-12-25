<template>
  <div class="my-requests">
    <!-- Header -->
    <div class="section-header">
      <div class="header-content">
        <h2 class="section-title">طلباتي الحصرية</h2>
        <p class="section-subtitle">تتبع حالة طلبات المشاريع الحصرية التي قدمتها وأكمل العقود المعتمدة.</p>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="data-table-container">
      <div class="table-header-info">
        <h3 class="table-title">قائمة الطلبات</h3>
        <p class="table-count" v-if="!isLoading">تم العثور على {{ requests.length }} طلب.</p>
      </div>

      <table class="custom-table">
        <thead>
          <tr>
            <th>اسم المشروع</th>
            <th>تاريخ الطلب</th>
            <th>الحالة</th>
            <th class="text-center">الإجراء</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="4" class="text-center padding-30">
              <span class="spinner-gold"></span>
              <p class="loading-text">جاري تحميل الطلبات...</p>
            </td>
          </tr>
          <tr v-else-if="requests.length === 0">
            <td colspan="4" class="text-center padding-30">
              <p class="no-data-text">لا يوجد طلبات حالياً.</p>
            </td>
          </tr>
          <tr v-else v-for="request in requests" :key="request.id">
            <td>
              <span class="project-name">{{ request.project_name }}</span>
            </td>
            <td>
              <span class="date-text">{{ request.date }}</span>
            </td>
            <td>
              <div class="status-badge" :class="request.status.toLowerCase()">
                {{ request.status === 'Approved' ? 'موافق عليه' : (request.status === 'Rejected' ? 'مرفوض' : 'معلق') }}
              </div>
            </td>
            <td class="text-center">
              <button 
                class="complete-btn" 
                @click="completeContract(request.id)"
                :disabled="request.status.toLowerCase() !== 'approved'"
              >
                استكمال العقد
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import contractService from '../services/contractService'

export default {
  name: 'MyRequestsView',
  setup() {
    const router = useRouter()
    const requests = ref([])
    const isLoading = ref(true)

    const fetchRequests = async () => {
      isLoading.value = true
      try {
        const data = await contractService.getContracts()
        // Map API fields if they differ
        requests.value = data.map(item => ({
            id: item.id,
            project_name: item.project_name || 'بدون اسم',
            date: item.created_at ? item.created_at.split('T')[0] : 'غير متوفر',
            status: item.status || 'Pending'
        }))
      } catch (error) {
        console.error('Failed to fetch requests', error)
      } finally {
        isLoading.value = false
      }
    }

    onMounted(fetchRequests)

    const completeContract = (id) => {
      router.push(`/contract-form/${id}`)
    }

    return {
      requests,
      isLoading,
      completeContract
    }
  }
}
</script>

<style scoped>
.my-requests {
  animation: fadeIn 0.4s ease-out;
  direction: rtl;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  margin-bottom: 30px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 8px 0;
  font-family: 'Amiri', serif;
}

.section-subtitle {
  color: #64748b;
  font-size: 16px;
}

.data-table-container {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.table-header-info {
  padding: 24px 30px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
}

.table-count {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th {
  text-align: right;
  padding: 16px 30px;
  color: #94a3b8;
  font-weight: 500;
  font-size: 14px;
  background: #fdfbf7;
}

.custom-table td {
  padding: 16px 30px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  font-size: 15px;
}

.project-name {
  font-weight: 700;
  color: #1e3a5f;
}

.date-text {
  font-family: monospace;
  color: #64748b;
}

.status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  min-width: 90px;
  border: 1px solid transparent;
}

.status-badge.pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.status-badge.approved { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.status-badge.rejected { background: #fee2e2; color: #b91c1c; border: 1px solid #fecdd3; }

.complete-btn {
  background: linear-gradient(135deg, #a18b5c 0%, #8c7851 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-family: 'Tajawal', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px rgba(161, 139, 92, 0.2);
}

.complete-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(161, 139, 92, 0.3);
  filter: brightness(1.1);
}

.complete-btn:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.text-center { text-align: center; }
.padding-30 { padding: 30px !important; }

.spinner-gold {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(161, 139, 92, 0.1);
  border-top-color: #a18b5c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

.loading-text {
  margin-top: 10px;
  color: #a18b5c;
  font-weight: 500;
}

.no-data-text {
  color: #94a3b8;
  font-size: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
