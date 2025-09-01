<template>
  <main class="file_area" :class="{ 'rounded-bottom': !isPreviewVisible }">
         <div v-if="activeTab === 'sources'" class="flow-wrapper">
       <DatasetCreating 
         :selectedConnection="selectedConnection" 
         :mainTable="mainTable"
         :relations="relations" 
         :all-tables="allTablesOfConnection" 
         @editRelation="$emit('editRelation', $event)"
         @removeRelation="$emit('removeRelation', $event)" 
         @openTableLinkModal="$emit('openTableLinkModal')"
         @tablesLoaded="$emit('tablesLoaded', $event)"
         @update:selectedConnection="$emit('update:selectedConnection', $event)"
         @update:mainTable="$emit('update:mainTable', $event)"
         @resetAllRelations="$emit('resetAllRelations')"
       />
     </div>
    <div v-else style="height: 100%;">
      <!-- Плейсхолдер для проблем с подключением -->
      <Placeholders 
        v-if="hasConnectionIssues"
        type="connection-error"
        title="Проблемы с подключением"
        description="В выбранном подключении обнаружены проблемы с файлами или подключением. Перейдите к вкладке 'Источники' для проверки и исправления проблем с подключением."
        :actions="[
          {
            key: 'switch-to-sources',
            label: 'Перейти к источникам',
            variant: 'btn-primary',
            onClick: switchToSources
          }
        ]"
        @action="handlePlaceholderAction"
      />

      <!-- Плейсхолдер для пустого состояния -->
      <Placeholders 
        v-else-if="activeTab === 'fields' && (!fields || fields.length === 0)"
        type="empty"
        title="Поля не найдены"
        description="В данном датасете пока нет полей. Добавьте первое поле для начала работы."
        :actions="[
          {
            key: 'add',
            label: 'Добавить поле',
            variant: 'btn-primary',
            onClick: addFirstField
          }
        ]"
        @action="handlePlaceholderAction"
      />

      <!-- Плейсхолдер для загрузки -->
      <Placeholders 
        v-else-if="isLoading"
        type="loading"
        title="Загрузка данных..."
        description="Пожалуйста, подождите, загружаем данные."
      />

      <!-- Компонент вкладки -->
      <component 
        v-else-if="activeTab === 'fields' && selectedTables.length" 
        :is="getTabComponent(activeTab)"
        :fields="fields" 
        :tables="selectedTables" 
        :cols="previewCols" 
        :rows="previewRows"
        :dataset-id="needsDataset(activeTab) && dataset ? dataset.id : null"
        :connection-status="connectionStatus"
        @remove-table="$emit('removeTable', $event)" 
        @update:fields="$emit('update:fields', $event)"
        @switch-to-sources="$emit('update:activeTab', 'sources')"
      />

      <!-- Сообщение о необходимости выбора таблицы -->
      <div v-else-if="!hasConnectionIssues" class="text-muted p-4"
        style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%; text-align: center;">
        Сначала выберите таблицу из подключения и создайте датасет,<br>чтобы редактировать {{ tabLabel(activeTab) }}.
      </div>
      
      <!-- Сообщение о проблемах с подключением -->
      <div v-else class="connection-error-message p-4"
        style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%; text-align: center; gap: 16px;">
        <div class="error-icon">⚠️</div>
        <div class="error-content">
          <div class="error-title">Проблемы с подключением</div>
          <div class="error-description">
            В выбранном подключении обнаружены проблемы с файлами или подключением. 
            Перейдите к вкладке "Источники" для проверки и исправления проблем.
          </div>
        </div>
        <button class="error-action-btn" @click="switchToSources">
          Перейти к источникам
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import DatasetCreating from './DatasetCreating.vue'
import FieldsPage from './FieldsPage.vue'
import ParamsPage from './ParamsPage.vue'
import Placeholders from '../common/Placeholders.vue'

const props = defineProps({
  activeTab: String,
  selectedConnection: Object,
  mainTable: Object,
  relations: Array,
  allTablesOfConnection: Array,
  selectedTables: Array,
  fields: Array,
  previewCols: Array,
  previewRows: Array,
  dataset: Object,
  isPreviewVisible: Boolean,
  connectionStatus: { type: String, default: 'connected' },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'editRelation',
  'removeRelation', 
  'openTableLinkModal',
  'tablesLoaded',
  'removeTable',
  'update:fields',
  'update:selectedConnection',
  'update:mainTable',
  'update:activeTab',
  'add-field',
  'resetAllRelations'
])

function needsDataset(tab) {
  return tab === 'fields' || tab === 'params'
}

function tabLabel(tab) {
  return tab === 'fields' ? 'поля' : (tab === 'params' ? 'параметры' : '')
}

function getTabComponent(tab) {
  const cmp = { fields: FieldsPage, params: ParamsPage }[tab] || null
  return cmp
}

// Вычисляемое свойство для определения проблем с подключением
const hasConnectionIssues = computed(() => {
  return props.connectionStatus === 'error' || 
         (props.selectedConnection && (props.selectedConnection.hasMissingFiles || props.selectedConnection.hasProblematicFiles))
})

// Функция для переключения на вкладку источников
function switchToSources() {
  emit('update:activeTab', 'sources')
}

// Функция для добавления первого поля
function addFirstField() {
  emit('add-field')
}

// Обработчик действий плейсхолдера
function handlePlaceholderAction(action) {
  switch (action) {
    case 'switch-to-sources':
      switchToSources()
      break
    case 'add':
      addFirstField()
      break
  }
}
</script>

<style scoped lang="scss">
.file_area {
  grid-area: field;
  padding-bottom: 200px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  height: 100%;
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

.text-muted {
  color: var(--color-secondary-text);
}

.p-4 {
  padding: 1rem;
}

/* Стили для сообщения об ошибке подключения */
.connection-error-message .error-icon {
  font-size: 48px;
  opacity: 0.6;
}

.connection-error-message .error-content {
  max-width: 400px;
}

.connection-error-message .error-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  font-size: 16px;
}

.connection-error-message .error-description {
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
}

.connection-error-message .error-action-btn {
  background: #c53030;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.connection-error-message .error-action-btn:hover {
  background: #9b2c2c;
}
</style>
