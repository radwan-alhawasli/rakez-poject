/**
 * Shared status classification helpers.
 * Map status strings (English or Arabic) to CSS class tokens: 'excellent' | 'good'.
 * Use getStatusClass() for general statuses; getClaimStatusClass() for claim-file statuses.
 * Ensure templates use these classes (e.g. status-excellent, status-good) for consistent styling.
 */

/**
 * @param {string} status - Raw status string (English or Arabic)
 * @returns {'excellent'|'good'} CSS status class token
 */
export function getStatusClass(status) {
  if (!status) return 'good';
  const s = status.toLowerCase();
  if (
    s.includes('completed') ||
    s.includes('approved') ||
    s.includes('paid') ||
    s.includes('مكتمل') ||
    s.includes('موافق') ||
    s.includes('مقبوض')
  )
    return 'excellent';
  if (
    s.includes('pending') ||
    s.includes('waiting') ||
    s.includes('معلق') ||
    s.includes('منتظر')
  )
    return 'good';
  return 'good';
}

/**
 * @param {string} status - Raw status string
 * @returns {'excellent'|'good'} CSS status class token for claim files
 */
export function getClaimStatusClass(status) {
  if (!status) return 'good';
  const s = status.toLowerCase();
  if (s === 'completed' || s.includes('مكتمل')) return 'excellent';
  if (s === 'under_processing' || s.includes('معالجة')) return 'good';
  if (s === 'pending' || s.includes('معلق')) return 'good';
  if (s === 'submitted' || s.includes('مرسل')) return 'good';
  return 'good';
}
