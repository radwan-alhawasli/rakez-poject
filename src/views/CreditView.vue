<template>
  <div class="hr-view credit-view">
    <!-- Tab Content -->
    <div class="tab-content custom-scrollbar">
      <CreditDashboardTab v-if="activeTab === 'dashboard'" />

      <CreditNotificationsTab v-else-if="activeTab === 'notifications'" />

      <CreditBookingsTab v-else-if="activeTab === 'bookings'" />

      <CreditFinancingTab v-else-if="activeTab === 'financing'" />

      <CreditTitleTransferTab v-else-if="activeTab === 'title-transfer'" />

      <CreditSoldProjectsTab v-else-if="activeTab === 'sold-projects'" />

      <CreditClaimFilesTab v-else-if="activeTab === 'claim-files'" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import CreditDashboardTab from '@/components/credit/CreditDashboardTab.vue';
import CreditNotificationsTab from '@/components/credit/CreditNotificationsTab.vue';
import CreditBookingsTab from '@/components/credit/CreditBookingsTab.vue';
import CreditFinancingTab from '@/components/credit/CreditFinancingTab.vue';
import CreditTitleTransferTab from '@/components/credit/CreditTitleTransferTab.vue';
import CreditSoldProjectsTab from '@/components/credit/CreditSoldProjectsTab.vue';
import CreditClaimFilesTab from '@/components/credit/CreditClaimFilesTab.vue';

const route = useRoute();

const activeTab = computed(() => {
  const name = route.name;
  if (name === 'CreditDashboard') return 'dashboard';
  if (name === 'CreditNotifications') return 'notifications';
  if (name === 'CreditBookings') return 'bookings';
  if (name === 'CreditFinancing') return 'financing';
  if (name === 'CreditTitleTransfer') return 'title-transfer';
  if (name === 'CreditSoldProjects') return 'sold-projects';
  if (name === 'CreditClaimFiles') return 'claim-files';
  return 'dashboard';
});
</script>

<style scoped>
.credit-view {}
</style>

