<template>
  <div class="contracts-view">
    <!-- عنوان الصفحة -->
    <div class="welcome-header">
      <h1 class="welcome-title">إدارة العقود والطلبات</h1>
      <p class="welcome-subtitle">مراجعة واعتماد عقود المشاريع الجديدة والطلبات الحصرية.</p>
    </div>

    <!-- فلتر العرض الحديث -->
    <MobileFilterSheet>
      <div class="controls-Modern-area">
        <div class="modern-tabs">
          <button
            :class="['tab-item', { active: activeFilter === 'all' }]"
            @click="activeFilter = 'all'"
          >
            كل السجلات <span class="tab-count">{{ totalCount }}</span>
          </button>

          <button
            :class="['tab-item', { active: activeFilter === 'pending' }]"
            @click="activeFilter = 'pending'"
          >
            المعلقة <span class="tab-count">{{ pendingCount }}</span>
          </button>

          <button
            :class="['tab-item', { active: activeFilter === 'approved' }]"
            @click="activeFilter = 'approved'"
          >
            العقود المقبولة <span class="tab-count">{{ approvedCount }}</span>
          </button>

          <button
            :class="['tab-item', { active: activeFilter === 'archive' }]"
            @click="activeFilter = 'archive'"
          >
            الأرشيف <span class="tab-count">{{ archiveCount }}</span>
          </button>
        </div>

        <!-- حقل البحث -->
        <div class="search-container">
          <svg
            class="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="البحث برقم العقد أو اسم المشروع..."
          />
        </div>
      </div>
    </MobileFilterSheet>

    <!-- حالة التحميل -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">جاري تحميل العقود...</p>
    </div>

    <!-- حالة الخطأ -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="48"
          height="48"
        >
          <path
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
          ></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <p class="error-text">{{ error }}</p>
      <button class="retry-btn" @click="fetchContracts">إعادة المحاولة</button>
    </div>

    <!-- جدول البيانات -->
    <div v-else class="table-container">
      <div class="table-responsive">
      <table class="custom-table table-mobile-stacked">
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
          <tr v-for="contract in paginatedContracts" :key="contract.id">
            <td data-label="النوع">
              <span class="badge-type">{{ contract.type }}</span>
            </td>
            <td class="font-bold" data-label="رقم العقد/الطلب">{{ contract.number }}</td>
            <td class="dev-name" data-label="المطور">{{ contract.developer }}</td>
            <td class="dir-ltr" data-label="تاريخ الإنشاء">{{ contract.createdDate }}</td>
            <td data-label="الحالة">
              <span
                :class="[
                  'status-badge-custom',
                  {
                    pending: contract.status === 'Pending',
                    rejected: contract.status === 'Refused',
                    approved: contract.status === 'Approved',
                  },
                ]"
              >
                {{ contract.status }}
              </span>
            </td>
            <td data-label="الإجراء"><button class="view-link" @click="viewContract(contract)">عرض</button></td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- مودال تفاصيل العقد -->
    <ContractModal
      v-if="showModal"
      :contract="selectedContract"
      @close="closeModal"
      @approve="handleApprove"
      @reject="handleReject"
    />

    <!-- Pagination -->
    <Pagination
      v-if="totalCount > 0 || contracts.length > 0"
      :current-page="currentPage"
      :total-items="totalCount"
      :per-page="perPage"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import ContractModal from '@/components/ContractModal.vue';
import Pagination from '@/components/Pagination.vue';
import MobileFilterSheet from '@/components/MobileFilterSheet.vue';
import contractService from '@/services/contractService';
import authService from '@/services/authService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

const activeFilter = ref('all');
const searchQuery = ref('');
const isLoading = ref(false);
const error = ref(null);
const contracts = ref([]);
const totalFromApi = ref(0);
const showModal = ref(false);
const selectedContract = ref(null);
const currentPage = ref(1);
const perPage = ref(25);

const user = ref(authService.getCurrentUser());
const userRole = computed(() => {
  const type = user.value?.type;
  if (type === 1 || type === 'admin' || user.value?.role === 'admin') return 1;
  if (type == 3 || type === 'project_management') return 3;
  return type ?? 0;
});

const isAdminWithPagination = computed(() => userRole.value == 1);

