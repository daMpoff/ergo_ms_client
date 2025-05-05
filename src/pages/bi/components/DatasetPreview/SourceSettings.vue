<template>
  <div class="source-settings" :class="{ 'resizing-footer': isResizing }" :style="{ '--footer-height': showHelp ? helpHeight + 'px' : '0px' }">
    <div class="settings-top d-flex align-items-center gap-3">
      <input v-model="local.name" class="form-control form-control-sm bg-dark text-white flex-grow-1" placeholder="Название поля" />
      <div class="tab-group">
        <button class="tab-button" :class="{ active: activeTab === 'formula' }" @click="activeTab = 'formula'">Формула</button>
        <button class="tab-button" :class="{ active: activeTab === 'field' }" @click="activeTab = 'field'">Поле из источника</button>
      </div>
      <button class="btn btn-sm btn-outline-secondary ms-auto" v-if="activeTab === 'formula'" @click="showHelp = !showHelp">Справочник</button>
    </div>
    <div class="settings-body">
      <SourceSettingsFormula v-if="activeTab === 'formula'" v-model:expression="expression" />
      <SourceSettingsField v-else v-model:search="search" :fields="filteredFields" @insert-field="insertField" />
      <div class="modal-actions d-flex justify-content-end gap-2 mt-3" :class="{ 'no-footer': !showHelp || activeTab === 'field' }">
        <button class="btn btn-sm btn-outline-light cancel-btn" @click="$emit('close')">Отменить</button>
        <button class="btn btn-sm btn-primary" @click="apply">Создать</button>
      </div>
    </div>
    <div class="settings-footer" @mousedown="startHelpResize" @dblclick="resetHelpHeight">
      <SourceSettingsHelp />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import SourceSettingsField from './SourceSettingsField.vue'
import SourceSettingsFormula from './SourceSettingsFormula.vue'
import SourceSettingsHelp from './SourceSettingsHelp.vue'

const props = defineProps({ field: Object })
const emit = defineEmits(['close', 'create'])

const local = ref({ ...props.field })
const activeTab = ref('formula')
const expression = ref('')
const search = ref('')
const fields = ref([{ name: 'Column_1' }, { name: 'Column_2' }])
const filteredFields = computed(() =>
  fields.value.filter(f => f.name.toLowerCase().includes(search.value.toLowerCase()))
)

const showHelp = ref(true)
const helpHeight = ref(200)
let isResizing = false, startY = 0, startH = 0

function startHelpResize(e) {
  if (e.offsetY <= 6) {
    isResizing = true
    startY = e.clientY
    startH = helpHeight.value
    document.addEventListener('mousemove', onHelpResize)
    document.addEventListener('mouseup', stopHelpResize)
  }
}
function onHelpResize(e) {
  if (!isResizing) return
  const delta = startY - e.clientY
  helpHeight.value = Math.min(Math.max(startH + delta, 100), 400)
}
function stopHelpResize() {
  isResizing = false
  document.removeEventListener('mousemove', onHelpResize)
  document.removeEventListener('mouseup', stopHelpResize)
}
function resetHelpHeight() {
  helpHeight.value = 200
}

watch(activeTab, tab => {
  if (tab === 'field') showHelp.value = false
  else showHelp.value = true
})

function insertField(name) {
  expression.value += name
}

function apply() {
  emit('create', { ...local.value, expression, mode: activeTab.value })
}
</script>

<style scoped lang="scss">
.source-settings {
  display: grid;
  grid-template-rows: auto 1fr var(--footer-height, 200px);
  height: 100%;
  overflow: hidden;
}

.settings-footer::before {
  content: "";
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 6px;
  cursor: row-resize;
  z-index: 10;
}

.settings-top {
  padding: 1rem;
  gap: .5rem;
}

.settings-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-actions {
  margin-top: auto;
  padding-bottom: 20px;
  &.no-footer {
    padding-bottom: 40px;
  }
}

/* Footer */
.settings-footer {
  position: relative;
  background: #2a2a2a;
  overflow: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* invisible handle strip */
.settings-footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  cursor: row-resize;
  z-index: 10;
}

/* повторяем ваши табы */
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

/* input стили */
.settings-top input.form-control {
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 5px !important;
  max-width: 300px;
}

.cancel-btn {
  color: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.2);
  background: transparent;
  transition: background-color .2s ease, color .2s ease;
}

.cancel-btn:hover,
.cancel-btn:focus {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
