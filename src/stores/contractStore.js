/**
 * Contract Store (Pinia)
 * Manages contract-related state and operations
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import contractService from '@/services/contractService';
import { useAuthStore } from './authStore';
import logger from '@/utils/logger';

export const useContractStore = defineStore('contract', () => {
  // State
  const contracts = ref([]);
  const currentContract = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const filters = ref({
    status: null,
    has_photography: null,
    search: null,
  });

  // Getters
  const allContracts = computed(() => contracts.value);
  const contractCount = computed(() => contracts.value.length);
  const activeContract = computed(() => currentContract.value);
  const approvedContracts = computed(() =>
    contracts.value.filter(c => c.status === 'approved' || c.status === 'Approved')
  );
  const pendingContracts = computed(() =>
    contracts.value.filter(c => c.status === 'pending' || c.status === 'Pending')
  );

  // Actions
  async function fetchContracts(customFilters = {}) {
    isLoading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      const user = authStore.currentUser;

      let data;
      if (user?.type === 1) {
        // Admin
        data = await contractService.getAllContracts();
      } else if (user?.type === 4) {
        // Editor
        data = await contractService.getEditorContracts();
      } else {
        // Regular user
        const mergedFilters = { ...filters.value, ...customFilters };
        data = await contractService.getContracts(mergedFilters);
      }

      contracts.value = Array.isArray(data) ? data : [];
      return contracts.value;
    } catch (err) {
      error.value = err;
      logger.error('Failed to fetch contracts:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchContractById(contractId) {
    isLoading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      const user = authStore.currentUser;

      let data;
      if (user?.type === 4) {
        // Editor
        data = await contractService.getEditorContractById(contractId);
      } else {
        data = await contractService.getContractById(contractId);
      }

      currentContract.value = data;
      return data;
    } catch (err) {
      error.value = err;
      logger.error('Failed to fetch contract:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createContract(contractData) {
    isLoading.value = true;
    error.value = null;
    try {
      const newContract = await contractService.createContract(contractData);
      contracts.value.push(newContract);
      return newContract;
    } catch (err) {
      error.value = err;
      logger.error('Failed to create contract:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateContractStatus(contractId, status) {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedContract = await contractService.updateContractStatus(contractId, status);
      const index = contracts.value.findIndex(c => c.id === contractId);
      if (index !== -1) {
        contracts.value[index] = updatedContract;
      }
      if (currentContract.value?.id === contractId) {
        currentContract.value = updatedContract;
      }
      return updatedContract;
    } catch (err) {
      error.value = err;
      logger.error('Failed to update contract status:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters };
  }

  function clearFilters() {
    filters.value = {
      status: null,
      has_photography: null,
      search: null,
    };
  }

  function setCurrentContract(contract) {
    currentContract.value = contract;
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    contracts,
    currentContract,
    isLoading,
    error,
    filters,
    // Getters
    allContracts,
    contractCount,
    activeContract,
    approvedContracts,
    pendingContracts,
    // Actions
    fetchContracts,
    fetchContractById,
    createContract,
    updateContractStatus,
    setFilters,
    clearFilters,
    setCurrentContract,
    clearError,
  };
});
