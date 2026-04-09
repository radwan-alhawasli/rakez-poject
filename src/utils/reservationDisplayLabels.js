/**
 * عرض قيم الحجز للمستخدم (عربي) — تطابق منطق UnitReservationModal حيث ينطبق.
 */

const PAYMENT_METHOD_LABELS = {
  bank_transfer: 'تحويل بنكي',
  'Bank Transfer': 'تحويل بنكي',
  bank_financing: 'تمويل بنكي',
  'Bank Financing': 'تمويل بنكي',
  cash: 'نقدي',
  Cash: 'نقدي',
  check: 'شيك',
  Check: 'شيك',
  cheque: 'شيك',
  Cheque: 'شيك',
};

const PURCHASE_MECHANISM_LABELS = {
  cash: 'كاش',
  Cash: 'كاش',
  mortgage: 'تمويل عقاري',
  Mortgage: 'تمويل عقاري',
  supported_bank: 'بنك مدعوم',
  'Supported Bank': 'بنك مدعوم',
  non_supported_bank: 'بنك غير مدعوم',
  'Non-supported Bank': 'بنك غير مدعوم',
  unsupported_bank: 'بنك غير مدعوم',
  'Unsupported Bank': 'بنك غير مدعوم',
  installment: 'أقساط',
  Installment: 'أقساط',
};

const NATIONALITY_LABELS = {
  Saudi: 'سعودي',
  Other: 'أخرى',
  Egyptian: 'مصري',
  Emirati: 'إماراتي',
  Syrian: 'سوري',
  Jordanian: 'أردني',
  Lebanese: 'لبناني',
  Palestinian: 'فلسطيني',
  Iraqi: 'عراقي',
  Yemeni: 'يمني',
  Kuwaiti: 'كويتي',
  Bahraini: 'بحريني',
  Qatari: 'قطري',
  Omani: 'عُماني',
  Moroccan: 'مغربي',
  Tunisian: 'تونسي',
  Libyan: 'ليبي',
  Sudanese: 'سوداني',
  Algerian: 'جزائري',
  Pakistani: 'باكستاني',
  Indian: 'هندي',
  Filipino: 'فلبيني',
  American: 'أمريكي',
  British: 'بريطاني',
};

const RESERVATION_TYPE_LABELS = {
  negotiation: 'حجز بغرض التفاوض',
  confirmed_reservation: 'حجز مؤكد',
  'Reservation for Negotiation': 'حجز بغرض التفاوض',
  'Confirmed Reservation': 'حجز مؤكد',
};

/**
 * @param {string} [raw]
 * @returns {string}
 */
export function paymentMethodLabel(raw) {
  if (raw == null || raw === '') return '—';
  const s = String(raw).trim();
  return PAYMENT_METHOD_LABELS[s] ?? s;
}

/**
 * @param {string} [raw]
 * @returns {string}
 */
export function purchaseMechanismLabel(raw) {
  if (raw == null || raw === '') return '—';
  const s = String(raw).trim();
  return PURCHASE_MECHANISM_LABELS[s] ?? s;
}

/**
 * @param {string} [raw]
 * @returns {string}
 */
export function nationalityLabel(raw) {
  if (raw == null || raw === '') return '—';
  const s = String(raw).trim();
  return NATIONALITY_LABELS[s] ?? s;
}

/**
 * @param {string} [raw]
 * @returns {string}
 */
export function reservationTypeLabel(raw) {
  if (raw == null || raw === '') return '—';
  const s = String(raw).trim();
  return RESERVATION_TYPE_LABELS[s] ?? s;
}

/**
 * @param {string} [status]
 * @returns {string}
 */
export function downPaymentStatusLabel(status) {
  if (status == null || status === '') return '—';
  const s = String(status).trim().toLowerCase();
  if (s === 'refundable') return 'قابل للاسترداد';
  if (s === 'non_refundable' || s === 'non-refundable') return 'غير قابل للاسترداد';
  return String(status);
}
