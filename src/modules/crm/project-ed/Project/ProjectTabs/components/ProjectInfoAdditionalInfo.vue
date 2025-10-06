<template>
  <BaseInfoCard title="Дополнительная информация" :project-data="projectData" @edit-click="openEditModal">
    <div class="section-content" v-if="!isUpdating">
      <template v-if="hasStructuredInfo">
        <div class="info-list">
          <div v-if="risks" class="info-item">
            <AlertTriangle class="item-icon" />
            <div class="item-body">
              <div class="item-title">Риски</div>
              <p class="item-text">{{ risks }}</p>
            </div>
          </div>
          <div v-if="resources" class="info-item">
            <Package class="item-icon" />
            <div class="item-body">
              <div class="item-title">Ресурсы</div>
              <p class="item-text">{{ resources }}</p>
            </div>
          </div>
          <div v-if="notes" class="info-item">
            <StickyNote class="item-icon" />
            <div class="item-body">
              <div class="item-title">Заметки</div>
              <p class="item-text">{{ notes }}</p>
            </div>
          </div>
        </div>
      </template>
      <p v-else-if="displayedAdditionalInfo" class="additional-info-text">{{ displayedAdditionalInfo }}</p>
      <p v-else class="text-muted">Дополнительная информация не указана</p>
    </div>
    <div class="section-content d-flex align-items-center justify-content-center py-4" v-else>
      <div class="d-flex flex-column align-items-center text-center">
        <div class="spinner-border text-primary mb-2" role="status" aria-label="Загрузка">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <div class="text-muted">Обновляем данные...</div>
      </div>
    </div>
  </BaseInfoCard>
  
  <!-- Модальное окно редактирования раздела (как в TargetIndicatorsPage.vue) -->
  <div class="modal fade" :class="{ 'show d-block': showModal }" tabindex="-1" v-if="showModal">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Дополнительная информация</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <AdditionalInfo v-model:info="localInfo" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleCancel" :disabled="isSaving">Отменить</button>
          <button type="button" class="btn btn-primary" @click="handleSave" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <span>{{ isSaving ? 'Сохранение...' : 'Сохранить' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade" :class="{ 'show': showModal }" v-if="showModal"></div>
  
</template>

<script setup>
import { computed, ref } from 'vue'
import { AlertTriangle, Package, StickyNote } from 'lucide-vue-next'
import BaseInfoCard from '@/modules/crm/project-ed/Project/ProjectTabs/components/BaseInfoCard.vue'
import AdditionalInfo from '@/modules/crm/project-ed/components/steps/AdditionalInfo.vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import { useToast } from 'vue-toastification'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

const risks = computed(() => props.projectData?.risks || '')
const resources = computed(() => props.projectData?.resources || '')
const notes = computed(() => props.projectData?.notes || '')

const hasStructuredInfo = computed(() => !!(risks.value || resources.value || notes.value))

const additionalInfo = computed(() => {
  if (!props.projectData) return ''
  return props.projectData.additional_info || props.projectData.additionalInfo || ''
})

// Локально отображаемый текст (обновляется сразу после сохранения)
const displayedAdditionalInfo = ref('')
displayedAdditionalInfo.value = additionalInfo.value

// Данные для формы в модальном окне (используем ref, чтобы v-model заменял объект)
const localInfo = ref({
  additionalInfo: additionalInfo.value || ''
})

const showModal = ref(false)
const isSaving = ref(false)
const isUpdating = ref(false)
const emit = defineEmits(['saved', 'cancelled'])
const toast = useToast()

function openEditModal() {
  // Инициализируем локальное значение при открытии
  localInfo.value = { additionalInfo: additionalInfo.value || '' }
  showModal.value = true
}
function closeModal() { showModal.value = false }

function handleCancel() {
  emit('cancelled')
  closeModal()
}

async function handleSave() {
  if (!props.projectData?.id) {
    toast.error('Не удалось определить проект')
    return
  }
  try {
    isSaving.value = true
    isUpdating.value = true
    const payload = { additional_info: localInfo.value.additionalInfo || '' }
    await apiClient.patch(endpoints.project_ed.projects.update(props.projectData.id), payload)
    toast.success('Изменения сохранены')
    emit('saved', { ...localInfo.value })
    // Сообщаем контейнеру аудита о необходимости перезагрузки
    try {
      const projectId = props.projectData.id
      window.dispatchEvent(new CustomEvent('project-audit:reload', { detail: { projectId } }))
    } catch (err) {
      // no-op: безопасный фоллбек, если window недоступен
    }
    // Мгновенно обновляем отображение в контейнере
    displayedAdditionalInfo.value = localInfo.value.additionalInfo || ''
    closeModal()
  } catch (e) {
    toast.error('Ошибка при сохранении изменений')
  } finally {
    isSaving.value = false
    // Небольшая задержка для ощущения обновления
    setTimeout(() => { isUpdating.value = false }, 300)
  }
}
</script>

<style scoped lang="scss">
.section-content {
  margin-left: 0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.item-icon {
  width: 18px;
  height: 18px;
  color: var(--color-primary-text);
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.item-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-title {
  font-weight: 600;
  color: var(--color-primary-text);
}

.item-text {
  margin: 0;
  color: var(--color-primary-text);
  line-height: 1.6;
  white-space: pre-wrap;
}

.additional-info-text {
  line-height: 1.6;
  color: var(--color-primary-text);
  margin-bottom: 0;
  white-space: pre-wrap;
}

.text-muted {
  color: var(--color-secondary-text);
  font-style: italic;
  margin-bottom: 0;
}
</style>


