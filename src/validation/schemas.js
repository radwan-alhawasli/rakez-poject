/**
 * Centralised Zod validation schemas for the application.
 *
 * All forms should prefer these schemas over the legacy validator.js helpers.
 * Use with vee-validate via toTypedSchema() from @vee-validate/zod:
 *
 *   import { toTypedSchema } from '@vee-validate/zod';
 *   import { loginSchema } from '@/validation/schemas';
 *   const schema = toTypedSchema(loginSchema);
 */
import { z } from 'zod';

// ─── Common Reusables ─────────────────────────────────────────────────────────

export const phoneSchema = z
  .string()
  .min(7, 'رقم الهاتف يجب أن يكون 7 أرقام على الأقل')
  .max(15, 'رقم الهاتف يجب أن يكون 15 رقمًا على الأكثر')
  .regex(/^[\d\s+\-()+]+$/, 'رقم الهاتف يحتوي على أحرف غير صحيحة');

export const emailSchema = z
  .string()
  .min(1, 'البريد الإلكتروني مطلوب')
  .email('صيغة البريد الإلكتروني غير صحيحة');

export const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير على الأقل');

// ─── Authentication ───────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    new_password: passwordSchema,
    new_password_confirmation: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine(data => data.new_password === data.new_password_confirmation, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['new_password_confirmation'],
  });

// ─── User Management ──────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100, 'الاسم طويل جداً'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  role: z.string().min(1, 'الدور الوظيفي مطلوب'),
  password: passwordSchema,
  password_confirmation: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
});

export const editUserSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100, 'الاسم طويل جداً'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  role: z.string().min(1, 'الدور الوظيفي مطلوب'),
});

// ─── Contract / Project ───────────────────────────────────────────────────────

export const contractFormSchema = z.object({
  developer_id: z.union([z.number(), z.string()]).refine(v => v !== '' && v !== 0, 'المطور مطلوب'),
  project_name: z.string().min(2, 'اسم المشروع مطلوب'),
  project_type: z.string().min(1, 'نوع المشروع مطلوب'),
  total_units: z.number({ invalid_type_error: 'عدد الوحدات يجب أن يكون رقمًا' }).int().positive('عدد الوحدات يجب أن يكون موجبًا'),
  start_date: z.string().min(1, 'تاريخ البدء مطلوب'),
  end_date: z.string().min(1, 'تاريخ الانتهاء مطلوب'),
  price_per_unit: z.number().positive('السعر يجب أن يكون موجبًا').optional(),
  location: z.string().optional(),
  description: z.string().max(2000, 'الوصف لا يمكن أن يتجاوز 2000 حرف').optional(),
});

export const contractInfoSchema = z.object({
  second_party_name: z.string().min(2, 'اسم الطرف الثاني مطلوب'),
  second_party_id: z.string().min(1, 'رقم هوية الطرف الثاني مطلوب'),
  gregorian_date: z.string().min(1, 'التاريخ الميلادي مطلوب'),
  agreement_duration_days: z.string().min(1, 'مدة الاتفاقية مطلوبة'),
  commission_percent: z.union([z.string(), z.number()]).refine(v => v !== '' && v !== 0, 'نسبة العمولة مطلوبة'),
  project_name: z.string().min(2, 'اسم المشروع مطلوب'),
  city: z.string().min(1, 'المدينة مطلوبة'),
});

// ─── Agent ────────────────────────────────────────────────────────────────────

export const agentSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(100, 'الاسم طويل جداً'),
  email: emailSchema,
  phone: phoneSchema,
  national_id: z.string().min(10, 'رقم الهوية يجب أن يكون 10 أرقام').max(10, 'رقم الهوية يجب أن يكون 10 أرقام').optional().or(z.literal('')),
  commission_rate: z.number().min(0).max(100, 'نسبة العمولة يجب أن تكون بين 0 و 100').optional(),
});

export const chatbotAgentSchema = z.object({
  name: z.string().min(2, 'اسم الوكيل مطلوب').max(100, 'اسم الوكيل طويل جداً'),
});

// ─── Team ─────────────────────────────────────────────────────────────────────

export const teamSchema = z.object({
  name: z.string().min(2, 'اسم الفريق مطلوب'),
  leader_id: z.union([z.number(), z.string()]).refine(v => v !== '' && v !== 0, 'قائد الفريق مطلوب'),
  department: z.string().optional(),
});

// ─── Sales Target ─────────────────────────────────────────────────────────────

export const salesTargetSchema = z.object({
  marketer_id: z.union([z.number(), z.string()]).refine(v => v !== '' && v !== 0, 'المسوق مطلوب'),
  contract_id: z.union([z.number(), z.string()]).refine(v => v !== '' && v !== 0, 'المشروع مطلوب'),
  target_value: z.number({ invalid_type_error: 'قيمة الهدف يجب أن تكون رقمًا' }).positive('قيمة الهدف يجب أن تكون موجبة'),
  deadline: z.string().min(1, 'الموعد النهائي مطلوب'),
});

export const setTargetSchema = z.object({
  targetValue: z.number({ invalid_type_error: 'قيمة الهدف يجب أن تكون رقمًا' }).positive('قيمة الهدف يجب أن تكون موجبة'),
});
