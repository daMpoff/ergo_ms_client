<template>
    <div class="field-body">
        <div class="body-table">
            <div class="table-row">
                <div class="table-row-label">Источник</div>
                <select class="table-row-select select-1 form-select form-select-sm" id="smallSelect">
                    <option selected>Откройте это меню выбора</option>
                    <option value="1">Один</option>
                    <option value="2">Два</option>
                    <option value="3">Три</option>
                </select>
            </div>
            <div class="table-row">
                <div class="table-row-label">Поле источника</div>
                <div class="dropdown-wrapper select-2">
                    <button type="button" class="dropdown-toggle form-select form-select-sm table-row-select w-100" @click="isOpen = !isOpen">
                        {{ selectedLabel }}
                    </button>
                    <div v-if="isOpen" class="dropdown-menu show">
                        <div class="dropdown-search p-2">
                            <input 
                                type="text" 
                                class="form-control form-control-sm" 
                                placeholder="Поиск таблицы..." 
                                v-model="filter"
                                autocomplete="off"
                            />
                        </div>
                        <ul class="dropdown-list">
                            <li 
                                v-for="t in filteredTables" 
                                :key="t.id"
                                class="dropdown-item"
                                :class="{ active: isSelected(t) }"
                                @click="selectTable(t)"
                            >
                                {{ tableLabel(t) }}
                            </li>
                            <li v-if="filteredTables.length === 0" class="dropdown-empty">Нет результатов</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="table-row">
                <div class="table-row-label">Тип поля</div>
                <select class="table-row-select select-2 form-select form-select-sm" id="smallSelect">
                    <option selected>Откройте это меню выбора</option>
                    <option value="1">Один</option>
                    <option value="2">Два</option>
                    <option value="3">Три</option>
                </select>
            </div>
            <div class="table-row">
                <div class="table-row-label">Агрегация</div>
                <select class="table-row-select select-2 form-select form-select-sm" id="smallSelect">
                    <option selected>Откройте это меню выбора</option>
                    <option value="1">Один</option>
                    <option value="2">Два</option>
                    <option value="3">Три</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    tables: { type: Array, default: () => [] },
    selectedConnection: { type: Object, default: null },
    field: { type: Object, default: null }
})

const emit = defineEmits(['update:search', 'insert-field'])

const isOpen = ref(false)
const filter = ref('')
const selectedTable = ref(null)

const connectionName = computed(() => props.selectedConnection?.name || 'Подключение')

function tableLabel(t) {
    return t.name || ((t.schema && t.table) ? `${t.schema}.${t.table}` : (t.table || ''))
}

const filteredTables = computed(() => {
    const s = filter.value.trim().toLowerCase()
    if (!s) return props.tables
    return props.tables.filter(t => {
        const lbl = tableLabel(t).toLowerCase()
        return lbl.includes(s)
    })
})

const selectedLabel = computed(() => {
    if (!selectedTable.value) return `${connectionName.value}.Выберите таблицу`
    return `${connectionName.value}.${tableLabel(selectedTable.value)}`
})

function selectTable(t) {
    selectedTable.value = t
    isOpen.value = false
}

function isSelected(t) {
    return selectedTable.value && String(selectedTable.value.id) === String(t.id)
}

function onClickOutside(e) {
    const root = e.target.closest('.dropdown-wrapper')
    if (!root) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside)
})

// Автовыбор таблицы при редактировании поля
function resolveSelectedFromField() {
    if (!props.field) return
    const srcTbl = props.field.source_table
    const src = props.field.source

    let found = null
    if (srcTbl && typeof srcTbl === 'object' && srcTbl.id) {
        found = props.tables.find(t => String(t.id) === String(srcTbl.id))
    } else if (srcTbl) {
        found = props.tables.find(t => String(t.id) === String(srcTbl))
    }
    if (!found && src && src.table) {
        const target = String(src.table)
        found = props.tables.find(t => tableLabel(t) === target || t.table === target)
    }
    if (found) {
        selectedTable.value = found
    }
}

// Следим за приходом таблиц и полем
import { watch } from 'vue'
watch(() => props.tables, () => resolveSelectedFromField(), { deep: true })
watch(() => props.field, () => resolveSelectedFromField(), { deep: true, immediate: true })
</script>

<style scoped lang="scss">
.field-body{
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 20px 32px 0;
}

.body-table{
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.table-row{
    display: flex;
    align-items: center;
}

.table-row-label{
    flex: 0 0 150px;
    color: var(--color-primary-text);
    font-size: 0.9rem;
}

.table-row-select {
  background: transparent !important;
  color: var(--color-primary-text) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 5px !important;
  padding: 0.25rem 0.5rem !important;
  transition: background-color 0.2s ease, border-color 0.2s ease !important;
  appearance: none !important;
}

.table-row-select:hover,
.table-row-select:focus {
  background-color: var(--color-hover-background) !important;
  border-color: var(--color-border) !important;
  outline: none !important;
}

.table-row-select::-ms-expand {
  display: none !important;
}

.select-1{
    max-width: 580px;
}

.select-2{
    max-width: 260px;
}

.dropdown-wrapper {
  position: relative;
  width: 100%;
}

.dropdown-toggle.table-row-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.dropdown-toggle.table-row-select::after {
  content: '';
  display: inline-block;
  margin-left: 8px;
  border-top: .35em solid currentColor;
  border-right: .35em solid transparent;
  border-left: .35em solid transparent;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--color-primary-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 8px 24px #0008;
  z-index: 1000;
}

.dropdown-list {
  list-style: none;
  padding: 6px;
  margin: 0;
  max-height: 260px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-primary-text);
}

.dropdown-item:hover,
.dropdown-item.active {
  background-color: var(--color-hover-background);
}

.dropdown-empty {
  padding: 8px;
  color: var(--color-secondary-text);
}
</style>