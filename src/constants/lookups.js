/**
 * Shared lookup options for dropdowns when no API is available.
 * When backend exposes lookup endpoints, replace these with API calls and keep this file as fallback or remove.
 */

/** Nationalities for user/lead forms (value, label) */
export const NATIONALITIES = [
  { value: 'saudi', label: 'سعودي' },
  { value: 'egyptian', label: 'مصري' },
  { value: 'jordanian', label: 'أردني' },
  { value: 'syrian', label: 'سوري' },
  { value: 'yemeni', label: 'يمني' },
  { value: 'sudanese', label: 'سوداني' },
  { value: 'other', label: 'أخرى' },
];

/** Marital status options (API: married, divorced, widowed) */
export const MARITAL_STATUSES = [
  { value: 'single', label: 'أعزب/عزباء' },
  { value: 'married', label: 'متزوج/متزوجة' },
  { value: 'divorced', label: 'مطلق/مطلقة' },
  { value: 'widowed', label: 'أرمل/أرملة' },
];

/** قائمة الأدوار لاختيار القسم عند إضافة/تعديل الموظف — مُستخرجة من constants/roles */
import { ROLE_OPTIONS } from '@/constants/roles';
export const EMPLOYEE_TYPE_OPTIONS = ROLE_OPTIONS;

/** Lead sources for marketing (value, label) - load from API if /marketing/lead-sources or similar exists */
export const LEAD_SOURCES = [
  { value: 'Snapchat', label: 'سناب شات' },
  { value: 'Instagram', label: 'إنستجرام' },
  { value: 'Twitter', label: 'تويتر (X)' },
  { value: 'Facebook', label: 'فيسبوك' },
  { value: 'Google Ads', label: 'إعلانات جوجل' },
  { value: 'Website', label: 'الموقع الإلكتروني' },
  { value: 'Referral', label: 'إحالة' },
  { value: 'Other', label: 'أخرى' },
];

/** Unit types for exclusive project request (value, label) */
export const UNIT_TYPES = [
  { value: 'apartment', label: 'شقة' },
  { value: 'villa', label: 'فيلا' },
  { value: 'land', label: 'أرض' },
  { value: 'shop', label: 'محل' },
  { value: 'office', label: 'مكتب' },
  { value: 'other', label: 'أخرى' },
];
