<template>
  <div class="pagination-container" v-if="totalPages > 1">
    <div class="pagination-info">
      <span>عرض {{ startItem }} - {{ endItem }} من {{ totalItems }} عنصر</span>
      <select v-model="localPerPage" @change="handlePerPageChange" class="per-page-select">
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
      <span>عنصر في الصفحة</span>
    </div>

    <div class="pagination-controls">
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="goToPage(1)"
        title="الصفحة الأولى"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="11 17 6 12 11 7"></polyline>
          <polyline points="18 17 13 12 18 7"></polyline>
        </svg>
      </button>

      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
        title="السابق"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          :class="['page-number', { active: page === currentPage, ellipsis: page === '...' }]"
          @click="page !== '...' && goToPage(page)"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>
      </div>

      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
        title="التالي"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(totalPages)"
        title="الصفحة الأخيرة"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="13 17 18 12 13 7"></polyline>
          <polyline points="6 17 11 12 6 7"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'PaginationComponent',
  props: {
    currentPage: {
      type: Number,
      required: true,
      default: 1,
    },
    totalItems: {
      type: Number,
      required: true,
      default: 0,
    },
    perPage: {
      type: Number,
      default: 25,
    },
    maxVisiblePages: {
      type: Number,
      default: 7,
    },
  },
  emits: ['page-change', 'per-page-change'],
  setup(props, { emit }) {
    const localPerPage = ref(props.perPage);

    const totalPages = computed(() => Math.ceil(props.totalItems / localPerPage.value));

    const startItem = computed(() => {
      if (props.totalItems === 0) return 0;
      return (props.currentPage - 1) * localPerPage.value + 1;
    });

    const endItem = computed(() => {
      const end = props.currentPage * localPerPage.value;
      return end > props.totalItems ? props.totalItems : end;
    });

    const visiblePages = computed(() => {
      const pages = [];
      const total = totalPages.value;
      const current = props.currentPage;
      const maxVisible = props.maxVisiblePages;

      if (total <= maxVisible) {
        // Show all pages if total is less than max visible
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // Always show first page
        pages.push(1);

        if (current <= Math.floor(maxVisible / 2) + 1) {
          // Near the start
          for (let i = 2; i <= maxVisible - 2; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        } else if (current >= total - Math.floor(maxVisible / 2)) {
          // Near the end
          pages.push('...');
          for (let i = total - (maxVisible - 3); i < total; i++) {
            pages.push(i);
          }
          pages.push(total);
        } else {
          // In the middle
          pages.push('...');
          const start = current - Math.floor((maxVisible - 4) / 2);
          const end = current + Math.floor((maxVisible - 4) / 2);
          for (let i = start; i <= end; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        }
      }

      return pages;
    });

    const goToPage = page => {
      if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
        emit('page-change', page);
      }
    };

    const handlePerPageChange = () => {
      emit('per-page-change', localPerPage.value);
      // Reset to first page when changing per page
      if (props.currentPage !== 1) {
        emit('page-change', 1);
      }
    };

    // Watch for external perPage changes
    watch(
      () => props.perPage,
      newVal => {
        localPerPage.value = newVal;
      }
    );

    return {
      localPerPage,
      totalPages,
      startItem,
      endItem,
      visiblePages,
      goToPage,
      handlePerPageChange,
    };
  },
};
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-top: 20px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
  font-size: 14px;
}

.per-page-select {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  color: #1e293b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.per-page-select:hover {
  border-color: #b1a28f;
}

.per-page-select:focus {
  outline: none;
  border-color: #b1a28f;
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #b1a28f;
  color: #b1a28f;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn svg {
  width: 18px;
  height: 18px;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 5px;
}

.page-number {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #b1a28f;
  color: #b1a28f;
}

.page-number.active {
  background: #b1a28f;
  border-color: #b1a28f;
  color: white;
  font-weight: 600;
}

.page-number.ellipsis {
  border: none;
  background: transparent;
  cursor: default;
  pointer-events: none;
}

.page-number:disabled {
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-info {
    justify-content: center;
  }

  .pagination-controls {
    justify-content: center;
  }

  .page-numbers {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .pagination-wrapper {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  .page-btn {
    min-width: 36px;
    min-height: 36px;
    font-size: 12px;
  }
  .per-page-selector select {
    font-size: 13px;
    padding: 6px 8px;
  }
}

@media (min-width: 1920px) {
  .page-btn {
    min-width: 42px;
    min-height: 42px;
    font-size: 15px;
  }
  .pagination-info {
    font-size: 14px;
  }
}

@media (min-width: 2560px) {
  .page-btn {
    min-width: 48px;
    min-height: 48px;
    font-size: 16px;
    border-radius: 12px;
  }
}

@media (min-width: 3840px) {
  .page-btn {
    min-width: 56px;
    min-height: 56px;
    font-size: 20px;
    border-radius: 14px;
  }
  .pagination-info {
    font-size: 18px;
  }
  .per-page-selector select {
    font-size: 18px;
    padding: 10px 14px;
  }
}
</style>
