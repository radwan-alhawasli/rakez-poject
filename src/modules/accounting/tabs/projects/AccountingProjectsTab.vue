<template>
  <div class="management-view accounting-projects-tab">
    <header class="welcome-header projects-hero">
      <div class="projects-hero-inner">
        <span class="title-icon-wrap">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </span>
        <div class="projects-hero-text">
          <h1 class="welcome-title">المشاريع والمطالبات</h1>
          <p class="welcome-subtitle">إدارة الوحدات المباعة وإنشاء ملفات المطالبة المجمعة.</p>
        </div>
      </div>
    </header>

    <div class="projects-content">
      <!-- Top Actions Bar (Match Screenshot 5) -->
      <div class="projects-top-bar">
        <div class="top-bar-left">
          <button 
             class="btn-create-combined" 
             :disabled="selectedReservationIds.length === 0 || isCreatingClaim"
             @click="handleCreateClaim"
          >
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
               <polyline points="14 2 14 8 20 8"></polyline>
               <line x1="12" y1="18" x2="12" y2="12"></line>
               <line x1="9" y1="15" x2="15" y2="15"></line>
             </svg>
             إنشاء ملف مجمع ({{ selectedReservationIds.length }})
          </button>

        </div>

        <div class="top-bar-right">
          <div class="toggle-group">
            <button 
              class="toggle-btn" 
              :class="{ active: activeSubTab === 'units' }" 
              @click="activeSubTab = 'units'"
            >
              الوحدات والمطالبات الجديدة
            </button>
            <button 
              class="toggle-btn" 
              :class="{ active: activeSubTab === 'claims' }" 
              @click="activeSubTab = 'claims'"
            >
              ملفات المطالبة الحالية
            </button>
          </div>
        </div>

      </div>

      <!-- FILTER BAR (Refined) -->
      <div class="filter-bar-v2" v-if="activeSubTab !== 'claims'">
         <div class="filter-controls">
            <div class="filter-item">
              <label>المشروع:</label>
              <select v-model="filters.contract_id" @change="loadSoldUnits">
                <option value="">كل المشاريع</option>
                <option v-for="proj in projects" :key="proj.id" :value="proj.id">
                  {{ proj.project_name || proj.name }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label>حالة المطالبة:</label>
              <select v-model="filters.has_claim_file" @change="loadSoldUnits">
                <option value="">الكل</option>
                <option :value="0">بدون ملف مطالبة</option>
                <option :value="1">يوجد ملف مطالبة</option>
              </select>
            </div>
         </div>
         <div class="search-wrap">
           <input type="text" v-model="searchQuery" placeholder="بحث برقم الحجز أو الوحدة..." class="search-input">
           <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <circle cx="11" cy="11" r="8"></circle>
             <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
           </svg>
         </div>
      </div>

      <!-- UNITS & NEW CLAIMS SECTION -->
      <section v-if="activeSubTab === 'units'" class="units-section">

        <div v-if="isLoadingUnits" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل الوحدات...</p>
        </div>

        <div v-else-if="soldUnits.length === 0" class="empty-state">
          <p>لا توجد وحدات تطابق الفلترة الحالية.</p>
        </div>

        <div v-else class="table-wrap">
          <div class="table-header-row">
            <h2 class="section-title">الوحدات المباعة — {{ currentProjectName }}</h2>
          </div>
          <div class="metrics-table-container">
            <table class="metrics-table">
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox" 
                      :checked="isAllSelected" 
                      @change="toggleSelectAll"
                      :disabled="filters.has_claim_file === 1"
                    >
                  </th>
                  <th>رقم الحجز</th>
                  <th>الوحدة</th>
                  <th>مبلغ المطالبة</th>
                  <th>ملف مطالبة</th>
                  <th>تحميل</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="unit in filteredSoldUnits" :key="unit.reservation_id">
                  <td>
                    <input 
                      type="checkbox" 
                      v-model="selectedReservationIds" 
                      :value="unit.reservation_id"
                      :disabled="unit.has_claim_file"
                    >
                  </td>
                  <td>{{ unit.reservation_id }}</td>
                  <td>{{ unit.unit_number }}</td>
                  <td>{{ formatCurrency(unit.claim_amount) }}</td>
                  <td>
                    <span v-if="unit.has_claim_file" class="status-badge" :class="unit.claim_file_status">
                      #{{ unit.claim_file_id }} - {{ unit.claim_file_status === 'completed' ? 'مكتمل' : 'قيد الانتظار' }}
                    </span>
                    <span v-else class="status-badge none">لا يوجد</span>
                  </td>
                  <td>
                    <div class="claim-actions claim-actions--units">
                      <button
                        v-if="unit.has_claim_file"
                        class="btn-download"
                        :disabled="viewingClaimId === unit.claim_file_id"
                        @click="handleViewClaimFileForUnit(unit)"
                      >
                        {{ viewingClaimId === unit.claim_file_id ? 'جاري العرض...' : 'عرض ملف المطالبه' }}
                      </button>
                      <button 
                        v-if="unit.has_pdf" 
                        class="btn-download-small" 
                        @click="openPdf(unit.download_path)"
                      >
                        تحميل
                      </button>
                      <span v-if="!unit.has_claim_file && !unit.has_pdf" class="cell-placeholder">—</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </section>

      <!-- EXISTING CLAIMS SECTION -->
      <section v-if="activeSubTab === 'claims'" class="claims-section">
        <div v-if="isLoadingClaims" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل ملفات المطالبة...</p>
        </div>

        <div v-else-if="claimFiles.length === 0" class="empty-state">
          <p>لا توجد ملفات مطالبة حالية.</p>
        </div>

        <div v-else class="table-wrap">
          <div class="metrics-table-container">
            <table class="metrics-table">
              <thead>
                <tr>
                  <th>رقم الملف</th>
                  <th>عدد الوحدات</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="claim in claimFiles" :key="claim.id">
                  <td>
                    <div class="claim-id-wrap">
                      <span class="claim-id-label">#{{ claim.id }}-{{ getProjectNameForClaim(claim) || 'مشروع' }}</span>
                      <span class="claim-count-pill">{{ claim.reservation_ids?.length || 0 }}</span>
                    </div>
                    <div class="claim-units-list">
                      <span class="units-label">الوحدات:</span>
                      <span class="units-values">{{ formatClaimUnits(claim) }}</span>
                    </div>
                  </td>



                  <td>{{ claim.reservation_ids?.length || 0 }}</td>
                  <td>
                    <span class="status-badge" :class="claim.status">
                      {{ getClaimStatusText(claim.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="claim-actions">
                      <button
                        class="btn-generate-pdf"
                        :disabled="isClaimActionLoading(claim.id)"
                        @click="handleSendClaimFileToDeveloper(claim)"
                      >
                        {{ sendingClaimId === claim.id ? '\u062c\u0627\u0631\u064a \u0627\u0644\u0625\u0631\u0633\u0627\u0644...' : '\u0625\u0631\u0633\u0627\u0644 \u0645\u0644\u0641 \u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0629 \u0644\u0644\u0645\u0637\u0648\u0631' }}
                      </button>
                      <button
                        class="btn-download"
                        :disabled="isClaimActionLoading(claim.id)"
                        @click="handleViewClaimFile(claim)"
                      >
                        {{ viewingClaimId === claim.id ? '\u062c\u0627\u0631\u064a \u0627\u0644\u0639\u0631\u0636...' : '\u0639\u0631\u0636 \u0645\u0644\u0641 \u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0647' }}
                      </button>
                      <button
                        class="btn-pdf"
                        :disabled="isClaimActionLoading(claim.id) || claim.status === 'completed'"
                        @click="handleConfirmCommissionReceived(claim)"
                      >
                        {{ confirmingClaimId === claim.id ? '\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u0623\u0643\u064a\u062f...' : '\u062a\u0627\u0643\u064a\u062f \u0627\u0633\u062a\u0644\u0627\u0645 \u0627\u0644\u0639\u0645\u0648\u0644\u0647' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import accountingService from '@/services/accountingService';
import { contractServiceMarketerMethods } from '@/services/contracts/contractServiceMarketer';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';


const activeSubTab = ref('units');
const isLoadingUnits = ref(false);
const isLoadingClaims = ref(false);
const isCreatingClaim = ref(false);

const projects = ref([]);
const soldUnits = ref([]);
const claimFiles = ref([]);
const selectedReservationIds = ref([]);
const sendingClaimId = ref(null);
const viewingClaimId = ref(null);
const confirmingClaimId = ref(null);

const searchQuery = ref('');

const filters = ref({
  contract_id: '',
  has_claim_file: ''
});


onMounted(async () => {
  await loadProjects();
  await loadSoldUnits();
  await loadClaimFiles();
});

async function loadProjects() {
  try {
    // Using marketer endpoint instead of admin-index to avoid 403 Forbidden for accounting users
    const res = await contractServiceMarketerMethods.getContracts({ per_page: 1000 });
    projects.value = res.items || [];
  } catch (error) {
    logger.error('Failed to load projects:', error);
  }
}


async function loadSoldUnits() {
  isLoadingUnits.value = true;
  try {
    const params = {};
    if (filters.value.contract_id) params.contract_id = filters.value.contract_id;
    if (filters.value.has_claim_file !== '') params.has_claim_file = filters.value.has_claim_file;
    
    // If it's "individual" tab, we might want to filter only those that don't have a claim yet
    // or handle it differently. For now, we'll keep the same data fetch.
    soldUnits.value = await accountingService.getClaimFileSoldUnits(params);
    selectedReservationIds.value = [];
  } catch (error) {
    logger.error('Failed to load sold units:', error);
  } finally {
    isLoadingUnits.value = false;
  }
}


async function loadClaimFiles() {
  isLoadingClaims.value = true;
  try {
    const res = await accountingService.getClaimFiles();
    claimFiles.value = res.items || [];
  } catch (error) {
    logger.error('Failed to load claim files:', error);
  } finally {
    isLoadingClaims.value = false;
  }
}

async function handleCreateClaim() {
  if (selectedReservationIds.value.length === 0) return;
  isCreatingClaim.value = true;
  try {
    // Correct payload for combined claim as per user request:
    // booking_ids instead of reservation_ids
    // claim_type: commission
    const payload = {
      booking_ids: selectedReservationIds.value,          
      claim_type: 'commission'
    };
    
    if (filters.value.contract_id) {
      payload.contract_id = filters.value.contract_id;
    }

    await accountingService.createCombinedClaimFile(payload);
    
    selectedReservationIds.value = [];
    activeSubTab.value = 'claims';
    await loadClaimFiles();
    await loadSoldUnits();
  } catch (error) {
    logger.error('Failed to create claim:', error);
  } finally {
    isCreatingClaim.value = false;
  }
}




function isClaimActionLoading(claimId) {
  return (
    sendingClaimId.value === claimId ||
    viewingClaimId.value === claimId ||
    confirmingClaimId.value === claimId
  );
}

async function handleSendClaimFileToDeveloper(claim) {
  const claimId = claim?.id;
  if (!claimId) return;
  sendingClaimId.value = claimId;
  try {
    const res = await accountingService.generateClaimFilePdf(claimId);
    if (res?.download_url) claim.download_url = res.download_url;
    notificationService.addNotification(
      '\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0645\u0644\u0641 \u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0629 \u0644\u0644\u0645\u0637\u0648\u0631 \u0628\u0646\u062c\u0627\u062d',
      'success',
    );
    await loadClaimFiles();
  } catch (error) {
    logger.error('Failed to send claim file to developer:', error);
    notificationService.addNotification(
      '\u062a\u0639\u0630\u0631 \u0625\u0631\u0633\u0627\u0644 \u0645\u0644\u0641 \u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0629 \u0644\u0644\u0645\u0637\u0648\u0631',
      'error',
    );
  } finally {
    sendingClaimId.value = null;
  }
}

async function handleViewClaimFile(claim) {
  const claimId = claim?.id;
  if (!claimId) return;
  viewingClaimId.value = claimId;
  try {
    const res = await accountingService.generateClaimFilePdf(claimId);
    const pdfPath = res?.download_url || res?.download_path || res?.pdf_path || claim?.download_url;
    if (res?.download_url) claim.download_url = res.download_url;
    if (pdfPath) {
      openPdf(pdfPath);
      notificationService.addNotification(
        '\u062a\u0645 \u0641\u062a\u062d \u0645\u0644\u0641 \u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0629',
        'success',
      );
    } else {
      notificationService.addNotification(
        '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0631\u0627\u0628\u0637 \u0645\u0644\u0641 \u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0629',
        'warning',
      );
    }
    await loadClaimFiles();
  } catch (error) {
    logger.error('Failed to view claim file:', error);
    notificationService.addNotification(
      '\u062a\u0639\u0630\u0631 \u0639\u0631\u0636 \u0645\u0644\u0641 \u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0629',
      'error',
    );
  } finally {
    viewingClaimId.value = null;
  }
}

async function handleViewClaimFileForUnit(unit) {
  const claimId = Number(unit?.claim_file_id || unit?.claim_id || 0);
  if (!Number.isFinite(claimId) || claimId <= 0) {
    if (unit?.download_path) {
      openPdf(unit.download_path);
      return;
    }
    notificationService.addNotification('لا يوجد ملف مطالبة لهذه الوحدة', 'warning');
    return;
  }

  viewingClaimId.value = claimId;
  try {
    const res = await accountingService.generateClaimFilePdf(claimId);
    const pdfPath = res?.download_url || res?.download_path || res?.pdf_path || unit?.download_path;
    if (pdfPath) {
      openPdf(pdfPath);
      notificationService.addNotification('تم فتح ملف المطالبة', 'success');
    } else {
      notificationService.addNotification('لم يتم العثور على رابط ملف المطالبة', 'warning');
    }
  } catch (error) {
    logger.error('Failed to view claim file from unit row:', error);
    notificationService.addNotification('تعذر عرض ملف المطالبة', 'error');
  } finally {
    viewingClaimId.value = null;
  }
}

async function handleConfirmCommissionReceived(claim) {
  const claimId = claim?.id;
  if (!claimId) return;
  confirmingClaimId.value = claimId;
  try {
    await accountingService.updateClaimFileStatus(claimId, 'completed');
    claim.status = 'completed';
    await loadClaimFiles();
    notificationService.addNotification(
      '\u062a\u0645 \u062a\u0627\u0643\u064a\u062f \u0627\u0633\u062a\u0644\u0627\u0645 \u0627\u0644\u0639\u0645\u0648\u0644\u0647 \u0628\u0646\u062c\u0627\u062d',
      'success',
    );
  } catch (error) {
    logger.error('Failed to confirm commission received:', error);
    notificationService.addNotification(
      '\u062a\u0639\u0630\u0631 \u062a\u0627\u0643\u064a\u062f \u0627\u0633\u062a\u0644\u0627\u0645 \u0627\u0644\u0639\u0645\u0648\u0644\u0647',
      'error',
    );
    await loadClaimFiles();
  } finally {
    confirmingClaimId.value = null;
  }
}

function openPdf(url) {
  if (!url) return;
  // If it's a relative path, we might need to prepend base URL
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  window.open(fullUrl, '_blank');
}


function formatCurrency(val) {
  if (!val) return '0.00 ريال';
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(val);
}

function getClaimStatusText(status) {
  return status === 'completed'
    ? '\u0645\u0643\u062a\u0645\u0644'
    : '\u0642\u064a\u062f \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631';
}

const currentProjectName = computed(() => {
  if (!filters.value.contract_id) return 'كل المشروع';
  const proj = projects.value.find(p => String(p.id) === String(filters.value.contract_id));
  return proj ? (proj.project_name || proj.name) : 'المشروع';
});

function getProjectNameForClaim(claim) {
  if (claim.project_name) return claim.project_name;
  if (claim.contract?.project_name) return claim.contract.project_name;
  // Fallback: if we have contract_id in the claim or can find it via first reservation
  if (claim.contract_id) {
    const proj = projects.value.find(p => String(p.id) === String(claim.contract_id));
    if (proj) return proj.project_name || proj.name;
  }
  return '';
}

function formatClaimUnits(claim) {
  if (claim.unit_numbers && Array.isArray(claim.unit_numbers)) {
    return claim.unit_numbers.join('، ');
  }
  if (claim.reservation_ids && Array.isArray(claim.reservation_ids)) {
    return claim.reservation_ids.map(id => `حجز ${id}`).join('، ');
  }
  return '—';
}



const filteredSoldUnits = computed(() => {
  let units = soldUnits.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    units = units.filter(u => 
      String(u.reservation_id).includes(q) || 
      String(u.unit_number).toLowerCase().includes(q)
    );
  }
  return units;
});

const isAllSelected = computed(() => {
  const selectable = filteredSoldUnits.value.filter(u => !u.has_claim_file);
  return selectable.length > 0 && selectedReservationIds.value.length === selectable.length;
});

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedReservationIds.value = [];
  } else {
    selectedReservationIds.value = filteredSoldUnits.value
      .filter(u => !u.has_claim_file)
      .map(u => u.reservation_id);
  }
}

</script>

<style scoped src="./styles/AccountingProjectsTab.css"></style>

