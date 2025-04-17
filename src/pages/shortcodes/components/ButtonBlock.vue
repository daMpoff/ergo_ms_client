<template>
  <button :class="buttonClass" type="button">
    {{ component.label || 'Кнопка' }}
  </button>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

const buttonClass = computed(() => {
  // Базовые классы + пользовательские
  const base = 'btn'
  const user = props.component.bootstrap_classes || ''
  return `${base} ${user}`.trim()
})
</script>
