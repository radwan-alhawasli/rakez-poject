<template>
  <div
    class="modal-overlay"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
    tabindex="-1"
  >
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">إنشاء ملف مطالبة</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <p class="modal-desc">
          اختر الحجوزات المباعة ثم حدد طريقة الإنشاء: ملف مجمّع واحد أو ملف لكل حجز على حدة.
        </p>

        <!-- Mode Toggle -->
        <div class="mode-toggle">
          <button
            type="button"
            :class="['mode-btn', { active: mode === 'combined' }]"
            @click="mode = 'combined'"
          >
            ملف مطالبة مجمّع
          </button>
          <button
            type="button"
            :class="['mode-btn', { active: mode === 'individual' }]"
            @click="mode = 'individual'"
          >
            ملف لكل حجز
          </button>
        </div>

        <div class="selection-summary" v-if="selectedIds.length > 0">
          <span class="badge">{{ selectedIds.length }}</span>
          حجز محدد
          <span v-if="mode === 'combined' && selectedIds.length < 2" class="min-warn">
            (يلزم حجزين على الأقل للملف المجمّع)
          </span>
        </div>

        <div class="search-box-mini">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="بحث بالاسم أو المشروع أو رقم الوحدة..."
            class="search-input-mini"
          />
        </div>

        <div class="table-wrapper">
          <table class="metrics-table">
            <thead>
              <tr>
                <th class="th-checkbox">
                  <input
                    type="checkbox"
                    :checked="allVisibleSelected"
                    :indeterminate="someVisibleSelected && !allVisibleSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th>رقم الحجز</th>
                <th>المشروع</th>
                <th>الوحدة</th>
                <th>مبلغ المطالبة</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoadingCandidates && filteredCandidates.length === 0">
                <td colspan="6" class="empty-cell">جاري التحميل...</td>
              </tr>
              <tr v-else-if="filteredCandidates.length === 0 && !isLoadingCandidates">
                <td colspan="6" class="empty-cell">
                  {{ searchTerm ? 'لا توجد نتائج مطابقة' : 'لا توجد حجوزات متاحة' }}
                </td>
              </tr>
              <tr
                v-for="candidate in filteredCandidates"
                :key="candidate.reservation_id"
                :class="{ 'row-selected': isSelected(candidate) }"
                @click="toggleCandidate(candidate)"
              >
                <td class="td-checkbox">
                  <input
                    type="checkbox"
                    :checked="isSelected(candidate)"
                    @click.stop
                    @change="toggleCandidate(candidate)"
                  />
                </td>
                <td>{{ candidate.reservation_id }}</td>
                <td>{{ candidate.project_name || 'غير محدد' }}</td>
                <td>{{ candidate.unit_number || '—' }}</td>
                <td>{{ formatCurrency(candidate.claim_amount) }}</td>
                <td>
                  <span class="status-tag good">{{ candidate.status_label_ar || 'مباع' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Notes (combined mode only) -->
        <div class="form-group" v-if="mode === 'combined'">
          <label class="form-label">ملاحظات (اختياري)</label>
          <textarea
            v-model="notes"
            class="form-textarea"
            placeholder="ملاحظات إضافية..."
            rows="3"
            maxlength="1000"
          ></textarea>
        </div>

        <!-- Results summary for bulk mode -->
        <div v-if="bulkResult" class="bulk-result">
          <div v-if="bulkResult.createdCount > 0" class="bulk-success">
            تم إنشاء {{ bulkResult.createdCount }} ملف مطالبة بنجاح.
          </div>
          <div v-if="bulkResult.errorCount > 0" class="bulk-errors">
            <p>فشل إنشاء {{ bulkResult.errorCount }} ملف:</p>
            <ul>
              <li v-for="(msg, resId) in bulkResult.errors" :key="resId">
                حجز {{ resId }}: {{ msg }}
              </li>
            </ul>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('close')">
            {{ bulkResult ? 'إغلاق' : 'إلغاء' }}
          </button>
          <button
            v-if="!bulkResult"
            type="button"
            class="btn-primary"
            :disabled="!canSubmit || isSubmitting"
            @click="handleSubmit"
          >
            <span v-if="!isSubmitting">
              {{
                mode === 'combined'
                  ? `إنشاء ملف مجمّع (${selectedIds.length})`
                  : `إنشاء ${selectedIds.length} ملف`
              }}
            </span>
            <span v-else>جاري الإنشاء...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useFormatters } from '../../composables/useFormatters';

export default {
  name: 'CombinedClaimFileModal',
  props: {
    candidates: {
      type: Array,
      default: () => [],
    },
    isLoadingCandidates: {
      type: Boolean,
      default: false,
    },
    isSubmitting: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'submit-combined', 'submit-bulk'],
  setup(props, { emit }) {
    const { formatCurrency } = useFormatters();

    const selectedIds = ref([]);
    const notes = ref('');
    const searchTerm = ref('');
    const mode = ref('combined');
    const bulkResult = ref(null);

    const filteredCandidates = computed(() => {
      if (!searchTerm.value.trim()) return props.candidates;
      const q = searchTerm.value.trim().toLowerCase();
      return props.candidates.filter(c => {
        const project = (c.project_name || '').toLowerCase();
        const unit = (c.unit_number || '').toLowerCase();
        const id = String(c.reservation_id || '');
        return project.includes(q) || unit.includes(q) || id.includes(q);
      });
    });

    const allVisibleSelected = computed(() => {
      if (filteredCandidates.value.length === 0) return false;
      return filteredCandidates.value.every(c => selectedIds.value.includes(c.reservation_id));
    });

    const someVisibleSelected = computed(() =>
      filteredCandidates.value.some(c => selectedIds.value.includes(c.reservation_id))
    );

    const canSubmit = computed(() => {
      if (selectedIds.value.length === 0) return false;
      if (mode.value === 'combined' && selectedIds.value.length < 2) return false;
      return true;
    });

    function isSelected(candidate) {
      return selectedIds.value.includes(candidate.reservation_id);
    }

    function toggleCandidate(candidate) {
      bulkResult.value = null;
      const idx = selectedIds.value.indexOf(candidate.reservation_id);
      if (idx >= 0) {
        selectedIds.value.splice(idx, 1);
      } else {
        selectedIds.value.push(candidate.reservation_id);
      }
    }

    function toggleSelectAll() {
      bulkResult.value = null;
      if (allVisibleSelected.value) {
        const visibleIds = new Set(filteredCandidates.value.map(c => c.reservation_id));
        selectedIds.value = selectedIds.value.filter(id => !visibleIds.has(id));
      } else {
        const current = new Set(selectedIds.value);
        filteredCandidates.value.forEach(c => current.add(c.reservation_id));
        selectedIds.value = [...current];
      }
    }

    function handleSubmit() {
      if (!canSubmit.value) return;
      if (mode.value === 'combined') {
        emit('submit-combined', {
          booking_ids: [...selectedIds.value],
          claim_type: 'commission',
          notes: notes.value.trim() || undefined,
        });
      } else {
        emit('submit-bulk', {
          reservation_ids: [...selectedIds.value],
        });
      }
    }

    function showBulkResult(result) {
      const created = result?.created ?? {};
      const errors = result?.errors ?? {};
      bulkResult.value = {
        createdCount: Object.keys(created).length,
        errorCount: Object.keys(errors).length,
        errors,
      };
    }

    const handleEscape = e => {
      if (e.key === 'Escape') emit('close');
    };

    onMounted(() => {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    });

    onUnmounted(() => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    });

    return {
      selectedIds,
      notes,
      searchTerm,
      mode,
      bulkResult,
      filteredCandidates,
      allVisibleSelected,
      someVisibleSelected,
      canSubmit,
      isSelected,
      toggleCandidate,
      toggleSelectAll,
      formatCurrency,
      handleSubmit,
      showBulkResult,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  animation: fadeIn 0.3s ease;
}

.modal-overlay:focus {
  outline: none;
}

.modal-container {
  background: white;
  width: 95%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-light-gray);
  padding-bottom: 15px;
  flex-shrink: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-navy);
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-dark-gray);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--color-error);
}

