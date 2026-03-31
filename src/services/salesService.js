import { SALES_API_ENDPOINT_REGISTRY } from '@/services/sales/salesEndpointRegistry.js';
import { salesNegotiationsApi } from '@/services/sales/salesNegotiationsApi.js';
import { salesServiceCoreMethods } from '@/services/sales/salesServiceCoreMethods.js';
import { salesServiceExtendedMethods } from '@/services/sales/salesServiceExtendedMethods.js';

/**
 * Sales Department Service
 * Composes core + extended method maps and negotiation helpers into one default export.
 */
const salesService = {
  __endpointRegistry: SALES_API_ENDPOINT_REGISTRY,
  ...salesServiceCoreMethods,
  ...salesServiceExtendedMethods,
  ...salesNegotiationsApi,
};

export default salesService;
