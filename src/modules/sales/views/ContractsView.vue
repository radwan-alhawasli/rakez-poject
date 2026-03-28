<template>
  <div class="contracts-view">
    <div class="welcome-header">
      <h1 class="welcome-title">إدارة العقود والطلبات</h1>
      <p class="welcome-subtitle">مراجعة واعتماد عقود المشاريع الجديدة والطلبات الحصرية.</p>
    </div>

    <MobileFilterSheet>
      <div class="controls-Modern-area">
        <div class="modern-tabs">
          <button v-for="t in tabs" :key="t.id" :class="['tab-item', { active: activeFilter === t.id }]" @click="activeFilter = t.id">
            {{ t.label }} <span class="tab-count">{{ counts[t.id] }}</span>
          </button>
        </div>

        <div class="search-container">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input v-model="searchQuery" type="text" class="search-input" placeholder="البحث برقم العقد أو اسم المشروع..." />
        </div>
      </div>
    </MobileFilterSheet>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">جاري تحميل العقود...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-text">{{ error }}</p>
      <button class="retry-btn" @click="fetchContracts">إعادة المحاولة</button>
    </div>

    <template v-else>
      <ContractTable :contracts="filteredContracts" @view="viewContract" @edit="openEditModal" />
      
      <Pagination
        v-if="counts.total > 0"
        :current-page="currentPage" :total-items="counts.total" :per-page="perPage"
        @page-change="handlePageChange" @per-page-change="handlePerPageChange"
      />
    </template>

    <ContractModal v-if="showModal" :contract="selectedContract" @close="closeModal" @approve="handleApprove" @reject="handleReject" />

    <EditExclusiveProjectModal
      v-if="showEditModal" :contract-id="editingId" :initial-data="editingData"
      @close="showEditModal = false" @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import ContractModal from '@/components/ContractModal.vue';
import EditExclusiveProjectModal from '@/components/EditExclusiveProjectModal.vue';
import Pagination from '@/components/Pagination.vue';
import MobileFilterSheet from '@/components/MobileFilterSheet.vue';
import ContractTable from './contracts/components/ContractTable.vue';
import { useContracts } from '../composables/useContracts';
import contractService from '@/services/contractService';
import { toast } from '@/composables/useToast';
import { normalizeContractStatus } from '../utils/contractMapper';

const {
  contracts, filteredContracts, isLoading, error,
  activeFilter, searchQuery, currentPage, perPage, counts,
  fetchContracts, userRole
} = useContracts();

const tabs = [
  { id: 'all', label: 'كل السجلات' },
  { id: 'pending', label: 'المعلقة' },
  { id: 'approved', label: 'العقود المقبولة' },
  { id: 'archive', label: 'الأرشيف' }
];

const showModal = ref(false);
const selectedContract = ref(null);
const showEditModal = ref(false);
const editingId = ref(null);
const editingData = ref(null);

const viewContract = async c => {
  try {
    const data = (userRole.value == 4) ? await contractService.getEditorContractById(c.id) : await contractService.getContractById(c.id);
    const merged = { ...c, ...data };
    merged.status = normalizeContractStatus(merged);
    selectedContract.value = merged;
    showModal.value = true;
  } catch (e) { toast.error('فشل تحميل التفاصيل'); }
};

const closeModal = () => { showModal.value = false; selectedContract.value = null; };

const handleApprove = async (c, notes = '') => {
  const id = c?.id || selectedContract.value?.id;
  if (!id) return;
  try {
    await contractService.approveContract(id, notes);
    toast.success('تم الاعتماد'); fetchContracts(); closeModal();
  } catch (e) { toast.error('فشل الاعتماد'); }
};

const handleReject = async (c, notes = '') => {
  const id = c?.id || selectedContract.value?.id;
  if (!id) return;
  try {
    await contractService.rejectContract(id, notes);
    toast.success('تم الرفض'); fetchContracts(); closeModal();
  } catch (e) { toast.error('فشل الرفض'); }
};

const openEditModal = c => { editingId.value = c.id; editingData.value = c; showEditModal.value = true; };
const onSaved = () => { showEditModal.value = false; fetchContracts(); };
const handlePageChange = p => { currentPage.value = p; fetchContracts(); };
const handlePerPageChange = pp => { perPage.value = pp; currentPage.value = 1; fetchContracts(); };

watch(activeFilter, () => { currentPage.value = 1; fetchContracts(); });
</script>

<style scoped>
.contracts-view { animation: fadeIn 0.4s ease-out; direction: rtl; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.controls-Modern-area { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.modern-tabs { display: flex; background: #f1f5f9; padding: 6px; border-radius: 12px; gap: 8px; }
.tab-item { padding: 10px 24px; border: none; background: transparent; border-radius: 8px; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 10px; }
.tab-item.active { background: white; color: #1e3a5f; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.tab-count { background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 6px; font-size: 11px; }
.tab-item.active .tab-count { background: #b1a28f; color: white; }
.search-container { position: relative; min-width: 300px; }
.search-icon { position: absolute; right: 14px; top: 12px; width: 18px; height: 18px; color: #94a3b8; }
.search-input { width: 100%; padding: 10px 40px 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #b1a28f; border-radius: 50%; animation: spin 1s linear infinite; margin: 40px auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state, .error-state { text-align: center; padding: 80px; background: #fff; border-radius: 12px; }
.retry-btn { padding: 10px 24px; background: #b1a28f; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
</style>
