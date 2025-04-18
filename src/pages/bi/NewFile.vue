<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="name">
        <div class="name_container">
          <button @click="goToNewConnection" class="icon-button" title="Новое подключение">
            <ArrowLeft class="icon" />
          </button>
          <img src="/src/assets/bi/icons/folder_windows_style.svg" class="icon_name" />
          <div class="title">Файлы</div>
        </div>
      </div>

      <div class="file-upload-button">
        <div class="upload-button">
          <button class="btn btn-outline-danger" @click="triggerFileUpload">
            <Upload class="icon_upload" />
            Загрузить файл
          </button>
          <input
            type="file"
            ref="fileInput"
            accept=".csv,.xlsx,.txt"
            multiple
            @change="handleFileUpload"
            style="display: none"
          />
        </div>
      </div>

      <div class="file-list">
        <FileItem
          v-for="file in selectedFiles"
          :key="file.id"
          :file="file"
          @replace="handleFileReplace"
          @rename="renameFile"
          @delete="deleteFile"
        />
      </div>
    </aside>

    <header class="file_area_header"></header>
    <main class="file_area"></main>
  </div>
</template>
  
<script setup>
import { onMounted, ref } from 'vue'
import FileItem from './components/FileItem.vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Upload } from 'lucide-vue-next'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const router = useRouter()
const fileInput = ref(null)
const selectedFiles = ref([])

const MAX_FILES = 10
const MAX_SIZE_MB = 200

function goToNewConnection() {
  router.push('/bi/connections/new/')
}

function triggerFileUpload() {
  fileInput.value?.click()
}

// Замена файла

const replaceInput = ref(null)
const fileToReplace = ref(null)

function replaceFile(file) {
  fileToReplace.value = file
  replaceInput.value?.click()
}

function renameFile(file) {
  console.log('Переименовать:', file)
  // Открыть модалку или prompt
}

function deleteFile(file) {
  if (confirm(`Удалить файл "${file.name}"?`)) {
    // Вызвать API и обновить список
    console.log('Удалено:', file)
  }
}

async function handleFileUpload(event) {
  const files = Array.from(event.target.files)

  if (files.length > MAX_FILES) {
    alert(`Можно выбрать не более ${MAX_FILES} файлов.`)
    event.target.value = ''
    return
  }

  const oversized = files.filter(file => file.size > MAX_SIZE_MB * 1024 * 1024)
  if (oversized.length > 0) {
    alert(`Файлы превышают ${MAX_SIZE_MB} МБ:\n${oversized.map(f => f.name).join(', ')}`)
    event.target.value = ''
    return
  }

  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', file.name)

    const res = await apiClient.upload(endpoints.bi.Upload, formData)
    if (!res.success) {
      console.error(`Ошибка загрузки файла ${file.name}:`, res.errors)
      alert(`Ошибка загрузки файла ${file.name}`)
    }
  }

  event.target.value = ''
  await loadUserFiles() // перезагружаем список из базы
}

async function handleFileReplace(event) {
  const file = event.target.files[0]
  if (!file || !fileToReplace.value) return

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    alert(`Файл превышает ${MAX_SIZE_MB} МБ`)
    return
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', file.name)

  const res = await apiClient.put(
    `bi_analysis/bi_datasets/upload/${fileToReplace.value.id}/`,
    formData
  )

  if (res.success) {
    console.log('Файл заменён:', res.data)
    await loadUserFiles()
  } else {
    console.error('Ошибка замены файла:', res.errors)
    alert('Не удалось заменить файл')
  }

  event.target.value = ''
  fileToReplace.value = null
}

onMounted(() => {
  loadUserFiles()
})

async function loadUserFiles() {
  const res = await apiClient.getUploadedFiles(endpoints.bi.UploadedFiles)
  if (res.success) {
    selectedFiles.value = res.data
  } else {
    console.error('Ошибка при загрузке файлов пользователя:', res.errors)
  }
}
</script>
  
<style scoped>
* {
     margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    height: 100%;
    font-family: sans-serif;
    color: #fff;
}
  
.layout {
    display: grid;
    border-radius: 12px;
    border: 1px solid #4c4b51;
    grid-template-columns: 260px 1fr;
    grid-template-rows: 56px 1fr;
    grid-template-areas:
      "sidebar header"
      "sidebar chat";
    height: 100vh;
    background-color: transparent;
}

.sidebar {
    grid-area: sidebar;
    background-color: transparent;
    padding: 1rem;
    border-top-left-radius: 12px;
}

.file_area_header {
  position: relative;
  grid-area: header;
  background-color: #313338;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  border-bottom: none; /* убери стандартную границу */
  border-top-right-radius: 12px; /* добавь закругление */
}

.file_area_header::after {
  content: '';
  position: absolute;
  bottom: -5px; /* выстави нужный уровень */
  left: 0;
  right: 0;
  height: 1px;
  background-color: #4e5058;
}

.file_area {
    grid-area: chat;
    background-color: #313338;
    padding: 1rem;
    overflow-y: auto;
}

.icon-button {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s ease;
  border-radius: 6px;
  margin-right: 10px;
}

.icon-button:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.icon {
  width: 18px;
  height: 18px;
  color: #fff;
}

.icon_name{
    width: 32px;
    height: 32px;
    margin-right: 5px;
}

.icon_upload {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  vertical-align: middle;
}

.title{
    font-weight: bolder;
}

.name {
    font-size: 1.2rem;
    margin-inline: -1rem;
    padding-inline: 1rem;
    border-bottom: 1px solid #4e5058;
}

.name_container{
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 0.75rem;
}

.file-list {
    list-style: none;
    line-height: 1.8;
    font-size: 0.95rem;
    color: #b5bac1;
}

.file-upload-button{
    position: relative;
    margin-top: 20px;
    margin-bottom: 20px;
}

.file-upload-button::after {
  content: '';
  position: absolute;
  bottom: -20px; /* ⬅ отступ вниз от кнопки */
  left: 0;
  right: 0;
  height: 1px;
  background-color: #4e5058;
}

.btn-outline-danger{
    width: 100%;
    height: 2rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
}

</style>
  