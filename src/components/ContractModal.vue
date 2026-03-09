<template>
  <AppModal
    :open="true"
    subtitle="مراجعة كاملة لبيانات السجل قبل الموافقة أو الرفض."
    @update:open="(v) => { if (v === false) closeModal() }"
  >
    <template #title>
      <div class="header-title-row flex items-center gap-2 flex-wrap">
        <span class="font-extrabold text-[var(--color-navy)]">تفاصيل العقد/الطلب</span>
        <span :class="['status-badge-header', normalizedStatus]">
          {{
            normalizedStatus === 'approved'
              ? 'موافق عليه'
              : normalizedStatus === 'rejected'
              ? 'مرفوض'
              : 'معلق'
          }}
        </span>
      </div>
    </template>
    <div class="modal-content">
        <!-- بيانات المطور -->
        <section class="details-section">
          <div class="section-header">
            <div class="section-bar"></div>
            <h3 class="section-title">بيانات المطور</h3>
          </div>
          <div class="details-list">
            <div class="detail-row">
              <span class="detail-label">الاسم:</span>
              <span class="detail-value">{{ contractDetails.name }}</span>
            </div>
          </div>
        </section>

        <!-- المشاريع -->
        <section class="details-section">
          <div class="section-header">
            <div class="section-bar"></div>
            <h3 class="section-title">المشاريع</h3>
          </div>
          <div class="details-list">
            <div class="detail-row">
              <span class="detail-label">اسم المشروع:</span>
              <span class="detail-value">{{ contractDetails.projectName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">نوع الوحدات:</span>
              <span class="detail-value">{{ contractDetails.unitType }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">عدد الوحدات:</span>
              <span class="detail-value">{{ contractDetails.unitCount }}</span>
            </div>
          </div>
        </section>

        <!-- تفاصيل التسويق -->
        <section class="details-section">
          <div class="section-header">
            <div class="section-bar"></div>
            <h3 class="section-title">تفاصيل التسويق</h3>
          </div>
          <div class="details-list">
            <div class="detail-row">
              <span class="detail-label">المسوقون (جلب):</span>
              <span class="detail-value">{{ contractDetails.marketer }}</span>
            </div>
          </div>
        </section>

        <!-- معلومات إضافية (مخفية مؤقتاً لتطابق الصورة، يمكن إظهارها عند الحاجة أو نقلها) -->
        <!-- 
        <div class="info-grid">
          ...
        </div> 
        -->
    </div>
    <template #footer>
      <div class="modal-footer-action flex gap-3 justify-end flex-wrap">
        <button @click="closeModal" class="btn-close-large">إغلاق</button>
        <div
          v-if="normalizedStatus === 'pending' && hasPermission('contracts.approve')"
          class="action-buttons flex gap-2"
        >
          <button @click="rejectContract" class="btn-reject">رفض العقد</button>
          <button @click="approveContract" class="btn-approve">الموافقة على العقد</button>
        </div>
      </div>
    </template>
  </AppModal>
  <ConfirmModal
      v-if="showConfirmModal"
      :title="confirmModalConfig.title"
      :message="confirmModalConfig.message"
      :type="confirmModalConfig.type"
      :confirm-text="confirmModalConfig.confirmText"
      @confirm="onConfirmModalConfirm"
      @close="showConfirmModal = false"
  />
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppModal from '@/components/AppModal.vue'
import ConfirmModal from './ConfirmModal.vue'
import { usePermissions } from '@/composables/usePermissions'

export default {
  name: 'ContractModal',
  components: { AppModal, ConfirmModal },
  props: {
    contract: {
      type: Object,
      required: true,
    },
  },
  emits: ['close', 'approve', 'reject'],
  setup(props, { emit }) {
    const { hasPermission } = usePermissions();

    // Handle Escape key
    const handleEscape = e => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    // Lock body scroll when modal is open
    onMounted(() => {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    });

    onUnmounted(() => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    });

    const showConfirmModal = ref(false);
    const confirmModalConfig = ref({
      title: '',
      message: '',
      type: 'warning',
      confirmText: 'تأكيد',
      resolve: null,
    });

    // بيانات تفاصيل العقد المحددة - ربط صحيح مع API
    const contractDetails = computed(() => {
      const c = props.contract || {};

      // حساب عدد الوحدات ونوعها من units array إذا كان موجوداً
      let unitType = 'N/A';
      let unitCount = 0;

      if (c.units && Array.isArray(c.units) && c.units.length > 0) {
        // جمع عدد الوحدات من جميع العناصر
        unitCount = c.units.reduce((sum, unit) => sum + (parseInt(unit.count) || 0), 0);
        // أخذ نوع الوحدة من العنصر الأول (أو دمج الأنواع إذا كانت مختلفة)
        const types = c.units
          .map(u => u.type)
          .filter(t => t)
          .join('، ');
        unitType = types || 'N/A';
      } else {
        // استخدام الحقول المباشرة إذا لم يكن هناك units array
        unitType = c.unit_type || 'N/A';
        unitCount = c.units_count || c.unit_count || 0;
      }

      return {
        // بيانات المطور - الاسم هو اسم المطور (developer_name)
        name: c.developer_name || c.developer || 'غير محدد',

        // بيانات المشروع - من API الحقول الصحيحة
        projectName: c.project_name || 'غير محدد',
        unitType: unitType,
        unitCount: unitCount,

        // تفاصيل التسويق - المسوقون هو اسم المستخدم الذي قدم الطلب (created_by_name)
        marketer: c.created_by_name || c.marketer || c.marketer_name || 'غير محدد',
      };
    });

    // حساب الحالة المعيارية للعرض والتحقق
    const normalizedStatus = computed(() => {
      const s = props.contract?.status ? String(props.contract.status).toLowerCase() : 'pending';
      if (s === 'approved') return 'approved';
      if (s === 'rejected' || s === 'refused') return 'rejected';
      return 'pending';
    });

    const closeModal = () => {
      emit('close');
    };

    const approveContract = () => {
      confirmModalConfig.value = {
        title: 'الموافقة على العقد',
        message: `هل أنت متأكد من الموافقة على العقد ${props.contract.number}؟`,
        type: 'info',
        confirmText: 'موافقة',
        resolve: () => {
          emit('approve', props.contract);
          closeModal();
        },
      };
      showConfirmModal.value = true;
    };

    const rejectContract = () => {
      confirmModalConfig.value = {
        title: 'رفض العقد',
        message: `هل أنت متأكد من رفض العقد ${props.contract.number}؟`,
        type: 'danger',
        confirmText: 'رفض',
        resolve: () => {
          emit('reject', props.contract);
          closeModal();
        },
      };
      showConfirmModal.value = true;
    };

    const onConfirmModalConfirm = async () => {
      const fn = confirmModalConfig.value.resolve;
      if (fn) await fn();
      showConfirmModal.value = false;
    };

    return {
      contractDetails,
      closeModal,
      approveContract,
      rejectContract,
      normalizedStatus,
      hasPermission,
      showConfirmModal,
      confirmModalConfig,
      onConfirmModalConfirm,
    };
  },
};
</script>

<style scoped>
.header-title-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
}

.status-badge-header {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}
.status-badge-header.approved {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #86efac;
}
.status-badge-header.pending {
  background: #fefce8;
  color: #5c3d1a;
  border: 1px solid #d4a84b;
}
.status-badge-header.rejected {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecdd3;
}

.modal-content {
  padding: 10px 32px 32px 32px;
  overflow-y: auto;
  flex: 1;
  background: var(--color-white);
}

.details-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-bar {
  width: 4px;
  height: 24px;
  background: linear-gradient(180deg, var(--color-gold) 0%, #c9a961 100%);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(161, 139, 92, 0.3);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin: 0;
  letter-spacing: 0.3px;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-right: 16px;
}

.detail-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-light-gray);
  transition: background 0.2s ease;
}

