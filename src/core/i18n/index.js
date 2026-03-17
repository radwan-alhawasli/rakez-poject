/**
 * Vue I18n instance for the application.
 * @module core/i18n
 */
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'ar',
  fallbackLocale: 'ar',
  messages: {
    ar: {},
    en: {},
  },
});

export default i18n;
