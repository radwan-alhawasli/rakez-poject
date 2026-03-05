import { ref, shallowRef } from 'vue';

const _store = new Map();

export function useCache(key, fetcher, ttlMs = 60000) {
  const data = shallowRef(null);
  const isLoading = ref(false);
  const error = ref(null);

  function _getCached() {
    const entry = _store.get(key);
    if (entry && Date.now() - entry.ts < ttlMs) return entry.value;
    return undefined;
  }

  async function _fetch() {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await fetcher();
      _store.set(key, { value: result, ts: Date.now() });
      data.value = result;
    } catch (err) {
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  }

  async function load() {
    const cached = _getCached();
    if (cached !== undefined) {
      data.value = cached;
      return;
    }
    await _fetch();
  }

  async function refresh() {
    _store.delete(key);
    await _fetch();
  }

  function clear() {
    _store.delete(key);
    data.value = null;
  }

  load();

  return { data, isLoading, error, refresh, clear };
}
