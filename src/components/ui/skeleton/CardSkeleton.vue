<script setup>
import Skeleton from './Skeleton.vue';

defineProps({
  count: {
    type: Number,
    default: 3
  }
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="i in count" :key="i" class="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-4">
      <div class="flex justify-between items-start">
        <Skeleton class="h-6 w-1/3" />
        <Skeleton class="h-6 w-1/4 rounded-full" />
      </div>
      
      <div class="space-y-3">
        <div class="flex justify-between">
          <Skeleton class="h-4 w-1/4" />
          <Skeleton class="h-4 w-1/2" />
        </div>
        <div class="flex justify-between">
          <Skeleton class="h-4 w-1/4" />
          <Skeleton class="h-4 w-1/2" />
        </div>
      </div>
      
      <div class="pt-4 border-t flex gap-2">
        <Skeleton class="h-10 flex-1 rounded-lg" />
        <Skeleton class="h-10 flex-1 rounded-lg" />
      </div>
    </div>
  </div>
</template>
