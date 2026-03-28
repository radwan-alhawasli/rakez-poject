<template>
  <div class="reservations-page my-reservations">
    <div class="welcome-header">
      <h1 class="welcome-title">حجوزاتي</h1>
      <p class="welcome-subtitle">عرض جميع الوحدات التي قمت بحجزها وتتبع حالتها.</p>
    </div>

    <div class="filter-tabs">
      <button v-for="tab in tabs" :key="tab.id" :class="['tab-btn', { active: activeTab === tab.id }]" @click="activeTab = tab.id">
        {{ tab.label }}
        <span v-if="activeCounts[tab.id]" class="tab-count">{{ activeCounts[tab.id] }}</span>
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل البيانات...</p>
    </div>

    <template v-else>
      <div v-if="currentList.length === 0" class="empty-state">
        <p>لا توجد بيانات في هذا القسم</p>
      </div>
      <div v-else class="reservations-list">
        <template v-if="activeTab === 'active' || activeTab === 'cancelled'">
          <ReservationCard
            v-for="res in currentList" :key="res.id || res.reservation_id"
            :reservation="res" :can-confirm="canConfirm"
            :get-status-label="getStatusLabel" :format-date="formatDate" :format-currency="formatCurrency"
            @open-details="openDetails" @download-voucher="onDownloadVoucher"
            @confirm="confirmRes" @cancel="cancelRes"
          />
        </template>
        <template v-else-if="activeTab === 'waiting'">
          <WaitingListCard
            v-for="item in currentList" :key="item.id"
            :item="item" :can-convert="canConvert"
            @convert="convertWaiting" @cancel="cancelWaiting"
          />
        </template>
        <template v-else-if="activeTab === 'negotiations'">
          <NegotiationCard
            v-for="neg in currentList" :key="neg.id || neg.reservation_id"
            :neg="neg" :can-approve="canApproveNeg" :format-currency="formatCurrency"
            @open-details="openDetails" @approve="approveNeg" @reject="rejectNeg"
          />
        </template>
      </div>
    </template>

    <ReservationDetailModal v-if="detailItem" :item="detailItem" :format-date="formatDate" :format-currency="formatCurrency" @close="detailItem = null" />

    <ConfirmModal
      v-if="showConfirmModal" :title="confirmModalConfig.title" :message="confirmModalConfig.message"
      :type="confirmModalConfig.type" :confirm-text="confirmModalConfig.confirmText"
      @confirm="onConfirmModalConfirm" @close="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import ReservationCard from './reservations/components/ReservationCard.vue';
import WaitingListCard from './reservations/components/WaitingListCard.vue';
import NegotiationCard from './reservations/components/NegotiationCard.vue';
import ReservationDetailModal from './reservations/components/ReservationDetailModal.vue';

import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';
import { usePermissions } from '@/composables/usePermissions';
import salesService from '@/services/salesService';
import { downloadReservationVoucher } from '../utils/reservationPdfHelper';

const { hasPermission } = usePermissions();
const { formatDateISO: formatDate, formatNumber: formatCurrency } = useFormatters();

const activeTab = ref('active');
const isLoading = ref(false);
const detailItem = ref(null);
const showConfirmModal = ref(false);
const confirmModalConfig = ref({ title: '', message: '', type: 'warning', confirmText: 'تأكيد', resolve: null });

const reservations = ref([]);
const waitingList = ref([]);
const negotiations = ref([]);

const tabs = [
  { id: 'active', label: 'حجوزات' },
  { id: 'cancelled', label: 'حجوزات ملغاة' },
  { id: 'waiting', label: 'انتظار' },
  { id: 'negotiations', label: 'تفاوضات' },
];

const canConfirm = computed(() => hasPermission('sales.reservations.confirm'));
const canConvert = computed(() => hasPermission('sales.waiting_list.convert'));
const canApproveNeg = computed(() => hasPermission('sales.negotiation.approve'));

const activeCounts = computed(() => ({
  active: reservations.value.filter(r => r.status !== 'cancelled' && r.status !== 'rejected').length,
  cancelled: reservations.value.filter(r => r.status === 'cancelled' || r.status === 'rejected').length,
  waiting: waitingList.value.length,
  negotiations: negotiations.value.length,
}));

