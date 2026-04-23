/**
 * @param {any} value
 */
const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * @param {any} value
 */
const toArray = value => (Array.isArray(value) ? value : []);

/**
 * @param {any} value
 * @returns {number|null}
 */
const toMarketingPercentNullable = value => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/**
 * Marketing dashboard KPI payload.
 * Preferred count field from API: `number_of_available_units` (عدد الوحدات المتاحة).
 * Legacy alias: `available_units_count`.
 * Preferred deposits count: `number_of_deposits` (عدد العربون اليومي).
 * Also accepted: `count_of_deposits`, `number_of_daily_deposits`, `daily_deposits_count`, `deposits_count_daily`, `deposits_count`.
 * @param {any} [raw]
 */
export const normalizeMarketingDashboard = raw => {
  raw = raw ?? {};
  const availableUnitsCount = toNumber(
    raw.number_of_available_units ??
      raw.available_units_count ??
      raw.units_available_count ??
      raw.count_available_units
  );
  const dailyDepositsCount = toNumber(
    raw.number_of_deposits ??
      raw.count_of_deposits ??
      raw.number_of_daily_deposits ??
      raw.daily_deposits_count ??
      raw.deposits_count_daily ??
      raw.deposits_count
  );
  return {
    total_leads: toNumber(raw.total_leads),
    available_units_value: toNumber(raw.available_units_value),
    available_units_count: availableUnitsCount,
    daily_task_achievement_rate: toNumber(raw.daily_task_achievement_rate),
    daily_deposits_count: dailyDepositsCount,
    deposit_cost: toNumber(raw.deposit_cost),
    total_expected_bookings: toNumber(raw.total_expected_bookings),
    total_expected_booking_value: toNumber(raw.total_expected_booking_value),
    total_daily_spend: toNumber(raw.total_daily_spend),
  };
};

/** @param {any} [raw] */
export const normalizeProjectDetails = raw => {
  raw = raw ?? {};
  // الوحدات: يُفضّل contract_units (من GET /marketing/projects/:id) ثم units ثم مواضع احتياطية
  const rawContractUnits =
    raw.contract_units ??
    raw.contractUnits ??
    [];
  const rawUnits =
    raw.units ??
    raw.contract_info?.units ??
    raw.contract?.units ??
    raw.marketing_project?.units ??
    [];
  const contract_units = toArray(rawContractUnits.length ? rawContractUnits : rawUnits);
  const units = contract_units; // alias لتوافق الكود القديم

  const availableUnits = contract_units.filter(u => {
    const s = String(u.status || u.unit_status || '').toLowerCase();
    return s === 'available' || s === 'متاح' || s === '';
  });
  const pendingUnits = contract_units.filter(u => {
    const s = String(u.status || u.unit_status || '').toLowerCase();
    return s === 'pending' || s === 'reserved' || s === 'pending_approval' || s === 'محجوز';
  });

  const unitsCount = raw.units_count;
  const availableFromApi =
    unitsCount && typeof unitsCount.available !== 'undefined'
      ? toNumber(unitsCount.available)
      : typeof raw.units_available !== 'undefined'
      ? toNumber(raw.units_available)
      : null;
  const pendingFromApi =
    unitsCount && typeof unitsCount.pending !== 'undefined'
      ? toNumber(unitsCount.pending)
      : typeof raw.units_pending !== 'undefined'
      ? toNumber(raw.units_pending)
      : null;

  const availableUnitsValue = availableUnits.reduce((acc, u) => acc + toNumber(u.price ?? u.unit_price), 0);
  const averageUnitPrice = contract_units.length
    ? contract_units.reduce((acc, u) => acc + toNumber(u.price ?? u.unit_price), 0) / contract_units.length
    : toNumber(raw.avg_unit_price ?? raw.average_unit_price ?? raw.avg_price);

  const contractNumber = raw.contract_number ?? raw.contract_info?.contract_number;

  return {
    ...raw,
    contract_units,
    units,
    contract_number: contractNumber,
    location:
      raw.location ??
      (raw.city || raw.district ? [raw.city, raw.district].filter(Boolean).join(' ') : null),
    available_units_count:
      availableFromApi ?? toNumber(raw.available_units_count, availableUnits.length),
    pending_units_count: pendingFromApi ?? toNumber(raw.pending_units_count, pendingUnits.length),
    available_units_value: toNumber(
      raw.total_available_value ?? raw.available_units_value,
      availableUnitsValue
    ),
    average_unit_price: averageUnitPrice,
    commission_percentage: toNumber(raw.commission_percent ?? raw.commission_percentage),
    advertiser_number: raw.advertiser_number,
    advertiser_number_value: raw.advertiser_number_value,
    marketing_percent: toMarketingPercentNullable(raw.marketing_percent),
    marketing_percent_source:
      raw.marketing_percent_source != null && raw.marketing_percent_source !== ''
        ? String(raw.marketing_percent_source)
        : null,
  };
};

/** @param {any} [raw] */
export const normalizeExpectedSale = raw => {
  raw = raw ?? {};
  const direct = toNumber(
    raw.direct_communications ??
      raw.direct_contacts ??
      raw.direct_contact_count ??
      raw.direct_communication_count
  );
  const handRaise = toNumber(raw.hand_raises ?? raw.raised_hands ?? raw.hand_raise_count);

  const conversionRateRaw = toNumber(raw.conversion_rate, 1);
  const conversionRatePercent =
    conversionRateRaw <= 1 ? conversionRateRaw * 100 : conversionRateRaw;

  const expectedBookings =
    toNumber(raw.expected_bookings) ||
    Math.round((direct + handRaise) * (conversionRatePercent / 100));

  const campaignBudget = toNumber(
    raw.campaign_budget ?? raw.marketing_budget ?? raw.marketing_value ?? raw.total_budget
  );

  const expectedBookingValue = toNumber(
    raw.expected_booking_value ?? raw.total_expected_booking_value ?? raw.average_booking_value
  );

  return {
    ...raw,
    direct_communications: direct,
    hand_raises: handRaise,
    conversion_rate: conversionRatePercent,
    conversion_rate_percent: conversionRatePercent,
    expected_bookings: expectedBookings,
    expected_booking_value: expectedBookingValue,
    campaign_budget: campaignBudget,
    deposit_per_booking:
      expectedBookings > 0
        ? toNumber(raw.deposit_per_booking, campaignBudget / expectedBookings)
        : 0,
  };
};

/** @param {any} [items] */
export const normalizeListResponse = items => toArray(items ?? []);

/**
 * @param {any} value
 */
const toDisplayValue = value => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return String(value.length);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

/**
 * @param {any} value
 */
export const normalizeReportRows = (value, reportName = '') => {
  if (Array.isArray(value)) {
    return value.map((row, index) => ({
      name: `${reportName || 'Record'} #${index + 1}`,
      summary: toDisplayValue(row),
    }));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).map(([key, val]) => ({
      name: key,
      summary: toDisplayValue(val),
    }));
  }

  return [
    {
      name: reportName || 'Summary',
      summary: toDisplayValue(value),
    },
  ];
};
