// Компонент отображает список таблиц модуля и позволяет выбрать таблицу для редактирования
<template>
  <div class="database-tables card rounded-3 p-4 mb-4">
    <div class="container">
      <!-- Заголовок карточки -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="mb-0 text-primary">
          <i class="bi bi-table me-2"></i>Таблицы модуля
        </h3>
      </div>
      
      <div class="row">
        <div class="col-12">
          <!-- Блок загрузки -->
          <div v-if="isLoading" class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Загрузка...</span>
            </div>
            <div class="mt-2 text-muted">Загрузка списка таблиц...</div>
          </div>

          <!-- Таблица с данными -->
          <div v-else-if="tables.length" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Название таблицы</th>
                  <th class="text-end">Количество полей</th>
                  <th class="text-end">Количество записей</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <!-- Перебор таблиц, выделение выбранной, кнопка для редактирования -->
                <tr v-for="table in tables" :key="table.name" :class="{'table-active': selectedTable === table.name}">
                  <td>{{ table.name }}</td>
                  <td class="text-end">{{ table.columns_count }}</td>
                  <td class="text-end">{{ table.rows_count }}</td>
                  <td class="text-end">
                    <button 
                      @click="$emit('select-table', table.name)"
                      class="btn btn-sm"
                      :class="[
                        selectedTable === table.name 
                        ? 'btn-primary' 
                        : 'btn-outline-primary'
                      ]">
                      <Edit :size="16" class="me-1"/>
                      {{ selectedTable === table.name ? 'Редактируется' : 'Редактировать' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Сообщение, если таблиц нет -->
          <div v-else class="alert alert-info text-center">
            <i class="bi bi-info-circle me-2"></i>
            Нет доступных таблиц
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Импорт иконки для кнопки редактирования
import { Edit } from 'lucide-vue-next'

// Описание входных параметров компонента
// isLoading: флаг загрузки
// selectedTable: имя выбранной таблицы
// tables: массив объектов с описанием таблиц
defineProps({
  isLoading: Boolean,
  selectedTable: String,
  tables: {
    type: Array,
    default: () => []
  }
})

// Описание события, которое эмитится при выборе таблицы
// select-table: имя выбранной таблицы
defineEmits(['select-table'])
</script>

<style scoped>
/* Стили для выделения выбранной строки таблицы */
.table-active {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
}
</style>
