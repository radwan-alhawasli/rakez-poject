<template>
  <div class="users-view">
    <UserManagement :use-admin-api="true" />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const UserManagement = defineAsyncComponent(() => import('@/components/UserManagement.vue'));
</script>

<style scoped>
.users-view {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Responsive: Tablet Landscape ── */
@media (max-width: 992px) {
  .users-view {
    padding: 0 8px;
  }
}

/* ── Responsive: Tablet Portrait ── */
@media (max-width: 768px) {
  .users-view {
    padding: 0 4px;
    overflow-x: hidden;
  }
  .users-view :deep(table) {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .users-view :deep(.grid),
  .users-view :deep([class*='grid']) {
    grid-template-columns: 1fr !important;
  }
}

/* ── Responsive: Mobile ── */
@media (max-width: 576px) {
  .users-view {
    padding: 0;
    overflow-x: hidden;
  }
  .users-view :deep(button),
  .users-view :deep(a),
  .users-view :deep(input),
  .users-view :deep(select) {
    min-height: 44px;
  }
  .users-view :deep(h1) {
    font-size: 22px;
  }
  .users-view :deep(h2) {
    font-size: 18px;
  }
  .users-view :deep(.modal-content),
  .users-view :deep([class*='modal-content']) {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0;
    border-radius: 12px 12px 0 0;
  }
}

/* ── Responsive: Extra Small Mobile ── */
@media (max-width: 320px) {
  .users-view :deep(h1) {
    font-size: 20px;
  }
  .users-view :deep(h2) {
    font-size: 16px;
  }
  .users-view :deep(p),
  .users-view :deep(span),
  .users-view :deep(td),
  .users-view :deep(th) {
    font-size: 13px;
  }
}

/* ── Responsive: Large Desktop ── */
@media (min-width: 1200px) {
  .users-view {
    padding: 0 12px;
  }
}

/* ── Responsive: Full HD ── */
@media (min-width: 1920px) {
  .users-view :deep(h1) {
    font-size: 32px;
  }
  .users-view :deep(h2) {
    font-size: 24px;
  }
  .users-view :deep(table th),
  .users-view :deep(table td) {
    padding: 22px 24px;
    font-size: 15px;
  }
}

/* ── Responsive: QHD ── */
@media (min-width: 2560px) {
  .users-view :deep(h1) {
    font-size: 38px;
  }
  .users-view :deep(h2) {
    font-size: 28px;
  }
  .users-view :deep(table th),
  .users-view :deep(table td) {
    padding: 26px 28px;
    font-size: 16px;
  }
}

/* ── Responsive: 4K ── */
@media (min-width: 3840px) {
  .users-view :deep(h1) {
    font-size: 48px;
  }
  .users-view :deep(h2) {
    font-size: 34px;
  }
  .users-view :deep(table th),
  .users-view :deep(table td) {
    padding: 32px;
    font-size: 20px;
  }
  .users-view :deep(button),
  .users-view :deep(a) {
    font-size: 18px;
  }
}
</style>
