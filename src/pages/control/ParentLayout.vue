<script setup>
import { ref, onMounted } from 'vue'
import { FileText, Trash2 } from 'lucide-vue-next'
import { endpoints } from '@/js/api/endpoints'
import { apiClient } from '@/js/api/manager'

const uploadedFiles = ref([])

const fetchFiles = async () => {
  try {
    const { data } = await apiClient.get(endpoints.file)
    uploadedFiles.value = data.map((f) => ({
      ...f,
      active: true, 
    }))
  } catch (error) {
    console.error('Ошибка загрузки файлов', error)
  }
}

const toggleFile = (index) => {
  uploadedFiles.value[index].active = !uploadedFiles.value[index].active
}

const deleteFile = async (id) => {
  try {
    await axios.delete(`/api/file/${id}/`)
    uploadedFiles.value = uploadedFiles.value.filter((f) => f.id !== id)
  } catch (err) {
    console.error('Ошибка удаления файла', err)
  }
}

onMounted(fetchFiles)
</script>

<template>
  <div class="card">
    <h5 class="card-title mb-3">Загруженные файлы</h5>
    <div class="row row-gap-2">
      <div v-for="(file, index) in uploadedFiles" :key="file.id" class="col-12 col-md-6">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2 w-75">
            <div class="bg-light p-2 rounded d-flex align-items-center">
              <FileText size="22" />
            </div>
            <div class="text-truncate">
              <h6 class="mb-0">
                <a :href="file.file" target="_blank" :title="file.file.split('/').pop()">
                  {{ file.file.split('/').pop() }}
                </a>
              </h6>
              <small>{{ new Date(file.uploaded_at).toLocaleString() }}</small>
            </div>
          </div>
          <div class="d-flex gap-2 align-items-center">
            <div class="form-check form-switch mb-0">
              <input
                type="checkbox"
                class="form-check-input"
                :checked="file.active"
                @change="toggleFile(index)"
              />
            </div>
            <button class="btn btn-sm btn-danger" @click="deleteFile(file.id)">
              <Trash2 size="18" />
            </button>
          </div>
        </div>
      </div>
      <div v-if="!uploadedFiles.length" class="text-muted mt-3 px-3">Нет загруженных файлов</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card a {
  text-decoration: none;
  color: inherit;
}
</style>
