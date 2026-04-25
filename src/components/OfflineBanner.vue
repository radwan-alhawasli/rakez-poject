<script setup>
import { useNetworkStatus } from '@/composables/useNetworkStatus';
import { WifiOff, AlertCircle } from 'lucide-vue-next';

const { isOnline } = useNetworkStatus();
</script>

<template>
  <transition
    enter-active-class="transform transition ease-out duration-300"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transform transition ease-in duration-200"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div 
      v-if="!isOnline" 
      class="fixed top-0 left-0 right-0 z-[9999] bg-destructive text-destructive-foreground py-2 px-4 shadow-lg flex items-center justify-center gap-3 text-sm font-medium"
    >
      <WifiOff class="w-4 h-4 animate-pulse" />
      <span>أنت الآن خارج الاتصال (Offline). يرجى التحقق من جودة الإنترنت لضمان حفظ بياناتك.</span>
      <AlertCircle class="w-4 h-4" />
    </div>
  </transition>
</template>

<style scoped>
.bg-destructive {
  background-color: #ef4444;
}
.text-destructive-foreground {
  color: #ffffff;
}
</style>
