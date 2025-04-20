<template>
  <div :class="component.bootstrap_classes" class="position-relative">
    <p>{{ component.extra_data.text}}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  component: Object
})
</script>