const currentList = computed(() => {
  if (activeTab.value === 'waiting') return waitingList.value;
  if (activeTab.value === 'negotiations') return negotiations.value;
  const isCancelled = activeTab.value === 'cancelled';
  return reservations.value.filter(r => isCancelled ? ['cancelled', 'rejected'].includes(r.status) : !['cancelled', 'rejected'].includes(r.status));
});

const loadAll = async () => {
  isLoading.value = true;
  try {
    const [res, wait, neg] = await Promise.all([
      salesService.getReservations({ mine: true, include_cancelled: true }),
      salesService.getWaitingList(),
      salesService.getReservations({ status: 'under_negotiation' }),
    ]);
    reservations.value = res?.items || res || [];
    waitingList.value = wait || [];
    negotiations.value = neg?.items || neg || [];
  } finally { isLoading.value = false; }
};

const getStatusLabel = s => ({ confirmed: 'مؤكد', approved: 'مؤكد', under_negotiation: 'تفاوض', waiting: 'انتظار', cancelled: 'ملغي', rejected: 'مرفوض' }[s] || s);
const openDetails = item => { detailItem.value = item; };
const onDownloadVoucher = res => downloadReservationVoucher(res);

const confirmRes = r => {
  confirmModalConfig.value = { title: 'تأكيد الحجز', message: 'تأكيد الحجز؟', type: 'info', confirmText: 'تأكيد', resolve: async () => {
    await salesService.confirmReservation(r.reservation_id || r.id);
    toast.success('تم التأكيد'); loadAll();
  }}; showConfirmModal.value = true;
};

const cancelRes = r => {
  confirmModalConfig.value = { title: 'إلغاء الحجز', message: 'إلغاء؟', type: 'warning', confirmText: 'إلغاء', resolve: async () => {
    await salesService.cancelReservation(r.reservation_id || r.id, { reason: 'User cancel' });
    toast.success('تم الإلغاء'); loadAll();
  }}; showConfirmModal.value = true;
};

const convertWaiting = i => {
  confirmModalConfig.value = { title: 'تحويل لحجز', message: 'تحويل؟', type: 'info', confirmText: 'تحويل', resolve: async () => {
    await salesService.convertToReservation(i.id, { contract_date: new Date().toISOString().slice(0, 10), reservation_type: 'confirmed_reservation' });
    toast.success('تم التحويل'); loadAll();
  }}; showConfirmModal.value = true;
};

const cancelWaiting = i => {
  confirmModalConfig.value = { title: 'حذف', message: 'حذف من الانتظار؟', type: 'warning', resolve: async () => {
    await salesService.cancelWaitingListEntry(i.id);
    toast.success('تم الحذف'); loadAll();
  }}; showConfirmModal.value = true;
};

const approveNeg = n => {
  confirmModalConfig.value = { title: 'قبول التفاوض', message: 'قبول؟', type: 'info', resolve: async () => {
    await salesService.approveNegotiation(n.reservation_id || n.id);
    toast.success('تم القبول'); loadAll();
  }}; showConfirmModal.value = true;
};

const rejectNeg = n => {
  confirmModalConfig.value = { title: 'رفض التفاوض', message: 'رفض؟', type: 'warning', resolve: async () => {
    await salesService.rejectNegotiation(n.reservation_id || n.id);
    toast.success('تم الرفض'); loadAll();
  }}; showConfirmModal.value = true;
};

const onConfirmModalConfirm = async () => {
  if (confirmModalConfig.value.resolve) await confirmModalConfig.value.resolve();
  showConfirmModal.value = false;
};

onMounted(loadAll);
</script>

<style scoped>
.my-reservations { direction: rtl; }
.filter-tabs { display: flex; gap: 8px; margin-bottom: 24px; padding: 8px; border-radius: 16px; background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(255, 255, 255, 0.45); }
.tab-btn { flex: 1; padding: 10px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; background: transparent; }
.tab-btn.active { background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.tab-count { padding: 2px 8px; background: #eee; border-radius: 20px; font-size: 11px; }
.tab-btn.active .tab-count { background: #27374d; color: #fff; }
.reservations-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.spinner { width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #b5a99a; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state, .empty-state { text-align: center; padding: 40px; color: #64748b; }
</style>
