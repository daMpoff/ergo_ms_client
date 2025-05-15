<template>
  <div class="excel-upload-card card rounded-3 p-4 mb-4">
    <div class="container px-0">
      <!-- Заголовок и описание -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="mb-0 text-primary d-flex align-items-center">
          <FileSpreadsheet :size="22" class="me-2"/>
          Загрузка Excel файлов
        </h3>
      </div>

      <div class="alert alert-info mb-4" role="alert">
        <Info :size="18" class="me-2 text-primary"/>
        <span>Загрузите Excel файлы для извлечения и анализа данных</span>
      </div>

      <!-- Форма загрузки -->
      <div class="upload-form mb-4">
        <div class="mb-3">
          <label for="uploadType" class="form-label">Тип загружаемых данных:</label>
          <select v-model="uploadType" class="form-select" id="uploadType">
            <option value="" disabled>Выберите тип данных</option>
            <option value="curriculum">Учебный план, .xsls</option>
            <option value="competencies">Компетенции, .csv</option>
            <option value="disciplines">Дисциплины, . csv</option>
            <option value="vacancies">Вакансии, .csv</option>
            <option value="custom">Пользовательский формат, .json</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="excelFile" class="form-label">Выберите файл:</label>
          <input
            type="file"
            class="form-control"
            id="excelFile"
            ref="fileInput"
            accept=".xlsx,.xls"
            @change="handleFileChange"
          />
        </div>

        <div v-if="uploadType === 'custom'" class="mb-3">
          <label for="sheetName" class="form-label">Имя листа (опционально):</label>
          <input
            type="text"
            class="form-control"
            id="sheetName"
            v-model="sheetName"
            placeholder="Оставьте пустым для первого листа"
          />
        </div>

        <div v-if="selectedFile" class="selected-file-info mb-3">
          <div class="d-flex align-items-center">
            <File :size="18" class="me-2 text-primary"/>
            <strong>{{ selectedFile.name }}</strong>
            <span class="ms-2 text-muted">({{ formatFileSize(selectedFile.size) }})</span>
            <button
              class="btn btn-sm btn-link text-danger ms-auto"
              @click="clearSelectedFile"
            >
              <X :size="16"/>
            </button>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button
            @click="uploadFile"
            :disabled="!canUpload || isUploading || isProcessing"
            class="btn btn-primary d-flex align-items-center action-btn">
            <template v-if="isUploading">
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Загрузка...
            </template>
            <template v-else>
              <Upload :size="18" class="me-2"/>
              <span>Загрузить файл</span>
            </template>
          </button>

          <button
            @click="processFile"
            :disabled="!isFileUploaded || isProcessing || isUploading"
            class="btn btn-primary d-flex align-items-center action-btn">
            <template v-if="isProcessing">
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Обработка...
            </template>
            <template v-else>
              <BarChartBig :size="18" class="me-2"/>
              <span>Обработать данные</span>
            </template>
          </button>
        </div>
      </div>

      <!-- Результаты предварительного просмотра -->
      <div v-if="previewData.length > 0" class="preview-section mb-4">
        <h4 class="mb-3">Предварительный просмотр данных</h4>
        <div class="preview-container">
          <table class="table table-bordered table-hover table-sm">
            <thead class="table-light">
              <tr>
                <th v-for="(column, index) in previewHeaders" :key="index">{{ column }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in previewData.slice(0, 5)" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="previewData.length > 5" class="text-muted text-center mt-2">
            Показаны первые 5 строк из {{ previewData.length }}
          </div>
        </div>
      </div>

      <!-- Результаты обработки -->
      <div v-if="processingResults" class="processing-results">
        <h4 class="mb-3">Результаты обработки</h4>
        <div class="alert" :class="processingSuccess ? 'alert-success' : 'alert-danger'">
          <div class="d-flex align-items-start">
            <CheckCircle2 v-if="processingSuccess" :size="20" class="me-2"/>
            <AlertCircle v-else :size="20" class="me-2"/>
            <div>
              <p class="mb-1"><strong>{{ processingResults.message }}</strong></p>
              <div v-if="processingResults.details">
                <p class="mb-1">{{ processingResults.details }}</p>
              </div>
              <div v-if="processingResults.stats" class="mt-2">
                <div v-for="(value, key) in processingResults.stats" :key="key" class="d-flex mb-1">
                  <span class="text-muted me-2">{{ key }}:</span>
                  <strong>{{ value }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToastNotification ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FileSpreadsheet, File, Info, Upload, BarChartBig, X, CheckCircle2, AlertCircle } from 'lucide-vue-next'
// Закомментируем неиспользуемые импорты до момента фактической реализации API
// import { apiClient } from '@/js/api/manager'
// import { endpoints } from '@/js/api/endpoints'
import ToastNotification from './ToastNotification.vue'

const toastRef = ref(null)
const fileInput = ref(null)
const selectedFile = ref(null)
const uploadType = ref('')
const sheetName = ref('')
const isUploading = ref(false)
const isProcessing = ref(false)
const isFileUploaded = ref(false)
const previewData = ref([])
const previewHeaders = ref([])
const processingResults = ref(null)
const processingSuccess = ref(false)

// Проверка возможности загрузки
const canUpload = computed(() => {
  return selectedFile.value && uploadType.value
})

// Обработка выбора файла
const handleFileChange = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    selectedFile.value = files[0]
    // Сбрасываем предыдущие результаты
    resetResults()
  } else {
    selectedFile.value = null
  }
}

