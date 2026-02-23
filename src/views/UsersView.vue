<template>
  <div class="users-view">
    <UserManagement />
  </div>
</template>

<script>
import UserManagement from '../components/UserManagement.vue';

export default {
  name: 'UsersView',
  components: {
    UserManagement,
  },
};
</script>

<style scoped>
.users-view {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
