<template>
  <div>
    <h2 class="mb-4">Админ-панель</h2>
    <router-view />
    <DatabaseManagementCard
      :is-downloading="isDownloading"
      v-model:is-uploading="isUploading"
      @download="downloadAllData"
      @clear="showConfirmationModal"
      @reload="delayedReload"
    />
    <DatabaseTablesCard
      :is-loading="isReloading || isLoading"
      :tables="tables"
      :selected-table="selectedTable"
      @select-table="selectTable"
      @reload="delayedReload"
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
import { endpoints } from '@/js/api/endpoints'
import { apiClient } from '@/js/api/manager'
import DatabaseManagementCard from './cards/DatabaseManagementCard.vue'
import DatabaseTablesCard from './cards/DatabaseTablesCard.vue'
import ToastNotification from './cards/ToastNotification.vue'
import ClearDatabaseModal from './cards/ClearDatabaseModal.vue'
import TableEditor from './cards/TableEditor.vue'


const isLoading = ref(false)
const isDownloading = ref(false)
const isUploading = ref(false)
const isClearing = ref(false)
const isReloading = ref(false)
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

const handleApiResponse = (response, successMsg) => {
  if (response.success) {
    if (successMsg) showToast(successMsg, TOAST_TYPES.SUCCESS)
    return response.data
  } else {
    showToast(response.errors || 'Ошибка запроса', TOAST_TYPES.ERROR)
    return null
  }
}

onMounted(async () => {
  await fetchTablesList()
})

const fetchTablesList = async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get(endpoints.learning_analytics.tables)
    const data = handleApiResponse(response)
    tables.value = data?.tables || []
    if (tables.value.length > 0) {
      showToast(`Загружено ${tables.value.length} таблиц`, TOAST_TYPES.SUCCESS)
    }
  } finally {
    isLoading.value = false
  }
}

const downloadAllData = async () => {
  if (isDownloading.value) return
  isDownloading.value = true
  showToast('Функция еще не реализована', TOAST_TYPES.INFO)
  await new Promise(resolve => setTimeout(resolve, 1000))
  isDownloading.value = false
}

const showConfirmationModal = () => {
  clearModal.value?.show()
}

const clearDatabase = async () => {
  if (isClearing.value) return
  isClearing.value = true
  showToast('Очистка базы данных...', TOAST_TYPES.INFO)
  const response = await apiClient.post(endpoints.learning_analytics.clearTables)
  handleApiResponse(response, 'База данных успешно очищена')
  selectedTable.value = null
  await fetchTablesList()
  isClearing.value = false
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

const delayedReload = () => {
  isReloading.value = true
  setTimeout(async () => {
    await fetchTablesList()
    isReloading.value = false
  }, 1200)
}
</script>
