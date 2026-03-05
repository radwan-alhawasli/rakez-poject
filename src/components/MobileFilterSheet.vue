<template>
  <div class="mobile-filter-sheet-desktop hidden md:block">
    <slot />
  </div>
  <div class="mobile-filter-sheet-mobile md:hidden">
    <button class="filter-trigger-btn" @click="open = true">
      <SlidersHorizontal class="w-4 h-4" />
      <span>تصفية</span>
    </button>
    <Drawer v-model:open="open">
      <DrawerContent class="max-h-[80vh]">
        <DrawerTitle class="sr-only">تصفية</DrawerTitle>
        <div class="p-4">
          <slot />
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { SlidersHorizontal } from 'lucide-vue-next'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'

const open = ref(false)
</script>

<style scoped>
/* CSS fallback for Tailwind responsive classes */
.mobile-filter-sheet-desktop { display: none; }
.mobile-filter-sheet-mobile { display: block; }
@media (min-width: 768px) {
  .mobile-filter-sheet-desktop { display: block !important; }
  .mobile-filter-sheet-mobile { display: none !important; }
}

.filter-trigger-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  min-height: 44px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 10px;
  background: white;
  color: var(--color-dark-gray);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}
.filter-trigger-btn:hover {
  background: var(--color-light-gray);
  border-color: var(--color-gold);
  color: var(--color-gold);
}
</style>
