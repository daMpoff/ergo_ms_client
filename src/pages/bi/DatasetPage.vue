<template>
  <div
    class="layout"
    :class="{ 'with-sidebar': activeTab === 'sources', 'resizing-sidebar': isSidebarResizing }"
    :style="{
      gridTemplateColumns: activeTab === 'sources' ? sidebarWidth + 'px 1fr' : '0px 1fr',
      '--footer-height': isPreviewVisible ? footerHeight + 'px' : '0px'
    }"
  >
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
        <button
          class="tab-button"
          :class="{ active: activeTab === 'sources' }"
          @click="activeTab = 'sources'"
        >
          Источники
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'fields' }"
          @click="activeTab = 'fields'"
        >
          Поля
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'params' }"
          @click="activeTab = 'params'"
        >
          Параметры
        </button>
      </div>
      <div class="button-preview">
        <button
          v-if="activeTab === 'fields'"
          class="btn btn-outline-secondary"
          style="display: flex; gap: 5px;"
          @click="refreshFields"
        >
          <RefreshCw :size="18" />Обновить поля
        </button>
        <button
          class="btn btn-outline-secondary"
          style="display: flex; gap: 5px;"
          @click="isPreviewVisible = !isPreviewVisible"
        >
          <Eye :size="18" /> Предпросмотр
        </button>
        <button
          v-if="activeTab === 'fields'"
          class="btn btn-outline-secondary"
          style="display: flex; gap: 5px;"
          @click="addField"
        >
          <Plus :size="18" />Добавить поле
        </button>
      </div>
    </div>

    <transition name="slide">
      <div v-if="activeTab === 'sources'" class="sidebar-wrapper">
        <aside
          class="sidebar"
          :style="{ width: sidebarWidth + 'px' }"
          :class="{ 'rounded-bottom': !isPreviewVisible }"
          @mousedown="startSidebarResize"
        >
          <SourcesPage
            v-model:selectedConnection="selectedConnection"
            v-model:selectedTables="selectedTables"
          />
        </aside>
      </div>
    </transition>

    <main class="file_area" :class="{ 'rounded-bottom': !isPreviewVisible }">
      <div v-if="activeTab === 'sources'" class="flow-wrapper">
        <div>relations: {{ selectedRelations }}</div>
        <SourcesPageLinks
          v-model:selectedTables="selectedTables"
          v-model:relations="selectedRelations"
        />
      </div>
      <div v-else>
        <component
          :is="getTabComponent(activeTab)"
          :tables="selectedTables"
          @drop-table="handleDropTable"
          @remove-table="handleRemoveTable"
        />
      </div>
    </main>

    <transition name="slide-footer">
      <footer
        class="footer"
        v-if="isPreviewVisible"
        :style="{ height: footerHeight + 'px' }"
        @mousedown="startResizing"
      >
        <DatasetTablePreview />
      </footer>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RefreshCw, Plus, Eye } from 'lucide-vue-next'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import SourcesPage from '@/pages/bi/components/DatasetPreview/SourcesPage.vue'
import SourcesPageLinks from '@/pages/bi/components/DatasetPreview/SourcesPageLinks.vue'
import FieldsPage from '@/pages/bi/components/DatasetPreview/FieldsPage.vue'
import ParamsPage from '@/pages/bi/components/DatasetPreview/ParamsPage.vue'
import DatasetTablePreview from '@/pages/bi/components/DatasetPreview/DatasetTablePreview.vue'

// вкладки и предпросмотр
const activeTab = ref('sources')
const isPreviewVisible = ref(true)

// состояние датасета
const selectedConnection = ref(null)
const selectedTables = ref([])
const selectedRelations = ref([])

// сайдбар ресайз (без изменений) …
const sidebarWidth = ref(260)
let isSidebarResizing = false, sidebarStartX = 0, sidebarStartWidth = 0
function startSidebarResize(e) { /* … */ }
function resizeSidebar(e) { /* … */ }
function stopSidebarResize() { /* … */ }

// футер ресайз …
const footerHeight = ref(100)
let isResizing = false, startY = 0, startHeight = 0
function startResizing(e) { /* … */ }
function onResize(e) { /* … */ }
function stopResizing() { /* … */ }

// функции для полей
function refreshFields() {
  // логика обновления (может перезагружать структуру)
}
function addField() {
  // можно передать событие в FieldsPage через emit
}

// **Новые методы по запросу FieldsPage.vue**  
function handleDropTable(table) {
  // пример: добавляем таблицу, если её ещё нет
  if (!selectedTables.value.includes(table)) {
    selectedTables.value.push(table)
  }
}
function handleRemoveTable(table) {
  const idx = selectedTables.value.indexOf(table)
  if (idx !== -1) selectedTables.value.splice(idx, 1)
}

// переключение табов
function getTabComponent(tab) {
  return { fields: FieldsPage, params: ParamsPage }[tab]
}
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
.layout.with-sidebar { --sidebar-width: 260px; }
.layout.resizing-sidebar { transition: none; }

.header,
.file_area_header {
  position: relative;
  grid-area: header;
  background-color: #313338;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 20px;
  height: 61px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  border-bottom: 1px solid #4e5058;
}
.file_area_header_buttons {
  margin-left: auto;
  display: flex;
  gap: 10px;
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

.sidebar-wrapper {
  display: flex;
  grid-area: sidebar;
  height: 100%;
}

.sidebar {
  position: relative;
  min-width: 260px;
  background-color: #1e1f22;
  border-right: 1px solid #4e5058;
  overflow: hidden;
  cursor: default;
}
.sidebar.rounded-bottom {
  border-bottom-left-radius: 12px !important;
  border-bottom-right-radius: 0 !important;
}
.sidebar::after {
  content: "";
  position: absolute;
  top: 0; right: 0;
  width: 6px; height: 100%;
  cursor: ew-resize;
  z-index: 1;
}

.file_area {
  grid-area: chat;
  background-color: #313338;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-bottom-left-radius: 0;
}
.file_area.rounded-bottom {
  border-bottom-right-radius: 12px !important;
}

.flow-wrapper {
  flex: 1;
  position: relative;
}

.footer {
  grid-area: footer;
  background-color: #2c2e33;
  padding: 10px;
  text-align: center;
  color: #aaa;
  font-size: 0.9rem;
  border-top: 1px solid #4e5058;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  min-height: 100px;
  max-height: 400px;
  overflow: hidden;
  position: relative;
}
.footer::before {
  content: "";
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 6px;
  cursor: row-resize;
  z-index: 1;
}

.button-preview {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.btn-secondary,
.btn-outline-secondary {
  width: 10rem;
  height: 2rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-outline-secondary { color: white; }

.btn-success {
  width: 13rem;
  height: 2rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.breadcrumb {
  display: flex;
  background: transparent;
  padding: 0;
  margin: 0;
  list-style: none;
  font-size: 0.95rem;
  color: #b0b0b0;
}
.breadcrumb-item {
  display: flex;
  align-items: center;
  color: #b0b0b0;
}
.breadcrumb-item.active {
  color: var(--bs-primary);
}
.breadcrumb-item a {
  color: #e0e0e0;
  text-decoration: none;
}
.breadcrumb-item a:hover {
  color: var(--bs-primary);
}
</style>
