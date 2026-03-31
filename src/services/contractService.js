import { normalizeContractWritePayload } from '@/services/contract/contractNormalize.js';
import { contractServiceAdminMethods } from '@/services/contracts/contractServiceAdmin.js';
import { contractServiceMarketerMethods } from '@/services/contracts/contractServiceMarketer.js';
import { contractServiceUnitsMethods } from '@/services/contracts/contractServiceUnits.js';
import { contractServiceDeveloperMethods } from '@/services/contracts/contractServiceDeveloper.js';
import { contractServiceMiscMethods } from '@/services/contracts/contractServiceMisc.js';

/**
 * خدمة العقود - API Integration (واجهة موحّدة من وحدات فرعية تحت src/services/contracts/)
 */
const contractService = {
  ...contractServiceAdminMethods,
  ...contractServiceMarketerMethods,
  ...contractServiceUnitsMethods,
  ...contractServiceDeveloperMethods,
  ...contractServiceMiscMethods,
};

export { normalizeContractWritePayload };
export default contractService;
