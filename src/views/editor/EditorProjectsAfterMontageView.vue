<template>
  <div class="editor-after-montage">
    <div class="page-header">
      <h1 class="page-title">بعد المونتاج</h1>
      <p class="page-subtitle">المشاريع التي تم إرسال رابط المونتاج لها (بيانات من الـ API)</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المشاريع...</p>
    </div>
    <div v-else-if="afterMontageList.length === 0" class="empty-state">
      <p>لا توجد مشاريع بعد المونتاج.</p>
    </div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>المشروع</th>
            <th>رابط المونتاج</th>
            <th>الحالة</th>
            <th v-if="isManager">إجراء</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in afterMontageList" :key="p.id">
            <td>{{ p.name || p.project_name || p.contract_number || '—' }}</td>
            <td>
              <a v-if="montageLink(p)" :href="montageLink(p)" target="_blank" rel="noopener" class="link-cell">{{ montageLink(p) }}</a>
              <span v-else>—</span>
            </td>
            <td>
              <span :class="['status-badge', statusClass(p)]">{{ statusLabel(p) }}</span>
            </td>
            <td v-if="isManager">
              <template v-if="isPending(p)">
                <button type="button" class="btn-approve" @click="approve(p.id)">قبول</button>
                <button type="button" class="btn-reject" @click="openReject(p)">رفض</button>
              </template>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Reject modal -->
    <div v-if="rejectTarget" class="modal-overlay" @click.self="rejectTarget = null">
      <div class="modal-box">
        <h3>رفض رابط المونتاج</h3>
        <div class="form-group">
          <label>سبب الرفض</label>
          <input v-model="rejectReason" type="text" class="form-input" placeholder="اختياري" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="rejectTarget = null">إلغاء</button>
          <button type="button" class="btn-primary" @click="submitReject">تأكيد الرفض</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import authService from '@/services/authService';
import editorService from '@/services/editorService';
import { toast } from '@/composables/useToast';

const user = authService.getCurrentUser();
const isManager = computed(() => user?.is_manager === true || user?.is_manager === 1);

const contracts = ref([]);
const loading = ref(true);
const rejectTarget = ref(null);
const rejectReason = ref('');

// API: has_photography_data, has_montage_data (both === 1 → after montage)
const isAfterMontage = c =>
  (c.has_photography_data == 1 || c.has_photography == 1 || c.has_photography === true) &&
  (c.has_montage_data == 1 || c.has_montage == 1 || c.has_montage === true);

const afterMontageList = computed(() =>
  contracts.value.filter(isAfterMontage)
);

function montageLink(p) {
  return p.image_url || p.montage_image_url || p.video_url || p.montage_video_url || '';
}

function hasLinks(p) {
  return !!(p.image_url || p.montage_image_url || p.video_url || p.montage_video_url || (p.description && p.description.trim()));
}

function statusLabel(p) {
  const s = p.montage_status ?? p.approval_status ?? p.status ?? '';
  if (s === 'approved' || s === 'معتمد') return 'معتمد';
  if (s === 'rejected' || s === 'مرفوض') return 'مرفوض';
  return 'قيد المراجعة';
}

function statusClass(p) {
  const s = (p.montage_status ?? p.approval_status ?? p.status ?? '').toLowerCase();
  if (s === 'approved') return 'approved';
  if (s === 'rejected') return 'rejected';
  return 'pending';
}

function isPending(p) {
  const s = (p.montage_status ?? p.approval_status ?? p.status ?? '').toLowerCase();
  return s !== 'approved' && s !== 'rejected';
}

async function fetchContracts() {
  loading.value = true;
  try {
    const list = await editorService.getContracts();
    contracts.value = Array.isArray(list) ? list : [];
  } catch (_) {
    contracts.value = [];
  } finally {
    loading.value = false;
  }
}

async function approve(contractId) {
  try {
    await editorService.approveMontage(contractId, { status: 'approved' });
    toast.success('تم قبول رابط المونتاج');
    await fetchContracts();
  } catch (e) {
    toast.error(e?.message || 'فشل القبول');
  }
}

function openReject(contract) {
  rejectTarget.value = contract;
  rejectReason.value = '';
}

async function submitReject() {
  const c = rejectTarget.value;
  const id = c?.id ?? (typeof c === 'object' ? null : c);
  if (!id) return;
  try {
    await editorService.approveMontage(id, {
      status: 'rejected',
      rejection_reason: rejectReason.value?.trim() || undefined,
    });
    toast.success('تم رفض رابط المونتاج');
    rejectTarget.value = null;
    rejectReason.value = '';
    await fetchContracts();
  } catch (e) {
    toast.error(e?.message || 'فشل الرفض');
  }
}

onMounted(() => {
  fetchContracts();
});
</script>

<style scoped>
.editor-after-montage {
  padding: 1.5rem;
  direction: rtl;
  max-width: 1000px;
  margin: 0 auto;
}
.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.25rem 0; }
.page-subtitle { color: #64748b; margin: 0; font-size: 0.9rem; }
.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}
.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid #e2e8f0;
  border-top-color: #27374d;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.table-wrap { overflow-x: auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th,
.data-table td { padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid #e2e8f0; }
.data-table th { background: #f8fafc; font-weight: 600; }
.data-table tr:last-child td { border-bottom: none; }
.link-cell { color: #27374d; word-break: break-all; }
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.85rem;
}
.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.approved { background: #d1fae5; color: #065f46; }
.status-badge.rejected { background: #fee2e2; color: #991b1b; }
.btn-approve, .btn-reject {
  padding: 0.35rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-left: 0.25rem;
}
.btn-approve { background: #10b981; color: #fff; }
.btn-reject { background: #ef4444; color: #fff; }
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
.modal-box { background: #fff; border-radius: 12px; padding: 1.5rem; max-width: 420px; width: 100%; }
.modal-box h3 { margin: 0 0 1rem 0; }
.form-group { margin: 1rem 0; }
.form-group label { display: block; margin-bottom: 0.35rem; font-weight: 500; }
.form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; }
.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.25rem; }
.btn-primary { padding: 0.5rem 1rem; background: #27374d; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.btn-secondary { padding: 0.5rem 1rem; background: #e2e8f0; color: #334155; border: none; border-radius: 8px; cursor: pointer; }
</style>
