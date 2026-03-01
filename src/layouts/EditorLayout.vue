<template>
  <div class="editor-layout">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'EditorLayout',
};
</script>

<style scoped>
.editor-layout {
  min-height: 100%;
  width: 100%;
}
</style>