// Очистка выбранного файла
const clearSelectedFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  resetResults()
}

// Сброс результатов
const resetResults = () => {
  previewData.value = []
  previewHeaders.value = []
  processingResults.value = null
  isFileUploaded.value = false
}

// Форматирование размера файла
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Байт'
  const k = 1024
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Загрузка файла
const uploadFile = async () => {
  if (!selectedFile.value || !uploadType.value) {
    toastRef.value?.show('Выберите файл и тип данных', 'warning')
    return
  }

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('type', uploadType.value)
    if (uploadType.value === 'custom' && sheetName.value) {
      formData.append('sheet_name', sheetName.value)
    }

    // Здесь должен быть эндпоинт для загрузки Excel файлов
    // const endpoint = endpoints.learning_analytics.uploadExcel || '/api/learning-analytics/upload-excel'

    // TODO: Раскомментировать после добавления эндпоинта в API
    // const response = await apiClient.post(endpoint, formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   }
    // })

    // Имитация загрузки (замените этот код на реальный запрос)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Симуляция успешного ответа с данными предпросмотра
    const mockHeaders = ['Название', 'Код', 'Описание', 'Категория', 'Значение']
    const mockData = [
      ['Математика', 'MATH101', 'Высшая математика', 'Базовая', '10'],
      ['Информатика', 'CS101', 'Основы программирования', 'Профильная', '15'],
      ['Физика', 'PHYS101', 'Общая физика', 'Базовая', '12'],
      ['Статистика', 'STAT101', 'Теория вероятностей', 'Профильная', '8'],
      ['Английский', 'ENG101', 'Технический английский', 'Общая', '6'],
      ['Философия', 'PHIL101', 'История философии', 'Общая', '4']
    ]

    /* Реальный запрос будет выглядеть примерно так:
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.success) {
      previewHeaders.value = response.data.headers
      previewData.value = response.data.preview
      isFileUploaded.value = true
      toastRef.value?.show('Файл успешно загружен', 'success')
    } else {
      toastRef.value?.show(response.errors?.message || 'Ошибка при загрузке файла', 'error')
    }
    */

    // Пока используем имитацию ответа
    previewHeaders.value = mockHeaders
    previewData.value = mockData
    isFileUploaded.value = true
    toastRef.value?.show('Файл успешно загружен', 'success')

  } catch (error) {
    console.error('Ошибка при загрузке файла:', error)
    toastRef.value?.show(`Ошибка при загрузке файла: ${error.message || 'Неизвестная ошибка'}`, 'error')
  } finally {
    isUploading.value = false
  }
}

