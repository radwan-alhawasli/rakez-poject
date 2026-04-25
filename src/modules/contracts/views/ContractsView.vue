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
    <div v-if="isLoading" class="mt-6">
      <TableSkeleton :rows="6" :columns="7" />
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
            <th>نسبة السعي</th>
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
            <td data-label="نسبة السعي">{{ contract.commissionLabel }}</td>
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
            <td data-label="الإجراء">
              <button class="view-link" @click="viewContract(contract)">عرض</button>
              <button
                v-if="contract.status === 'Pending'"
                type="button"
                class="edit-link"
                @click="openEditModal(contract)"
              >
                تعديل
              </button>
            </td>
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

    <!-- مودال تعديل معلومات المشروع الحصري -->
    <EditExclusiveProjectModal
      v-if="showEditModal"
      :contract-id="editingContractId"
      :initial-data="editingContractData"
      @close="closeEditModal"
      @saved="onExclusiveProjectSaved"
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
import { TableSkeleton } from '@/components/ui/skeleton';
import ContractModal from '@/components/ContractModal.vue';
import EditExclusiveProjectModal from '@/components/EditExclusiveProjectModal.vue';
import Pagination from '@/components/Pagination.vue';
import MobileFilterSheet from '@/components/MobileFilterSheet.vue';
import contractService from '@/services/contractService';
import authService from '@/services/authService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { showApiError, getApiErrorMessage } from '@/utils/errorHandler';

const activeFilter = ref('all');
const searchQuery = ref('');
const isLoading = ref(false);
const error = ref(null);
const contracts = ref([]);
const totalFromApi = ref(0);
const showModal = ref(false);
const selectedContract = ref(null);
const showEditModal = ref(false);
const editingContractId = ref(null);
const editingContractData = ref(null);
const currentPage = ref(1);
const perPage = ref(25);

const user = ref(authService.getCurrentUser());
const userRole = computed(() => {
  const type = user.value?.type;
  if (type === 1 || type === 'admin' || user.value?.role === 'admin') return 1;
  if (type == 2 || type === 'project_management') return 2;
  return type ?? 0;
});

const isAdminWithPagination = computed(() => userRole.value == 1);

/** Maps UI filter (all|pending|approved|archive) to API status param (pending|approved|rejected). */
function mapStatusForApi(filter) {
  if (filter === 'all') return undefined;
  if (filter === 'pending') return 'pending';
  if (filter === 'approved') return 'approved';
  if (filter === 'archive') return 'rejected';
  return undefined;
}

/** Normalize raw status from API to display value (Pending|Approved|Refused). Backend may use status, approval_status, project_progress, etc. */
function normalizeStatusFromApi(contract) {
  const raw = (
    contract?.status ??
    contract?.approval_status ??
    contract?.contract_status ??
    contract?.admin_status ??
    contract?.admin_approval_status ??
    contract?.data?.status ??
    contract?.contract?.status ??
    ''
  )
    .toString()
    .toLowerCase()
    .trim();
  const approvedValues = [
    'approved', 'معتمد', '1', 'completed', 'مكتمل', 'complete', 'done', 'finished', 'closed', 'مغلق', 'active', 'نشط'
  ];
  const refusedValues = [
    'rejected', 'refused', 'مرفوض', '0', 'cancelled', 'ملغى', 'canceled'
  ];
  if (approvedValues.includes(raw)) return 'Approved';
  if (refusedValues.includes(raw)) return 'Refused';
  // احتياطي: إذا كانت حالة الاعتماد غير معتمدة لكن حالة المشروع مكتملة، نعرض معتمد
  const progress = (contract?.project_progress ?? contract?.progress ?? '')
    .toString()
    .toLowerCase()
    .trim();
  if (progress && ['completed', 'مكتمل', 'complete', 'done', 'finished', 'closed'].includes(progress)) {
    return 'Approved';
  }
  return 'Pending';
}

/** تحديث حالة عقد في القائمة محلياً (تحديث تفاؤلي بعد الموافقة/الرفض) */
function updateContractStatusInList(contractId, newStatus) {
  const id = contractId ?? selectedContract.value?.id ?? selectedContract.value?.contract_id;
  if (id == null) return;
  const idx = contracts.value.findIndex(
    c => (c.id ?? c.contract_id) === id || (c.id ?? c.contract_id) == id
  );
  if (idx === -1) return;
  const c = contracts.value[idx];
  c.status = newStatus;
  c.pending = newStatus === 'Pending';
  c.approved = newStatus === 'Approved';
  c.rejected = newStatus === 'Refused';
}

