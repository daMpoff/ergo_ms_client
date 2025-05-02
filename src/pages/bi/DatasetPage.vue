<template>
    <div class="layout" :class="{ 'with-sidebar': activeTab === 'sources', 'resizing-sidebar': isSidebarResizing }" :style="{
    gridTemplateColumns: activeTab === 'sources' ? sidebarWidth + 'px 1fr' : '0px 1fr',
    '--footer-height': isPreviewVisible ? footerHeight + 'px' : '0px' }">
        <header class="file_area_header">
            <div class="file_area_header_label">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="#">BI</a></li>
                        <li class="breadcrumb-item"><a href="#">Датасеты</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Новый датасет</li>
                    </ol>
                </nav>
            </div>
            <div class="file_area_header_buttons">
                <button type="button" class="btn btn-secondary">Создать чарт</button>
            </div>
        </header>

        <div class="toolbar">
            <div class="tab-group">
                <button class="tab-button" :class="{ active: activeTab === 'sources' }" autocomplete="off" checked @click="activeTab = 'sources'">
                    Источники
                </button>
                <button class="tab-button" :class="{ active: activeTab === 'fields' }" autocomplete="off" @click="activeTab = 'fields'">
                    Поля
                </button>
                <button class="tab-button" :class="{ active: activeTab === 'params' }" autocomplete="off" @click="activeTab = 'params'">
                    Параметры
                </button>
            </div>
            <div class="button-preview">
                <button type="button" class="btn btn-outline-secondary" @click="isPreviewVisible = !isPreviewVisible">Предпросмотр</button>
            </div>
        </div>
        <transition name="slide">
            <div v-if="activeTab === 'sources'" class="sidebar-wrapper">
                <aside class="sidebar" :style="{ width: sidebarWidth + 'px' }" :class="{ 'rounded-bottom': !isPreviewVisible }" @mousedown="startSidebarResize">
                  <SourcesPage v-if="activeTab === 'sources'" v-model:selected-connection="selectedConnection" v-model:selected-tables="selectedTables"/>
                </aside>
            </div>
        </transition>

        <main class="file_area" :class="{ 'rounded-bottom': !isPreviewVisible }">
            <component :is="getTabComponent(activeTab)" />
        </main>

        <transition name="slide-footer">
            <footer class="footer" v-if="isPreviewVisible" :style="{ height: footerHeight + 'px' }" @mousedown="startResizing">
                <DatasetTablePreview />
            </footer>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import SourcesPage from '@/pages/bi/components/DatasetPreview/SourcesPage.vue'
import SourcesPageLinks from '@/pages/bi/components/DatasetPreview/SourcesPageLinks.vue'
import FieldsPage from '@/pages/bi/components/DatasetPreview/FieldsPage.vue'
import ParamsPage from '@/pages/bi/components/DatasetPreview/ParamsPage.vue'
import DatasetTablePreview from '@/pages/bi/components/DatasetPreview/DatasetTablePreview.vue'

const activeTab = ref('sources')
const isPreviewVisible = ref(true)

const STORAGE_KEY = 'bi_dataset_state'

const selectedConnection = ref(null)
const selectedTables = ref([])
const selectedFields = ref([])
const datasetParams = ref({})

const confirmedUnload = ref(false)

const getTabComponent = (tab) => {
    switch (tab) {
        case 'sources': return SourcesPageLinks
        case 'fields': return FieldsPage
        case 'params': return ParamsPage
    }
}

const footerHeight = ref(100)
let startY = 0
let startHeight = 0
let isResizing = false

function startResizing(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const offsetY = e.clientY - rect.top

  if (offsetY <= 6) {
    isResizing = true
    startY = e.clientY
    startHeight = footerHeight.value

    document.addEventListener('mousemove', resize)
    document.addEventListener('mouseup', stopResizing)
  }
}

function resize(event) {
  if (!isResizing) return
  const delta = startY - event.clientY
  footerHeight.value = Math.min(Math.max(startHeight + delta, 100), 400)
}

function stopResizing() {
  isResizing = false
  document.removeEventListener('mousemove', resize)
  document.removeEventListener('mouseup', stopResizing)
}

const sidebarWidth = ref(260)
let sidebarStartX = 0
let sidebarStartWidth = 0
let isSidebarResizing = false

function startSidebarResize(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const offsetX = e.clientX - rect.left

  if (offsetX >= rect.width - 6) {
    isSidebarResizing = true
    sidebarStartX = e.clientX
    sidebarStartWidth = sidebarWidth.value

    document.addEventListener('mousemove', resizeSidebar)
    document.addEventListener('mouseup', stopSidebarResize)
  }
}

function resizeSidebar(e) {
  if (!isSidebarResizing) return
  const delta = e.clientX - sidebarStartX
  sidebarWidth.value = Math.min(Math.max(sidebarStartWidth + delta, 260), 500)
}

function stopSidebarResize() {
  isSidebarResizing = false
  document.removeEventListener('mousemove', resizeSidebar)
  document.removeEventListener('mouseup', stopSidebarResize)
}

