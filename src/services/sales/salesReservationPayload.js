/**
 * Normalize reservation payload for POST /sales/reservations.
 * Sends core fields for all reservations and Off-Plan fields only when is_off_plan is true.
 * @param {any} data
 * @returns {Record<string, any>}
 */
export function normalizeReservationPayload(data) {
  const typeRaw = data?.reservation_type ?? data?.reservationType ?? 'negotiation';
  /** @type {Record<string, string>} */
  const typeMap = {
    عقد: 'confirmed_reservation',
    contract: 'confirmed_reservation',
    confirmed: 'confirmed_reservation',
    تفاوض: 'negotiation',
    negotiation: 'negotiation',
  };

  const reservation_type =
    typeMap[String(typeRaw)] ??
    (typeRaw === 'confirmed_reservation' || typeRaw === 'negotiation' ? typeRaw : 'negotiation');

  /**
   * @param {unknown} value
   * @returns {number}
   */
  const parseNumber = value => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  /**
   * @param {unknown} value
   * @returns {boolean}
   */
  const isTruthyOffPlan = value => {
    if (value === true || value === 1 || value === '1') return true;
    const t = String(value ?? '').trim().toLowerCase();
    return t === 'true' || t === 'yes' || t === 'off_plan' || t === 'off-plan';
  };

  const is_off_plan = [
    data?.is_off_plan,
    data?.isOffPlan,
    data?.project?.is_off_plan,
    data?.contract?.is_off_plan,
    data?.context?.is_off_plan,
  ].some(isTruthyOffPlan);

  const deposit_amount = parseNumber(
    data?.deposit_amount ?? data?.depositAmount ?? data?.down_payment_amount ?? data?.downPaymentAmount ?? 0
  );
  const final_price = parseNumber(
    data?.final_price ?? data?.finalPrice ?? data?.unit_price ?? data?.price ?? data?.proposed_price ?? 0
  );
  const commission_percentage = parseNumber(
    data?.commission_percentage ?? data?.commissionPercentage ?? data?.commission_percent ?? 0
  );

  /** @type {Record<string, any>} */
  const payload = {
    contract_id: data?.contract_id,
    contract_unit_id: data?.contract_unit_id,
    contract_date: data?.contract_date || data?.date || new Date().toISOString().split('T')[0],
    reservation_type,
    client_name: data?.client_name ?? '',
    client_mobile: data?.client_mobile ?? data?.phone ?? data?.mobile ?? '',
    client_id_number: data?.client_id_number ?? data?.clientIdNumber ?? '',
    deposit_amount,
    commission_source: data?.commission_source ?? data?.commissionSource ?? data?.commission_from ?? 'owner',
    final_price,
    commission_percentage,
    client_nationality: data?.client_nationality ?? 'غير محدد',
    client_iban: data?.client_iban ?? data?.clientIban ?? '',
    payment_method: data?.payment_method ?? data?.paymentMethod ?? 'cash',
    down_payment_status: data?.down_payment_status ?? data?.downPaymentStatus ?? 'refundable',
    purchase_mechanism: data?.purchase_mechanism ?? data?.purchaseMechanism ?? 'cash',
    is_off_plan,
  };

  if (is_off_plan) {
    payload.down_payment_amount = parseNumber(data?.down_payment_amount ?? data?.downPaymentAmount ?? 0);
    payload.delivery_date = data?.delivery_date ?? data?.deliveryDate ?? '';
    payload.first_payment = parseNumber(data?.first_payment ?? data?.firstPayment ?? 0);
    payload.first_payment_date = data?.first_payment_date ?? data?.firstPaymentDate ?? '';
    payload.account = data?.account ?? '';

    const paymentsRaw = Array.isArray(data?.payments) ? data.payments : [];
    const payments = paymentsRaw
      .map((/** @type {any} */ row) => ({
        payment: row?.payment != null && row?.payment !== '' ? Number(row.payment) : NaN,
        date: row?.date ? String(row.date) : '',
      }))
      .filter((/** @type {{ payment: number; date: string }} */ row) => Number.isFinite(row.payment) && row.payment > 0);

    if (payments.length > 0) payload.payments = payments;
    if (!payload.first_payment_date) delete payload.first_payment_date;
  }

  if (data?.evacuation_date) payload.evacuation_date = data.evacuation_date;

  if (reservation_type === 'negotiation') {
    payload.negotiation_notes = data?.negotiation_notes ?? '';
    payload.negotiation_reason = data?.negotiation_reason ?? 'other';
    payload.proposed_price =
      data?.proposed_price != null && data?.proposed_price !== '' ? Number(data.proposed_price) : 0;
  }

  if (Array.isArray(data?.participants)) {
    payload.participants = data.participants
      .map((/** @type {any} */ participant) => ({
        user_id: Number(participant?.user_id),
        did_bring: Boolean(participant?.did_bring),
        did_convince: Boolean(participant?.did_convince),
        did_close: Boolean(participant?.did_close),
        weight: Number(participant?.weight),
        notes:
          participant?.notes != null && String(participant.notes).trim() !== ''
            ? String(participant.notes).trim()
            : null,
      }))
      .filter(
        (/** @type {{ user_id: number; did_bring: boolean; did_convince: boolean; did_close: boolean; weight: number }} */ participant) =>
          Number.isFinite(participant.user_id) &&
          participant.user_id > 0 &&
          Number.isFinite(participant.weight) &&
          participant.weight > 0 &&
          (participant.did_bring || participant.did_convince || participant.did_close)
      );
  }

  return payload;
}
