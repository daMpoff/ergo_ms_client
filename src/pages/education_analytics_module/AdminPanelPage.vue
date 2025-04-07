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
              :disabled="isDownloading"
              class="btn btn-primary d-flex align-items-center">
              <template v-if="isDownloading">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Выгрузка...
              </template>
              <template v-else>
                <Download :size="20" class="me-2"/> 
                <span>Выгрузить данные модуля</span>
              </template>
            </button>
            <button 
              @click="loadExampleData" 
              class="btn btn-primary d-flex align-items-center">
              <Upload :size="20" class="me-2"/>
              <span>Загрузить тестовые данные</span>
            </button>
            <button 
              @click="showConfirmationModal" 
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

    <!-- Обновленный тост с анимацией -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div 
        class="toast" 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
        ref="toastEl">
        <div 
          class="toast-header text-white border-0"
          :class="{
            'bg-success': toastType === TOAST_TYPES.SUCCESS,
            'bg-primary': toastType === TOAST_TYPES.INFO,
            'bg-danger': toastType === TOAST_TYPES.ERROR
          }">
          <div class="d-flex align-items-center flex-grow-1">
            <template v-if="toastType === TOAST_TYPES.SUCCESS">
              <CircleCheck :size="20" class="me-2" />
            </template>
            <template v-else-if="toastType === TOAST_TYPES.INFO">
              <CircleAlert :size="20" class="me-2" />
            </template>
            <template v-else>
              <AlertCircle :size="20" class="me-2" />
            </template>
            <strong class="me-auto">{{ toastMessage }}</strong>
          </div>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
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
import { Toast, Modal } from 'bootstrap'
import { CircleAlert, CircleCheck, Download, OctagonX, Upload, AlertCircle } from 'lucide-vue-next'
import axios from 'axios'

// Базовые состояния
const isLoading = ref(false)
const tables = ref([])
const toastEl = ref(null)
const toastMessage = ref('')
const toastType = ref('success')

// Константы для типов уведомлений
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'danger',
  INFO: 'primary'
}

// Состояния для отдельных операций
const isDownloading = ref(false)
const isUploading = ref(false)
const isClearing = ref(false)

// Обновленная функция показа уведомлений
const showToast = (message, type = TOAST_TYPES.SUCCESS) => {
  toastMessage.value = message
  toastType.value = type
  
  const toastElement = toastEl.value
  if (toastElement) {
    const toast = new Toast(toastElement, {
      animation: true,
      autohide: true,
      delay: 3000
    })
    
    // Добавляем слушатель события скрытия
    toastElement.addEventListener('hide.bs.toast', () => {
      toastElement.classList.add('hide')
    }, { once: true })

    // Добавляем слушатель события показа
    toastElement.addEventListener('show.bs.toast', () => {
      toastElement.classList.remove('hide')
      toastElement.classList.add('showing')
      setTimeout(() => {
        toastElement.classList.remove('showing')
        toastElement.classList.add('show')
      }, 10)
    }, { once: true })

    toast.show()
  }
}

onMounted(async () => {
  await fetchTablesList()
})

const fetchTablesList = async () => {
  try {
    isLoading.value = true
    const response = await axios.get('http://localhost:8000/api/learning_analytics/tables/')
    console.log('API Response:', response.data)
    
    if (response.data?.tables) {
      tables.value = response.data.tables
      if (tables.value.length > 0) {
        showToast(`Загружено ${tables.value.length} таблиц`, TOAST_TYPES.SUCCESS)
      }
    }
  } catch (error) {
    console.error('Error fetching tables:', error.response || error)
    showToast('Ошибка при загрузке списка таблиц', TOAST_TYPES.ERROR)
    tables.value = []
  } finally {
    isLoading.value = false
  }
}

const downloadAllData = async () => {
  if (isDownloading.value) return
  
  try {
    isDownloading.value = true
    showToast('Выгрузка данных началась...', TOAST_TYPES.INFO)
    
    // TODO: Добавить логику выгрузки
    await new Promise(resolve => setTimeout(resolve, 1000)) // Имитация загрузки
    
    showToast('Данные успешно выгружены', TOAST_TYPES.SUCCESS)
  } catch (error) {
    console.error('Error downloading data:', error)
    showToast('Ошибка при выгрузке данных', TOAST_TYPES.ERROR)
  } finally {
    isDownloading.value = false
  }
}

const loadExampleData = async () => {
  if (isUploading.value) return

  try {
    isUploading.value = true
    showToast('Загрузка тестовых данных...', TOAST_TYPES.INFO)
    // TODO: Добавить логику загрузки
    await new Promise(resolve => setTimeout(resolve, 1000)) // Имитация загрузки
    showToast('Тестовые данные успешно загружены', TOAST_TYPES.SUCCESS)
    await fetchTablesList()
  } catch (error) {
    console.error('Error loading example data:', error)
    showToast('Ошибка при загрузке тестовых данных', TOAST_TYPES.ERROR)
  } finally {
    isUploading.value = false
  }
}

const showConfirmationModal = () => {
  const modal = new Modal(document.getElementById('confirmClearModal'))
  modal.show()
}

const clearDatabase = async () => {
  if (isClearing.value) return

  try {
    isClearing.value = true
    showToast('Очистка базы данных...', TOAST_TYPES.INFO)
    // TODO: Добавить логику очистки
    await new Promise(resolve => setTimeout(resolve, 1000)) // Имитация очистки
    showToast('База данных успешно очищена', TOAST_TYPES.SUCCESS)
    await fetchTablesList()
  } catch (error) {
    console.error('Error clearing database:', error)
    showToast('Ошибка при очистке базы данных', TOAST_TYPES.ERROR)
  } finally {
    isClearing.value = false
  }
}
</script>

<style scoped>

.toast {
  min-width: 350px;
  opacity: 0;
  transition: all 0.3s ease-in-out;
}

.toast.showing {
  opacity: 0;
  transform: translateY(100%);
}

.toast.show {
  opacity: 1;
  transform: translateY(0);
}

.toast.hide {
  opacity: 0;
  transform: translateY(-100%);
}

.toast-container {
  z-index: 1060;
}

.toast-header {
  padding: 0.75rem 1rem;
}

.toast.hide {
  display: none;
}

.toast.show {
  display: block;
}

.btn {
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

.bg-primary {
  background-color: #0d6efd !important;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>