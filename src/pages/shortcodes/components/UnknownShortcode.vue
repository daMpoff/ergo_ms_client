<template>
  <div class="text-danger">
    Неизвестный шорткод: {{ component.component_type }}
  </div>
</template>

<script setup>
import { defineProps, defineOptions } from 'vue'
defineOptions({ name: 'UnknownShortcode' })

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})
</script>
