/**
 * v-permission Directive Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp, h, defineComponent } from 'vue'
import permissionDirective from '../../src/directives/permission'
import authService from '../../src/services/authService'

vi.mock('../../src/services/authService', () => ({
  default: { getCurrentUser: vi.fn(() => null) }
}))

describe('v-permission directive', () => {
  beforeEach(() => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(null)
  })

  it('should hide element when user lacks permission', () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ permissions: [] })

    const Comp = defineComponent({
      directives: { permission: permissionDirective },
      template: '<div v-permission="\'contracts.create\'" data-test="el">Content</div>'
    })
    const wrapper = mount(Comp)

    expect(wrapper.find('[data-test="el"]').element.style.display).toBe('none')
  })

  it('should show element when user has permission', () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ permissions: ['contracts.create'] })

    const Comp = defineComponent({
      directives: { permission: permissionDirective },
      template: '<div v-permission="\'contracts.create\'" data-test="el">Content</div>'
    })
    const wrapper = mount(Comp)

    expect(wrapper.find('[data-test="el"]').element.style.display).toBe('')
  })

  it('should do nothing when binding value is empty', () => {
    const Comp = defineComponent({
      directives: { permission: permissionDirective },
      template: '<div v-permission="" data-test="el">Content</div>'
    })
    const wrapper = mount(Comp)

    expect(wrapper.find('[data-test="el"]').exists()).toBe(true)
  })
})
