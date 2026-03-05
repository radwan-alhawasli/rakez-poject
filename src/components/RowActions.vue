<template>
  <div class="row-actions-desktop hidden md:flex gap-2 items-center flex-wrap">
    <slot />
  </div>
  <div class="row-actions-mobile md:hidden">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button class="kebab-btn" aria-label="الإجراءات">
          <MoreVertical class="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="min-w-[160px]">
        <slot name="menu" />
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup>
import { MoreVertical } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'
</script>

<style scoped>
/* CSS fallback for Tailwind responsive classes */
.row-actions-desktop { display: none; }
.row-actions-mobile { display: block; }
@media (min-width: 768px) {
  .row-actions-desktop { display: flex !important; }
  .row-actions-mobile { display: none !important; }
}

.kebab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  background: white;
  color: var(--color-dark-gray);
  cursor: pointer;
  transition: all 0.2s;
}
.kebab-btn:hover {
  background: var(--color-light-gray);
  border-color: var(--color-gold);
  color: var(--color-gold);
}
</style>
