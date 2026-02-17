/**
 * useValidation Composable Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useValidation } from '../../src/composables/useValidation'

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() }
}))

describe('useValidation', () => {
  it('should return errors, touched, isValid, validate, validateField, touch, clearErrors, getFieldError, hasError, isTouched', () => {
    const schema = { name: [{ type: 'required' }] }
    const TestComp = defineComponent({
      setup() {
        return useValidation(schema)
      },
      render: () => h('div')
    })
    const wrapper = mount(TestComp)
    expect(wrapper.vm.errors).toBeDefined()
    expect(wrapper.vm.touched).toBeDefined()
    expect(wrapper.vm.isValid).toBe(true)
    expect(typeof wrapper.vm.validate).toBe('function')
    expect(typeof wrapper.vm.validateField).toBe('function')
    expect(typeof wrapper.vm.touch).toBe('function')
    expect(typeof wrapper.vm.clearErrors).toBe('function')
    expect(typeof wrapper.vm.getFieldError).toBe('function')
    expect(typeof wrapper.vm.hasError).toBe('function')
    expect(typeof wrapper.vm.isTouched).toBe('function')
  })

  it('should validate form and set errors', () => {
    const schema = {
      name: [{ type: 'required', message: 'Name' }]
    }
    const TestComp = defineComponent({
      setup() {
        return useValidation(schema)
      },
      render: () => h('div')
    })
    const wrapper = mount(TestComp)
    const valid = wrapper.vm.validate({ name: '' })
    expect(valid).toBe(false)
    expect(wrapper.vm.hasError('name')).toBe(true)
  })

  it('touch should set touched', () => {
    const schema = {}
    const TestComp = defineComponent({
      setup() {
        return useValidation(schema)
      },
      render: () => h('div')
    })
    const wrapper = mount(TestComp)
    expect(wrapper.vm.isTouched('x')).toBe(false)
    wrapper.vm.touch('x')
    expect(wrapper.vm.isTouched('x')).toBe(true)
  })

  it('clearErrors should clear errors', () => {
    const schema = { name: [{ type: 'required' }] }
    const TestComp = defineComponent({
      setup() {
        return useValidation(schema)
      },
      render: () => h('div')
    })
    const wrapper = mount(TestComp)
    wrapper.vm.validate({ name: '' })
    expect(wrapper.vm.hasError('name')).toBe(true)
    wrapper.vm.clearErrors()
    expect(wrapper.vm.hasError('name')).toBe(false)
  })
})
