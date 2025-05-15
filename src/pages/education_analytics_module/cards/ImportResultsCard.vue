<template>
  <div class="import-results-card card rounded-3 p-4 mb-4">
    <div class="container px-0">
      <!-- Заголовок и описание -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="mb-0 text-primary d-flex align-items-center">
          <Database :size="22" class="me-2"/>
          Результаты импорта
        </h3>
        <button
          @click="refresh"
          class="btn btn-outline-primary d-flex align-items-center"
          :disabled="isLoading"
        >
          <RefreshCw :size="18" class="me-2" :class="{ 'spin': isLoading }"/>
          <span>Обновить</span>
        </button>
      </div>

      <!-- Статистика импорта -->
      <div class="import-stats mb-4">
        <div class="row g-4">
          <div class="col-md-6 col-lg-3">
            <div class="stats-card bg-primary-subtle p-3 rounded-3 h-100">
              <div class="d-flex align-items-center mb-2">
                <FileText :size="20" class="me-2 text-primary"/>
                <h5 class="mb-0">Файлы</h5>
              </div>
              <div class="stats-number">{{ stats.filesCount }}</div>
              <div class="stats-label">Всего обработано</div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="stats-card bg-success-subtle p-3 rounded-3 h-100">
              <div class="d-flex align-items-center mb-2">
                <CheckCircle2 :size="20" class="me-2 text-success"/>
                <h5 class="mb-0">Импорт</h5>
              </div>
              <div class="stats-number">{{ stats.totalRecords }}</div>
              <div class="stats-label">Всего записей</div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="stats-card bg-warning-subtle p-3 rounded-3 h-100">
              <div class="d-flex align-items-center mb-2">
                <AlertCircle :size="20" class="me-2 text-warning"/>
                <h5 class="mb-0">Ошибки</h5>
              </div>
              <div class="stats-number">{{ stats.errorsCount }}</div>
              <div class="stats-label">Количество ошибок</div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="stats-card bg-info-subtle p-3 rounded-3 h-100">
              <div class="d-flex align-items-center mb-2">
                <Clock :size="20" class="me-2 text-info"/>
                <h5 class="mb-0">Последний</h5>
              </div>
              <div class="stats-time">{{ stats.lastImportDate }}</div>
              <div class="stats-label">Последний импорт</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Таблица с историей импорта -->
      <div class="history-section mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0">История импорта</h4>
          <div class="input-group input-group-sm" style="width: 250px;">
            <span class="input-group-text">
              <Search :size="16"/>
            </span>
            <input type="text" class="form-control" v-model="searchQuery" placeholder="Поиск...">
          </div>
        </div>

        <div v-if="isLoading" class="text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
          <p class="mt-2 text-muted">Загрузка истории импорта...</p>
        </div>

        <div v-else-if="importHistory.length === 0" class="text-center my-5">
          <FileQuestion :size="48" class="text-muted mb-3" />
          <p class="text-muted">История импорта пуста</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Дата и время</th>
                <th>Тип данных</th>
                <th>Файл</th>
                <th>Записей</th>
                <th>Результат</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in filteredHistory" :key="index">
                <td>{{ formatDate(item.timestamp) }}</td>
                <td>{{ translateDataType(item.dataType) }}</td>
                <td class="text-truncate" style="max-width: 200px">{{ item.fileName }}</td>
                <td>{{ item.recordsCount }}</td>
                <td>
                  <span
                    class="badge"
                    :class="item.status === 'success' ? 'text-bg-success' :
                           item.status === 'warning' ? 'text-bg-warning' :
                           'text-bg-danger'"
                  >
                    {{ translateStatus(item.status) }}
                  </span>
                </td>
                <td>
                  <div class="d-flex">
                    <button
                      class="btn btn-sm btn-outline-secondary me-2"
                      @click="showDetails(item)"
                      :title="'Подробности импорта ' + item.fileName"
                    >
                      <Eye :size="16" />
                    </button>
                    <button
                      v-if="item.canRepeat"
                      class="btn btn-sm btn-outline-primary"
                      @click="repeatImport(item)"
                      :title="'Повторить импорт ' + item.fileName"
                    >
                      <Repeat :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Пагинация -->
        <div v-if="importHistory.length > pageSize" class="d-flex justify-content-center mt-4">
          <nav>
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                  <ChevronLeft :size="16" />
                </button>
              </li>
              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                  <ChevronRight :size="16" />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Детали импорта (модальное окно) -->
      <div v-if="selectedImport" class="detail-modal">
        <div class="modal fade" id="importDetailsModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Детали импорта</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
              </div>
              <div class="modal-body">
                <dl class="row">
                  <dt class="col-sm-4">Тип данных:</dt>
                  <dd class="col-sm-8">{{ translateDataType(selectedImport.dataType) }}</dd>

                  <dt class="col-sm-4">Файл:</dt>
                  <dd class="col-sm-8">{{ selectedImport.fileName }}</dd>

                  <dt class="col-sm-4">Дата и время:</dt>
                  <dd class="col-sm-8">{{ formatDate(selectedImport.timestamp, true) }}</dd>

                  <dt class="col-sm-4">Статус:</dt>
                  <dd class="col-sm-8">
                    <span
                      class="badge"
                      :class="selectedImport.status === 'success' ? 'text-bg-success' :
                            selectedImport.status === 'warning' ? 'text-bg-warning' :
                            'text-bg-danger'">
                      {{ translateStatus(selectedImport.status) }}
                    </span>
                  </dd>
                </dl>

                <h6>Статистика:</h6>
                <ul class="list-group mb-3">
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Всего записей
                    <span class="badge text-bg-primary rounded-pill">{{ selectedImport.recordsCount }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Добавлено
                    <span class="badge text-bg-success rounded-pill">{{ selectedImport.stats?.added || 0 }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Обновлено
                    <span class="badge text-bg-info rounded-pill">{{ selectedImport.stats?.updated || 0 }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Пропущено
                    <span class="badge text-bg-warning rounded-pill">{{ selectedImport.stats?.skipped || 0 }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Ошибок
                    <span class="badge text-bg-danger rounded-pill">{{ selectedImport.stats?.errors || 0 }}</span>
                  </li>
                </ul>

                <div v-if="selectedImport.errorDetails && selectedImport.errorDetails.length > 0">
                  <h6>Детали ошибок:</h6>
                  <div class="alert alert-danger">
                    <ul class="mb-0">
                      <li v-for="(error, index) in selectedImport.errorDetails" :key="index">
                        {{ error }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                <button
                  v-if="selectedImport.canRepeat"
                  type="button"
                  class="btn btn-primary"
                  @click="repeatImport(selectedImport)"
                >
                  <Repeat :size="16" class="me-2"/>
                  Повторить импорт
                </button>
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
import { ref, computed, onMounted, watch } from 'vue'
import { Database, FileText, CheckCircle2, AlertCircle, Clock, Search, Eye, Repeat,
        FileQuestion, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-vue-next'
// import { apiClient } from '@/js/api/manager'
// import { endpoints } from '@/js/api/endpoints'
import ToastNotification from './ToastNotification.vue'

// Состояние
const isLoading = ref(false)
const importHistory = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedImport = ref(null)
const toastRef = ref(null)
const stats = ref({
  filesCount: 0,
  totalRecords: 0,
  errorsCount: 0,
  lastImportDate: 'Не выполнялся'
})

// Модальное окно
let importDetailsModal = null

// Фильтрация истории
const filteredHistory = computed(() => {
  let filtered = [...importHistory.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.fileName.toLowerCase().includes(query) ||
      translateDataType(item.dataType).toLowerCase().includes(query) ||
      translateStatus(item.status).toLowerCase().includes(query)
    )
  }

  // Сортировка по дате (сначала новые)
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  // Пагинация
  const startIndex = (currentPage.value - 1) * pageSize
  return filtered.slice(startIndex, startIndex + pageSize)
})

// Общее количество страниц
const totalPages = computed(() => {
  const filtered = searchQuery.value.trim()
    ? importHistory.value.filter(item =>
        item.fileName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        translateDataType(item.dataType).toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        translateStatus(item.status).toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    : importHistory.value

  return Math.max(1, Math.ceil(filtered.length / pageSize))
})

// Сбросить страницу при изменении поискового запроса
watch(searchQuery, () => {
  currentPage.value = 1
})

// Инициализация
onMounted(() => {
  // Инициализация модального окна
  if (typeof window !== 'undefined' && window.bootstrap) {
    importDetailsModal = new window.bootstrap.Modal(document.getElementById('importDetailsModal'))
  }

  // Загрузка данных
  loadImportHistory()
})

// Загрузка истории импорта
const loadImportHistory = async () => {
  isLoading.value = true

  try {
    // В реальном коде тут был бы запрос к API
    // const response = await apiClient.get(endpoints.learning_analytics.importHistory)
    // importHistory.value = response.data.history

    // Имитация загрузки данных
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Демонстрационные данные
    importHistory.value = [
      {
        id: 1,
        timestamp: '2023-09-10T14:30:00',
        dataType: 'curriculum',
        fileName: 'curriculum_sample_2023.xlsx',
        recordsCount: 56,
        status: 'success',
        canRepeat: true,
        stats: {
          added: 48,
          updated: 8,
          skipped: 0,
          errors: 0
        }
      },
      {
        id: 2,
        timestamp: '2023-09-05T10:15:00',
        dataType: 'competencies',
        fileName: 'competencies_2023.csv',
        recordsCount: 120,
        status: 'warning',
        canRepeat: true,
        stats: {
          added: 105,
          updated: 0,
          skipped: 15,
          errors: 0
        },
        errorDetails: []
      },
      {
        id: 3,
        timestamp: '2023-08-28T09:45:00',
        dataType: 'disciplines',
        fileName: 'disciplines_courses.csv',
        recordsCount: 75,
        status: 'error',
        canRepeat: true,
        stats: {
          added: 65,
          updated: 0,
          skipped: 0,
          errors: 10
        },
        errorDetails: [
          'Строка 12: Отсутствует обязательное поле "Код дисциплины"',
          'Строка 24: Некорректный формат часов "abc"',
          'Строка 43-53: Дублирующиеся значения в поле "Код дисциплины"'
        ]
      },
      {
        id: 4,
        timestamp: '2023-08-15T16:20:00',
        dataType: 'vacancies',
        fileName: 'vacancies_it_august.csv',
        recordsCount: 250,
        status: 'success',
        canRepeat: true,
        stats: {
          added: 250,
          updated: 0,
          skipped: 0,
          errors: 0
        }
      },
      {
        id: 5,
        timestamp: '2023-07-30T11:10:00',
        dataType: 'custom',
        fileName: 'custom_data_format.json',
        recordsCount: 30,
        status: 'success',
        canRepeat: true,
        stats: {
          added: 27,
          updated: 3,
          skipped: 0,
          errors: 0
        }
      }
    ]

    // Обновляем статистику
    updateStats()

  } catch (error) {
    console.error('Ошибка при загрузке истории импорта:', error)
    toastRef.value?.show('Ошибка при загрузке истории импорта', 'error')
  } finally {
    isLoading.value = false
  }
}

// Обновление статистики
const updateStats = () => {
  const history = importHistory.value

  if (history.length > 0) {
    // Общее количество файлов
    stats.value.filesCount = history.length

    // Общее количество записей
    stats.value.totalRecords = history.reduce((sum, item) => sum + item.recordsCount, 0)

    // Количество ошибок
    stats.value.errorsCount = history.reduce((sum, item) => {
      return sum + (item.stats?.errors || 0)
    }, 0)

    // Дата последнего импорта
    const lastImport = [...history].sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    )[0]

    stats.value.lastImportDate = formatDate(lastImport.timestamp)
  }
}

// Перевод типа данных
const translateDataType = (type) => {
  const types = {
    'curriculum': 'Учебный план',
    'competencies': 'Компетенции',
    'disciplines': 'Дисциплины',
    'vacancies': 'Вакансии',
    'custom': 'Пользовательский формат'
  }

  return types[type] || type
}

// Перевод статуса
const translateStatus = (status) => {
  const statuses = {
    'success': 'Успешно',
    'warning': 'С предупреждениями',
    'error': 'С ошибками'
  }

  return statuses[status] || status
}

// Форматирование даты
const formatDate = (dateString, detailed = false) => {
  if (!dateString) return ''

  const date = new Date(dateString)

  if (detailed) {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Обновление данных
const refresh = () => {
  loadImportHistory()
  toastRef.value?.show('Данные обновлены', 'success')
}

// Показать детали импорта
const showDetails = (importItem) => {
  selectedImport.value = importItem

  // Открываем модальное окно
  if (importDetailsModal) {
    importDetailsModal.show()
  }
}

// Повторить импорт
const repeatImport = (importItem) => {
  toastRef.value?.show(`Повторный импорт ${importItem.fileName}. Функция в разработке.`, 'info')

  // Здесь должен быть код для повторного импорта
  // Например:
  // apiClient.post(endpoints.learning_analytics.reimport, { id: importItem.id })
}
</script>

<style scoped>
.import-results-card {
  background: rgba(--bs-body-bg, 0.8);
  border: 1px solid var(--bs-border-color);
  box-shadow: 0 4px 24px 0 rgba(60, 72, 88, 0.08), 0 1.5px 4px 0 rgba(60, 72, 88, 0.04);
  transition: box-shadow 0.2s;
}

.import-results-card:hover {
  box-shadow: 0 8px 32px 0 rgba(60, 72, 88, 0.16), 0 3px 8px 0 rgba(60, 72, 88, 0.08);
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
}

h5 {
  font-size: 1rem;
  font-weight: 600;
}

.stats-card {
  border-radius: 0.5rem;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.stats-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.stats-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0.5rem 0;
}

.stats-time {
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.2;
  margin: 0.5rem 0;
}

.stats-label {
  font-size: 0.9rem;
  color: var(--bs-secondary-color);
}

.table th {
  font-weight: 600;
  background-color: var(--bs-tertiary-bg);
}

.table-responsive {
  border-radius: 0.375rem;
  border: 1px solid var(--bs-border-color);
  overflow: hidden;
}

.pagination .page-link {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.2rem;
  min-width: 2.2rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
