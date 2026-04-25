<script setup>
import Skeleton from './Skeleton.vue';

defineProps({
  rows: {
    type: Number,
    default: 5
  },
  columns: {
    type: Number,
    default: 4
  }
});
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Table Header Skeleton -->
    <div class="flex items-center space-x-4 space-x-reverse border-b pb-4">
      <Skeleton v-for="i in columns" :key="'h-' + i" class="h-6 flex-1" />
    </div>
    
    <!-- Table Body Skeleton -->
    <div v-for="r in rows" :key="'r-' + r" class="flex items-center space-x-4 space-x-reverse py-2 border-b border-gray-50">
      <Skeleton v-for="c in columns" :key="'c-' + c" class="h-10 flex-1" />
    </div>
  </div>
</template>