const fetchContracts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    if (userRole.value == 1) {
      const params = {
        page: currentPage.value,
        per_page: perPage.value,
      };
      const status = mapStatusForApi(activeFilter.value);
      if (status) params.status = status;
      const { items, total } = await contractService.getAllContracts(params);
      contracts.value = items.map(mapContract);
      totalFromApi.value = total;
    } else if (userRole.value == 4) {
      const data = await contractService.getEditorContracts();
      contracts.value = (Array.isArray(data) ? data : []).map(mapContract);
      totalFromApi.value = contracts.value.length;
    } else {
      const data = await contractService.getContracts();
      contracts.value = (Array.isArray(data) ? data : []).map(mapContract);
      totalFromApi.value = contracts.value.length;
    }
  } catch (err) {
    logger.error('Error fetching contracts:', err);
    error.value = 'فشل تحميل العقود. يرجى التأكد من الصلاحيات.';
    contracts.value = [];
    totalFromApi.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const filteredContracts = computed(() => {
  let filtered = contracts.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      c => c.number?.toString().includes(q) || c.developer?.toLowerCase().includes(q)
    );
  }
  return filtered;
});

const paginatedContracts = computed(() => {
  if (isAdminWithPagination.value) return filteredContracts.value;
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredContracts.value.slice(start, end);
});

const handlePageChange = page => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (isAdminWithPagination.value) fetchContracts();
};

const handlePerPageChange = newPerPage => {
  perPage.value = newPerPage;
  currentPage.value = 1;
  if (isAdminWithPagination.value) fetchContracts();
};

const totalCount = computed(() =>
  isAdminWithPagination.value ? totalFromApi.value : filteredContracts.value.length
);
const pendingCount = computed(() => contracts.value.filter(c => c.status === 'Pending').length);
const approvedCount = computed(
  () => contracts.value.filter(c => c.status === 'Approved').length
);
const archiveCount = computed(() => contracts.value.filter(c => c.status === 'Refused').length);
const marketerCount = computed(
  () => contracts.value.filter(c => c.type === 'Full Contract' || !c.type).length
);
const exclusiveCount = computed(
  () => contracts.value.filter(c => c.type === 'Exclusive').length
);
const myRequestsCount = computed(
  () => contracts.value.filter(c => c.marketer === user.value?.name).length
);

const viewContract = async c => {
  try {
    // جلب تفاصيل العقد الكاملة من API
    let fullDetails;
    if (userRole.value == 4) {
      fullDetails = await contractService.getEditorContractById(c.id);
    } else {
      fullDetails = await contractService.getContractById(c.id);
    }

    selectedContract.value = {
      ...c,
      ...fullDetails,
    };
    showModal.value = true;
  } catch (error) {
    logger.error('Error fetching contract details:', error);
    // في حالة الخطأ، استخدم البيانات الأساسية
    selectedContract.value = c;
    showModal.value = true;
  }
};
const closeModal = () => {
  showModal.value = false;
  selectedContract.value = null;
};

const handleApprove = async c => {
  try {
    if (userRole.value == 3) {
      await contractService.updateContractStatusProjectManager(c.id, 'approved');
    } else {
      await contractService.approveContract(c.id);
    }
    fetchContracts();
    closeModal();
  } catch (err) {
    logger.error('Error approving contract:', err);
    toast.error('حدث خطأ أثناء اعتماد العقد');
  }
};

const handleReject = async c => {
  try {
    if (userRole.value == 3) {
      await contractService.updateContractStatusProjectManager(c.id, 'rejected');
    } else {
      await contractService.rejectContract(c.id);
    }
    fetchContracts();
    closeModal();
  } catch (err) {
    logger.error('Error rejecting contract:', err);
    toast.error('حدث خطأ أثناء رفض العقد');
  }
};

watch(activeFilter, () => {
  currentPage.value = 1;
  if (isAdminWithPagination.value) fetchContracts();
});

onMounted(fetchContracts);
</script>

<style scoped>
.contracts-view {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  background: #b1a28f;
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
  color: #1e293b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  direction: rtl;
}

.search-input:focus {
  outline: none;
  border-color: #b1a28f;
  box-shadow: 0 0 0 3px rgba(161, 139, 92, 0.1);
}

/* Table container */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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

.dev-name {
  font-weight: 600;
}

.dir-ltr {
  direction: ltr;
  text-align: right;
  display: inline-block;
  width: 100%;
}

.status-badge-custom {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  min-width: 100px;
  text-align: center;
  display: inline-block;
}

