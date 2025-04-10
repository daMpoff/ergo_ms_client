<template>
  <div class="database-management card rounded-3 p-4 mb-4">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="mb-0 text-primary">
          <i class="bi bi-database me-2"></i>Работа с базой данных
        </h3>
        <div class="d-flex gap-3">
          <button 
            @click="$emit('download')" 
            :disabled="isDownloading"
            class="btn btn-primary d-flex align-items-center">
            <template v-if="isDownloading">
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Выгрузка...
            </template>
            <template v-else>
              <Download :size="20" class="me-2"/> 
              <span>Выгрузить данные модуля (.csv)</span>
            </template>
          </button>
          <button 
            @click="$emit('load-example')" 
            class="btn btn-primary d-flex align-items-center">
            <Upload :size="20" class="me-2"/>
            <span>Загрузить тестовые данные</span>
          </button>
          <button 
            @click="$emit('clear')" 
            class="btn btn-outline-danger d-flex align-items-center">
            <OctagonX :size="20" class="me-2"/>
            <span>Очистить БД</span>
          </button>
        </div>
      </div>
      <div class="alert alert-info" role="alert">
        <CircleAlert :size="20" class="me-1" /> Используйте для управления данными в БД
      </div>
    </div>
  </div>
</template>

<script setup>
import { Download, Upload, OctagonX, CircleAlert } from 'lucide-vue-next'

defineProps({
  isDownloading: Boolean
})

defineEmits(['download', 'load-example', 'clear'])
</script>
