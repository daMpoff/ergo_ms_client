<template>
  <div :class="finalClass">
    <slot>{{ data.extra_data?.text || 'Контейнер' }}</slot>
  </div>
</template>

<script setup>
const props = defineProps({
  data: Object
})

const finalClass = computed(() => {
  return `${props.data.bootstrap_classes} ${props.data.extra_data?.align || ''}`.trim()
})
</script>

<style scoped>
div {
  min-height: 50px;
}
</style>
