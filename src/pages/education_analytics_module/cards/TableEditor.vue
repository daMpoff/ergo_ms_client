<template>
  <!-- Основной контейнер редактора таблицы -->
  <div v-if="selectedTable" class="table-editor card rounded-3 p-4 mb-4">
    <!-- Заголовок и кнопки управления -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0 text-primary">
        <Database :size="20" class="me-2"/>{{ selectedTable }}
      </h3>
      <div class="btn-group">
        <button 
          @click="addRow"
          class="btn btn-primary"
          :disabled="isLoading"
          title="Добавить новую запись">
          <Plus :size="20" class="me-2"/>
          Добавить запись
        </button>
        <button 
          @click="saveChanges"
          :class="[
            'btn ms-2 d-flex align-items-center',
            hasChanges ? 'btn-success pulse-animation' : 'btn-outline-secondary'
          ]"
          :disabled="!hasChanges || isLoading"
          title="Сохранить все внесенные изменения">
          <Save :size="20" class="me-2"/>
          <span>{{ hasChanges ? 'Сохранить изменения*' : 'Изменений нет' }}</span>
        </button>
      </div>
    </div>

    <!-- Контейнер таблицы с поддержкой прокрутки -->
    <div class="table-responsive">
      <!-- Индикатор загрузки -->
      <div v-if="isLoading" class="text-center p-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p class="text-muted mt-2">Пожалуйста, подождите...</p>
      </div>
      
      <!-- Таблица данных -->
      <table class="table table-hover table-striped" v-else-if="columns.length">
        <!-- Заголовки колонок с фиксированной позицией -->
        <thead class="table-light sticky-top">
          <tr>
            <!-- Динамическое создание заголовков на основе колонок -->
            <th v-for="col in columns" 
                :key="col.name" 
                :class="{ 
                  'required': isRequired(col), 
                  'id-column': col.name.toLowerCase() === 'id' 
                }"
                :title="col.type"><!-- Подсказка с типом данных -->
              {{ col.name }}
            </th>
            <th class="actions-column">Действия</th>
          </tr>
        </thead>

        <!-- Тело таблицы с данными -->
        <tbody>
          <tr v-for="(row, index) in paginatedRows" :key="index">
            <!-- Ячейки с данными или полями ввода в режиме редактирования -->
            <td v-for="col in columns" 
                :key="col.name" 
                :class="{ 'text-muted': col.name.toLowerCase() === 'id' }">
              <!-- Поле ввода в режиме редактирования (кроме ID) -->
              <input v-if="editingRow === index && col.name.toLowerCase() !== 'id'"
                     v-model="row[col.name]"
                     :type="getInputType(col.type)"
                     :class="{'form-control form-control-sm': true, 
                             'is-invalid': getValidationError(row, col)}"
                     @input="validateField(row, col)"/>
              <!-- Сообщение об ошибке валидации -->
              <div v-if="editingRow === index" class="invalid-feedback">
                {{ getValidationError(row, col) }}
              </div>
              <!-- Отображение значения в режиме просмотра -->
              <span v-else>{{ formatValue(row[col.name], col.type) }}</span>
            </td>

            <!-- Кнопки управления записью -->
            <td>
              <div class="btn-group">
                <button 
                  v-if="editingRow !== index"
                  @click="startEditing(index)"
                  class="btn btn-sm btn-outline-primary"
                  title="Редактировать запись">
                  <Edit :size="16"/>
                </button>
                <button 
                  v-else
                  @click="confirmStopEditing()"
                  class="btn btn-sm btn-outline-warning"
                  title="Отменить редактирование">
                  <X :size="16"/>
                </button>
                <button 
                  @click="confirmDeleteRow(index)"
                  class="btn btn-sm btn-outline-danger ms-2"
                  title="Удалить запись">
                  <Trash :size="16"/>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="d-flex justify-content-center mt-3">
        <nav aria-label="Навигация по страницам">
          <ul class="pagination">
            <li :class="['page-item', { disabled: currentPage === 1 }]">
              <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                Назад
              </button>
            </li>
            <li v-for="page in totalPages" :key="page" :class="['page-item', { active: page === currentPage }]">
              <button class="page-link" @click="currentPage = page">{{ page }}</button>
            </li>
            <li :class="['page-item', { disabled: currentPage === totalPages }]">
              <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                Вперед
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
// Импорты
import { ref, computed, watch } from 'vue'
import { Database, Plus, Save, Edit, Trash, X } from 'lucide-vue-next'
import axios from 'axios'

// Константы и конфигурация
const TABLE_IGNORED_COLUMNS = ['id', 'ID', 'created_at', 'updated_at'] // Системные поля
const API_BASE_URL = 'http://localhost:8000/api/learning_analytics'

