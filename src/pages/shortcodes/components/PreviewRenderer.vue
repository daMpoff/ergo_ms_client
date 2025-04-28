<template>
  <div :class="[
      'position-relative',
      component.bootstrap_classes,
      component.extra_data.align
    ]">
    <p>{{ component.extra_data.text}}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  component: Object
})
</script>
