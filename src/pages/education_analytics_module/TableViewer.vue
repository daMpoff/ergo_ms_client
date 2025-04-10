<template>
  <div class="table-viewer p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="d-flex align-items-center">
        <router-link to="/admin" class="btn btn-outline-primary me-3">
          <i class="bi bi-arrow-left"></i>
        </router-link>
        Таблица: {{ tableName }}
      </h2>
    </div>

    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <template v-else>
      <DatabaseTable
        :cols="columns"
        :data="tableData"
        :tableName="tableName"
        @recordUpdated="handleRecordUpdate"
        @recordDeleted="handleRecordDelete"
        @recordCreated="handleRecordCreate"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import DatabaseTable from '../datatables/DatabaseTable.vue'

const route = useRoute()
const tableName = ref(route.params.tableName)
const isLoading = ref(true)
const error = ref(null)
const columns = ref([])
const tableData = ref([])

const loadTableData = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await axios.get(`http://localhost:8000/api/learning_analytics/tables/?table=${tableName.value}`)
    
    if (response.data) {
      columns.value = response.data.columns?.map(col => ({
        field: col.name,
        title: col.name,
        type: col.type.includes('int') ? 'number' : 'text',
        required: !col.nullable
      })) || []
      
      tableData.value = response.data.rows || []
    }
  } catch (err) {
    console.error('Error loading table data:', err)
    error.value = 'Ошибка при загрузке данных таблицы'
  } finally {
    isLoading.value = false
  }
}

const handleRecordUpdate = async (record) => {
  try {
    await axios.put(`http://localhost:8000/api/learning_analytics/${tableName.value}_put/`, record.data)
    await loadTableData()
  } catch (err) {
    console.error('Error updating record:', err)
    error.value = 'Ошибка при обновлении записи'
  }
}

const handleRecordDelete = async (record) => {
  try {
    await axios.delete(`http://localhost:8000/api/learning_analytics/${tableName.value}_delete/?id=${record.id}`)
    await loadTableData()
  } catch (err) {
    console.error('Error deleting record:', err)
    error.value = 'Ошибка при удалении записи'
  }
}

const handleRecordCreate = async (record) => {
  try {
    await axios.post(`http://localhost:8000/api/learning_analytics/${tableName.value}_send/`, record.data)
    await loadTableData()
  } catch (err) {
    console.error('Error creating record:', err)
    error.value = 'Ошибка при создании записи'
  }
}

onMounted(() => {
  loadTableData()
})
</script>

<style scoped>
.table-viewer {
  min-height: 400px;
}
</style>
