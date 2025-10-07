<template>
  <BaseInfoCard title="Целевые показатели" :project-data="projectData" @edit-click="openEditModal">
      <div class="info-section">
        <div class="section-content">
          <div v-if="loadingIndicators" class="loading-state">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Загрузка...</span>
            </div>
            <span class="ms-2">Загрузка показателей...</span>
          </div>
          <div v-else-if="targetIndicators && targetIndicators.length > 0" class="indicators-list">
            <div 
              v-for="(indicator, index) in targetIndicators" 
              :key="indicator.id || index"
              class="indicator-card"
            >
              <div class="indicator-header">
                <h6 class="indicator-title">
                  <Target class="indicator-icon" />
                  {{ indicator.name }}
                </h6>
                <div v-if="indicator.unit" class="indicator-unit">
                  {{ indicator.unit }}
                </div>
              </div>
              <div class="indicator-body">
                <div class="indicator-values">
                  <div v-if="indicator.baseline !== null && indicator.baseline !== undefined" class="value-item">
                    <span class="value-label">Базовое значение:</span>
                    <span class="value-number">{{ formatValue(indicator.baseline) }}</span>
                  </div>
                  <div v-if="indicator.planned !== null && indicator.planned !== undefined" class="value-item">
                    <span class="value-label">Планируемое значение:</span>
                    <span class="value-number planned">{{ formatValue(indicator.planned) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-muted">Целевые показатели не указаны</p>
        </div>
      </div>
  </BaseInfoCard>

  <ModalCenter :title="'Редактирование целевых показателей'" :modal-id="modalId" :dialog-class="'modal-xl'" @closemodal="onModalClose">
    <form @submit.prevent="onSave" class="d-flex flex-column gap-2">
      <TargetIndicators
        :indicators="editIndicators"
        :selectedEvent="selectedEventForIndicators"
        @update:indicators="val => (editIndicators = val)"
      />

      <div class="d-flex justify-content-end gap-2 mt-2">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
        <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Сохранение…' : 'Сохранить' }}</button>
      </div>
    </form>
  </ModalCenter>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { Target } from 'lucide-vue-next'
import BaseInfoCard from '@/modules/crm/project-ed/Project/ProjectTabs/components/BaseInfoCard.vue'
import ModalCenter from '@/components/ModalCenter.vue'
import TargetIndicators from '@/modules/crm/project-ed/components/steps/TargetIndicators.vue'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import { Modal } from 'bootstrap'
import { useToast } from 'vue-toastification'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

const targetIndicators = ref([])
const loadingIndicators = ref(false)
const saving = ref(false)
const toast = useToast()

const modalId = 'editTargetIndicatorsModal'
let modalInstance = null
const editIndicators = ref([])

const selectedEventForIndicators = computed(() => {
  const blockId = props.projectData?.event_block_id || props.projectData?.event_block || null
  const eventId = props.projectData?.event_id || props.projectData?.event || null
  return { blockId, eventId }
})

// Загружаем целевые показатели проекта из данных
const loadTargetIndicators = () => {
  if (!props.projectData?.target_indicators) {
    targetIndicators.value = []
    return
  }
  
  targetIndicators.value = props.projectData.target_indicators.map(indicator => ({
    id: indicator.id,
    name: indicator.display_name || indicator.name || 'Не указано',
    unit: indicator.display_unit || indicator.unit || '',
    baseline: indicator.baseline,
    planned: indicator.planned,
    source_indicator: indicator.source_indicator
  }))
}

// Форматирование числового значения
const formatValue = (value) => {
  if (value === null || value === undefined) return ''
  
  // Если это число, форматируем с разделителями тысяч
  if (typeof value === 'number') {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value)
  }
  
  // Если это строка, пытаемся преобразовать в число
  const numValue = parseFloat(value)
  if (!isNaN(numValue)) {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue)
  }
  
  return String(value)
}


// Загружаем показатели при изменении данных проекта
watch(() => props.projectData?.target_indicators, () => {
  loadTargetIndicators()
}, { immediate: true })

// Загружаем показатели при монтировании компонента
onMounted(() => {
  loadTargetIndicators()
})

function ensureModal() {
  if (modalInstance) return modalInstance
  try {
    const el = document.getElementById(modalId)
    if (el) {
      modalInstance = new Modal(el)
    }
  } catch (_) {}
  return modalInstance
}

