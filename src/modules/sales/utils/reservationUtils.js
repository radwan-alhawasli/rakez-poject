/**
 * Utility functions for formatting team labels and merging payloads.
 */
export function formatTeamLabel(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'string') {
    const t = value.trim();
    return t || '';
  }
  if (Array.isArray(value)) {
    const parts = value.map(formatTeamLabel).filter(Boolean);
    return [...new Set(parts)].join('، ');
  }
  if (typeof value === 'object') {
    return (
      formatTeamLabel(value.name) ||
      formatTeamLabel(value.team_name) ||
      formatTeamLabel(value.title) ||
      formatTeamLabel(value.label) ||
      ''
    );
  }
  return String(value);
}

export function mergeReservationContextPayload(raw) {
  const base = raw?.data?.data || raw?.data || raw || {};
  if (!base || typeof base !== 'object') return {};
  const nested = base.context && typeof base.context === 'object' ? base.context : {};
  return { ...base, ...nested };
}

export const RESERVATION_LABELS = {
  negotiation: 'حجز بغرض التفاوض',
  confirmed_reservation: 'حجز مؤكد',
  'Reservation for Negotiation': 'حجز بغرض التفاوض',
  'Confirmed Reservation': 'حجز مؤكد',
};

export const NATIONALITY_LABELS = {
  Saudi: 'سعودي', Other: 'أخرى', Egyptian: 'مصري', Emirati: 'إماراتي',
  Syrian: 'سوري', Jordanian: 'أردني', Lebanese: 'لبناني', Palestinian: 'فلسطيني',
  Iraqi: 'عراقي', Yemeni: 'يمني', Kuwaiti: 'كويتي', Bahraini: 'بحريني',
  Qatari: 'قطري', Omani: 'عُماني', Moroccan: 'مغربي', Tunisian: 'تونسي',
  Libyan: 'ليبي', Sudanese: 'سوداني', Algerian: 'جزائري', Pakistani: 'باكستاني',
  Indian: 'هندي', Filipino: 'فلبيني', American: 'أمريكي', British: 'بريطاني',
};

export const PAYMENT_LABELS = {
  bank_transfer: 'تحويل بنكي', 'Bank Transfer': 'تحويل بنكي',
  bank_financing: 'تمويل بنكي', 'Bank Financing': 'تمويل بنكي',
  cash: 'نقدي', Cash: 'نقدي', check: 'شيك', Check: 'شيك', cheque: 'شيك', Cheque: 'شيك',
};

export const MECHANISM_LABELS = {
  cash: 'كاش', Cash: 'كاش', mortgage: 'تمويل عقاري', Mortgage: 'تمويل عقاري',
  supported_bank: 'بنك مدعوم', 'Supported Bank': 'بنك مدعوم',
  non_supported_bank: 'بنك غير مدعوم', 'Non-supported Bank': 'بنك غير مدعوم',
  'Non-supported Bank': 'بنك غير مدعوم', 'Unsupported Bank': 'بنك غير مدعوم',
  unsupported_bank: 'بنك غير مدعوم', installment: 'أقساط', Installment: 'أقساط',
};

export const DOWN_PAYMENT_LABELS = {
  refundable: 'مسترد', Refundable: 'مسترد',
  non_refundable: 'غير مسترد', 'Non-refundable': 'غير مسترد',
  pending: 'معلق', Pending: 'معلق',
};

export function getArabicLabel(map, item) {
  return map[item.value] || map[item.label] || item.label;
}
