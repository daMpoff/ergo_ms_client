<template>
  <div class="bg-light p-4 border border-dashed min-vh-50 rounded" @dragover.prevent @drop="onDrop">
    <p class="text-muted" v-if="modelValue.length === 0">
      Перетащите компонент из палитры сюда...
    </p>

    <ComponentRenderer
      v-for="(component) in modelValue"
      :key="component.id"
      :component="component"
      @open-settings="emit('component-click', $event)"
    />
  </div>
</template>

<script setup>
import ComponentRenderer from './ComponentRenderer.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'component-click'])

const onDrop = (event) => {
  const raw = event.dataTransfer.getData('application/json')
  try {
    const template = JSON.parse(raw)
    const id = Date.now() + Math.floor(Math.random() * 10000)

    const newComponent = {
      ...template,
      id,
      bootstrap_classes: template.bootstrap_classes || '',
      extra_data: {}
    }

    emit('update:modelValue', [...props.modelValue, newComponent])
  } catch (err) {
    console.error('Ошибка при добавлении компонента:', err)
  }
}
</script>
ы