function handleBeforeUnload(e) {
  if (!confirmedUnload.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

function handleUnload() {
  if (!confirmedUnload.value) {
    localStorage.removeItem(STORAGE_KEY)
  }
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      selectedConnection.value = parsed.selectedConnection ?? null
      selectedTables.value = parsed.selectedTables ?? []
      selectedFields.value = parsed.selectedFields ?? []
      datasetParams.value = parsed.datasetParams ?? {}
    } catch (e) {
      console.warn('Ошибка при чтении из localStorage:', e)
    }
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('unload', handleUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('unload', handleUnload)
})

watch(
  [selectedConnection, selectedTables, selectedFields, datasetParams],
  () => {
    const payload = {
      selectedConnection: selectedConnection.value,
      selectedTables: selectedTables.value,
      selectedFields: selectedFields.value,
      datasetParams: datasetParams.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  },
  { deep: true }
)

</script>

<style scoped lang="scss">
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    pointer-events: none;
    opacity: 0;
    transform: translateY(-5px) translateX(-50%);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip.show {
    opacity: 1;
    transform: translateY(0) translateX(-50%);
}

html,
body {
    height: 100%;
    font-family: sans-serif;
    color: #fff;
}

.layout {
  display: grid;
  grid-template-rows: 56px 50px 1fr var(--footer-height, 200px);
  border: 1px solid #4e5058;
  border-radius: 12px;
  grid-template-areas:
    "header header"
    "toolbar toolbar"
    "sidebar chat"
    "footer footer";
  height: 90vh;
  transition: grid-template-columns 0.4s ease;
}

.layout {
    --sidebar-width: 0px;

    &.with-sidebar {
        --sidebar-width: 260px;
    }
}

.layout.resizing-sidebar {
  transition: none;
}

.toolbar {
    grid-area: toolbar;
    background-color: #313338;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    margin-top: 5px;
    gap: 1rem;
    border-bottom: 1px solid #4e5058;
}

.tab-group {
    display: inline-flex;
    align-items: center;
    border: 1px solid #e53935;
    border-radius: 6px;
    overflow: hidden;
    height: 2rem;
}

.tab-button {
    background: transparent;
    color: #e53935;
    border: none;
    padding: 0 1rem;
    font-size: 0.85rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
}

.tab-button.active {
    background: #e53935;
    color: #fff;
}

.tab-button:not(.active):hover {
    background: rgba(229, 57, 53, 0.2);
}

.footer {
  grid-area: footer;
  background-color: #2c2e33;
  padding: 10px;
  text-align: center;
  color: #aaa;
  font-size: 0.9rem;
  border-top: 1px solid #4e5058;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  overflow: auto;
  min-height: 100px;
  max-height: 400px;
  overflow-y: hidden;
  position: relative;
  cursor: default;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 6px;
    width: 100%;
    cursor: row-resize;
    z-index: 1;
  }
}

.sidebar {
  position: relative;
  min-width: 260px;
  border-right: 1px solid #4e5058;
  background-color: #1e1f22;
  overflow: hidden;
  cursor: default;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 6px;
    height: 100%;
    cursor: ew-resize;
    z-index: 1;
  }

  &.rounded-bottom {
    border-bottom-left-radius: 12px !important;
    border-bottom-right-radius: 0 !important;
  }
}

.sidebar.hidden {
    width: 0;
    padding: 0;
    opacity: 0;
    border-right: 1px solid #4e5058;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.sidebar-wrapper {
  display: flex;
  height: 100%;
  grid-area: sidebar;
}

.file_area_header {
    position: relative;
    grid-area: header;
    background-color: #313338;
    display: flex;
    gap: 20px;
    height: 61px;
    align-items: center;
    padding: 0 1rem;
    border-top-right-radius: 12px;
    border-top-left-radius: 12px;
    border-bottom: 1px solid #4e5058;
}

.file_area_header_buttons {
    display: flex;
    justify-content: flex-end;
    margin-left: auto;
    gap: 10px;
}

.file_area {
    grid-area: chat;
    background-color: #313338;
    padding: 1rem;
    overflow-y: auto;
    border-bottom-left-radius: 0;

  &.rounded-bottom {
    border-bottom-right-radius: 12px !important;
    border-bottom-left-radius: 0px !important;
  }
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

.icon_name {
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

.title {
    font-weight: bolder;
}

.name {
    font-size: 1.2rem;
    margin-inline: -1rem;
    padding-inline: 1rem;
    border-bottom: 1px solid #4e5058;
}

.name_container {
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

.file-upload-button {
    position: relative;
    margin-top: 20px;
    margin-bottom: 20px;
}

.file-upload-button::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #4e5058;
}

.btn-outline-danger {
    width: 100%;
    height: 2rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.section-header {
    margin-top: 10px;
    margin-bottom: 10px;
    font-weight: bold;
}

.btn-success {
    width: 13rem;
    height: 2rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.btn-secondary {
    width: 10rem;
    height: 2rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-outline-secondary {
    width: 10rem;
    height: 2rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.slide-enter-active,
.slide-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

.slide-footer-enter-active,
.slide-footer-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-footer-enter-from,
.slide-footer-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.breadcrumb {
  display: flex;
  background: transparent;
  padding: 0;
  margin: 0;
  list-style: none;
  font-size: 0.95rem;
  color: #b0b0b0;

  .breadcrumb-item {
    display: flex;
    align-items: center;
    color: #b0b0b0;

    &:last-child::after {
      content: '';
    }

    &.active {
      color: var(--bs-primary);
    }

    a {
      color: #e0e0e0;
      text-decoration: none;

      &:hover {
        color: var(--bs-primary);
      }
    }
  }
}

.button-preview{
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
  gap: 10px;
}
</style>