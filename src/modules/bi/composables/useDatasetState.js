import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import datasetService from '@/modules/bi/js/datasetService'
import connectionService from '@/modules/bi/js/connectionService'

export function useDatasetState() {
  const route = useRoute()
  const router = useRouter()
  
  // Основное состояние
  const dataset = ref({})
  const origDatasetRef = ref(null)
  const mainTable = ref(null)
  const allTablesOfConnection = ref([])
  const relations = ref([])
  
  // UI состояние
  const activeTab = ref('sources')
  const isPreviewVisible = ref(true)
  const isPreviewLoading = ref(false)
  const saving = ref(false)
  const saveSuccess = ref(false)
  
  // Данные
  const fields = ref([])
  const selectedTables = ref([])
  const previewCols = ref([])
  const previewRows = ref([])
  const previewLimit = ref(10)
  
  // Модальные окна
  const showModal = ref(false)
  const showTableLinkModal = ref(false)
  const showDatasetDialog = ref(false)
  const selectedField = ref(null)
  const editingRelation = ref(null)
  const editingRelationIndex = ref(null)
  
  // Подключения
  const selectedConnection = ref(null)
  const fileUploadsCache = ref([])
  
  // Вычисляемые свойства
  const datasetId = computed(() => route.params.id)
  const isNewPage = computed(() => !datasetId.value)
  const currentDatasetId = computed(() => dataset.value?.id)
  
  const headerName = computed(() =>
    dataset.value?.name || 'Новый датасет'
  )
  
  const canCreateDataset = computed(() =>
    isNewPage.value && !!mainTable.value?.id
  )
  
  const isDirty = computed(() => {
    if (!origDatasetRef.value) return false
    if (selectedConnection.value?.id !== origDatasetRef.value.connection) return true
    if (mainTable.value?.file_id !== origDatasetRef.value.file_source) return true
    
    const origMain = (origDatasetRef.value.tables || []).find(t => t.order === 0)
    const cur = JSON.stringify(normalizeRelations(relations.value))
    const orig = JSON.stringify(normalizeRelations(getRelationsFromDataset(origDatasetRef.value, origMain ? origMain.id : null)))
    
    if (cur !== orig) return true
    if (isFieldsDirty()) return true
    return false
  })
  
  const usedRightTableIds = computed(() =>
    (relations.value || []).map(r => r.rightTableId)
  )
  
  const computedLinkedTableIds = computed(() => {
    if (editingRelation.value?.rightTableId) {
      return usedRightTableIds.value.filter(
        id => String(id) !== String(editingRelation.value.rightTableId)
      )
    }
    return usedRightTableIds.value
  })
  
  // Функции
  function normalizeRelations(rels = []) {
    const normalized = rels
      .map(({ rightTableId, joinType, lines = [] }) => ({
        rightTableId: String(rightTableId),
        joinType: String(joinType),
        lines: lines
          .map(({ left, right }) => ({
            left: String(left),
            right: String(right)
          }))
          .sort((a, b) => (a.left + a.right).localeCompare(b.left + b.right))
      }))
      .sort((a, b) => a.rightTableId.localeCompare(b.rightTableId))
    
    return normalized
  }
  
  function isFieldsDirty() {
    if (!origDatasetRef.value || !Array.isArray(origDatasetRef.value.fields)) {
      return false
    }
    
    const keysToCheck = ['name', 'aggregation', 'type', 'description']
    const origMap = new Map(origDatasetRef.value.fields.map(f => [f.name, f]))
    
    const curNames = new Set(fields.value.map(f => f.name))
    const origNames = new Set(origDatasetRef.value.fields.map(f => f.name))
    
    if (curNames.size !== origNames.size || ![...curNames].every(n => origNames.has(n))) {
      return true
    }
    
    for (const f of fields.value) {
      const orig = origMap.get(f.name)
      if (!orig) return true
      
      for (const key of keysToCheck) {
        if ((f[key] || '') !== (orig[key] || '')) {
          return true
        }
      }
    }
    
    return false
  }
  
  function getRelationsFromDataset(ds, mainTableId) {
    const relationsMap = new Map()
    ;(ds.tables || [])
      .filter(t => t.id !== mainTableId && t.joined_on_type && t.joined_on_left && t.joined_on_right)
      .forEach(t => {
        const rightTableId = t.id
        const line = { left: t.joined_on_left, right: t.joined_on_right }
        
        if (relationsMap.has(rightTableId)) {
          const existing = relationsMap.get(rightTableId)
          if (!existing.lines.some(l => l.left === line.left && l.right === line.right)) {
            existing.lines.push(line)
          }
        } else {
          relationsMap.set(rightTableId, {
            rightTableId: rightTableId,
            joinType: t.joined_on_type?.toLowerCase(),
            lines: [line]
          })
        }
      })
    
    return Array.from(relationsMap.values())
  }
  
  function needsDataset(tab) {
    return tab === 'fields' || tab === 'params'
  }
  
  function tabLabel(tab) {
    return tab === 'fields' ? 'поля' : (tab === 'params' ? 'параметры' : '')
  }
  
  function getTabComponent(tab) {
    const cmp = { fields: 'FieldsPage', params: 'ParamsPage' }[tab] || null
    return cmp
  }
  
  // Экспортируем все необходимые переменные и функции
  return {
    // Состояние
    dataset,
    origDatasetRef,
    mainTable,
    allTablesOfConnection,
    relations,
    activeTab,
    isPreviewVisible,
    isPreviewLoading,
    saving,
    saveSuccess,
    fields,
    selectedTables,
    previewCols,
    previewRows,
    previewLimit,
    showModal,
    showTableLinkModal,
    showDatasetDialog,
    selectedField,
    editingRelation,
    editingRelationIndex,
    selectedConnection,
    fileUploadsCache,
    
    // Вычисляемые свойства
    datasetId,
    isNewPage,
    currentDatasetId,
    headerName,
    canCreateDataset,
    isDirty,
    usedRightTableIds,
    computedLinkedTableIds,
    
    // Функции
    normalizeRelations,
    isFieldsDirty,
    getRelationsFromDataset,
    needsDataset,
    tabLabel,
    getTabComponent
  }
}
