/**
 * Shared formatting utilities used across views and components.
 *
 * Two currency modes:
 *  - formatCurrency  : en-US locale, SAR symbol, no decimals (default)
 *  - formatCurrencyAr: ar-SA locale, SAR symbol, no decimals
 *
 * Import the composable and destructure what you need:
 *   const { formatCurrency, formatDate, formatNumber } = useFormatters();
 */
export function useFormatters() {
  const currencyFormatterEN = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  });

  const currencyFormatterAR = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
  });

  const numberFormatter = new Intl.NumberFormat('en-US');

  const formatCurrency = (val) => {
    if (val == null || val === '') return '0 ر.س';
    return currencyFormatterEN.format(Number(val) || 0);
  };

  const formatCurrencyAr = (val) => {
    return currencyFormatterAR.format(Number(val) || 0);
  };

  const formatNumber = (val) => {
    return numberFormatter.format(Number(val) || 0);
  };

  /**
   * @param {string} dateStr - ISO date string
   * @param {string} [fallback='—'] - Value returned for empty/invalid dates
   */
  const formatDate = (dateStr, fallback = '—') => {
    if (!dateStr) return fallback;
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return fallback;
      return d.toLocaleDateString('ar-SA');
    } catch {
      return fallback;
    }
  };

  const formatDateLong = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateISO = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  /** Format date with time (hours + minutes) using ar-EG locale */
  const formatDateTime = (dateStr, fallback = '—') => {
    if (!dateStr) return fallback;
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return fallback;
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return fallback;
    }
  };

  return {
    formatCurrency,
    formatCurrencyAr,
    formatNumber,
    formatDate,
    formatDateLong,
    formatDateISO,
    formatDateTime,
  };
}
