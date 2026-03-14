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
              @approve="doApprove($event.id)"
              @reject="openRejectModal($event.id)"
            />
          </div>
          <!-- Sales teams and members -->
          <div v-if="activeTab === 'after'" class="teams-section">
            <h3 class="section-title">فرق المبيعات وأعضاء الفريق</h3>
            <div v-if="teamsLoading" class="loading-inline">جاري التحميل...</div>
            <div v-else-if="teams.length === 0" class="empty-inline">لا توجد فرق.</div>
            <div v-else class="teams-list">
              <div v-for="team in teams" :key="team.id" class="team-block">
                <h4 class="team-name">{{ team.name || team.team_name || 'فريق' }}</h4>
                <ul class="members-list">
                  <li v-for="m in (team.members || team.users || [])" :key="m.id">
                    {{ m.name || m.user_name || '—' }}
                    <span v-if="m.phone" class="member-phone"> — {{ m.phone }}</span>
                  </li>
                </ul>
              </div>
            </div>
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
            <p><strong>رقم المعلن:</strong> <span :class="{ 'value-null': !displayDetail.advertiser_number && !displayDetail.publisher_number }">{{ displayDetail.advertiser_number ?? displayDetail.publisher_number ?? '—' }}</span></p>
            <p><strong>رابط التصوير:</strong> <span :class="{ 'value-null': !displayDetail.photography_link && !displayDetail.photography_url }">{{ displayDetail.photography_link ?? displayDetail.photography_url ?? '—' }}</span></p>
            <p><strong>الوصف:</strong> <span :class="{ 'value-null': !displayDetail.description }">{{ displayDetail.description ?? '—' }}</span></p>
            <p><strong>الوحدات المتاحة:</strong> <span :class="{ 'value-null': displayDetail.available_units == null }">{{ displayDetail.available_units ?? '—' }}</span></p>
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
          <!-- Manager: Approve / Reject (after montage only) -->
          <div v-if="isManager && activeTab === 'after' && montageData && (selectedProject.has_montage_data == 1 || selectedProject.has_montage == 1 || selectedProject.has_montage === true)" class="manager-actions">
            <h4>قرار المدير</h4>
            <div class="action-buttons">
              <button type="button" class="btn-approve" @click="doApprove(selectedProject.id)">قبول</button>
              <button type="button" class="btn-reject" @click="openRejectModal(selectedProject.id)">رفض</button>
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
import EditorProjectCard from '@/components/editor/EditorProjectCard.vue';
import { toast } from '@/composables/useToast';

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
  fetchTeams,
  approveMontage,
  teams,
  teamsLoading,
  montageHasLinksMap,
  fetchMontageLinksForProjects,
} = useEditorProjects();

const activeTab = ref('before');
const selectedProject = ref(null);
const montageForm = ref({ image_url: '', video_url: '', description: '' });
const montageSaving = ref(false);
const rejectTargetId = ref(null);
const rejectReason = ref('');

// Merge contract detail + montage-department/show so fields from montage API are shown when contract API returns null
const displayDetail = computed(() => {
  const d = detail.value || {};
  const m = montageData.value || {};
  const contract = m.contract || m.contract_data || {};
  return {
    advertiser_number: d.advertiser_number ?? contract.advertiser_number ?? m.advertiser_number,
    publisher_number: d.publisher_number ?? contract.publisher_number ?? m.publisher_number,
    photography_link: d.photography_link ?? contract.photography_link ?? m.photography_link,
    photography_url: d.photography_url ?? contract.photography_url ?? m.photography_url,
    description: d.description ?? contract.description ?? m.description,
    available_units: d.available_units ?? contract.available_units ?? m.available_units,
  };
});

watch(() => route.query.tab, (tab) => {
  if (tab === 'before' || tab === 'after') activeTab.value = tab;
}, { immediate: true });

watch(activeTab, (t) => {
  if (t === 'after') {
    fetchTeams();
    if (isManager.value && afterMontage.value.length) {
      fetchMontageLinksForProjects(afterMontage.value.map(p => p.id));
    }
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

watch(montageData, (m) => {
  if (!selectedProject.value) return;
  montageForm.value = {
    image_url: (m && m.image_url) ?? '',
    video_url: (m && m.video_url) ?? '',
    description: (m && m.description) ?? '',
  };
}, { deep: true });

onMounted(() => {
  fetchContracts();
  const tab = route.query.tab;
  if (tab === 'after' || tab === 'before') activeTab.value = tab;
});

function openDetail(p) {
  selectedProject.value = p;
}

function openMontageForm(p) {
  selectedProject.value = p;
}

function closeDetail() {
  selectedProject.value = null;
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
    await approveMontage(rejectTargetId.value, 'rejected', rejectReason.value.trim());
    toast.success('تم الرفض');
    rejectTargetId.value = null;
    rejectReason.value = '';
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
  max-width: 1200px;
  margin: 0 auto;
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
.btn-approve { padding: 0.5rem 1rem; background: #10b981; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.btn-reject { padding: 0.5rem 1rem; background: #ef4444; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.manager-actions .action-buttons { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.loading-inline, .empty-inline { padding: 0.5rem 0; color: #64748b; font-size: 0.9rem; }
</style>
