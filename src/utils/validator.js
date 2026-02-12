/**
 * Validation Utility
 * Client-side validation for forms and inputs
 */

import logger from './logger'
import { sanitizeEmail, sanitizePhone, sanitizeNumber, sanitizeUrl } from './sanitizer'

/**
 * Validation result object
 */
export class ValidationResult {
    constructor(isValid, errors = []) {
        this.isValid = isValid
        this.errors = Array.isArray(errors) ? errors : [errors]
    }

    addError(error) {
        this.errors.push(error)
        this.isValid = false
    }
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {ValidationResult} Validation result
 */
export function validateEmail(email) {
    const result = new ValidationResult(true)

    if (!email || typeof email !== 'string') {
        result.addError('البريد الإلكتروني مطلوب')
        return result
    }

    const sanitized = sanitizeEmail(email)
    if (!sanitized) {
        result.addError('صيغة البريد الإلكتروني غير صحيحة')
        return result
    }

    // Additional validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(sanitized)) {
        result.addError('صيغة البريد الإلكتروني غير صحيحة')
        return result
    }

    return result
}

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @param {Object} options - Options { required, minLength, maxLength }
 * @returns {ValidationResult} Validation result
 */
export function validatePhone(phone, options = {}) {
    const { required = true, minLength = 7, maxLength = 15 } = options
    const result = new ValidationResult(true)

    if (!phone || typeof phone !== 'string') {
        if (required) {
            result.addError('رقم الهاتف مطلوب')
        }
        return result
    }

    const sanitized = sanitizePhone(phone)
    if (!sanitized) {
        result.addError('رقم الهاتف غير صحيح')
        return result
    }

    if (sanitized.length < minLength) {
        result.addError(`رقم الهاتف يجب أن يكون ${minLength} أرقام على الأقل`)
        return result
    }

    if (sanitized.length > maxLength) {
        result.addError(`رقم الهاتف يجب أن يكون ${maxLength} أرقام على الأكثر`)
        return result
    }

    return result
}

/**
 * Validate required field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {ValidationResult} Validation result
 */
export function validateRequired(value, fieldName = 'الحقل') {
    const result = new ValidationResult(true)

    if (value === null || value === undefined || value === '') {
        result.addError(`${fieldName} مطلوب`)
        return result
    }

    if (typeof value === 'string' && value.trim() === '') {
        result.addError(`${fieldName} مطلوب`)
        return result
    }

    return result
}

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {Object} options - Options { min, max, required }
 * @param {string} fieldName - Field name for error message
 * @returns {ValidationResult} Validation result
 */
export function validateLength(value, options = {}, fieldName = 'الحقل') {
    const { min = 0, max = null, required = false } = options
    const result = new ValidationResult(true)

    if (!value || typeof value !== 'string') {
        if (required) {
            result.addError(`${fieldName} مطلوب`)
        }
        return result
    }

    const length = value.trim().length

    if (length < min) {
        result.addError(`${fieldName} يجب أن يكون ${min} أحرف على الأقل`)
        return result
    }

    if (max !== null && length > max) {
        result.addError(`${fieldName} يجب أن يكون ${max} أحرف على الأكثر`)
        return result
    }

    return result
}

/**
 * Validate number
 * @param {*} value - Value to validate
 * @param {Object} options - Options { min, max, integer, required, allowNegative }
 * @param {string} fieldName - Field name for error message
 * @returns {ValidationResult} Validation result
 */
