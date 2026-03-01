import apiClient from '../api/apiClient';
import { handleServiceError } from '../utils/serviceErrorHandler';

/**
 * Editor Department Service
 * Matches backend Route::prefix('editor')->middleware(['auth:sanctum', 'role:editor|admin']) in api.php.
 *
 * Backend routes (all under /editor):
 *   GET    /contracts/index, /contracts/show/{id}
 *   GET    /second-party-data/show/{id}
 *   GET    /contracts/units/show/{contractId}
 *   GET    /developers, /developers/{developer_number}
 *   GET    /montage-department/show/{contractId}
 *   POST   /montage-department/store/{contractId}
 *   PUT    /montage-department/update/{contractId}
 *   GET    /photography-department/show/{contractId}
 *   POST   /photography-department/store/{contractId}
 *   PUT    /photography-department/update/{contractId}
 *   PATCH  /photography-department/approve/{contractId}
 *   GET    /boards-department/show/{contractId}
 *   POST   /boards-department/store/{contractId}
 *   PUT    /boards-department/update/{contractId}
 */
const editorService = {
  // --- Contracts (contracts.view_all, contracts.view) ---

  /**
   * GET /editor/contracts/index — ContractController@adminIndex
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of contracts
   */
  async getContracts(params = {}) {
    try {
      const response = await apiClient.get('/editor/contracts/index', { params });
      const contracts = response.data?.data || response.data || [];
      return Array.isArray(contracts) ? contracts : [];
    } catch (error) {
      return handleServiceError(error, 'Fetch editor contracts', 'get', []);
    }
  },

  /**
   * GET /editor/contracts/show/:id — ContractController@show
   * @param {number|string} contractId - Contract ID
   * @returns {Promise<Object>} Contract details
   */
  async getContractById(contractId) {
    const response = await apiClient.get(`/editor/contracts/show/${contractId}`);
    return response.data?.data || response.data || {};
  },

  // --- Second Party Data (second_party.view) ---

  /**
   * GET /editor/second-party-data/show/:id — SecondPartyDataController@show
   * @param {number|string} id - Contract or second-party ID
   * @returns {Promise<Object>} Second party data
   */
  async getSecondPartyData(id) {
    try {
      const response = await apiClient.get(`/editor/second-party-data/show/${id}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Fetch editor second party data', 'get', {});
    }
  },

  // --- Contract Units (units.view) ---

  /**
   * GET /editor/contracts/units/show/:contractId — ContractUnitController@indexByContract
   * @param {number|string} contractId - Contract ID
   * @returns {Promise<Array>} Units for the contract
   */
  async getContractUnits(contractId) {
    try {
      const response = await apiClient.get(`/editor/contracts/units/show/${contractId}`);
      const units = response.data?.data || response.data || [];
      return Array.isArray(units) ? units : [];
    } catch (error) {
      return handleServiceError(error, 'Fetch editor contract units', 'get', []);
    }
  },

  // --- Developers (contracts.view_all, contracts.view) ---

  /**
   * GET /editor/developers — DeveloperController@index
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of developers
   */
  async getDevelopers(params = {}) {
    try {
      const response = await apiClient.get('/editor/developers', { params });
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return handleServiceError(error, 'Fetch editor developers', 'get', []);
    }
  },

  /**
   * GET /editor/developers/:developer_number — DeveloperController@show
   * @param {string|number} developerNumber - Developer number
   * @returns {Promise<Object>} Developer details
   */
  async getDeveloperByNumber(developerNumber) {
    try {
      const response = await apiClient.get(`/editor/developers/${developerNumber}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Fetch editor developer', 'get', {});
    }
  },

  // --- Montage Department (departments.montage.*) ---

  /**
   * GET /editor/montage-department/show/:contractId
   * @param {number|string} contractId - Contract ID
   * @returns {Promise<Object>} Montage details
   */
  async getMontage(contractId) {
    try {
      const response = await apiClient.get(`/editor/montage-department/show/${contractId}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Fetch montage for contract ${contractId}`, 'get', {});
    }
  },

  /**
   * POST /editor/montage-department/store/:contractId
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - Montage data
   * @returns {Promise<Object>} Created montage
   */
  async createMontage(contractId, data) {
    try {
      const response = await apiClient.post(`/editor/montage-department/store/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Create montage', 'post');
    }
  },

  /**
   * PUT /editor/montage-department/update/:contractId — MontageDepartmentController@update
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated montage
   */
  async updateMontage(contractId, data) {
    try {
      const response = await apiClient.put(`/editor/montage-department/update/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `Update montage ${contractId}`, 'put');
    }
  },

  // --- Photography Department (departments.photography.*) ---

  /**
   * GET /editor/photography-department/show/:contractId — PhotographyDepartmentController@show
   * @param {number|string} contractId - Contract ID
   * @returns {Promise<Object>} Photography department data
   */
  async getPhotography(contractId) {
    try {
      const response = await apiClient.get(`/editor/photography-department/show/${contractId}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Fetch editor photography', 'get', {});
    }
  },

  /**
   * POST /editor/photography-department/store/:contractId — PhotographyDepartmentController@store
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - Photography data
   * @returns {Promise<Object>} Created record
   */
  async createPhotography(contractId, data) {
    try {
      const response = await apiClient.post(`/editor/photography-department/store/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Create photography', 'post');
    }
  },

  /**
   * PUT /editor/photography-department/update/:contractId — PhotographyDepartmentController@update
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated record
   */
  async updatePhotography(contractId, data) {
    try {
      const response = await apiClient.put(`/editor/photography-department/update/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Update photography', 'put');
    }
  },

  /**
   * PATCH /editor/photography-department/approve/:contractId — PhotographyDepartmentController@approve
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - e.g. { status, rejection_reason }
   * @returns {Promise<Object>}
   */
  async approvePhotography(contractId, data = {}) {
    try {
      const response = await apiClient.patch(`/editor/photography-department/approve/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Approve photography', 'patch');
    }
  },

  // --- Boards Department (departments.boards.*) ---

  /**
   * GET /editor/boards-department/show/:contractId — BoardsDepartmentController@show
   * @param {number|string} contractId - Contract ID
   * @returns {Promise<Object>} Boards department data
   */
  async getBoards(contractId) {
    try {
      const response = await apiClient.get(`/editor/boards-department/show/${contractId}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Fetch editor boards', 'get', {});
    }
  },

  /**
   * POST /editor/boards-department/store/:contractId — BoardsDepartmentController@store
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - Boards data
   * @returns {Promise<Object>} Created record
   */
  async createBoards(contractId, data) {
    try {
      const response = await apiClient.post(`/editor/boards-department/store/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Create boards', 'post');
    }
  },

  /**
   * PUT /editor/boards-department/update/:contractId — BoardsDepartmentController@update
   * @param {number|string} contractId - Contract ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated record
   */
  async updateBoards(contractId, data) {
    try {
      const response = await apiClient.put(`/editor/boards-department/update/${contractId}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'Update boards', 'put');
    }
  },
};

export default editorService;