// Props & Emits
const props = defineProps({
  selectedTable: String
})

const emit = defineEmits(['update:table', 'error', 'success'])

// Состояние компонента
const rows = ref([])          // Текущие данные таблицы
const columns = ref([])       // Структура колонок
const originalRows = ref([])  // Исходные данные для отслеживания изменений
const editingRow = ref(null)  // Индекс редактируемой строки
const isLoading = ref(false)  // Состояние загрузки

// Вычисляемые свойства
const hasChanges = computed(() => {
  return JSON.stringify(rows.value) !== JSON.stringify(originalRows.value)
})

// Helper functions
const getInputType = (columnType) => {
  switch (columnType?.toLowerCase()) {
    case 'integer':
    case 'bigint':
    case 'numeric': return 'number'
    case 'boolean': return 'checkbox'
    case 'date':
    case 'datetime': return 'datetime-local'
    default: return 'text'
  }
}

const filterSystemColumns = (cols) => {
  return cols
}

const preparePayload = (data) => {
  const payload = { ...data }
  TABLE_IGNORED_COLUMNS.forEach(col => delete payload[col])
  return payload
}

// Обработка данных таблицы
const loadTableData = async () => {
  if (!props.selectedTable) return
  
  try {
    isLoading.value = true
    const response = await axios.get(`${API_BASE_URL}/tables/?table=${props.selectedTable}`)
    
    if (response.data) {
      columns.value = filterSystemColumns(response.data.columns || [])
      rows.value = response.data.rows || []
      originalRows.value = JSON.parse(JSON.stringify(rows.value))
    }
  } catch (error) {
    console.error('Error loading table data:', error)
    emit('error', 'Ошибка при загрузке данных таблицы')
  } finally {
    isLoading.value = false
  }
}

// Управление изменениями
const saveChanges = async () => {
  try {
    isLoading.value = true
    const changes = rows.value.filter((row, i) => 
      JSON.stringify(row) !== JSON.stringify(originalRows.value[i])
    )
    
    for (const row of changes) {
      const payload = preparePayload(row)
      
      if (row.id) {
        await axios.put(`${API_BASE_URL}/${props.selectedTable}_put/?id=${row.id}`, payload)
      } else {
        await axios.post(`${API_BASE_URL}/${props.selectedTable}_send/`, payload)
      }
    }
    
    await loadTableData()
    emit('success', 'Изменения успешно сохранены')
  } catch (error) {
    console.error('Error saving changes:', error)
    emit('error', 'Ошибка при сохранении изменений')
  } finally {
    isLoading.value = false
    editingRow.value = null
  }
}

// Управление записями
const deleteRow = async (index) => {
  if (!confirm('Удалить эту запись?')) return
  
  const row = rows.value[index]
  if (row.id) {
    try {
      await axios.delete(`${API_BASE_URL}/${props.selectedTable}_delete/?id=${row.id}`)
      rows.value.splice(index, 1)
      originalRows.value = JSON.parse(JSON.stringify(rows.value))
      emit('success', 'Запись успешно удалена')
    } catch (error) {
      console.error('Error deleting row:', error)
      emit('error', 'Ошибка при удалении записи')
    }
  } else {
    rows.value.splice(index, 1)
  }
}

const addRow = () => {
  const newRow = {}
  columns.value.forEach(col => newRow[col.name] = null)
  rows.value.push(newRow)
  startEditing(rows.value.length - 1)
}

// Управление состоянием редактирования
const startEditing = (index) => {
  editingRow.value = index
}

const stopEditing = () => {
  editingRow.value = null
}

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = computed(() => Math.ceil(rows.value.length / itemsPerPage))
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return rows.value.slice(start, end)
})

// Validation
const validationErrors = ref({})
const requiredColumns = ['name', 'email'] // Customize based on your needs

const isRequired = (column) => {
  return requiredColumns.includes(column.name)
}

const validateField = (row, column) => {
  const rowId = row.id || 'new'
  if (!validationErrors.value[rowId]) {
    validationErrors.value[rowId] = {}
  }

  if (isRequired(column) && !row[column.name]) {
    validationErrors.value[rowId][column.name] = 'This field is required'
    return false
  }

  // Add type-specific validation
  if (column.type === 'email' && row[column.name]) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(row[column.name])) {
      validationErrors.value[rowId][column.name] = 'Invalid email format'
      return false
    }
  }

  delete validationErrors.value[rowId][column.name]
  return true
}

const getValidationError = (row, column) => {
  const rowId = row.id || 'new'
  return validationErrors.value[rowId]?.[column.name]
}

