import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from '@/composables/useToast';
import { usePermissions } from '@/composables/usePermissions';
import { getApiErrorMessage } from '@/utils/errorHandler';
import marketingService from '@/services/marketingService';
import userService from '@/services/userService';
import salesService from '@/services/salesService';
import projectRewardService from '@/services/projectRewardService';
import { getProjectManagementReservations } from '@/services/teamReservationService';
import { PERMISSIONS } from '@/constants/permissions';
import {
  PROJECT_SAI_PERCENTAGE_KEYS,
  PROJECT_SAI_SOURCE_KEYS,
  PROJECT_SAI_SOURCE_LABELS,
  REWARD_SOURCE_OPTIONS,
  CALCULATION_MODE_OPTIONS,
  DEGREE_OPTIONS,
  OPERATION_FIELDS,
  SCOPE_FIELDS,
  MANAGEMENT_ROLES,
  REWARD_STATUS_LABELS,
  SOURCE_SCOPE_LABELS,
  SOURCE_TYPE_LABELS,
  UNRESOLVED_REASON_LABELS,
  UNAVAILABLE_TEXT,
  UNSUPPORTED_TEXT
} from './constsProjectRewards.js';
import {
  toNumberOrNull,
  toBoolean,
  getNestedValue,
  firstDefinedValue,
  normalizeProjectSaiSource,
  normalizeRewardSource,
  normalizeEmployeeLabel,
  normalizeReservationItem,
  rewardRecipientsFromPayload,
  rewardUnresolvedFromPayload,
  buildPreviewPayload
} from './utilsProjectRewards.js';
import {
  emptyRewardForm,
  fillFormFromSetting,
  resetFormToDefaults
} from './formsProjectRewards.js';
// ...
// بقية الدالة useProjectRewardsProject تبقى نفسها ولكن بدون تكرار الثوابت أو الدوال ويكون استخدامها عن طريق import فقط
// ...
