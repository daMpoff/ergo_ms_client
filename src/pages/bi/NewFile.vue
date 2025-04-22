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
          <input type="file" ref="fileInput" accept=".csv,.xlsx,.txt" multiple @change="handleFileUpload" style="display: none"/>
          <input type="file" ref="replaceInput" accept=".csv,.xlsx,.txt" style="display: none" @change="handleFileReplace"/>
        </div>
      </div>

      <div class="file-list">
        <div v-if="tempUploadedFiles.length">
          <div class="section-header">Новые файлы</div>
          <FileItem
            v-for="file in tempUploadedFiles"
            :key="file.temp_path"
            :file="file"
            :isTemp="true"
            :isActive="selectedFile === file"
            @select="selectFile"
            @tooltip-show="onIconHover"
            @tooltip-hide="hideTooltipWithDelay"
            @delete="() => removeTempFile(file)"
            @pick-sheets="openSheetPicker"
          />
        </div>

        <div v-if="uploadedFiles.length">
          <div class="section-header">Загруженные ранее</div>
          <FileItem
            v-for="file in uploadedFiles"
            :key="file.id"
            :file="file"
            :isTemp="false"
            :isActive="selectedFile === file"
            @replace="replaceFile"
            @rename="renameFile"
            @delete="deleteFile"
            @select="selectFile"
            @tooltip-show="onIconHover"
            @tooltip-hide="hideTooltipWithDelay"
            @pick-sheets="openSheetPicker"
          />
        </div>
      </div>
    </aside>

    <header class="file_area_header">
      <button type="button" v-if="showCreateDatasetButton" class="btn btn-outline-secondary">Создать датасет</button>
      <button type="button" v-if="showSaveChangesButton" class="btn btn-success" @click="finalizeUploads">Сохранить изменения</button>
    </header>
    <main class="file_area">
      <FilePreviewPanel v-if="selectedFile" :file="selectedFile" />
    </main>
  </div>

  <transition name="fade">
    <div v-show="showTooltip" :style="tooltipStyle" class="tooltip show">{{ tooltipText }}</div>
  </transition>

  <XlsxSheetPicker :visible="isSheetPickerVisible" :filename="currentUploadFile?.name || ''" :sheets="availableSheets" :currentSheet="sheetBeingEdited" @confirm="handleSheetSelection" @cancel="isSheetPickerVisible = false"/>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Upload } from 'lucide-vue-next'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import FileItem from './components/FileItem.vue'
import FilePreviewPanel from './components/FilePreviewPanel.vue'
import XlsxSheetPicker from './components/FilePreview/XlsxSheetPicker.vue'


const router = useRouter()
const fileInput = ref(null)
const replaceInput = ref(null)
const fileToReplace = ref(null)
const selectedFiles = ref([])
const showTooltip = ref(false)
const tooltipText = ref('')
const tooltipStyle = ref({})
const tooltipTimeout = ref(null)
const selectedFile = ref(null)
const sheetBeingEdited = ref(null)

const MAX_FILES = 10
const MAX_SIZE_MB = 200

const isSheetPickerVisible = ref(false)
const currentUploadFile = ref(null)
const availableSheets = ref([])
const uploadedFiles = ref([])           // загруженные из БД
const tempUploadedFiles = ref([])       // временно загруженные


const isSheetPickerReady = computed(() =>
  isSheetPickerVisible.value &&
  currentUploadFile.value &&
  Array.isArray(availableSheets.value) &&
  availableSheets.value.length > 0
)

function goToNewConnection() {
  router.push('/bi/connections/new/')
}

function triggerFileUpload() {
  fileInput.value?.click()
}

function replaceFile(file) {
  if (file.file_type === 'xlsx' && file.pendingSheets?.length) {
    currentUploadFile.value = file
    availableSheets.value = file.pendingSheets
    sheetBeingEdited.value = getSheetNameFromFile(file.name)
    isSheetPickerVisible.value = true
  } else {
    fileToReplace.value = file
    replaceInput.value?.click()
  }
}

function getSheetNameFromFile(name) {
  const match = name.match(/–\s*(.+)\.xlsx$/)
  return match ? match[1] : null
}

function selectFile(file) {
  if (file.pendingSheets && !file.processedSheets) {
    openSheetPicker(file)
    return
  }
  selectedFile.value = file
}