const formatValue = (value, type) => {
  if (value === null || value === undefined) return ''
  if (type === 'datetime') return new Date(value).toLocaleString()
  if (type === 'boolean') return value ? 'Да' : 'Нет'
  return value
}

const confirmStopEditing = () => {
  if (hasChanges.value) {
    if (confirm('Есть несохраненные изменения. Отменить редактирование?')) {
      stopEditing()
    }
  } else {
    stopEditing()
  }
}

const confirmDeleteRow = (index) => {
  if (confirm('Удалить эту запись? Это действие нельзя отменить.')) {
    deleteRow(index)
  }
}

// Отслеживание изменений выбранной таблицы
watch(
  () => props.selectedTable,
  (newTable) => {
    // Сброс состояния при смене таблицы
    rows.value = []
    columns.value = []
    originalRows.value = []
    editingRow.value = null
    if (newTable) loadTableData()
  },
  { immediate: true }
)
</script>

<style scoped>
/* Основные стили контейнера */
.table-editor {
  max-height: 80vh;
  overflow-y: auto;
}

/* Настройки таблицы */
.table {
  --bs-table-bg: transparent;
  --bs-table-color: var(--bs-emphasis-color);
  --bs-table-border-color: var(--bs-border-color-translucent);
}

/* Стили заголовков */
thead {
  background: var(--bs-tertiary-bg);
}

thead th {
  padding: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--bs-emphasis-color);
  border-bottom: 2px solid var(--bs-border-color);
  background: var(--bs-tertiary-bg);
  transition: background-color 0.15s ease;
  white-space: nowrap;
}

thead th:hover {
  background: var(--bs-secondary-bg);
}

/* Стили ячеек и колонок */
.id-column, .actions-column {
  position: sticky;
  background: var(--bs-secondary-bg);
  backdrop-filter: blur(8px);
  border-color: var(--bs-border-color-translucent);
}

.id-column {
  width: 80px;
  left: 0;
  z-index: 2;
}

.actions-column {
  width: 120px;
  right: 0;
  z-index: 2;
}

tbody td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
  border-color: var(--bs-border-color-translucent);
}

.table-striped > tbody > tr:nth-child(odd) {
  background-color: rgba(var(--bs-emphasis-color-rgb), 0.01);
}

.table-hover > tbody > tr:hover {
  background-color: rgba(var(--bs-emphasis-color-rgb), 0.03);
}

/* Стили форм и кнопок */
.form-control {
  min-width: 120px;
  border: 1px solid var(--bs-border-color-translucent);
  background-color: var(--bs-secondary-bg);
  color: var(--bs-emphasis-color);
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: var(--bs-primary);
  background-color: var(--bs-tertiary-bg);
  box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.1);
}

.btn-group .btn {
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  transition: all 0.15s ease;
}

.btn-group .btn:hover {
  transform: translateY(-1px);
}

.btn-outline-primary {
  --bs-btn-color: var(--bs-primary);
  --bs-btn-border-color: var(--bs-border-color-translucent);
  --bs-btn-hover-bg: rgba(var(--bs-primary-rgb), 0.1);
  --bs-btn-hover-border-color: var(--bs-primary);
}

.btn-outline-warning {
  --bs-btn-color: var(--bs-warning);
  --bs-btn-border-color: var(--bs-border-color-translucent);
  --bs-btn-hover-bg: rgba(var(--bs-warning-rgb), 0.1);
  --bs-btn-hover-border-color: var(--bs-warning);
}

.btn-outline-danger {
  --bs-btn-color: var(--bs-danger);
  --bs-btn-border-color: var(--bs-border-color-translucent);
  --bs-btn-hover-bg: rgba(var(--bs-danger-rgb), 0.1);
  --bs-btn-hover-border-color: var(--bs-danger);
}

.btn-success.pulse-animation {
  animation: gentle-pulse 1s infinite;
}

/* Анимации */
@keyframes gentle-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--bs-success-rgb), 0.3);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(var(--bs-success-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--bs-success-rgb), 0);
  }
}

.required::after {
  content: "*";
  color: var(--bs-danger);
  margin-left: 4px;
  opacity: 0.8;
}

.pagination {
  --bs-pagination-bg: var(--bs-secondary-bg);
  --bs-pagination-border-color: var(--bs-border-color-translucent);
  --bs-pagination-hover-bg: var(--bs-tertiary-bg);
  --bs-pagination-focus-bg: var(--bs-tertiary-bg);
  --bs-pagination-active-bg: var(--bs-primary);
  --bs-pagination-active-border-color: var(--bs-primary);
}
</style>