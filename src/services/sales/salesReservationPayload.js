/**
 * Normalize reservation form/API payload for POST /sales/reservations.
 * @param {any} data
 * @returns {Object}
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

  /** @type {any} */
  const payload = {
    contract_id: data?.contract_id,
    contract_unit_id: data?.contract_unit_id,
    contract_date: data?.contract_date || new Date().toISOString().split('T')[0],
    reservation_type,
    client_name: data?.client_name ?? '',
    client_mobile: data?.client_mobile ?? data?.phone ?? data?.mobile ?? '',
    client_nationality: data?.client_nationality ?? 'غير محدد',
    client_iban: data?.client_iban ?? data?.clientIban ?? '',
    payment_method: data?.payment_method ?? data?.paymentMethod ?? 'cash',
    down_payment_amount: Number(data?.down_payment_amount ?? data?.downPaymentAmount ?? 0),
    down_payment_status: data?.down_payment_status ?? data?.downPaymentStatus ?? 'refundable',
    purchase_mechanism: data?.purchase_mechanism ?? data?.purchaseMechanism ?? 'cash',
    delivery_date: data?.delivery_date ?? data?.deliveryDate ?? '',
    first_payment:
      data?.first_payment != null && data?.first_payment !== ''
        ? Number(data.first_payment)
        : Number(data?.down_payment_amount ?? data?.downPaymentAmount ?? 0),
    first_payment_date: data?.first_payment_date ?? data?.firstPaymentDate ?? '',
    account: data?.account ?? '',
  };
  const paymentsRaw = Array.isArray(data?.payments) ? data.payments : [];
  const payments = paymentsRaw
    .map((/** @type {any} */ row) => ({
      payment: row?.payment != null && row?.payment !== '' ? Number(row.payment) : NaN,
      date: row?.date ? String(row.date) : '',
    }))
    .filter((/** @type {{ payment: number; date: string }} */ row) => Number.isFinite(row.payment) && row.payment > 0);
  if (payments.length > 0) payload.payments = payments;
  if (!Number.isFinite(payload.first_payment) || payload.first_payment <= 0) delete payload.first_payment;
  if (!payload.first_payment_date) delete payload.first_payment_date;
  if (!payload.delivery_date) delete payload.delivery_date;
  if (!payload.account) delete payload.account;
  if (data?.evacuation_date) payload.evacuation_date = data.evacuation_date;
  if (reservation_type === 'negotiation') {
    payload.negotiation_notes = data?.negotiation_notes ?? '';
    payload.negotiation_reason = data?.negotiation_reason ?? 'other';
    payload.proposed_price =
      data?.proposed_price != null && data?.proposed_price !== '' ? Number(data.proposed_price) : 0;
  }
  return payload;
}
