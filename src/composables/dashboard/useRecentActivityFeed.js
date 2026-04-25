import { ref, shallowRef } from 'vue';
import accountingService from '@/services/accountingService';
import { mapDepositRecordToActivityItem } from '@/utils/dashboardData';
import logger from '@/utils/logger';

/**
 * Loads recent accounting-related rows for ActivityListWidget.
 * Uses GET /accounting/deposits/follow-up and GET /accounting/deposits/pending
 * (see docs/RAKEZ_LAST_SYSTEM_API_REFERENCE.md — Accounting; paths via accountingService).
 *
 * @param {{ maxItems?: number }} options
 */
export function useAccountingRecentActivity(options = {}) {
  const maxItems = options.maxItems ?? 8;
  /** @type {import('vue').ShallowRef<any[]>} */
  const items = shallowRef([]);
  const loading = ref(false);

  const load = async () => {
    loading.value = true;
    try {
      const [followUp, pending] = await Promise.all([
        accountingService.getDepositsFollowUp({ per_page: maxItems }),
        accountingService.getPendingDeposits({ per_page: maxItems }),
      ]);

      const a = followUp?.items ?? [];
      const b = pending?.items ?? [];
      const seen = new Set();
      const merged = [];
      for (const row of [...a, ...b]) {
        const id = row?.id ?? row?.deposit_id ?? row?.reservation_id;
        const key = id != null ? String(id) : JSON.stringify(row).slice(0, 80);
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(mapDepositRecordToActivityItem(row, merged.length));
        if (merged.length >= maxItems) break;
      }
      items.value = merged;
    } catch (e) {
      logger.error('useAccountingRecentActivity', e);
      items.value = [];
    } finally {
      loading.value = false;
    }
  };

  return { items, loading, load };
}
