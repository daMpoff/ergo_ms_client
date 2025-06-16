<script setup>
const { component } = defineProps({ component: Object })

const data = component.extra_data || {}
const src = data.src || 'https://image-placeholder.com/images/actual-size/600x400.png'
const alt = data.alt || ''
const cls = [
  ...(component.class_list || []),
  data.fluid ? 'img-fluid' : '',
  data.rounded ? 'rounded' : '',
]
</script>

<template>
  <img :src="src" :alt="alt" :class="cls" />
</template>
