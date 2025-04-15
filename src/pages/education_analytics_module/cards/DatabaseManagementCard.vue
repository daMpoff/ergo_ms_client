<template>
  <div class="database-management card rounded-3 p-4 mb-4">
    <div class="container px-0">
      <!-- Заголовок и кнопки управления -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="mb-0 text-primary d-flex align-items-center">
          <Database :size="22" class="me-2"/>
          Управление данными
        </h3>
        <div class="d-flex gap-2">
          <button 
            @click="$emit('download')" 
            :disabled="isDownloading || isUploading"
            class="btn btn-primary d-flex align-items-center action-btn">
            <template v-if="isDownloading">
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Выгрузка...
            </template>
            <template v-else>
              <ArrowDownToLine :size="18" class="me-2"/> 
              <span>Экспорт данных</span>
            </template>
          </button>
          <button 
            @click="$emit('load-example')" 
            :disabled="isDownloading || isUploading"
            class="btn btn-outline-primary d-flex align-items-center action-btn">
            <template v-if="isUploading">
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Загрузка...
            </template>
            <template v-else>
              <ArrowUpFromLine :size="18" class="me-2"/>
              <span>Загрузить примеры</span>
            </template>
          </button>
          <button 
            @click="$emit('clear')" 
            :disabled="isDownloading || isUploading"
            class="btn btn-outline-danger d-flex align-items-center action-btn">
            <Trash2 :size="18" class="me-2"/>
            <span>Очистить</span>
          </button>
        </div>
      </div>

      <div class="alert alert-secondary border-0 d-flex align-items-center" role="alert">
        <Info :size="18" class="me-2 text-primary"/>
        <span>Используйте эти инструменты для управления данными в базе данных</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Database, ArrowDownToLine, ArrowUpFromLine, Trash2, Info } from 'lucide-vue-next'

defineProps({
  isDownloading: Boolean,
  isUploading: Boolean
})

defineEmits(['download', 'load-example', 'clear'])
</script>

<style scoped>
.database-management {
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
}

.action-btn {
  min-width: 160px;
  transition: all 0.15s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.alert {
  background-color: var(--bs-tertiary-bg);
  color: var(--bs-secondary-color);
}
</style>
