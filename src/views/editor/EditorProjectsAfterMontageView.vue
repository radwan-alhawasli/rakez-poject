<template>
  <div class="editor-after-montage">
    <div class="page-header">
      <h1 class="page-title">بعد المونتاج</h1>
      <p class="page-subtitle">المشاريع التي تم إرسال رابط المونتاج لها (في انتظار المراجعة أو معتمدة/مرفوضة)</p>
    </div>

    <div v-if="montageProjects.length === 0" class="empty-state">
      <p>لا توجد مشاريع بعد المونتاج. أضف رابط مونتاج من صفحة «غير مونتاج».</p>
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
          <tr v-for="p in montageProjects" :key="p.projectId">
            <td>{{ p.projectName }}</td>
            <td>
              <a v-if="p.montageLink" :href="p.montageLink" target="_blank" rel="noopener" class="link-cell">{{ p.montageLink }}</a>
              <span v-else>—</span>
            </td>
            <td>
              <span :class="['status-badge', p.status]">{{ statusLabel(p.status) }}</span>
            </td>
            <td v-if="isManager">
              <template v-if="p.status === 'pending'">
                <button type="button" class="btn-approve" @click="setStatus(p.projectId, 'approved')">قبول</button>
                <button type="button" class="btn-reject" @click="setStatus(p.projectId, 'rejected')">رفض</button>
              </template>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import authService from '@/services/authService';
import { useEditorMockData } from '@/composables/editor/useEditorMockData';
import { toast } from '@/composables/useToast';

const user = authService.getCurrentUser();
const isManager = computed(() => user?.is_manager === true || user?.is_manager === 1);

const { montageProjects, setMontageStatus } = useEditorMockData();

function statusLabel(s) {
  if (s === 'approved') return 'معتمد';
  if (s === 'rejected') return 'مرفوض';
  return 'قيد المراجعة';
}

function setStatus(projectId, status) {
  setMontageStatus(projectId, status);
  toast.success(status === 'approved' ? 'تم قبول رابط المونتاج' : 'تم رفض رابط المونتاج');
}
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
.empty-state {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  color: #64748b;
}
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
</style>