/** Maps API contract to view model (number, developer, createdDate, status: Pending|Approved|Refused, type). */
function mapContract(contract) {
  if (!contract || typeof contract !== 'object') return contract;
  const status = normalizeStatusFromApi(contract);
  const created = contract.created_at ?? contract.createdAt ?? contract.date;
  const createdDate =
    created instanceof Date
      ? created.toLocaleDateString('ar-SA', { numberingSystem: 'latn' })
      : created
        ? new Date(created).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            numberingSystem: 'latn',
          })
        : '—';
  const commRaw = contract.commission_percent ?? contract.commission_percentage ?? contract.info?.commission_percent;
  let commissionLabel = '—';
  if (commRaw !== undefined && commRaw !== null && String(commRaw).trim() !== '') {
    const n = parseFloat(String(commRaw).replace(/%/g, '').replace(/,/g, '').trim());
    commissionLabel = Number.isFinite(n) ? `${n}%` : `${String(commRaw).trim()}%`;
  }
  return {
    ...contract,
    id: contract.id ?? contract.contract_id,
    number: contract.number ?? contract.project_name ?? contract.id ?? contract.contract_id ?? '—',
    developer: contract.developer_name ?? contract.developer ?? contract.second_party_name ?? '—',
    commissionLabel,
    createdDate,
    status,
    type: contract.contract_type ?? contract.type ?? 'Full Contract',
    marketer: contract.marketer_name ?? contract.marketer ?? contract.user_name ?? '—',
    pending: status === 'Pending',
    rejected: status === 'Refused',
    approved: status === 'Approved',
  };
}

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
      const status = mapStatusForApi(activeFilter.value);
      const { items, total } = await contractService.getContracts({
        page: currentPage.value,
        per_page: perPage.value,
        ...(status && { status }),
      });
      contracts.value = (Array.isArray(items) ? items : []).map(mapContract);
      totalFromApi.value = total;
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

const paginatedContracts = computed(() => filteredContracts.value);

const handlePageChange = page => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fetchContracts();
};

const handlePerPageChange = newPerPage => {
  perPage.value = newPerPage;
  currentPage.value = 1;
  fetchContracts();
};

const totalCount = computed(() => totalFromApi.value);
const pendingCount = computed(() => contracts.value.filter(c => c.status === 'Pending').length);
const approvedCount = computed(
  () => contracts.value.filter(c => c.status === 'Approved').length
);
const archiveCount = computed(() => contracts.value.filter(c => c.status === 'Refused').length);

const viewContract = async c => {
  try {
    // جلب تفاصيل العقد الكاملة من API (الحالة الفعلية من الخادم)
    let fullDetails;
    if (userRole.value == 4) {
      fullDetails = await contractService.getEditorContractById(c.id);
    } else {
      fullDetails = await contractService.getContractById(c.id);
    }

    const merged = { ...c, ...fullDetails };
    // توحيد الحالة من الاستجابة حتى لا نعرض "معلق" بينما الخادم يعتبرها معتمدة/مرفوضة
    merged.status = normalizeStatusFromApi(merged);
    merged.pending = merged.status === 'Pending';
    merged.approved = merged.status === 'Approved';
    merged.rejected = merged.status === 'Refused';
    selectedContract.value = merged;
    showModal.value = true;
  } catch (error) {
    logger.error('Error fetching contract details:', error);
    toast.error(getApiErrorMessage(error, 'فشل تحميل تفاصيل العقد'));
    selectedContract.value = c;
    showModal.value = true;
  }
};
const closeModal = () => {
  showModal.value = false;
  selectedContract.value = null;
};

const handleApprove = async (c, notes = '') => {
  // عند الاستدعاء من الـ Modal لا يُمرَّر عقد (الـ Modal نفّذ الطلب مسبقاً)
  if (c != null && (c.id ?? c.contract_id)) {
    try {
      await contractService.approveContract(c.id ?? c.contract_id, notes);
      toast.success('تم اعتماد العقد');
      updateContractStatusInList(c.id ?? c.contract_id, 'Approved');
    } catch (err) {
      logger.error('Error approving contract:', err);
      showApiError(err);
      fetchContracts();
      return;
    }
  } else {
    // استدعاء من الـ Modal: تحديث تفاؤلي فوري ثم إعادة جلب القائمة
    const sel = selectedContract.value;
    const id = sel?.id ?? sel?.contract_id;
    if (id != null) updateContractStatusInList(id, 'Approved');
  }
  fetchContracts();
  closeModal();
};

const handleReject = async (c, notes = '') => {
  if (c != null && (c.id ?? c.contract_id)) {
    try {
      await contractService.rejectContract(c.id ?? c.contract_id, notes);
      toast.success('تم رفض العقد');
      updateContractStatusInList(c.id ?? c.contract_id, 'Refused');
    } catch (err) {
      logger.error('Error rejecting contract:', err);
      showApiError(err);
      fetchContracts();
      return;
    }
  } else {
    const sel = selectedContract.value;
    const id = sel?.id ?? sel?.contract_id;
    if (id != null) updateContractStatusInList(id, 'Refused');
  }
  fetchContracts();
  closeModal();
};

function openEditModal(contract) {
  if (!contract?.id) return;
  editingContractId.value = contract.id;
  editingContractData.value = contract;
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  editingContractId.value = null;
  editingContractData.value = null;
}

function onExclusiveProjectSaved() {
  closeEditModal();
  fetchContracts();
}

watch(activeFilter, () => {
  currentPage.value = 1;
  if (isAdminWithPagination.value) fetchContracts();
});

onMounted(fetchContracts);
</script>

<style scoped src="./styles/ContractsView.scoped.s1.css"></style>
