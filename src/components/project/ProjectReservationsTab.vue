<template>
  <div class="tab-content">
    <div class="tracker-header-simple">
      <h2 style="font-family: 'Amiri', serif; color: #1e3a5f; margin-bottom: 10px">
        حجوزات المشروع
      </h2>
      <p style="color: #64748b">قائمة بجميع الحجوزات المسجلة لهذا المشروع.</p>
    </div>

    <div v-if="reservationsLoading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="projectReservations.length === 0" class="empty-state">
      <p>لا توجد حجوزات لهذا المشروع حالياً.</p>
    </div>

    <div v-else class="units-table-container">
      <div class="table-responsive">
      <table class="units-table">
        <thead>
          <tr>
            <th>رقم الحجز</th>
            <th>العميل</th>
            <th>الوحدة</th>
            <th>المبلغ</th>
            <th>الحالة</th>
            <th>التاريخ</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="res in projectReservations" :key="res.id">
            <td>#{{ res.id }}</td>
            <td>{{ res.client_name }}</td>
            <td>{{ res.unit_number || '—' }}</td>
            <td>{{ formatCurrency(res.down_payment_amount) }}</td>
            <td>
              <span class="status-badge" :class="res.status">{{
                res.status === 'confirmed'
                  ? 'مؤكد'
                  : res.status === 'cancelled'
                  ? 'ملغي'
                  : 'معلق'
              }}</span>
            </td>
            <td>{{ res.contract_date }}</td>
            <td>
              <div style="display: flex; gap: 5px">
                <button class="btn-sm" @click="downloadVoucher(res.id)">⬇</button>
                <button
                  v-if="res.status === 'pending'"
                  class="btn-sm success"
                  @click="confirmReservation(res.id)"
                  aria-label="تأكيد الحجز"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    width="16"
                    height="16"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <ConfirmModal
      v-if="showConfirmModal"
      :title="confirmModalConfig.title"
      :message="confirmModalConfig.message"
      :type="confirmModalConfig.type"
      :confirm-text="confirmModalConfig.confirmText"
      @confirm="onConfirmModalConfirm"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { useProjectReservations } from '@/composables/project/useProjectReservations';

const props = defineProps({
  projectId: { type: [String, Number], required: true },
});

const {
  projectReservations,
  reservationsLoading,
  formatCurrency,
  showConfirmModal,
  confirmModalConfig,
  onConfirmModalConfirm,
  loadReservations,
  confirmReservation,
  downloadVoucher,
} = useProjectReservations(props.projectId);

onMounted(() => {
  loadReservations();
});
</script>

<style scoped>
.loading-state {
  padding: 100px;
  text-align: center;
  color: #94a3b8;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top-color: #b1a28f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.units-table-container {
  overflow-x: auto;
}
.units-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.units-table th,
.units-table td {
  padding: 12px 16px;
  text-align: right;
  border-bottom: 1px solid #f1f5f9;
}
.units-table th {
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
}
.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}
.status-badge.confirmed {
  background: #dcfce7;
  color: #16a34a;
}
.status-badge.cancelled {
  background: #fee2e2;
  color: #dc2626;
}
.btn-sm {
  background: #f1f5f9;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.btn-sm.success {
  background: #dcfce7;
  color: #166534;
}
.btn-sm.reserve {
  background: #1e3a5f;
  color: white;
}
.btn-sm.reserve:hover {
  background: #234775;
}

@media (max-width: 768px) {
  .units-table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .units-table { min-width: 540px; }
}
@media (max-width: 576px) {
  .units-table th,
  .units-table td {
    padding: 8px 10px;
    font-size: 12px;
  }
}
</style>