async function deleteFile(file) { // Функция удаления файлов с сервера
  const confirmed = confirm(`Вы уверены, что хотите удалить файл "${file.name}"?`)
  if (!confirmed) return

  try {
    const res = await apiClient.delete(`bi_analysis/bi_datasets/upload/${file.id}/`)

    if (res.status === 204 || res.success) {
      const index = uploadedFiles.value.findIndex(f => f.id === file.id)
      if (index !== -1) {
        uploadedFiles.value.splice(index, 1)
      }

      if (selectedFile.value?.id === file.id) {
        selectedFile.value = null
      }

      console.log('[deleteFile] удалён успешно')
    } else {
      console.warn('[deleteFile] ошибка удаления:', res)
      alert('Не удалось удалить файл')
    }
  } catch (error) {
    console.error('[deleteFile] ошибка при запросе:', error)
    alert('Ошибка при удалении файла')
  }
}

function onIconHover(event, text) {
  if (tooltipTimeout.value) clearTimeout(tooltipTimeout.value)
  tooltipText.value = text
  showTooltip.value = true

  const rect = event.target.getBoundingClientRect()
  tooltipStyle.value = {
    top: `${rect.top + window.scrollY - 36}px`,
    left: `${rect.left + rect.width / 2 + window.scrollX}px`,
    transform: 'translateX(-50%)',
    position: 'absolute'
  }
}

function hideTooltipWithDelay() {
  tooltipTimeout.value = setTimeout(() => {
    showTooltip.value = false
  }, 200)
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

  const empty = files.filter(file => file.size === 0)
  if (empty.length > 0) {
    alert(`Файлы пустые:\n${empty.map(f => f.name).join(', ')}`)
    event.target.value = ''
    return
  }

  for (const file of files) {
  if (file.name.endsWith('.xlsx')) {
    const formData = new FormData()
    formData.append('file', file)
    const sheetRes = await apiClient.upload('bi_analysis/bi_datasets/xlsx/sheets/', formData)

    if (sheetRes.success && sheetRes.data.sheets.length > 1) {
      const tempFile = {
        name: file.name,
        originalFile: file,
        temp_path: null,
        original_filename: file.name,
        file_type: 'xlsx',
        pendingSheets: sheetRes.data.sheets,
        processedSheets: false
      }
      tempUploadedFiles.value.push(tempFile)

      // указать текущий файл для выбора листов
      currentUploadFile.value = tempFile
      availableSheets.value = sheetRes.data.sheets
      isSheetPickerVisible.value = true

      event.target.value = ''
      return
    }
  }

  await uploadFile(file)
}

  event.target.value = ''
  await loadUserFiles()
}

async function uploadFile(file, sheet = null) {
  const formData = new FormData()
  formData.append('file', file)

  let name = file.name
  if (sheet) {
    const base = file.name.replace(/\.xlsx$/, '')
    name = `${base} - ${sheet}.xlsx`
    formData.append('sheet', sheet)
  }

  formData.append('name', name)

  const res = await apiClient.upload('bi_analysis/bi_datasets/upload/', formData)

  if (res.success) {
    const temp = {
      name,
      temp_path: res.data.temp_path,
      original_filename: res.data.original_filename,
      file_type: res.data.file_type,
      originalFile: file,
      isReady: true,
      id: res.data.id ?? null
    }
    tempUploadedFiles.value.push(temp)

    selectedFile.value = temp
  }
}

function handleSheetSelection(sheets) {
  isSheetPickerVisible.value = false

  const file = currentUploadFile.value
  if (!file || !sheets.length) return

  sheets.forEach(sheet => {
    const formData = new FormData()
    formData.append('file', file.originalFile)
    formData.append('sheet', sheet)

    const newName = `${file.name.replace(/\.xlsx$/, '')} – ${sheet}.xlsx`
    formData.append('name', newName)

    uploadFileRaw(formData, newName, file.originalFile)
  })

  const index = tempUploadedFiles.value.findIndex(f => f.name === file.name)
  if (index !== -1) tempUploadedFiles.value.splice(index, 1)

  currentUploadFile.value = null
}
  // Удалить исходный файл с множеством листов из списка
const index = tempUploadedFiles.value.findIndex(f => f.name === file.name)
  if (index !== -1) tempUploadedFiles.value.splice(index, 1)
    currentUploadFile.value = null

