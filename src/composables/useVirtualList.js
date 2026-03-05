import { ref, computed, watch } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';

/**
 * Composable for virtual scrolling of large lists/tables.
 * Wraps @tanstack/vue-virtual for consistent usage across the app.
 *
 * @param {import('vue').Ref<Array>} items - Reactive array of items to virtualize
 * @param {Object} options
 * @param {number} [options.estimateSize=48] - Estimated row height in px
 * @param {number} [options.overscan=5] - Number of items to render outside viewport
 * @returns {{ parentRef, virtualRows, totalSize, scrollToIndex }}
 */
export function useVirtualList(items, options = {}) {
  const { estimateSize = 48, overscan = 5 } = options;

  const parentRef = ref(null);

  const count = computed(() => (Array.isArray(items.value) ? items.value.length : 0));

  const virtualizer = useVirtualizer({
    get count() {
      return count.value;
    },
    getScrollElement: () => parentRef.value,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualRows = computed(() => virtualizer.value.getVirtualItems());
  const totalSize = computed(() => virtualizer.value.getTotalSize());

  const scrollToIndex = (index, opts) => {
    virtualizer.value.scrollToIndex(index, opts);
  };

  return {
    parentRef,
    virtualRows,
    totalSize,
    scrollToIndex,
  };
}