// Обработка загруженного файла
const processFile = async () => {
  if (!isFileUploaded.value) {
    toastRef.value?.show('Сначала загрузите файл', 'warning')
    return
  }

  isProcessing.value = true
  try {
    // Имитация обработки файла (замените на реальный запрос)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Симуляция успешного результата обработки
    const mockResult = {
      success: true,
      message: 'Данные успешно обработаны и сохранены',
      details: 'Все записи успешно импортированы в базу данных',
      stats: {
        'Всего записей': previewData.value.length,
        'Обработано': previewData.value.length,
        'Добавлено': previewData.value.length - 1,
        'Обновлено': 1,
        'Пропущено': 0
      }
    }

    /* Реальный запрос будет выглядеть примерно так:
    const endpoint = endpoints.learning_analytics.processExcel || '/api/learning-analytics/process-excel'
    const response = await apiClient.post(endpoint, {
      type: uploadType.value,
      sheet_name: sheetName.value || undefined
    })

    processingResults.value = {
      success: response.success,
      message: response.data?.message || 'Обработка завершена',
      details: response.data?.details,
      stats: response.data?.stats
    }
    processingSuccess.value = response.success
    */

    // Пока используем имитацию ответа
    processingResults.value = mockResult
    processingSuccess.value = mockResult.success
    toastRef.value?.show(mockResult.message, processingSuccess.value ? 'success' : 'error')

  } catch (error) {
    console.error('Ошибка при обработке файла:', error)
    processingResults.value = {
      success: false,
      message: 'Ошибка при обработке файла',
      details: error.message || 'Произошла неизвестная ошибка'
    }
    processingSuccess.value = false
    toastRef.value?.show(`Ошибка при обработке файла: ${error.message || 'Неизвестная ошибка'}`, 'error')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.excel-upload-card {
  background: rgba(--bs-body-bg, 0.8);
  border: 1px solid var(--bs-border-color);
  box-shadow: 0 4px 24px 0 rgba(60, 72, 88, 0.08), 0 1.5px 4px 0 rgba(60, 72, 88, 0.04);
  transition: box-shadow 0.2s;
}

.excel-upload-card:hover {
  box-shadow: 0 8px 32px 0 rgba(60, 72, 88, 0.16), 0 3px 8px 0 rgba(60, 72, 88, 0.08);
}

.action-btn {
  min-width: 170px;
  transition: all 0.18s cubic-bezier(.4,0,.2,1);
  font-weight: 500;
  letter-spacing: 0.01em;
  box-shadow: 0 1px 2px 0 rgba(60,72,88,0.04);
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: var(--bs-white);
  font-weight: 600;
  box-shadow: 0 3px 8px rgba(var(--bs-primary-rgb), 0.25);
}

.action-btn:not(:disabled):hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 12px 0 rgba(60,72,88,0.10);
  z-index: 1;
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  filter: brightness(108%);
  box-shadow: 0 5px 15px rgba(var(--bs-primary-rgb), 0.35);
}

.action-btn:active:not(:disabled) {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  filter: brightness(95%);
}

.preview-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
}

.selected-file-info {
  padding: 0.75rem;
  background-color: var(--bs-light);
  border-radius: 0.375rem;
  border: 1px solid var(--bs-border-color);
}

h3 {
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--bs-primary);
  margin-top: 1.5rem;
}

.alert {
  background-color: var(--bs-tertiary-bg);
  color: var(--bs-secondary-color);
  border: none;
  box-shadow: 0 1px 4px 0 rgba(60,72,88,0.04);
  display: flex;
  align-items: center;
  font-size: 1.05rem;
  font-weight: 500;
}

.spinner-border {
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}
</style>
