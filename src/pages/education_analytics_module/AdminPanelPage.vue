<template>
  <div>
    <h2 class="mb-4">Админ-панель</h2>
    <router-view />
    
    <div class="database-management card rounded-3 p-4 mb-4">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="mb-0 text-primary">
            <i class="bi bi-database me-2"></i>Работа с базой данных
          </h3>
          <div class="d-flex gap-3">
            <button 
              @click="downloadAllData" 
              class="btn btn-primary px-4 py-2">
                Выгрузить данные модуля
            </button>
            <button 
              @click="loadExampleData" 
              class="btn btn-primary px-4 py-2">
                Загрузить тестовые данные
            </button>
            <button 
              @click="showConfirmationModal" 
              class="btn btn-outline-danger px-4 py-2">
              <i class="bi bi-trash3 me-2"></i>
                Очистить БД
            </button>
          </div>
        </div>
        <div class="alert alert-info" role="alert">
          <CircleAlert :size="20" class="me-1" /> Используйте для управления данными в БД
        </div>
      </div>
    </div>

    <div class="database-tables card rounded-3 p-4 mb-4">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="mb-0 text-primary">
            <i class="bi bi-table me-2"></i>Таблицы модуля
          </h3>
        </div>
        
        <div class="row">
          <div class="col-12">
            <div v-if="isLoading" class="text-center my-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Загрузка...</span>
              </div>
              <div class="mt-2 text-muted">Загрузка списка таблиц...</div>
            </div>

            <div v-else-if="tables.length" class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Название таблицы</th>
                    <th class="text-end">Количество полей</th>
                    <th class="text-end">Количество записей</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="table in tables" :key="table.name">
                    <td>{{ table.name }}</td>
                    <td class="text-end">{{ table.columns_count }}</td>
                    <td class="text-end">{{ table.rows_count }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="alert alert-info text-center">
              <i class="bi bi-info-circle me-2"></i>
              Нет доступных таблиц
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Тост уведомления -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div 
        class="toast align-items-center text-white border-0" 
        :class="toastType === 'success' ? 'bg-success' : 'bg-danger'"
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
        ref="toastEl">
        <div class="d-flex">
          <div class="toast-body">
            <CircleCheck :size="20" class="me-1" /> {{ toastMessage }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения -->
    <div class="modal fade" id="confirmClearModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              Подтверждение очистки
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted mb-0 fs-5">Вы собираетесь полностью очистить базу данных. Это действие:</p>
            <ul>
              <li>Удалит абсолютно все данные</li>
              <li>Не может быть отменено</li>
              <li>Может занять некоторое время</li>
            </ul>
            <p class="fw-bold text-muted mb-0 fs-5">Вы уверены, что хотите продолжить?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-2"></i>Отмена
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="clearDatabase"
              data-bs-dismiss="modal">
              <i class="bi bi-trash3 me-2"></i>Да, очистить БД
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Toast } from 'bootstrap'
import { CircleAlert, CircleCheck } from 'lucide-vue-next'
import axios from 'axios'

// Базовые состояния
const isLoading = ref(false)
const tables = ref([])
const toastEl = ref(null)
const toastMessage = ref('')
const toastType = ref('success')
let toast = null

onMounted(async () => {
  toast = new Toast(toastEl.value)
  await fetchTablesList()
})

// Утилиты
const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  toast.show()
}

// Получение списка таблиц
const fetchTablesList = async () => {
  try {
    isLoading.value = true
    const response = await axios.get('http://localhost:8000/api/learning_analytics/tables/')
    console.log('API Response:', response.data)
    
    if (response.data?.tables) {
      tables.value = response.data.tables
      if (tables.value.length > 0) {
        showToast(`Загружено ${tables.value.length} таблиц`, 'success')
      }
    }
  } catch (error) {
    console.error('Error fetching tables:', error.response || error)
    showToast('Ошибка при загрузке списка таблиц', 'danger')
    tables.value = []
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>

.toast {
  min-width: 300px;
}
</style>