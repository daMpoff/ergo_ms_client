<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const files = ref([])
const uploading = ref(false)
const uploadError = ref(null)
const fileInput = ref(null)

const fetchFiles = async () => {
  try {
    const { data } = await apiClient.get(endpoints.file)
    files.value = data
  } catch (error) {
    console.error('Ошибка загрузки списка файлов', error)
  }
}

const handleFileUpload = async (event) => {
  const selected = event.target.files?.[0] || event.dataTransfer?.files?.[0]
  if (!selected) return

  const formData = new FormData()
  formData.append('file', selected)

  uploading.value = true
  uploadError.value = null

  try {
    await apiClient.post(endpoints.file, formData, false)
    await fetchFiles()
  } catch (error) {
    uploadError.value = 'Ошибка загрузки файла'
    console.error(error)
  } finally {
    uploading.value = false
  }
}

const handleFileDelete = async (id) => {
  try {
    await apiClient.delete(`${endpoints.file}${id}/`, {}, true)
    await fetchFiles()
  } catch (error) {
    console.error('Ошибка удаления файла', error)
  }
}

onMounted(fetchFiles)
</script>

<template>
  <div class="card p-3">
    <h5 class="card-title mb-3">Файловый менеджер</h5>

    <!-- Загрузка файлов -->
    <div
      class="border p-4 mb-4 text-center bg-light rounded"
      @drop.prevent="handleFileUpload"
      @dragover.prevent
    >
      <p class="mb-2">Перетащите файл сюда или</p>
      <button class="btn btn-primary" @click="fileInput.click()">Выбрать файл</button>
      <input
        ref="fileInput"
        type="file"
        class="d-none"
        @change="handleFileUpload"
      />
    </div>

    <!-- Статус загрузки -->
    <div v-if="uploading" class="alert alert-info">Загрузка...</div>
    <div v-if="uploadError" class="alert alert-danger">{{ uploadError }}</div>

    <!-- Список файлов -->
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr class="table-striped-columns">
            <th>Имя файла</th>
            <th>Размер</th>
            <th>Дата загрузки</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="file in files" :key="file.id">
            <td>{{ file.name }}</td>
            <td>{{ (file.size / 1024).toFixed(2) }} KB</td>
            <td>{{ new Date(file.uploaded_at).toLocaleString() }}</td>
            <td>
              <button class="btn btn-sm btn-danger" @click="handleFileDelete(file.id)">
                Удалить
              </button>
            </td>
          </tr>
          <tr v-if="files.length === 0">
            <td colspan="4" class="text-center">Нет загруженных файлов</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}
</style>
