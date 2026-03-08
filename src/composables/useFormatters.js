/**
 * Shared formatting utilities used across views and components.
 *
 * Import the composable and destructure what you need:
 *   const { formatCurrency, formatCompact, formatDate, formatNumber } = useFormatters();
 */

const ARABIC_DIGITS = /[\u0660-\u0669]/g;
const toWestern = (str) =>
  String(str).replace(ARABIC_DIGITS, (d) => d.charCodeAt(0) - 0x0660);

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

  const compactFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  });

  const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  });

  const formatCurrency = (val) => {
    if (val == null || val === '') return '0 ر.س';
    return currencyFormatterEN.format(Number(val) || 0);
  };

  const formatCurrencyAr = (val) => {
    return toWestern(currencyFormatterAR.format(Number(val) || 0));
  };

  const formatNumber = (val) => {
    return numberFormatter.format(Number(val) || 0);
  };

  /** Compact number: 1500 → "1.5K", 2300000 → "2.3M" */
  const formatCompact = (val) => {
    const n = Number(val) || 0;
    if (Math.abs(n) < 1000) return numberFormatter.format(n);
    return compactFormatter.format(n);
  };

  /** Compact currency: 1500 → "SAR 1.5K" */
  const formatCurrencyCompact = (val) => {
    const n = Number(val) || 0;
    if (Math.abs(n) < 1000) return currencyFormatterEN.format(n);
    return compactCurrencyFormatter.format(n);
  };

  /**
   * للأرقام المالية في البطاقات: الرقم مع منزلة عشرية + حرف الرتبة (K/M/B)، واسم العملة منفصل للعرض أسفل الرقم.
   * @returns {{ main: string, currency: string }} main مثل "8.0 M" أو "1.5 K"، currency مثل "ر.س"
   */
  const formatCurrencyCompactParts = (val) => {
    const n = Number(val) || 0;
    const abs = Math.abs(n);
    let main;
    if (abs < 1000) {
      main = n.toFixed(1);
    } else if (abs < 1e6) {
      main = (n / 1000).toFixed(1) + ' K';
    } else if (abs < 1e9) {
      main = (n / 1e6).toFixed(1) + ' M';
    } else {
      main = (n / 1e9).toFixed(1) + ' B';
    }
    return { main, currency: 'ر.س' };
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
      return toWestern(d.toLocaleDateString('ar-SA'));
    } catch {
      return fallback;
    }
  };

  const formatDateLong = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return toWestern(
        d.toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      );
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

  /** Format date with time (hours + minutes) */
  const formatDateTime = (dateStr, fallback = '—') => {
    if (!dateStr) return fallback;
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return fallback;
      return toWestern(
        d.toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    } catch {
      return fallback;
    }
  };

  return {
    formatCurrency,
    formatCurrencyAr,
    formatNumber,
    formatCompact,
    formatCurrencyCompact,
    formatCurrencyCompactParts,
    formatDate,
    formatDateLong,
    formatDateISO,
    formatDateTime,
  };
}
