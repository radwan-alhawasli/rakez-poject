/**
 * Validation Composable
 * Provides form validation functionality
 */

import { reactive, computed } from 'vue'
import { validateForm } from '../utils/validator'
import { sanitizeFormData } from '../utils/sanitizer'

/**
 * Validation composable
 * @param {Object} schema - Validation schema
 * @param {Object} options - Options
 * @returns {Object} Validation utilities
 */
export function useValidation(schema = {}, options = {}) {
    const {
        autoSanitize = true,
        validateOnChange = false
    } = options

    const errors = reactive({})
    const touched = reactive({})
    const isValid = computed(() => Object.keys(errors).length === 0)

    /**
     * Validate field
     * @param {string} field - Field name
     * @param {*} value - Field value
     * @param {Object} fieldSchema - Field validation schema
     */
    function validateField(field, value, fieldSchema = null) {
        const rules = fieldSchema || schema[field]
        if (!rules || !Array.isArray(rules)) {
            return
        }

        const fieldErrors = []
        for (const rule of rules) {
            let result

            switch (rule.type) {
                case 'required':
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        fieldErrors.push(rule.message || `${field} is required`)
                    }
                    break
                case 'email': {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (value && !emailRegex.test(value)) {
                        fieldErrors.push(rule.message || 'Invalid email format')
                    }
                    break
                }
                case 'minLength':
                    if (value && value.length < rule.value) {
                        fieldErrors.push(rule.message || `Minimum length is ${rule.value}`)
                    }
                    break
                case 'maxLength':
                    if (value && value.length > rule.value) {
                        fieldErrors.push(rule.message || `Maximum length is ${rule.value}`)
                    }
                    break
                case 'custom':
                    if (rule.validator) {
                        result = rule.validator(value)
                        if (result && !result.isValid) {
                            fieldErrors.push(...(result.errors || [result.message || 'Validation failed']))
                        }
                    }
                    break
            }
        }

        if (fieldErrors.length > 0) {
            errors[field] = fieldErrors
        } else {
            delete errors[field]
        }
    }

    /**
     * Validate all fields
     * @param {Object} formData - Form data
     * @returns {boolean} True if valid
     */
    function validate(formData) {
        // Clear previous errors
        Object.keys(errors).forEach(key => delete errors[key])

        // Sanitize if enabled
        const dataToValidate = autoSanitize ? sanitizeFormData(formData, schema) : formData

        // Validate
        const result = validateForm(dataToValidate, schema)
        
        // Set errors
        Object.assign(errors, result.errors)

        return result.isValid
    }

    /**
     * Mark field as touched
     * @param {string} field - Field name
     */
    function touch(field) {
        touched[field] = true
        if (validateOnChange && schema[field]) {
            // Validate on touch if enabled
        }
    }

    /**
     * Mark all fields as touched
     */
    function touchAll() {
        Object.keys(schema).forEach(field => {
            touched[field] = true
        })
    }

    /**
     * Clear validation errors
     * @param {string} field - Field name (optional)
     */
    function clearErrors(field = null) {
        if (field) {
            delete errors[field]
            delete touched[field]
        } else {
            Object.keys(errors).forEach(key => delete errors[key])
            Object.keys(touched).forEach(key => delete touched[key])
        }
    }

    /**
     * Get field error
     * @param {string} field - Field name
     * @returns {string|null} Error message or null
     */
    function getFieldError(field) {
        return errors[field]?.[0] || null
    }

    /**
     * Check if field has error
     * @param {string} field - Field name
     * @returns {boolean} True if has error
     */
    function hasError(field) {
        return !!errors[field]
    }

    /**
     * Check if field is touched
     * @param {string} field - Field name
     * @returns {boolean} True if touched
     */
    function isTouched(field) {
        return !!touched[field]
    }

    return {
        errors,
        touched,
        isValid,
        validate,
        validateField,
        touch,
        touchAll,
        clearErrors,
        getFieldError,
        hasError,
        isTouched
    }
}

export default useValidation
