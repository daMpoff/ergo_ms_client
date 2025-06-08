<template>
    <div class="connection-tables">
        <div class="section-title">Таблицы</div>
        <ul class="table-list">
            <template v-if="isLoading">
                <li v-for="n in 4" :key="n" class="table-item loading">
                    <div class="skeleton-icon" />
                    <div class="skeleton-text" />
                </li>
            </template>
            <template v-else>
                <li v-for="file in uploadedFiles" :key="file.id" class="table-item" :class="{ linked: isLinked(file) }" draggable="true" @dragstart="(event) => handleDragStart(file, event)">
                    <Table class="icon red" />
                    <span class="table-name">{{ file.name || (file.schema + '.' + file.table) }}</span>
                </li>
            </template>
        </ul>
        <div v-if="!isLoading && uploadedFiles.length === 0" class="no-data">
            Нет таблиц
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useFileList } from '@/pages/bi/components/js/useFileList'
import { useDbTablesList } from '@/pages/bi/components/js/useDbTablesList'
import { Table } from 'lucide-vue-next'

const props = defineProps({
  connectionId: Number,
  connectionType: String,
  linkedTables: {
    type: Array,
    default: () => []
  }
})

const tempUploadedFiles = ref([])
const selectedFile = ref(null)
const currentUploadFile = ref(null)
const availableSheets = ref([])
const sheetBeingEdited = ref(null)
const isSheetPickerVisible = ref(false)

const isLoading = ref(true)
const uploadedFiles = ref([])

const {
  loadDbTables,
  dbTables,
  isDbLoading
} = useDbTablesList()

const {
  loadUserFiles
} = useFileList(
  ref([]), // tempUploadedFiles
  ref(null), // selectedFile
  uploadedFiles,
  ref(null), // currentUploadFile
  ref([]),   // availableSheets
  ref(null), // sheetBeingEdited
  ref(false) // isSheetPickerVisible
)

function handleDragStart(file, event) {
  event.dataTransfer.setData('application/json', JSON.stringify(file))
}

function getTableKey(table) {
  return `${table.schema || ''}::${table.table || ''}::${table.name || ''}`
}

function isLinked(file) {
  const fileKey = getTableKey(file)
  return props.linkedTables.some(t => getTableKey(t) === fileKey)
}

watch(() => props.connectionId, async (id) => {
  if (!id) return
  isLoading.value = true

  if (props.connectionType === 'file') {
    await loadUserFiles(id)
  } else {
    await loadDbTables(id)
    uploadedFiles.value = dbTables.value
  }

  isLoading.value = false
}, { immediate: true })

</script>

<style scoped lang="scss">
.connection-tables {
    padding: 10px 15px;
    width: 100%;
}

.section-title {
    font-weight: bold;
    color: #e0e0e0;
    margin-bottom: 10px;
}

.table-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
}

.table-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.2s;
  width: 100%;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &:hover,
  :deep(.linked) {
    background-color: rgba(255, 255, 255, 0.05);
  }
}

.table-item.linked {
  background-color: rgba(255, 255, 255, 0.05);
}

.icon {
    width: 16px;
    height: 16px;
    color: #aaa;

    &.red {
        color: #e53935;
    }
}

.table-name {
    font-size: 14px;
    color: #ddd;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.no-data {
    padding: 12px;
    text-align: center;
    font-size: 14px;
    color: #777;
}

.loading {
    pointer-events: none;
    background: transparent !important;
}

.skeleton-icon,
.skeleton-text {
    background-color: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    animation: shimmer 1.3s infinite ease-in-out;
}

.skeleton-icon {
    width: 16px;
    height: 16px;
}

.skeleton-text {
    width: 150px;
    height: 14px;
    margin-left: 10px;
    border-radius: 4px;
}

@keyframes shimmer {
    0% {
        opacity: 0.4;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0.4;
    }
}
</style>
