/**
 * Western digits (0–9) for Arabic locales in Intl / Date#toLocale*.
 * Keeps Arabic month names and RTL layout while avoiding Eastern Arabic numerals (٠–٩).
 */

/** Use with Intl or merge into toLocale* options */
export const NS_LATN = { numberingSystem: 'latn' };

export function localeOpts(options = {}) {
  return { ...options, numberingSystem: 'latn' };
}

const AR_INDIC = /[\u0660-\u0669]/g;
const FA_INDIC = /[\u06F0-\u06F9]/g;

/** Normalize any stray Arabic- or Persian-indic digits to Latin (safety net for mixed strings). 
 * @param {string|number} str - String to normalize
 * @returns {string}
*/
export function toWesternDigits(str) {
  return String(str)
    .replace(AR_INDIC, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(FA_INDIC, (d) => String(d.charCodeAt(0) - 0x06f0));
}
