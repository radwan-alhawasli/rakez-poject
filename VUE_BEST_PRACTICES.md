# Vue.js Best Practices Guide

## 1. Composition API Standardization

### Use `<script setup>` Syntax

**Preferred:**
```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

onMounted(() => {
  console.log('Component mounted')
})
</script>
```

**Avoid:**
```vue
<script>
export default {
  data() {
    return { count: 0 }
  },
  computed: {
    doubled() {
      return this.count * 2
    }
  }
}
</script>
```

## 2. Prop Validation

Always validate props with `defineProps`:

```vue
<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
    validator: (value) => value.length > 0
  },
  count: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0
  },
  items: {
    type: Array,
    default: () => []
  }
})
</script>
```

## 3. Performance Optimizations

### Use `v-memo` for Expensive Lists

```vue
<div v-for="item in expensiveList" :key="item.id" v-memo="[item.id, item.status]">
  {{ item.name }}
</div>
```

### Use `v-once` for Static Content

```vue
<div v-once>
  <h1>{{ staticTitle }}</h1>
</div>
```

### Use `shallowRef` for Large Objects

```vue
<script setup>
import { shallowRef } from 'vue'

const largeData = shallowRef({ /* large object */ })
</script>
```

### Lazy Load Images

```vue
<img :src="imageSrc" loading="lazy" alt="Description" />
```

## 4. Component Organization

### File Structure

```
components/
  ProjectCard/
    ProjectCard.vue
    ProjectCard.test.js
    index.js
```

### Component Naming

- Use PascalCase for component names
- Use descriptive, specific names
- Keep components focused on a single responsibility

## 5. Code Quality

### Use Composables for Reusable Logic

```vue
<script setup>
import { useApi } from '@/composables/useApi'
import { useValidation } from '@/composables/useValidation'

const { call, isLoading, error } = useApi()
const { validate, errors, isValid } = useValidation(validationSchema)
</script>
```

### Error Handling

Always use the error handling composable:

```vue
<script setup>
import { useError } from '@/composables/useError'

const { execute, error, isLoading } = useError()

const fetchData = () => execute(async () => {
  return await apiService.getData()
})
</script>
```

### Input Sanitization

Always sanitize user input:

```vue
<script setup>
import { sanitizeString, sanitizeEmail } from '@/utils/sanitizer'

const handleSubmit = () => {
  const sanitizedEmail = sanitizeEmail(formData.email)
  const sanitizedName = sanitizeString(formData.name, { maxLength: 100 })
  // Submit sanitized data
}
</script>
```

## 6. State Management

### Use Pinia Stores

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useMarketingStore } from '@/stores/marketingStore'

const marketingStore = useMarketingStore()
const { dashboard, isLoading } = storeToRefs(marketingStore)

await marketingStore.fetchDashboard()
</script>
```

## 7. Routing

### Use Route Guards

```javascript
import authService from '@/services/authService'

router.beforeEach((to, from, next) => {
  if (!to.meta.public && !authService.isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

## 8. Security Best Practices

### Never Use `v-html` with User Content

**Avoid:**
```vue
<div v-html="userContent"></div>
```

**Use:**
```vue
<script setup>
import { sanitizeHtml } from '@/utils/safeHtml'

const safeContent = computed(() => sanitizeHtml(userContent.value))
</script>
<template>
  <div v-html="safeContent"></div>
</template>
```

### Always Validate and Sanitize Input

```vue
<script setup>
import { validateForm } from '@/utils/validator'
import { sanitizeFormData } from '@/utils/sanitizer'

const handleSubmit = () => {
  const sanitized = sanitizeFormData(formData, schema)
  const validation = validateForm(sanitized, schema)
  
  if (!validation.isValid) {
    // Handle errors
    return
  }
  
  // Submit data
}
</script>
```

## 9. Testing

### Component Testing

```javascript
import { mount } from '@vue/test-utils'
import ProjectCard from '@/components/project/ProjectCard.vue'

describe('ProjectCard', () => {
  it('renders user name', () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: { id: 1, name: 'Palm Residence' }
      }
    })
    expect(wrapper.text()).toContain('Palm Residence')
  })
})
```

## 10. Performance Monitoring

### Use Performance API

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  if (performance.mark) {
    performance.mark('component-mounted')
  }
})
</script>
```

## 11. Accessibility

### Use Semantic HTML

```vue
<template>
  <main>
    <header>
      <h1>Page Title</h1>
    </header>
    <section>
      <article>
        <!-- Content -->
      </article>
    </section>
  </main>
</template>
```

### ARIA Labels

```vue
<button aria-label="Close dialog" @click="close">
  ×
</button>
```

## 12. Code Splitting

### Lazy Load Routes

```javascript
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/DashboardView.vue')
  }
]
```

### Lazy Load Components

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
)
</script>
```

## Summary

- Always use Composition API with `<script setup>`
- Validate all props
- Use composables for reusable logic
- Sanitize all user input
- Use Pinia for state management
- Handle errors consistently
- Optimize performance with `v-memo`, `v-once`, and lazy loading
- Follow security best practices
- Write tests for components
- Use semantic HTML and ARIA labels