export function validateNumber(value, options = {}, fieldName = 'الحقل') {
    const {
        min = null,
        max = null,
        integer = false,
        required = false,
        allowNegative = true
    } = options

    const result = new ValidationResult(true)

    if (value === null || value === undefined || value === '') {
        if (required) {
            result.addError(`${fieldName} مطلوب`)
        }
        return result
    }

    const num = sanitizeNumber(value, { min, max, integer, allowNegative })

    if (num === null) {
        result.addError(`${fieldName} يجب أن يكون رقماً صحيحاً`)
        return result
    }

    if (min !== null && num < min) {
        result.addError(`${fieldName} يجب أن يكون ${min} على الأقل`)
        return result
    }

    if (max !== null && num > max) {
        result.addError(`${fieldName} يجب أن يكون ${max} على الأكثر`)
        return result
    }

    return result
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @param {Object} options - Options { required, allowedProtocols }
 * @param {string} fieldName - Field name for error message
 * @returns {ValidationResult} Validation result
 */
export function validateUrl(url, options = {}, fieldName = 'الرابط') {
    const { required = false, allowedProtocols = ['http:', 'https:'] } = options
    const result = new ValidationResult(true)

    if (!url || typeof url !== 'string') {
        if (required) {
            result.addError(`${fieldName} مطلوب`)
        }
        return result
    }

    const sanitized = sanitizeUrl(url, { allowedProtocols, requireProtocol: true })

    if (!sanitized) {
        result.addError(`${fieldName} غير صحيح`)
        return result
    }

    return result
}

/**
 * Validate date
 * @param {string|Date} date - Date to validate
 * @param {Object} options - Options { required, min, max }
 * @param {string} fieldName - Field name for error message
 * @returns {ValidationResult} Validation result
 */
export function validateDate(date, options = {}, fieldName = 'التاريخ') {
    const { required = false, min = null, max = null } = options
    const result = new ValidationResult(true)

    if (!date) {
        if (required) {
            result.addError(`${fieldName} مطلوب`)
        }
        return result
    }

    const dateObj = date instanceof Date ? date : new Date(date)

    if (isNaN(dateObj.getTime())) {
        result.addError(`${fieldName} غير صحيح`)
        return result
    }

    if (min && dateObj < new Date(min)) {
        result.addError(`${fieldName} يجب أن يكون بعد ${min}`)
        return result
    }

    if (max && dateObj > new Date(max)) {
        result.addError(`${fieldName} يجب أن يكون قبل ${max}`)
        return result
    }

    return result
}

/**
 * Validate password
 * @param {string} password - Password to validate
 * @param {Object} options - Options { required, minLength, requireUppercase, requireLowercase, requireNumber, requireSpecial }
 * @returns {ValidationResult} Validation result
 */
export function validatePassword(password, options = {}) {
    const {
        required = true,
        minLength = 8,
        requireUppercase = false,
        requireLowercase = true,
        requireNumber = false,
        requireSpecial = false
    } = options

    const result = new ValidationResult(true)

    if (!password || typeof password !== 'string') {
        if (required) {
            result.addError('كلمة المرور مطلوبة')
        }
        return result
    }

    if (password.length < minLength) {
        result.addError(`كلمة المرور يجب أن تكون ${minLength} أحرف على الأقل`)
        return result
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
        result.addError('كلمة المرور يجب أن تحتوي على حرف كبير على الأقل')
        return result
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
        result.addError('كلمة المرور يجب أن تحتوي على حرف صغير على الأقل')
        return result
    }

    if (requireNumber && !/[0-9]/.test(password)) {
        result.addError('كلمة المرور يجب أن تحتوي على رقم على الأقل')
        return result
    }

    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        result.addError('كلمة المرور يجب أن تحتوي على رمز خاص على الأقل')
        return result
    }

    return result
}

/**
 * Validate form data against schema
 * @param {Object} formData - Form data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} { isValid, errors } - Validation result
 */
export function validateForm(formData, schema) {
    const errors = {}
    let isValid = true

    for (const field in schema) {
        if (Object.prototype.hasOwnProperty.call(schema, field)) {
            const rules = schema[field]
            const value = formData[field]
            const fieldErrors = []

            // Apply validation rules
            for (const rule of rules) {
                let result

                switch (rule.type) {
                    case 'required':
                        result = validateRequired(value, rule.message || field)
                        break
                    case 'email':
                        result = validateEmail(value)
                        break
                    case 'phone':
                        result = validatePhone(value, rule.options || {})
                        break
                    case 'length':
                        result = validateLength(value, rule.options || {}, rule.message || field)
                        break
                    case 'number':
                        result = validateNumber(value, rule.options || {}, rule.message || field)
                        break
                    case 'url':
                        result = validateUrl(value, rule.options || {}, rule.message || field)
                        break
                    case 'date':
                        result = validateDate(value, rule.options || {}, rule.message || field)
                        break
                    case 'password':
                        result = validatePassword(value, rule.options || {})
                        break
                    case 'custom':
                        result = rule.validator(value, formData)
                        break
                    default:
                        logger.warn('Unknown validation rule type:', rule.type)
                        continue
                }

                if (!result.isValid) {
                    fieldErrors.push(...result.errors)
                    isValid = false
                }
            }

            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors
            }
        }
    }

    return { isValid, errors }
}

export default {
    ValidationResult,
    validateEmail,
    validatePhone,
    validateRequired,
    validateLength,
    validateNumber,
    validateUrl,
    validateDate,
    validatePassword,
    validateForm
}
