<template>
  <AppModal
    :open="true"
    title="تاريخ التأكيدات"
    @update:open="(v) => { if (v === false) $emit('close') }"
  >
    <div class="modal-body">
        <div class="metrics-table-container table-responsive">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in history" :key="item.id">
                <td>{{ formatDate(getDateValue(item)) }}</td>
                <td>{{ formatCurrency(item.amount ?? item.confirmed_amount ?? 0) }}</td>
                <td><span class="status-tag excellent">مؤكد</span></td>
              </tr>
              <tr v-if="history.length === 0">
                <td
                  colspan="3"
                  style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
                >
                  لا يوجد تاريخ
                </td>
              </tr>
            </tbody>
          </table>
        </div>
    </div>
    <template #footer>
      <div class="modal-footer flex gap-3 justify-end">
        <button type="button" class="btn-secondary" @click="$emit('close')">إغلاق</button>
      </div>
    </template>
  </AppModal>
</template>

<script>
import { ref, onMounted } from 'vue'
import AppModal from '@/components/AppModal.vue'
import accountingService from '../../services/accountingService'
import logger from '../../utils/logger'
import { useFormatters } from '../../composables/useFormatters'

export default {
  name: 'ConfirmationHistoryModal',
  components: { AppModal },
  props: {
    reservationId: { type: [Number, String], default: null },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { formatCurrency, formatDate: _fmtDate } = useFormatters();
    const formatDate = dateStr => {
      if (!dateStr) return 'غير محدد';
      return _fmtDate(dateStr);
    };
    const history = ref([]);

    onMounted(async () => {
      try {
        const data = await accountingService.getConfirmationHistory(
          props.reservationId != null ? { reservation_id: props.reservationId } : {}
        );
        history.value = data?.items ?? (Array.isArray(data) ? data : []);
      } catch (error) {
        logger.error('Error loading confirmation history:', error);
        history.value = [];
      }
    });

    const getDateValue = item => {
      return (
        item?.confirmed_at ??
        item?.confirmation_date ??
        item?.created_at ??
        item?.date ??
        item?.confirmedAt ??
        item?.confirmationDate ??
        item?.createdAt
      );
    };

    return { history, formatCurrency, formatDate, getDateValue };
  },
};
</script>

<style scoped>
.metrics-table-container {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-off-white) 100%);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(30, 58, 95, 0.08);
  border: 1px solid rgba(177, 162, 143, 0.12);
}

.metrics-table {
  width: 100%;
  border-collapse: collapse;
  text-align: right;
}

.metrics-table th {
  background: linear-gradient(135deg, var(--color-light-gray) 0%, var(--color-light-gray) 100%);
  padding: 22px 24px;
  font-size: 13px;
  color: var(--color-charcoal);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid rgba(177, 162, 143, 0.15);
}

.metrics-table td {
  padding: 18px 24px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  font-size: 15px;
  font-weight: 500;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.status-tag.excellent {
  background: #dcfce7;
  color: var(--color-success);
}

.modal-footer {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--color-light-gray);
}

.btn-secondary {
  padding: 12px 24px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  background: white;
  color: var(--color-dark-gray);
  font-weight: 600;
  cursor: pointer;
}

/* Tablet responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
  }
  .modal-container {
    width: 95%;
    max-width: 95vw;
    padding: 20px;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 12px 14px;
    font-size: 13px;
  }
  .modal-footer button {
    width: 100%;
    min-height: 44px;
  }
}

/* Mobile full-screen */
@media (max-width: 575px) {
  .modal-overlay {
    padding: 8px;
  }
  .modal-container {
    width: 100%;
    max-width: 100vw;
    max-height: 100vh;
    overflow-y: auto;
    border-radius: 16px;
    padding: 16px;
  }
  .modal-title {
    font-size: 18px;
  }
  .metrics-table-container {
    border-radius: 12px;
  }
  .btn-secondary {
    min-height: 44px;
    width: 100%;
  }
}
</style>
