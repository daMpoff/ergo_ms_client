<template>
  <div class="info-card">
    <div class="info-card__header">
      <h6 class="mb-0">{{ title }}</h6>
    </div>
    <div class="info-card__body">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped lang="scss">
.info-card {
  background: var(--color-primary-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.info-card__header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-secondary-background);
}

.info-card__body {
  padding: 0.75rem 1rem;
}
</style>