<style>
.credit-view .credit-bookings-management .section-header-compact { margin-bottom: 16px; }
.credit-view .credit-bookings-six-tabs { display: flex; gap: 0; flex-wrap: wrap; margin-bottom: 20px; border-bottom: 1px solid var(--color-medium-gray); }
.credit-view .btn-tab-booking { padding: 12px 20px; border: none; border-bottom: 3px solid transparent; background: transparent; color: var(--color-dark-gray); font-weight: 600; font-size: 14px; cursor: pointer; font-family: inherit; transition: color 0.2s, border-color 0.2s, background 0.2s; }
.credit-view .btn-tab-booking:hover { color: var(--color-navy); background: var(--color-light-gray); }
.credit-view .btn-tab-booking.active { color: var(--color-navy); border-bottom-color: var(--color-navy); background: var(--color-light-gray); }
.credit-view .booking-detail-inline { margin-top: 8px; }
.credit-view .booking-no-id-message { padding: 24px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; margin-top: 12px; }
.credit-view .booking-no-id-message p { margin: 0; color: #92400e; font-weight: 500; }

.credit-view .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); display: flex; align-items: center; justify-content: center; z-index: var(--z-tooltip); }
.credit-view .advance-confirm-modal { background: #fff; border-radius: 12px; padding: 24px; box-sizing: border-box; width: min(520px, 92vw); max-width: 92vw; min-width: 0; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2); }
.credit-view .advance-confirm-modal .modal-title { margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: var(--color-navy); }
.credit-view .advance-confirm-modal .modal-body { margin: 0 0 24px 0; font-size: 15px; color: var(--color-charcoal); line-height: 1.6; }
.credit-view .advance-confirm-modal .modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
.credit-view .advance-confirm-modal .btn-modal-cancel { padding: 10px 20px; border: 1px solid var(--color-medium-gray); background: #fff; color: var(--color-dark-gray); border-radius: 8px; font-weight: 600; cursor: pointer; }
.credit-view .advance-confirm-modal .btn-modal-cancel:hover { background: var(--color-light-gray); }
.credit-view .advance-confirm-modal .btn-modal-confirm { padding: 10px 20px; border: none; background: #8d6e63; color: #fff; border-radius: 8px; font-weight: 600; cursor: pointer; }
.credit-view .advance-confirm-modal .btn-modal-confirm:hover:not(:disabled) { background: #7d5e53; }
.credit-view .advance-confirm-modal .btn-modal-confirm:disabled { opacity: 0.7; cursor: not-allowed; }

.credit-view .reject-financing-modal { background: #fff; border-radius: 12px; padding: 24px; box-sizing: border-box; width: min(520px, 92vw); max-width: 92vw; min-width: 0; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2); }
.credit-view .reject-financing-modal .modal-title { margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: var(--color-navy); }
.credit-view .reject-financing-modal .modal-body { margin: 0 0 12px 0; font-size: 15px; color: var(--color-charcoal); }
.credit-view .reject-financing-modal .modal-form-group { margin-bottom: 20px; }
.credit-view .reject-financing-modal .modal-input { width: 100%; padding: 10px 12px; border: 1px solid var(--color-medium-gray); border-radius: 8px; font-size: 15px; font-family: inherit; color: var(--color-navy); }
.credit-view .reject-financing-modal .modal-input:focus { outline: none; border-color: #8d6e63; box-shadow: 0 0 0 2px rgba(141, 110, 99, 0.2); }
.credit-view .reject-financing-modal .modal-textarea { resize: vertical; min-height: 80px; }
.credit-view .reject-financing-modal .modal-field-error { margin: 8px 0 0 0; font-size: 13px; color: #dc2626; }
.credit-view .reject-financing-modal .modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
.credit-view .reject-financing-modal .btn-modal-cancel,
.credit-view .reject-financing-modal .btn-modal-confirm { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-family: inherit; }
.credit-view .reject-financing-modal .btn-modal-cancel { border: 1px solid var(--color-medium-gray); background: #fff; color: var(--color-dark-gray); }
.credit-view .reject-financing-modal .btn-modal-cancel:hover { background: var(--color-light-gray); }
.credit-view .reject-financing-modal .btn-modal-confirm { border: none; background: #8d6e63; color: #fff; }
.credit-view .reject-financing-modal .btn-modal-confirm:hover:not(:disabled) { background: #7d5e53; }
.credit-view .reject-financing-modal .btn-modal-confirm:disabled { opacity: 0.7; cursor: not-allowed; }

.credit-view .booking-detail-header { margin-bottom: 12px; }
.credit-view .btn-back-list { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: var(--color-light-gray); border: 1px solid var(--color-medium-gray); border-radius: 8px; color: var(--color-charcoal); font-weight: 600; font-size: 13px; cursor: pointer; font-family: inherit; }
.credit-view .btn-back-list svg { width: 18px; height: 18px; }
.credit-view .credit-bookings-subtabs { display: flex; gap: 8px; flex-wrap: wrap; }
.credit-view .btn-tab-mini { padding: 8px 14px; border: 1px solid var(--color-medium-gray); border-radius: 8px; background: #fff; color: var(--color-dark-gray); font-weight: 600; font-size: 13px; cursor: pointer; font-family: inherit; transition: background 0.2s, border-color 0.2s, color 0.2s; }
.credit-view .btn-tab-mini:hover { background: var(--color-light-gray); border-color: var(--color-medium-gray); color: var(--color-navy); }
.credit-view .btn-tab-mini.active { background: var(--color-navy); border-color: var(--color-navy); color: #fff; }

.credit-view .type-badge { display: inline-block; padding: 2px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.credit-view .type-badge.combined { background: #ede9fe; color: #5b21b6; }
.credit-view .type-badge.single { background: #e0f2fe; color: #0369a1; }

@media (max-width: 992px) {
  .credit-view .credit-bookings-six-tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; flex-wrap: nowrap; }
  .credit-view .btn-tab-booking { white-space: nowrap; flex-shrink: 0; }
}
@media (max-width: 768px) {
  .credit-view .credit-tabs { overflow-x: auto; overflow-y: hidden; white-space: nowrap; -webkit-overflow-scrolling: touch; gap: 0; }
  .credit-view .credit-tabs::-webkit-scrollbar { height: 3px; }
  .credit-view .credit-tabs::-webkit-scrollbar-thumb { background: var(--color-gold); border-radius: 2px; }
  .credit-view .credit-bookings-subtabs { overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; }
  .credit-view .booking-detail-grid,
  .credit-view .financing-detail-grid { grid-template-columns: 1fr; }
}
@media (max-width: 576px) {
  .credit-view .btn-tab-mini { padding: 6px 10px; font-size: 12px; }
  .credit-view .page-header { flex-direction: column; gap: 12px; align-items: flex-start; }
}
@media (max-width: 320px) {
  .credit-view .credit-bookings-six-tabs { gap: 0; }
  .credit-view .btn-tab-booking { padding: 10px 12px; font-size: 12px; }
  .credit-view .btn-tab-mini { padding: 5px 8px; font-size: 11px; }
  .credit-view .btn-back-list { font-size: 12px; padding: 6px 10px; }
  .credit-view .advance-confirm-modal,
  .credit-view .reject-financing-modal { padding: 16px; }
  .credit-view .advance-confirm-modal .modal-title,
  .credit-view .reject-financing-modal .modal-title { font-size: 16px; }
  .credit-view .advance-confirm-modal .modal-body,
  .credit-view .reject-financing-modal .modal-body { font-size: 13px; }
  .credit-view .search-input-mini { font-size: 13px; }
}
@media (min-width: 1200px) {
  .credit-view .credit-bookings-six-tabs { gap: 0; }
}
@media (min-width: 1920px) {
  .credit-view .page-header h1 { font-size: 32px; }
  .credit-view .booking-detail-grid,
  .credit-view .financing-detail-grid { gap: 28px; }
}
@media (min-width: 2560px) {
  .credit-view .page-header h1 { font-size: 38px; }
}
@media (min-width: 3840px) {
  .credit-view .page-header h1 { font-size: 48px; }
  .credit-view .btn-tab-mini { padding: 12px 20px; font-size: 18px; }
  .credit-view .type-badge { font-size: 16px; padding: 4px 14px; }
  .credit-view .btn-tab-booking { padding: 16px 28px; font-size: 18px; }
  .credit-view .btn-back-list { font-size: 16px; padding: 12px 20px; }
}

/* Dark Mode */
html.dark .credit-view .credit-tabs { border-color: #334155; }
html.dark .credit-view .credit-bookings-subtabs { border-color: #334155; }
html.dark .credit-view .credit-bookings-six-tabs { border-color: #334155; }
html.dark .credit-view .btn-tab-booking { background: #1e293b; border-color: #334155; color: #94a3b8; }
html.dark .credit-view .btn-tab-booking:hover { background: #334155; color: #e2e8f0; }
html.dark .credit-view .btn-tab-booking.active { background: var(--color-navy-dark); border-color: var(--color-navy-dark); color: #ffffff; }
html.dark .credit-view .booking-detail-grid,
html.dark .credit-view .financing-detail-grid { color: #e2e8f0; }
html.dark .credit-view .type-badge.combined { background: rgba(91, 33, 182, 0.15); color: #c4b5fd; }
html.dark .credit-view .type-badge.single { background: rgba(3, 105, 161, 0.15); color: #7dd3fc; }
html.dark .credit-view .advance-confirm-modal,
html.dark .credit-view .reject-financing-modal { background: #1e293b; border-color: #334155; }
html.dark .credit-view .modal-form-group .modal-input,
html.dark .credit-view .modal-form-group .modal-textarea { background: #0f172a; border-color: #334155; color: #e2e8f0; }
html.dark .credit-view .btn-modal-cancel { background: #334155; color: #94a3b8; border-color: #334155; }
html.dark .credit-view .btn-back-list { background: #1e293b; border-color: #334155; color: #94a3b8; }
html.dark .credit-view .btn-back-list:hover { border-color: var(--color-gold); color: var(--color-gold); }
</style>
