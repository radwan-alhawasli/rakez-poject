import { ref, onMounted, onUnmounted } from 'vue';
import { useToast } from '@/composables/useToast';

/**
 * Composable to track internet connection status.
 */
export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine);
  const { toast } = useToast();

  const updateStatus = () => {
    const wasOnline = isOnline.value;
    isOnline.value = navigator.onLine;

    if (wasOnline && !isOnline.value) {
      toast.error('انقطع الاتصال بالإنترنت. بعض الميزات قد لا تعمل بشكل صحيح.', {
        title: 'أنت الآن خارج الاتصال',
        duration: 0, // Keep until closed or back online
      });
    } else if (!wasOnline && isOnline.value) {
      toast.success('تم استعادة الاتصال بالإنترنت بنجاح.', {
        title: 'تمت العودة للاتصال',
      });
    }
  };

  onMounted(() => {
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
  });

  onUnmounted(() => {
    window.removeEventListener('online', updateStatus);
    window.removeEventListener('offline', updateStatus);
  });

  return {
    isOnline,
  };
}