.status-badge-custom.approved {
  background: #dcfce7 !important;
  color: #166534 !important;
  border: 1px solid #bbf7d0 !important;
}
.status-badge-custom.pending {
  background: #fef9c3 !important;
  color: #854d0e !important;
  border: 1px solid #fde047 !important;
}
.status-badge-custom.rejected {
  background: #fee2e2 !important;
  color: #b91c1c !important;
  border: 1px solid #fecdd3 !important;
}

.view-link {
  background: none;
  border: none;
  color: #1e293b;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
}

.view-link:hover {
  text-decoration: underline;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f1f5f9;
  border-top-color: #b1a28f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Responsive: Tablet Landscape */
@media (max-width: 992px) {
  .page-title {
    font-size: 26px;
  }
  .controls-Modern-area {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .modern-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    flex-wrap: nowrap;
  }
  .tab-item {
    white-space: nowrap;
    padding: 8px 16px;
    font-size: 13px;
  }
  .search-container {
    min-width: unset;
    width: 100%;
  }
  .custom-table th,
  .custom-table td {
    padding: 16px 14px;
  }
}

/* Responsive: Tablet Portrait */
@media (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }
  .page-subtitle {
    font-size: 14px;
  }
  .modern-tabs {
    gap: 4px;
    padding: 4px;
    border-radius: 10px;
  }
  .tab-item {
    padding: 8px 12px;
    font-size: 12px;
    border-radius: 6px;
  }
  .tab-count {
    font-size: 10px;
    padding: 1px 6px;
  }
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 10px;
  }
  .custom-table {
    min-width: 640px;
  }
  .custom-table th,
  .custom-table td {
    padding: 12px;
    font-size: 13px;
  }
  .search-input {
    font-size: 13px;
  }
  .loading-state,
  .error-state {
    padding: 40px 20px;
  }
}

/* Responsive: Mobile */
@media (max-width: 576px) {
  .contracts-view {
    padding: 0;
  }
  .page-header {
    margin-bottom: 20px;
  }
  .page-title {
    font-size: 20px;
  }
  .page-subtitle {
    font-size: 13px;
  }
  .controls-Modern-area {
    margin-bottom: 20px;
    gap: 12px;
  }
  .modern-tabs {
    padding: 3px;
    border-radius: 8px;
    gap: 2px;
  }
  .tab-item {
    padding: 8px 10px;
    font-size: 11px;
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  .search-input {
    padding: 10px 36px 10px 10px;
    min-height: 44px;
    font-size: 13px;
    border-radius: 8px;
  }
  .custom-table th {
    padding: 10px 8px;
    font-size: 12px;
  }
  .custom-table td {
    padding: 12px 8px;
    font-size: 12px;
  }
  .badge-type {
    padding: 4px 8px;
    font-size: 11px;
  }
  .status-badge-custom {
    padding: 4px 10px;
    font-size: 11px;
    min-width: 70px;
  }
  .view-link {
    font-size: 13px;
    min-height: 44px;
    min-width: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .retry-btn {
    min-height: 44px;
    width: 100%;
    font-size: 14px;
  }
  .loading-state,
  .error-state {
    padding: 32px 16px;
    border-radius: 10px;
  }
}

/* Responsive: Extra Small Mobile */
@media (max-width: 320px) {
  .page-title {
    font-size: 18px;
  }
  .page-subtitle {
    font-size: 12px;
  }
  .tab-item {
    padding: 6px 6px;
    font-size: 10px;
    gap: 4px;
  }
  .tab-count {
    font-size: 9px;
    padding: 1px 4px;
  }
  .custom-table th,
  .custom-table td {
    padding: 8px 6px;
    font-size: 11px;
  }
  .search-input {
    font-size: 12px;
  }
}

/* Responsive: Large Desktop */
@media (min-width: 1920px) {
  .page-title {
    font-size: 38px;
  }
  .page-subtitle {
    font-size: 18px;
  }
  .controls-Modern-area {
    margin-bottom: 36px;
  }
  .tab-item {
    padding: 12px 28px;
    font-size: 16px;
  }
  .tab-count {
    font-size: 14px;
  }
  .search-input {
    padding: 14px 44px 14px 18px;
    font-size: 16px;
  }
  .custom-table th {
    padding: 22px 24px;
    font-size: 16px;
  }
  .custom-table td {
    padding: 26px 24px;
    font-size: 16px;
  }
  .badge-type {
    font-size: 14px;
    padding: 8px 16px;
  }
  .status-badge-custom {
    font-size: 15px;
    padding: 8px 20px;
  }
}
</style>
