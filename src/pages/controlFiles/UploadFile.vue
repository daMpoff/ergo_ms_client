<script setup>
import {ref, onMounted} from 'vue'
import { endpoints } from '@/js/api/endpoints'
import { apiClient } from '@/js/api/manager'

const file = ref(null)
const uploading = ref(false)
const uploadSuccess = ref(false)
const error = ref(null)

const handleFileUpload = async () => {
  if (!file.value) return

  const formData = new FormData()
  formData.append('files[]', file.value)

  uploading.value = true
  uploadSuccess.value = false
  error.value = null

  try {
    await apiClient.post(endpoints.file, formData)
    uploadSuccess.value = true
  } catch (e) {
    error.value = 'Ошибка при загрузке файла'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="card p-4">
    <h5 class="mb-3">Загрузка файла</h5>

    <input class="form-control mb-3" type="file" @change="e => file.value = e.target.files[0]" />
    
    <button class="btn btn-primary" :disabled="uploading" @click="handleFileUpload">
      {{ uploading ? 'Загрузка...' : 'Загрузить' }}
    </button>

    <div v-if="uploadSuccess" class="alert alert-success mt-3">Файл успешно загружен!</div>
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>

<style scoped>
.card {
  max-width: 500px;
  margin: auto;
}
</style>