async function uploadFileRaw(formData, displayName, originalFile = null) {
  const res = await apiClient.upload('bi_analysis/bi_datasets/upload/', formData)

  if (res.success) {
    const temp = {
      name: displayName,
      temp_path: res.data.temp_path,
      original_filename: res.data.original_filename,
      file_type: res.data.file_type,
      originalFile,
      isReady: true,
      id: res.data.id ?? null
    }
    tempUploadedFiles.value.push(temp)
    selectedFile.value = temp
  }
}

async function handleFileReplace(event) {
  const file = event.target.files[0]
  if (!file || !fileToReplace.value) return

  if (file.size === 0) {
    alert('Файл пустой. Пожалуйста, выберите непустой файл.')
    return
  }

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

async function finalizeUploads() {
  const successfullyFinalized = []

  for (const file of tempUploadedFiles.value) {
    const formData = new FormData()
    formData.append('temp_path', file.temp_path)
    formData.append('name', file.name)
    formData.append('original_filename', file.original_filename)
    formData.append('file_type', file.file_type)

    const res = await apiClient.post('bi_analysis/bi_datasets/upload/finalize/', formData)

    if (res.success) {
      successfullyFinalized.push(file)
    } else {
      console.error('Ошибка при финализации:', res.errors)
      alert(`Ошибка при сохранении файла ${file.name}`)
    }
  }

  // Очистка temp и обновление списка загруженных
  if (successfullyFinalized.length) {
    tempUploadedFiles.value = tempUploadedFiles.value.filter(
      f => !successfullyFinalized.includes(f)
    )
    await loadUserFiles()
    selectedFile.value = null
  }
}

async function renameFile(file) {
  const originalExt = file.name.split('.').pop()
  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')

  const newNameInput = prompt('Новое имя файла:', nameWithoutExt)
  if (!newNameInput || newNameInput.trim() === '') return

  const newName = `${newNameInput.trim()}.${originalExt}`

  const res = await apiClient.patch(`bi_analysis/bi_datasets/upload/${file.id}/`, {
    name: newName
  })

  if (res.success) {
    await loadUserFiles()
  } else {
    alert('Ошибка переименования')
    console.error(res.errors)
  }
}

async function loadUserFiles() {
  const res = await apiClient.getUploadedFiles(endpoints.bi.UploadedFiles)
  if (res.success) {
    uploadedFiles.value = res.data
  }
}

function openSheetPicker(file) {
    console.log('[openSheetPicker]', file)
    console.log('pendingSheets:', file.pendingSheets)
    console.log('processedSheets:', file.processedSheets)
    currentUploadFile.value = file
    availableSheets.value = file.pendingSheets
    sheetBeingEdited.value = getSheetNameFromFile(file.name)
    isSheetPickerVisible.value = true 
}

const showSaveChangesButton = computed(() => {
  return selectedFile.value?.originalFile != null
})

const showCreateDatasetButton = computed(() => {
  return (
    selectedFile.value != null &&
    !selectedFile.value.originalFile &&  // файл уже на сервере
    (selectedFile.value.id || selectedFile.value.temp_path)
  )
})

function removeTempFile(file) {
  console.log('[removeTempFile] попытка удалить:', file.name || file.temp_path)

  const index = tempUploadedFiles.value.findIndex(f => f.temp_path === file.temp_path)
  if (index !== -1) {
    tempUploadedFiles.value.splice(index, 1)

    if (selectedFile.value?.temp_path === file.temp_path) {
      selectedFile.value = null
    }

    console.log('[removeTempFile] удалено и предпросмотр сброшен (если был)')
  } else {
    console.warn('[removeTempFile] файл не найден среди временных')
  }
}

onMounted(loadUserFiles)
</script>
  
<style scoped>
* {
     margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.tooltip {
  position: absolute;
  background: #2e2f35;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  white-space: nowrap;
  z-index: auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  pointer-events: none;
  opacity: 0;
  transform: translateY(-5px) translateX(-50%);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip.show {
  opacity: 1;
  transform: translateY(0) translateX(-50%);
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
    height: 85vh;
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
  gap: 20px;
  height: 61px;
  align-items: center;
  justify-content: right;
  padding: 0 1rem;
  border-top-right-radius: 12px;
  border-bottom: 1px solid #4e5058;
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
    padding-top: 5px;
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

.section-header{
  margin-top: 10px;
  margin-bottom: 10px;
  font-weight: bold;
}

.btn-success{
  width: 13rem;
  height: 2rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.btn-outline-secondary{
  width: 10rem;
  height: 2rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

</style>