.modal-body {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.modal-desc {
  font-size: 14px;
  color: var(--color-dark-gray);
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.mode-toggle {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  overflow: hidden;
}

.mode-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: #fff;
  color: var(--color-dark-gray);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.mode-btn:first-child {
  border-left: 1px solid var(--color-medium-gray);
}

.mode-btn.active {
  background: var(--color-navy);
  color: #fff;
}

.mode-btn:hover:not(.active) {
  background: var(--color-light-gray);
}

.selection-summary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #166534;
  margin-bottom: 12px;
}

.min-warn {
  color: #b45309;
  font-weight: 500;
}

.badge {
  background: var(--color-success);
  color: #fff;
  border-radius: 50%;
  min-width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.search-box-mini {
  margin-bottom: 12px;
}

.search-input-mini {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input-mini:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1);
}

.table-wrapper {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
  margin-bottom: 16px;
}

.metrics-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.metrics-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.metrics-table th {
  background: var(--color-light-gray);
  color: var(--color-charcoal);
  font-weight: 700;
  padding: 10px 12px;
  text-align: right;
  border-bottom: 2px solid var(--color-medium-gray);
  white-space: nowrap;
}

.metrics-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-light-gray);
  color: var(--color-charcoal);
}

.th-checkbox,
.td-checkbox {
  width: 40px;
  text-align: center !important;
}

.metrics-table tbody tr {
  cursor: pointer;
  transition: background 0.15s;
}

.metrics-table tbody tr:hover {
  background: var(--color-light-gray);
}

.row-selected {
  background: #eff6ff !important;
}

.empty-cell {
  text-align: center !important;
  padding: 32px 12px !important;
  color: var(--color-dark-gray);
}

.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-tag.good {
  background: #dcfce7;
  color: #166534;
}

.form-group {
  margin-bottom: 8px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-charcoal);
  margin-bottom: 8px;
}

.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  font-size: 14px;
  resize: vertical;
  min-height: 70px;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1);
}

.bulk-result {
  margin-bottom: 12px;
  border-radius: 10px;
  padding: 14px;
  font-size: 14px;
}

.bulk-success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 8px;
  font-weight: 600;
}

.bulk-errors {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 14px;
}

.bulk-errors p {
  margin: 0 0 6px 0;
  font-weight: 600;
}

.bulk-errors ul {
  margin: 0;
  padding-right: 18px;
  list-style: disc;
}

.bulk-errors li {
  margin-bottom: 4px;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
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
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: var(--color-medium-gray);
  background: var(--color-light-gray);
}

.btn-primary {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(177, 162, 143, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
  .modal-footer {
    flex-direction: column;
  }
  .modal-footer button {
    width: 100%;
    min-height: 44px;
  }
  .mode-toggle {
    flex-direction: column;
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
    border-radius: 16px;
    padding: 16px;
  }
  .modal-title {
    font-size: 18px;
  }
  .table-wrapper {
    max-height: 200px;
  }
  .metrics-table {
    font-size: 12px;
  }
  .btn-primary,
  .btn-secondary {
    min-height: 44px;
    width: 100%;
  }
}
</style>
