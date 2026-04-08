<template>
  <span class="dashboard-stat-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <template v-if="name === 'employees'">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </template>
      <template v-else-if="name === 'check'">
        <polyline points="20 6 9 17 4 12"></polyline>
      </template>
      <template v-else-if="name === 'arrowDown'">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </template>
      <template v-else-if="name === 'chartBars'">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </template>
      <template v-else-if="name === 'trendUp'">
        <path d="M3 3v18h18"></path>
        <path d="M7 14l4-4 3 3 5-6"></path>
      </template>
      <template v-else-if="name === 'clock'">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </template>
      <template v-else-if="name === 'dollar'">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </template>
      <template v-else-if="name === 'building'">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </template>
      <template v-else-if="name === 'clipboard'">
        <path d="M9 11l3 3L22 4"></path>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      </template>
      <template v-else-if="name === 'negotiation'">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </template>
      <template v-else-if="name === 'file'">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </template>
      <template v-else-if="name === 'units'">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </template>
      <template v-else-if="name === 'successCircle'">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </template>
      <template v-else-if="name === 'warningCircle'">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </template>
      <template v-else-if="name === 'grid'">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </template>
      <template v-else-if="name === 'leads'">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </template>
      <template v-else-if="name === 'lock'">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </template>
    </svg>
  </span>
</template>

<script setup>
defineProps({
  /** Icon key — extend as dashboards need */
  name: {
    type: String,
    required: true,
    validator: (v) =>
      [
        'employees',
        'check',
        'arrowDown',
        'chartBars',
        'trendUp',
        'clock',
        'dollar',
        'building',
        'clipboard',
        'negotiation',
        'file',
        'units',
        'successCircle',
        'warningCircle',
        'grid',
        'leads',
        'lock',
      ].includes(v),
  },
});
</script>

<style scoped>
.dashboard-stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dashboard-stat-icon svg {
  width: 26px;
  height: 26px;
}
</style>