.detail-row:hover {
  background: #fafbfc;
  border-radius: 4px;
  padding-right: 8px;
  padding-left: 8px;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-navy);
  min-width: fit-content;
  white-space: nowrap;
}

.detail-value {
  font-size: 14px;
  color: var(--color-charcoal);
  font-weight: 400;
  flex: 1;
  text-align: right;
}

.detail-value.highlight {
  color: var(--color-gold);
  font-weight: 700;
  font-size: 15px;
}

/* Modal Footer Action */
.modal-footer-action {
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-approve {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(161, 139, 92, 0.2);
}

.btn-approve:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(161, 139, 92, 0.3);
  filter: brightness(1.1);
}

.btn-reject {
  background: white;
  color: var(--color-error);
  border: 1.5px solid #fee2e2;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-reject:hover {
  background: #fef2f2;
  border-color: #fecaca;
  transform: translateY(-2px);
}

.btn-close-large {
  background: white;
  border: 1px solid var(--color-medium-gray);
  padding: 8px 24px;
  border-radius: 6px;
  color: var(--color-dark-gray);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-close-large:hover {
  background: #fdfdfd;
  color: var(--color-gold);
  border-color: var(--color-gold);
}

/* Scrollbar customization */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: var(--color-gold);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-gold-dark);
}

@media (max-width: 768px) {
  .modal-content {
    max-height: 90vh;
    overflow-y: auto;
    padding: 16px 20px 20px;
  }
  .modal-footer-action {
    flex-direction: column;
    gap: 12px;
  }
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  .btn-approve,
  .btn-reject,
  .btn-close-large {
    width: 100%;
    min-height: 44px;
  }
}

@media (max-width: 575px) {
  .modal-content {
    padding: 16px;
  }
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .section-bar {
    height: 20px;
  }
  .btn-approve,
  .btn-reject,
  .btn-close-large {
    min-height: 44px;
    width: 100%;
  }
}

@media (min-width: 1920px) {
  .modal-content {
    max-width: 800px;
  }
  .detail-value,
  .detail-label {
    font-size: 15px;
  }
}

@media (min-width: 2560px) {
  .modal-content {
    max-width: 900px;
  }
  .detail-value,
  .detail-label {
    font-size: 16px;
  }
}

@media (min-width: 3840px) {
  .modal-content {
    max-width: 1100px;
    padding: 40px;
    border-radius: 24px;
  }
  .detail-value,
  .detail-label {
    font-size: 20px;
  }
  .section-title {
    font-size: 22px;
  }
}
</style>
