<template>
  <div>
    <h2 class="mb-4">Админ-панель</h2>
    <router-view />
    <DatabaseManagementCard
      :is-downloading="isDownloading"
      :is-uploading="isUploading"
      @download="downloadAllData"
      @load-example="loadExampleData"
      @clear="showConfirmationModal"
    />
    <DatabaseTablesCard
      :is-loading="isLoading"
      :tables="tables"
      :selected-table="selectedTable"
      @select-table="selectTable"
    />
    <TableEditor
      v-if="selectedTable"
      :selected-table="selectedTable"
      @error="handleError"
    />
    <ToastNotification ref="toast"/>
    <ClearDatabaseModal ref="clearModal" @confirm="clearDatabase"/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import DatabaseManagementCard from './cards/DatabaseManagementCard.vue'
import DatabaseTablesCard from './cards/DatabaseTablesCard.vue'
import ToastNotification from './cards/ToastNotification.vue'
import ClearDatabaseModal from './cards/ClearDatabaseModal.vue'
import TableEditor from './cards/TableEditor.vue'

const isLoading = ref(false)
const isDownloading = ref(false)
const isUploading = ref(false)
const isClearing = ref(false)
const tables = ref([])
const selectedTable = ref(null)

const toast = ref(null)
const clearModal = ref(null)

const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'danger',
  INFO: 'primary'
}

const showToast = (message, type = TOAST_TYPES.SUCCESS) => {
  toast.value?.show(message, type)
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
    showToast('Функция еще не реализована', TOAST_TYPES.INFO)
    
    // TODO: Добавить логику выгрузки
    await new Promise(resolve => setTimeout(resolve, 3000)) // Имитация загрузки
    
    // showToast('Данные успешно выгружены', TOAST_TYPES.SUCCESS)
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
  clearModal.value?.show()
}

const clearDatabase = async () => {
  if (isClearing.value) return

  try {
    isClearing.value = true
    showToast('Очистка базы данных...', TOAST_TYPES.INFO)
    
    await axios.post('http://localhost:8000/api/learning_analytics/tables/clear/')
    
    await fetchTablesList() // Обновляем список таблиц
    showToast('База данных успешно очищена', TOAST_TYPES.SUCCESS)
  } catch (error) {
    console.error('Error clearing database:', error)
    showToast('Ошибка при очистке базы данных', TOAST_TYPES.ERROR)
  } finally {
    isClearing.value = false
  }
}

const selectTable = (tableName) => {
  selectedTable.value = tableName === selectedTable.value ? null : tableName
  if (selectedTable.value) {
    showToast(`Выбрана таблица "${tableName}"`, TOAST_TYPES.INFO)
  }
}

const handleError = (message) => {
  showToast(message, TOAST_TYPES.ERROR)
}
</script>