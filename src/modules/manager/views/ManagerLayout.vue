<template>
  <div class="manager-layout">
    <nav class="manager-nav">
      <router-link
        :to="{ name: 'ManagerEmployees' }"
        :class="['nav-link', { active: $route.path.startsWith('/manager/employees') }]"
      >
        الموظفون والتقييم
      </router-link>
    </nav>
    <div class="manager-content">
      <router-view />
    </div>
  </div>
</template>

<script>
export default { name: 'ManagerLayout' };
</script>

<style scoped>
.manager-layout {
  direction: rtl;
  padding: 20px 30px;
  min-height: 100%;
}

.manager-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.2);
}

.nav-link {
  padding: 10px 20px;
  text-decoration: none;
  color: var(--color-dark-gray);
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: rgba(177, 162, 143, 0.1);
  color: var(--color-charcoal);
}

.nav-link.active {
  background: var(--color-gold);
  color: white;
}

.manager-content {
  min-height: 400px;
}
</style>