function openEditModal() {
  // Инициализируем данные для редактирования из текущих показателей
  editIndicators.value = (targetIndicators.value || []).map(it => ({
    // Если indicator привязан к справочному показателю блока, backend отдает его id в поле source_indicator
    // SelectBox ожидает value из options: it.id || it.code || it.name — поэтому передаем строковый id
    name: (Number.isFinite(Number(it.source_indicator)) ? String(Number(it.source_indicator)) : String(it.name || '')),
    unit: it.unit || '',
    baseValue: it.baseline != null ? Number(it.baseline) : 0,
    targetValue: it.planned != null ? Number(it.planned) : 0,
    isCustom: !(Number.isFinite(Number(it.source_indicator)) && Number(it.source_indicator) > 0),
  }))
  // Гарантируем хотя бы одну строку
  if (!editIndicators.value.length) {
    editIndicators.value = [{ name: '', unit: '', baseValue: 0, targetValue: 0, isCustom: true }]
  }
  nextTick(() => {
    const m = ensureModal()
    if (m) m.show()
  })
}

function onModalClose() {
  // noop for now
}

function mapIndicatorsToPayload(items) {
  return (items || []).map(it => {
    const maybeId = Number(it.name)
    const source_indicator_id = (!it.isCustom && Number.isFinite(maybeId)) ? maybeId : null
    return {
      source_indicator_id,
      name: it.isCustom ? String(it.name || '') : '',
      unit: String(it.unit || ''),
      baseline: it.baseValue != null && it.baseValue !== '' ? Number(it.baseValue) : null,
      planned: it.targetValue != null && it.targetValue !== '' ? Number(it.targetValue) : null,
    }
  })
}

async function onSave() {
  if (!props.projectData?.id) return
  saving.value = true
  try {
    const payload = { target_indicators: mapIndicatorsToPayload(editIndicators.value) }
    const resp = await apiClient.patch(endpoints.project_ed.projects.update(props.projectData.id), payload)
    const data = resp?.data || {}
    const latestIndicators = Array.isArray(data?.target_indicators) ? data.target_indicators : (data?.target_indicators_rel || [])
    if (Array.isArray(latestIndicators)) {
      // Обновляем локальный список для немедленного отображения
      targetIndicators.value = latestIndicators.map(indicator => ({
        id: indicator.id,
        name: indicator.display_name || indicator.name || 'Не указано',
        unit: indicator.display_unit || indicator.unit || '',
        baseline: indicator.baseline,
        planned: indicator.planned,
        source_indicator: indicator.source_indicator
      }))
    }
    // Сообщаем другим виджетам обновить аудит
    try {
      const evt = new CustomEvent('project-audit:reload', { detail: { projectId: props.projectData.id } })
      window.dispatchEvent(evt)
    } catch (_) {}
    // Закрываем модалку
    const m = ensureModal()
    if (m) m.hide()
    try { toast.success('Целевые показатели обновлены') } catch (_) {}
  } catch (e) {
    try { toast.error('Не удалось сохранить целевые показатели') } catch (_) {}
  } finally {
    saving.value = false
  }
}

onBeforeUnmount(() => {
  try {
    if (modalInstance) {
      modalInstance.dispose?.()
      modalInstance = null
    }
  } catch (_) {}
})
</script>

<style scoped lang="scss">
.info-section {
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.loading-state {
  display: flex;
  align-items: center;
  color: var(--color-secondary-text);
  padding: 1rem 0;
}

.indicators-list {
  display: grid;
  gap: 1rem;
}

.indicator-card {
  background: var(--color-primary-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
}

.indicator-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-secondary-background);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
    .indicator-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.3;
      color: var(--color-primary-text);
      
      .indicator-icon {
        width: 16px;
        height: 16px;
        color: var(--color-primary-text);
        flex-shrink: 0;
      }
      
    }
  
  .indicator-unit {
    color: var(--color-primary-text);
    padding: 0.25rem 0.15rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    flex-shrink: 0;
  }
}

.indicator-body {
  padding: 1rem 1.25rem;
}

.indicator-values {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.value-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .value-label {
    color: var(--color-secondary-text);
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .value-number {
    color: var(--color-primary-text);
    font-size: 0.875rem;
    font-weight: 600;
    
    &.planned {
      color: var(--color-primary-text);
    }
  }
}


.text-muted {
  color: var(--color-secondary-text);
  font-style: italic;
  margin-bottom: 0;
}

// Адаптивность для мобильных устройств
@media (max-width: 768px) {
  .indicator-card {
    border-radius: 8px;
  }
  
  .indicator-header {
    padding: 0.75rem 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    
    .indicator-title {
      font-size: 0.9rem;
    }
    
    .indicator-unit {
      font-size: 0.7rem;
    }
  }
  
  .indicator-body {
    padding: 0.75rem 1rem;
  }
  
  .indicator-values {
    gap: 0.5rem;
  }
  
  .value-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    
    .value-label,
    .value-number {
      font-size: 0.8rem;
    }
  }
  
}
</style>
