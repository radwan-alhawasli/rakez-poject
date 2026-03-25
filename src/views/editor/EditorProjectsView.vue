<template>
  <div class="editor-projects-view">
    <div class="page-header">
      <h1 class="page-title">المشاريع</h1>
      <p class="page-subtitle">قبل المونتاج وبعد المونتاج حسب حالة التصوير والمونتاج.</p>
    </div>

    <div class="tabs-row">
      <button
        :class="['tab-btn', { active: activeTab === 'before' }]"
        @click="activeTab = 'before'"
      >
        قبل المونتاج ({{ beforeMontage.length }})
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'after' }]"
        @click="activeTab = 'after'"
      >
        بعد المونتاج ({{ afterMontage.length }})
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المشاريع...</p>
    </div>

    <template v-else>
      <!-- Before Montage -->
      <section v-if="activeTab === 'before'" class="content-panel">
        <div v-if="beforeMontage.length === 0" class="empty-state">
          <p>لا توجد مشاريع قبل المونتاج.</p>
        </div>
        <div v-else class="cards-grid">
          <EditorProjectCard
            v-for="p in beforeMontage"
            :key="p.id"
            :project="p"
            :is-manager="isManager"
            status-label="قبل المونتاج"
            status-class="status-pending"
            @add-links="openDetail($event)"
            @see-more="openSeeMore($event)"
            @approve="doApprove($event.id)"
            @reject="openRejectModal($event.id)"
          />
        </div>
      </section>

      <!-- After Montage -->
      <section v-if="activeTab === 'after'" class="content-panel">
        <div v-if="afterMontage.length === 0" class="empty-state">
          <p>لا توجد مشاريع بعد المونتاج.</p>
        </div>
        <template v-else>
          <div class="cards-grid">
            <EditorProjectCard
              v-for="p in afterMontage"
              :key="p.id"
              :project="p"
              :is-manager="isManager"
              :status-label="montageStatusLabel(p)"
              :status-class="montageStatusClass(p)"
              :has-links="isManager ? (montageHasLinksMap[p.id] ?? null) : null"
              @add-links="openDetail($event)"
              @see-more="openSeeMore($event)"
              @approve="doApprove($event.id)"
              @reject="openRejectModal($event.id)"
            />
          </div>
        </template>
      </section>
    </template>

    <!-- Detail + Montage Modal -->
    <div v-if="selectedProject" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-box modal-large">
        <div class="modal-header">
          <h2>{{ selectedProject.name || selectedProject.project_name || selectedProject.title || selectedProject.project_title || selectedProject.contract_number || 'تفاصيل المشروع' }}</h2>
          <button type="button" class="btn-close" @click="closeDetail">×</button>
        </div>
        <div v-if="detailLoading" class="loading-inline">جاري تحميل التفاصيل...</div>
        <template v-else>
          <div v-if="detail || montageData" class="detail-fields">
            <p><strong>رقم المعلن:</strong> <span :class="{ 'value-null': !displayDetail.advertiser_number }">{{ displayDetail.advertiser_number ?? '—' }}</span></p>
            <p><strong>رابط التصوير:</strong>
              <a v-if="displayDetail.photography_link && displayDetail.photography_link !== '—'" :href="displayDetail.photography_link" target="_blank" rel="noopener noreferrer" class="link-cell">{{ displayDetail.photography_link }}</a>
              <span v-else :class="{ 'value-null': true }">—</span></p>
            <p><strong>الوصف:</strong> <span :class="{ 'value-null': !displayDetail.description }">{{ displayDetail.description ?? '—' }}</span></p>
            <p><strong>الوحدات المتاحة:</strong> <span :class="{ 'value-null': displayDetail.available_units == null }">{{ displayDetail.available_units !== undefined && displayDetail.available_units !== null ? displayDetail.available_units : '—' }}</span></p>
          </div>
          <!-- Rejection reason (for editor to see) -->
          <div v-if="montageData?.rejection_reason" class="rejection-section">
            <h4>سبب الرفض من المدير</h4>
            <p class="rejection-text">{{ montageData.rejection_reason }}</p>
          </div>
          <!-- Montage form: images, videos, description -->
          <div class="montage-form-section">
            <h4>قسم المونتاج (صور، فيديو، وصف)</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>رابط الصور</label>
                <input v-model="montageForm.image_url" type="text" class="form-input" placeholder="URL" />
              </div>
              <div class="form-group">
                <label>رابط الفيديو</label>
                <input v-model="montageForm.video_url" type="text" class="form-input" placeholder="URL" />
              </div>
              <div class="form-group full-width">
                <label>الوصف</label>
                <textarea v-model="montageForm.description" class="form-input" rows="3" placeholder="الوصف"></textarea>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeDetail">إغلاق</button>
              <button type="button" class="btn-primary" :disabled="montageSaving" @click="submitMontage">
                {{ montageData && Object.keys(montageData).length ? 'تحديث' : 'حفظ' }}
              </button>
            </div>
          </div>
          <!-- Manager: Approve / Reject (after montage only, إن لم يُعتمد/يُرفض بعد) -->
          <div
            v-if="
              isManager &&
              activeTab === 'after' &&
              montageData &&
              (selectedProject.has_montage_data == 1 || selectedProject.has_montage == 1 || selectedProject.has_montage === true) &&
              !isMontageDecisionFinal(selectedProject, montageStatusLabel(selectedProject))
            "
            class="manager-actions"
          >
            <h4>قرار المدير</h4>
            <div class="action-buttons">
              <button type="button" class="btn-approve" @click="doApprove(selectedProject.id)">قبول</button>
              <button type="button" class="btn-reject" @click="openRejectModal(selectedProject.id)">رفض</button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- See More modal (third screen): detail only, expandable long content -->
    <div v-if="seeMoreProject" class="modal-overlay" @click.self="closeSeeMore">
      <div class="modal-box modal-large modal-see-more">
        <div class="modal-header">
          <h2>{{ seeMoreProject.name || seeMoreProject.project_name || seeMoreProject.title || seeMoreProject.contract_number || 'تفاصيل المشروع' }}</h2>
          <button type="button" class="btn-close" @click="closeSeeMore">×</button>
        </div>
        <div v-if="seeMoreLoading" class="loading-inline">جاري تحميل التفاصيل...</div>
        <template v-else>
          <div class="detail-fields see-more-fields">
            <div class="detail-field" :class="{ expanded: seeMoreExpanded.advertiser }">
              <p><strong>رقم المعلن:</strong> <span :class="{ 'value-null': !seeMoreDisplay.advertiser_number }">{{ seeMoreDisplay.advertiser_number ?? '—' }}</span></p>
              <button v-if="isLongContent(seeMoreDisplay.advertiser_number)" type="button" class="btn-expand" @click="seeMoreExpanded.advertiser = !seeMoreExpanded.advertiser">{{ seeMoreExpanded.advertiser ? 'عرض أقل' : 'عرض المزيد' }}</button>
            </div>
            <div class="detail-field" :class="{ expanded: seeMoreExpanded.photography }">
              <p><strong>رابط التصوير:</strong>
                <a v-if="seeMoreDisplay.photography_link" :href="seeMoreDisplay.photography_link" target="_blank" rel="noopener noreferrer" class="link-cell">{{ seeMoreExpanded.photography ? seeMoreDisplay.photography_link : truncateUrl(seeMoreDisplay.photography_link) }}</a>
                <span v-else :class="{ 'value-null': true }">—</span>
              </p>
              <button v-if="isLongContent(seeMoreDisplay.photography_link)" type="button" class="btn-expand" @click="seeMoreExpanded.photography = !seeMoreExpanded.photography">{{ seeMoreExpanded.photography ? 'عرض أقل' : 'عرض المزيد' }}</button>
            </div>
            <div class="detail-field" :class="{ expanded: seeMoreExpanded.description }">
              <p><strong>الوصف:</strong> <span :class="{ 'value-null': !seeMoreDisplay.description }">{{ seeMoreExpanded.description ? (seeMoreDisplay.description ?? '—') : (truncateText(seeMoreDisplay.description, 80) ?? '—') }}</span></p>
              <button v-if="isLongContent(seeMoreDisplay.description)" type="button" class="btn-expand" @click="seeMoreExpanded.description = !seeMoreExpanded.description">{{ seeMoreExpanded.description ? 'عرض أقل' : 'عرض المزيد' }}</button>
            </div>
            <div class="detail-field" :class="{ expanded: seeMoreExpanded.units }">
              <p><strong>الوحدات المتاحة:</strong> <span :class="{ 'value-null': seeMoreDisplay.available_units == null }">{{ seeMoreDisplay.available_units !== undefined && seeMoreDisplay.available_units !== null ? seeMoreDisplay.available_units : '—' }}</span></p>
              <div v-if="seeMoreUnits.length" class="units-list">
                <button type="button" class="btn-expand" @click="seeMoreExpanded.units = !seeMoreExpanded.units">{{ seeMoreExpanded.units ? 'إخفاء تفاصيل الوحدات' : 'عرض تفاصيل الوحدات (' + seeMoreUnits.length + ')' }}</button>
                <ul v-if="seeMoreExpanded.units" class="units-expanded">
                  <li v-for="(u, i) in seeMoreUnits" :key="u.id || i">
                    {{ u.unit_type }} {{ u.unit_number }} — {{ u.status }} — {{ formatPrice(u.price) }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Reject reason modal -->
    <div v-if="rejectTargetId" class="modal-overlay" @click.self="rejectTargetId = null">
      <div class="modal-box">
        <h3>سبب الرفض</h3>
        <textarea v-model="rejectReason" class="form-input" rows="4" placeholder="أدخل سبب الرفض (إجباري)"></textarea>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="rejectTargetId = null">إلغاء</button>
          <button type="button" class="btn-reject" :disabled="!rejectReason.trim()" @click="doReject">إرسال الرفض</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authService from '@/services/authService';
import { useEditorProjects } from '@/composables/editor/useEditorProjects';
import editorService from '@/services/editorService';
import EditorProjectCard from '@/components/editor/EditorProjectCard.vue';
import { toast } from '@/composables/useToast';
import { isMontageDecisionFinal } from '@/utils/montageApproval';

const route = useRoute();
const router = useRouter();
const user = authService.getCurrentUser();
const isManager = computed(() => user?.is_manager === true || user?.is_manager === 1);

const {
  isLoading,
  beforeMontage,
  afterMontage,
  detail,
  detailLoading,
  montageData,
  fetchContracts,
  fetchDetail,
  fetchMontage,
  saveMontage,
  approveMontage,
  montageHasLinksMap,
  fetchMontageLinksForProjects,
  mergeContractDetail,
  preloadDetails,
} = useEditorProjects();

const activeTab = ref('before');
const selectedProject = ref(null);
const montageForm = ref({ image_url: '', video_url: '', description: '' });
const montageSaving = ref(false);
const rejectTargetId = ref(null);
const rejectReason = ref('');

const seeMoreProject = ref(null);
const seeMoreDetail = ref(null);
const seeMoreLoading = ref(false);
const seeMoreExpanded = ref({ advertiser: false, photography: false, description: false, units: false });

/**
 * Map editor/contracts/show response to display fields.
 * API shape: contract.second_party_data.advertiser_section_url, contract.photography_department.{ image_url, video_url, description }, contract.contract_units (array).
 */
function contractDisplayFromApi(contract) {
  if (!contract || typeof contract !== 'object') return null;
  const second = contract.second_party_data || {};
  const photo = contract.photography_department || {};
  const units = contract.contract_units ?? contract.units ?? [];
  const unitsArray = Array.isArray(units) ? units : [];
  return {
    advertiser_number: second.advertiser_section_url ?? contract.advertiser_number ?? second.advertiser_number ?? contract.advertiser_section_url,
    image_url: photo.image_url ?? contract.image_url,
    video_url: photo.video_url ?? contract.video_url,
    description: photo.description ?? contract.description,
    unitsCount: unitsArray.length,
    contract_units: unitsArray,
  };
}

// Merge contract detail + montage. Prefer API shape (second_party_data, photography_department, contract_units), then flat fields.
const displayDetail = computed(() => {
  const d = detail.value || {};
  const m = montageData.value || {};
  const fromApi = contractDisplayFromApi(d);
  const fromMontageContract = contractDisplayFromApi(m.contract || m.contract_data || {});
  const fallbackUnits = d.contract_units ?? d.units ?? m.contract_units ?? m.units ?? [];
  const fallbackCount = Array.isArray(fallbackUnits) ? fallbackUnits.length : 0;
  const fallback = {
    advertiser_number: d.advertiser_number ?? d.advertiser_section_url ?? m.advertiser_number,
    photography_link: d.photography_link ?? d.photography_url ?? d.image_url ?? m.photography_link ?? m.image_url,
    description: d.description ?? m.description,
    unitsCount: fallbackCount,
  };
  const api = fromApi || fromMontageContract;
  const advertiser_number = api?.advertiser_number ?? fallback.advertiser_number;
  const photography_link = api?.image_url ?? fallback.photography_link;
  const description = api?.description ?? fallback.description;
  const unitsCount = api?.unitsCount ?? fallback.unitsCount ?? 0;
  return {
    advertiser_number: advertiser_number ?? '—',
    photography_link: photography_link ?? '—',
    description: description ?? '—',
    available_units: unitsCount,
    units: api?.contract_units ?? [],
  };
});

const seeMoreDisplay = computed(() => {
  const d = seeMoreDetail.value || seeMoreProject.value || {};
  const api = contractDisplayFromApi(d);
  if (api) {
    return {
      advertiser_number: api.advertiser_number ?? '—',
      photography_link: api.image_url ?? null,
      description: api.description ?? null,
      available_units: api.unitsCount,
    };
  }
  const units = d.contract_units ?? d.units ?? [];
  const unitsArray = Array.isArray(units) ? units : [];
  return {
    advertiser_number: d.advertiser_number ?? d.advertiser_section_url ?? d.publisher_number ?? '—',
    photography_link: d.photography_link ?? d.photography_url ?? d.image_url ?? null,
    description: d.description ?? null,
    available_units: unitsArray.length,
  };
});

const seeMoreUnits = computed(() => {
  const d = seeMoreDetail.value || seeMoreProject.value || {};
  const api = contractDisplayFromApi(d);
  if (api) return api.contract_units || [];
  const units = d.contract_units ?? d.units ?? [];
  return Array.isArray(units) ? units : [];
});

watch(() => route.query.tab, (tab) => {
  if (tab === 'before' || tab === 'after') activeTab.value = tab;
}, { immediate: true });

watch(activeTab, (t) => {
  if (t === 'after' && isManager.value && afterMontage.value.length) {
    fetchMontageLinksForProjects(afterMontage.value.map(p => p.id));
  }
});

watch(afterMontage, (list) => {
  if (activeTab.value === 'after' && isManager.value && list.length) {
    fetchMontageLinksForProjects(list.map(p => p.id));
  }
}, { deep: true });

watch(selectedProject, async (p) => {
  if (!p) return;
  montageForm.value = { image_url: '', video_url: '', description: '' };
  await fetchDetail(p.id);
  await fetchMontage(p.id);
}, { flush: 'post' });

function applyMontageFormFromDetail() {
  if (!selectedProject.value) return;
  const d = detail.value || {};
  const m = montageData.value || {};
  const api = contractDisplayFromApi(d);
  montageForm.value = {
    image_url: (m && m.image_url) ?? api?.image_url ?? d.image_url ?? '',
    video_url: (m && m.video_url) ?? api?.video_url ?? d.video_url ?? '',
    description: (m && m.description) ?? api?.description ?? d.description ?? '',
  };
}

watch(montageData, applyMontageFormFromDetail, { deep: true });

watch(detail, () => {
  applyMontageFormFromDetail();
}, { deep: true });

watch(seeMoreProject, async (p) => {
  if (!p?.id) {
    seeMoreDetail.value = null;
    return;
  }
  seeMoreLoading.value = true;
  seeMoreDetail.value = null;
  seeMoreExpanded.value = { advertiser: false, photography: false, description: false, units: false };
  try {
    const data = await editorService.getContractById(p.id);
    seeMoreDetail.value = data ?? {};
    mergeContractDetail(p.id, data ?? {});
  } catch (_) {
    seeMoreDetail.value = { ...p };
  } finally {
    seeMoreLoading.value = false;
  }
}, { flush: 'post' });

onMounted(async () => {
  await fetchContracts();
  const tab = route.query.tab;
  if (tab === 'after' || tab === 'before') activeTab.value = tab;
  preloadDetails();
});

function openDetail(p) {
  selectedProject.value = p;
}

function openSeeMore(p) {
  seeMoreProject.value = p;
}

function closeSeeMore() {
  seeMoreProject.value = null;
  seeMoreDetail.value = null;
}

function openMontageForm(p) {
  selectedProject.value = p;
}

function closeDetail() {
  selectedProject.value = null;
}

function isLongContent(str, max = 60) {
  return typeof str === 'string' && str.length > max;
}

function truncateText(str, max = 80) {
  if (str == null || str === '') return null;
  const s = String(str);
  return s.length <= max ? s : s.slice(0, max) + '...';
}

function truncateUrl(url, max = 50) {
  if (!url) return '';
  const s = String(url);
  return s.length <= max ? s : s.slice(0, max) + '...';
}

function formatPrice(n) {
  if (n == null) return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('ar-SA', { style: 'decimal' }).format(num);
}

function montageStatusLabel(p) {
  const status = p.montage_status ?? p.approval_status ?? p.status;
  if (status === 'approved') return 'معتمد';
  if (status === 'rejected') return 'مرفوض';
  return 'قيد المراجعة';
}

function montageStatusClass(p) {
  const status = p.montage_status ?? p.approval_status ?? p.status;
  if (status === 'approved') return 'status-approved';
  if (status === 'rejected') return 'status-rejected';
  return 'status-pending';
}

async function submitMontage() {
  if (!selectedProject.value) return;
  montageSaving.value = true;
  try {
    const payload = {
      image_url: montageForm.value.image_url || undefined,
      video_url: montageForm.value.video_url || undefined,
      description: montageForm.value.description || undefined,
    };
    await saveMontage(selectedProject.value.id, payload, montageData.value && Object.keys(montageData.value).length > 0);
    // Refetch list so backend-updated has_photography_data/has_montage_data are reflected
    await fetchContracts();
    toast.success('تم الحفظ. تم نقل المشروع إلى "بعد المونتاج".');
    closeDetail();
    activeTab.value = 'after';
    router.replace({ query: { ...route.query, tab: 'after' } });
    if (isManager.value && afterMontage.value.length) {
      fetchMontageLinksForProjects(afterMontage.value.map(p => p.id));
    }
  } catch (e) {
    toast.error(e?.message || 'فشل الحفظ');
  } finally {
    montageSaving.value = false;
  }
}

async function doApprove(id) {
  try {
    await approveMontage(id, 'approved');
    toast.success('تم القبول');
    if (selectedProject.value && Number(selectedProject.value.id) === Number(id)) {
      selectedProject.value = {
        ...selectedProject.value,
        montage_status: 'approved',
        approval_status: 'approved',
      };
    }
    closeDetail();
  } catch (e) {
    toast.error(e?.message || 'فشل');
  }
}

function openRejectModal(id) {
  rejectTargetId.value = id;
  rejectReason.value = '';
}

async function doReject() {
  if (!rejectTargetId.value || !rejectReason.value.trim()) return;
  try {
    const rid = rejectTargetId.value;
    await approveMontage(rid, 'rejected', rejectReason.value.trim());
    toast.success('تم الرفض');
    rejectTargetId.value = null;
    rejectReason.value = '';
    if (selectedProject.value && Number(selectedProject.value.id) === Number(rid)) {
      selectedProject.value = {
        ...selectedProject.value,
        montage_status: 'rejected',
        approval_status: 'rejected',
      };
    }
    closeDetail();
  } catch (e) {
    toast.error(e?.message || 'فشل');
  }
}
</script>

<style scoped>
.editor-projects-view {
  padding: 1.5rem;
  direction: rtl;
  width: 100%;
  max-width: none;
  margin: 0;
}
.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.25rem 0; }
.page-subtitle { color: #64748b; margin: 0; font-size: 0.9rem; }
.tabs-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.tab-btn {
  padding: 0.6rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 0.95rem;
}
.tab-btn.active {
  background: #1e3a5f;
  color: #fff;
  border-color: #1e3a5f;
}
.content-panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
.loading-state, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top-color: #1e3a5f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
.teams-section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; }
.section-title { font-size: 1.1rem; margin: 0 0 0.75rem 0; }
.team-block { margin-bottom: 1rem; }
.team-name { font-size: 1rem; margin: 0 0 0.35rem 0; }
.members-list { margin: 0; padding-right: 1.25rem; }
.member-phone { color: #64748b; }
.value-null { color: #dc2626; font-weight: 500; }
.rejection-section { background: #fef2f2; padding: 0.75rem; border-radius: 8px; margin: 1rem 0; }
.rejection-text { margin: 0; color: #991b1b; }
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-large { max-width: 560px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.modal-header h2 { margin: 0; font-size: 1.2rem; }
.btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
.detail-fields p { margin: 0.5rem 0; }
.modal-see-more .see-more-fields .detail-field { margin-bottom: 0.75rem; }
.modal-see-more .see-more-fields .detail-field p { margin: 0.25rem 0; }
.btn-expand {
  background: none;
  border: none;
  color: #1e3a5f;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.25rem 0;
  margin-top: 0.25rem;
  text-decoration: underline;
}
.units-list { margin-top: 0.5rem; }
.units-list ul { margin: 0; padding-right: 1.25rem; list-style: disc; }
.units-list li { margin: 0.25rem 0; }
.link-cell { color: #1e3a5f; word-break: break-all; text-decoration: none; }
.link-cell:hover { text-decoration: underline; }
.montage-form-section h4, .manager-actions h4 { margin: 1rem 0 0.5rem 0; font-size: 1rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { display: block; margin-bottom: 0.25rem; font-size: 0.9rem; }
.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}
.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; }
.btn-primary { padding: 0.5rem 1rem; background: #1e3a5f; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.btn-secondary { padding: 0.5rem 1rem; background: #e2e8f0; color: #334155; border: none; border-radius: 8px; cursor: pointer; }
.btn-approve {
  padding: 0.5rem 1rem;
  background: #1e3a5f;
  color: #fff;
  border: 1px solid #1e3a5f;
  border-radius: 8px;
  cursor: pointer;
}
.btn-approve:hover:not(:disabled) { background: #152d4a; border-color: #152d4a; }
.btn-reject {
  padding: 0.5rem 1rem;
  background: #fff;
  color: #1e3a5f;
  border: 1px solid #1e3a5f;
  border-radius: 8px;
  cursor: pointer;
}
.btn-reject:hover:not(:disabled) { background: #f1f5f9; }
.btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }
.manager-actions .action-buttons { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.loading-inline, .empty-inline { padding: 0.5rem 0; color: #64748b; font-size: 0.9rem; }
</style>
