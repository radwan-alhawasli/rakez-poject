<template>
  <nav v-if="items && items.length > 0" class="breadcrumb" aria-label="مسار التنقل">
    <ol class="breadcrumb-list">
      <li v-for="(item, index) in items" :key="index" class="breadcrumb-item" :class="{ active: index === items.length - 1 }">
        <router-link v-if="item.to && index < items.length - 1" :to="item.to" class="breadcrumb-link">
          {{ item.label }}
        </router-link>
        <span v-else class="breadcrumb-current">{{ item.label }}</span>
        <span v-if="index < items.length - 1" class="breadcrumb-separator" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
    validator: items => items.every(i => typeof i.label === 'string'),
  },
});
</script>

<style scoped>
.breadcrumb-list {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: var(--color-gold, #b1a28f);
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-current {
  color: var(--color-dark-gray, #555);
}

.breadcrumb-separator {
  color: var(--color-medium-gray, #aaa);
  margin: 0 0.25rem;
}
</style>
