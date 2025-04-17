<template>
  <div :class="component.bootstrap_classes" class="position-relative p-3 border rounded shadow mb-3">
    <!-- Название и тип -->
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <h6 class="mb-1">{{ component.name }}</h6>
        <small class="text-muted">{{ component.component_type }}</small>
        <p class="text-sm">{{ component.extra_data.text}}</p>
      </div>

      <!-- Кнопка настроек -->
      <button
        class="btn btn-sm btn-outline-secondary"
        @click="$emit('open-settings', component)"
        title="Настроить компонент"
      >
        ⚙️
      </button>
    </div>

    <!-- Контент / заглушка -->
    <div class="text-sm text-muted">
      Тут будет визуализация компонента
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  component: Object
})
</script>
