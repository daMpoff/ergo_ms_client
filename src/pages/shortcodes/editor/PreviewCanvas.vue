<template>
  <div class="position-relative p-3 border shadow rounded mb-3">
    <h4 class="mb-3">Предпросмотр</h4>

    <div v-if="!components.length" class="text-muted">
      Здесь будет предпросмотр ваших компонентов
    </div>

    <div v-else>
      <RecursiveRenderer
        v-for="comp in components"
        :key="comp.uid"
        :component="comp"
      />
    </div>
  </div>
</template>

<script setup>
import RecursiveRenderer from './RecursiveRenderer.vue'

const props = defineProps({
  components: {
    type: Array,
    required: true
  }
})
</script>
