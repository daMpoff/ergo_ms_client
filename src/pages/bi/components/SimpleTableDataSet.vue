<template>
  <div class="scrollable-table">
    <table class="custom-table">
      <thead class="transparent-header">
        <tr>
          <th v-for="col in props.cols" :key="col.key">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in props.users"
          :key="row.id"
          class="table-row"
          @mouseenter="hoveredRow = row.id"
          @mouseleave="hoveredRow = null"
        >
          <td
            v-for="col in props.cols"
            :key="col.key"
            :style="{ position: 'relative', overflow: 'hidden' }"
            :class="{ 'td-actions': col.key === 'actions' }"
          >
            <!-- Название -->
            <template v-if="col.key === 'name'">
              <span class="tooltip-wrapper">
                <Table class="icon" title="Датасет" />
              </span>
              <span class="dataset-name">{{ getValue(row, col.key) ?? '—' }}</span>
            </template>

            <!-- Дата -->
            <template v-else-if="col.key === 'created_at'">
              <span
                class="tooltip-wrapper"
                @mouseenter="onIconHover($event, formatTooltipDate(getValue(row, col.key)))"
                @mouseleave="hideTooltip"
              >
                {{ new Date(getValue(row, col.key)).toLocaleDateString() }}
              </span>
            </template>

            <!-- Действия -->
            <template v-else-if="col.key === 'actions'">
              <div
                class="actions-cell"
                :class="{ visible: props.isDatasetSidebarOpen && (hoveredRow === row.id || isFavorite(row.id)) }"
              >
                <div class="actions-inner">
                  <button
                    class="action-btn star"
                    :class="{ active: isFavorite(row.id) }"
                    @click.stop="toggleFavorite(row.id)"
                    title="Избранное"
                  >
                    <Star class="icon-inline" />
                  </button>
                  <button class="action-btn more" title="Еще">
                    <MoreHorizontal class="icon-inline" />
                  </button>
                </div>
              </div>
            </template>

            <!-- Остальные поля -->
            <template v-else>
              {{ typeof col.format === 'function' ? col.format(getValue(row, col.key)) : getValue(row, col.key) ?? '—' }}
            </template>
          </td>
        </tr>

        <tr v-if="props.users.length === 0">
          <td :colspan="props.cols.length" class="no-data">Нет данных</td>
        </tr>
      </tbody>
    </table>

    <div v-if="showTooltip" class="tooltip-fixed" :style="tooltipStyle">
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Table, Image as Star, MoreHorizontal } from 'lucide-vue-next'

const props = defineProps({
  cols: Array,
  users: Array,
  isDatasetSidebarOpen: Boolean
})

const hoveredRow = ref(null)
const favorites = ref(new Set())

// localStorage избранное
function loadFavorites() {
  const raw = localStorage.getItem('favoriteDatasets')
  if (raw) {
    try {
      favorites.value = new Set(JSON.parse(raw))
    } catch {
      favorites.value = new Set()
    }
  }
}

function saveFavorites() {
  localStorage.setItem('favoriteDatasets', JSON.stringify([...favorites.value]))
}

function toggleFavorite(id) {
  if (favorites.value.has(id)) favorites.value.delete(id)
  else favorites.value.add(id)
}

function isFavorite(id) {
  return favorites.value.has(id)
}

onMounted(loadFavorites)
watch(favorites, saveFavorites, { deep: true })

function getValue(row, key) {
  return key.split('.').reduce((acc, part) => acc?.[part], row)
}

// Tooltip
const tooltipText = ref('')
const tooltipStyle = ref({ top: '0px', left: '0px' })
const showTooltip = ref(false)

function onIconHover(event, text) {
  tooltipText.value = text
  showTooltip.value = true
  const rect = event.target.getBoundingClientRect()
  tooltipStyle.value = {
    top: `${rect.top + window.scrollY - 32}px`,
    left: `${rect.left + rect.width / 2 + window.scrollX}px`
  }
}

function hideTooltip() {
  showTooltip.value = false
}

function formatTooltipDate(dateStr) {
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  const date = new Date(dateStr)
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.scrollable-table {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 440px;
  font-size: 14px;
  color: #ccc;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
}

.transparent-header th {
  background-color: transparent;
  color: #fff;
  font-weight: bold;
}

.custom-table th,
.custom-table td {
  padding: 12px 16px;
  text-align: left;
  white-space: nowrap;
}

.table-row:hover {
  background-color: #333;
}

.td-actions {
  width: 96px;
  max-width: 96px;
  min-width: 96px;
  padding: 0 4px;
}

.icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  color: #dc3545;
}

.tooltip-wrapper {
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
}

.tooltip-fixed {
  position: fixed;
  transform: translateX(-50%);
  background-color: #2a2a2a;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.dataset-name {
  vertical-align: middle;
}

.no-data {
  text-align: center;
  padding: 24px;
  color: #777;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.actions-cell.visible {
  opacity: 1;
  pointer-events: auto;
}

.actions-inner {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  color: #bbb;
  transition: background 0.2s ease, color 0.2s ease;
}

.action-btn:hover {
  background-color: #444;
  color: #fff;
}

.action-btn.star.active {
  color: #facc15;
}

.icon-inline {
  width: 18px;
  height: 18px;
}
</style>
