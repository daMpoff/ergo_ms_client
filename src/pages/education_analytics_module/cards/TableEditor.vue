<template>
  <div v-if="selectedTable" class="table-editor card rounded-3 p-4 mb-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0 text-primary">
        <Database :size="20" class="me-2"/>{{ selectedTable }}
      </h3>
      <div class="btn-group">
        <button 
          @click="addRow"
          class="btn btn-primary"
          :disabled="isLoading">
          <Plus :size="20" class="me-2"/>
          Добавить запись
        </button>
        <button 
          @click="saveChanges"
          class="btn btn-success ms-2"
          :disabled="!hasChanges || isLoading">
          <Save :size="20" class="me-2"/>
          Сохранить изменения
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover" v-if="columns.length">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.name">{{ col.name }}</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="index">
            <td v-for="col in columns" :key="col.name">
              <input
                v-if="editingRow === index"
                v-model="row[col.name]"
                :type="getInputType(col.type)"
                class="form-control form-control-sm"
              />
              <span v-else>{{ row[col.name] }}</span>
            </td>
            <td>
              <div class="btn-group">
                <button 
                  v-if="editingRow !== index"
                  @click="startEditing(index)"
                  class="btn btn-sm btn-outline-primary">
                  <Edit :size="16"/>
                </button>
                <button 
                  v-else
                  @click="stopEditing()"
                  class="btn btn-sm btn-outline-secondary">
                  <X :size="16"/>
                </button>
                <button 
                  @click="deleteRow(index)"
                  class="btn btn-sm btn-outline-danger ms-2">
                  <Trash :size="16"/>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Database, Plus, Save, Edit, Trash, X } from 'lucide-vue-next'
import axios from 'axios'

// Constants
const TABLE_IGNORED_COLUMNS = ['id', 'ID', 'created_at', 'updated_at']
const API_BASE_URL = 'http://localhost:8000/api/learning_analytics'

// Props & Emits
const props = defineProps({
  selectedTable: String
})

const emit = defineEmits(['update:table', 'error', 'success'])

// Reactive state
const rows = ref([])
const columns = ref([])
const originalRows = ref([])
const editingRow = ref(null)
const isLoading = ref(false)

// Computed
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
  return cols.filter(col => !TABLE_IGNORED_COLUMNS.includes(col.name))
}

const preparePayload = (data) => {
  const payload = { ...data }
  TABLE_IGNORED_COLUMNS.forEach(col => delete payload[col])
  return payload
}

// API calls
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

// Row management
const addRow = () => {
  const newRow = {}
  columns.value.forEach(col => newRow[col.name] = null)
  rows.value.push(newRow)
  startEditing(rows.value.length - 1)
}

const startEditing = (index) => {
  editingRow.value = index
}

const stopEditing = () => {
  editingRow.value = null
}

// Watch
watch(
  () => props.selectedTable,
  (newTable) => {
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
.table-editor {
  max-height: 600px;
  overflow-y: auto;
}

.form-control {
  min-width: 100px;
}
</style>
