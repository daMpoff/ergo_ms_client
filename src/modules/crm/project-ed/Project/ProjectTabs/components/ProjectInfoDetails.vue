<template>
  <BaseInfoCard 
    title="Основная информация" 
    :project-data="projectData"
    @edit-click="openEditModal"
  >
    
    <div class="info-section">
      <h5 class="section-title">
        <Edit class="section-icon" />
        Уточняющее название
      </h5>
      <div class="section-content">
        <p v-if="clarifyingTitle" class="clarifying-title-text">{{ clarifyingTitle }}</p>
        <p v-else class="text-muted">Уточняющее название не указано</p>
      </div>
    </div>

    <div class="info-section">
      <h5 class="section-title">
        <Target class="section-icon" />
        Цель проекта
      </h5>
      <div class="section-content">
        <p v-if="projectGoal" class="goal-text">{{ projectGoal }}</p>
        <p v-else class="text-muted">Цель проекта не указана</p>
      </div>
    </div>

    <div class="info-section">
      <h5 class="section-title">
        <List class="section-icon" />
        Задачи проекта
      </h5>
      <div class="section-content">
        <div v-if="loadingTasks" class="loading-state">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
          <span class="ms-2">Загрузка задач...</span>
        </div>
        <div v-else-if="projectTasks && projectTasks.length > 0" class="tasks-list">
          <div 
            v-for="(task, index) in projectTasks" 
            :key="task.id || index"
            class="task-item"
          >
            <span class="task-number">{{ index + 1 }}.</span>
            <div class="task-content">
              <span class="task-text">{{ task.title }}</span>
              <span v-if="task.description" class="task-description">{{ task.description }}</span>
            </div>
          </div>
        </div>
        <p v-else class="text-muted">Задачи проекта не найдены</p>
      </div>
    </div>

    <div class="info-section">
      <h5 class="section-title">
        <CheckCircle class="section-icon" />
        Планируемые результаты
      </h5>
      <div class="section-content">
        <div v-if="projectResults && projectResults.length > 0" class="results-list">
          <div 
            v-for="(result, index) in projectResults" 
            :key="index"
            class="result-item"
          >
            <Check class="result-icon" />
            <span class="result-text">{{ result }}</span>
          </div>
        </div>
        <p v-else class="text-muted">Планируемые результаты не указаны</p>
      </div>
    </div>

    
  </BaseInfoCard>

  <!-- Модальное окно редактирования основной информации -->
  <div v-if="showEditModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0, 0, 0, 0.5); z-index: 9999;">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Редактирование основной информации</h5>
          <button type="button" class="btn-close" @click="closeEditModal" :disabled="isSaving"></button>
        </div>
        <div class="modal-body">
          <BasicProvisions 
            ref="basicProvisionsRef"
            :provisions="editProvisions"
            :user-role="userRole"
            :selected-event="selectedEvent"
            :user-info="userInfo"
            :rector-info="rectorInfo"
            @update:provisions="updateEditProvisions"
          />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeEditModal" :disabled="isSaving">
            Отмена
          </button>
          <button type="button" class="btn btn-primary" @click="saveChanges" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { Target, List, CheckCircle, Check, Edit } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import BaseInfoCard from '@/modules/crm/project-ed/Project/ProjectTabs/components/BaseInfoCard.vue'
import BasicProvisions from '@/modules/crm/project-ed/components/steps/BasicProvisions.vue'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  },
  userRole: {
    type: String,
    default: null
  },
  userInfo: {
    type: Object,
    default: null
  },
  rectorInfo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['project-updated'])

const toast = useToast()

// Состояние модального окна
const showEditModal = ref(false)
const isSaving = ref(false)
const basicProvisionsRef = ref(null)

// Данные для редактирования
const editProvisions = ref({})
const selectedEvent = ref(null)

const projectTasks = ref([])
const loadingTasks = ref(false)

const clarifyingTitle = computed(() => {
  if (!props.projectData) return ''
  
  // Используем поле name_clarification из модели Project
  return props.projectData.name_clarification || ''
})

const projectGoal = computed(() => {
  if (!props.projectData) return ''
  
  // Пробуем разные возможные поля для цели проекта
  return props.projectData.goal || 
         props.projectData.objective || 
         props.projectData.description || 
         props.projectData.purpose || 
         ''
})

const projectResults = computed(() => {
  if (!props.projectData) return []
  
  // Используем данные из project_ed API
  if (props.projectData.planned_results && Array.isArray(props.projectData.planned_results)) {
    return props.projectData.planned_results.map(result => result.description)
  }
  
  // Fallback на другие возможные поля
  const results = props.projectData.results || 
                  props.projectData.expected_results || 
                  props.projectData.deliverables || 
                  props.projectData.outcomes || 
                  []
  
  // Если это строка, разделяем по переносам строк или запятым
  if (typeof results === 'string') {
    return results.split(/[\n,;]/).map(result => result.trim()).filter(result => result)
  }
  
  // Если это массив, возвращаем как есть
  return Array.isArray(results) ? results : []
})

// Раздел "Дополнительная информация" перенесен в отдельный компонент ProjectInfoAdditionalInfo

// Загружаем задачи проекта из данных (они уже приходят с проектом)
const loadProjectTasks = () => {
  if (!props.projectData?.tasks) {
    projectTasks.value = []
    return
  }
  
  // Преобразуем задачи из project_ed API в нужный формат
  projectTasks.value = props.projectData.tasks.map(task => ({
    id: task.id,
    title: task.description,
    description: '' // У project_ed задач нет отдельного описания
  }))
}


// Загружаем задачи при изменении данных проекта
watch(() => props.projectData?.tasks, () => {
  loadProjectTasks()
}, { immediate: true })

// Функции для управления прокруткой страницы
const disableBodyScroll = () => {
  document.body.style.overflow = 'hidden'
}

const enableBodyScroll = () => {
  document.body.style.overflow = ''
}

// Следим за состоянием модального окна и управляем прокруткой
watch(showEditModal, (isOpen) => {
  if (isOpen) {
    disableBodyScroll()
  } else {
    enableBodyScroll()
  }
})

// Загружаем задачи при монтировании компонента
onMounted(() => {
  loadProjectTasks()
})

// Восстанавливаем прокрутку при размонтировании компонента
onUnmounted(() => {
  enableBodyScroll()
})

// Методы для работы с модальным окном
const openEditModal = async () => {
  if (!props.projectData) {
    toast.error('Данные проекта не загружены')
    return
  }

  try {
    // Отладочная информация для отслеживания проблемы с названием
    console.log('=== ProjectInfoDetails: Отладка названия проекта ===')
    console.log('ProjectInfoDetails: Полные данные проекта:', props.projectData)
    console.log('ProjectInfoDetails: props.projectData.name =', props.projectData.name)
    console.log('ProjectInfoDetails: props.projectData.short_name =', props.projectData.short_name)
    console.log('ProjectInfoDetails: props.projectData.name_clarification =', props.projectData.name_clarification)
    console.log('ProjectInfoDetails: props.projectData.full_name =', props.projectData.full_name)
    console.log('ProjectInfoDetails: props.projectData.title =', props.projectData.title)
    
    // Проверяем все поля, которые могут содержать название
    const possibleNameFields = ['name', 'short_name', 'name_clarification', 'full_name', 'title', 'project_name', 'display_name']
    console.log('ProjectInfoDetails: Проверка возможных полей с названием:')
    possibleNameFields.forEach(field => {
      console.log(`  ${field}:`, props.projectData[field])
    })
    
    // Выводим все поля объекта для полной картины
    console.log('ProjectInfoDetails: Все доступные поля проекта:', Object.keys(props.projectData || {}))
    
    // Загружаем данные мероприятия, если есть event_id
    if (props.projectData.event_id) {
      const eventResp = await apiClient.get(endpoints.project_ed.events.detail(props.projectData.event_id))
      selectedEvent.value = eventResp.data
    }

    // Подготавливаем данные для редактирования
    const projectName = props.projectData.name || ''
    
    console.log('ProjectInfoDetails: Выбранное название для редактирования:', projectName)
    console.log('ProjectInfoDetails: Длина названия:', projectName.length)
    console.log('ProjectInfoDetails: Тип названия:', typeof projectName)
    
    editProvisions.value = {
      projectName: projectName,
      projectNameClarification: props.projectData.name_clarification || '',
      shortName: props.projectData.short_name || '',
      projectGoal: props.projectData.goal || props.projectData.objective || props.projectData.description || '',
      projectTasks: props.projectData.tasks ? props.projectData.tasks.map(task => task.description || task.title || '') : ['', ''],
      startDate: props.projectData.start_date || '',
      endDate: props.projectData.end_date || '',
      curator: props.projectData.curator_id || null,
      customer: props.projectData.customer_name || '',
      customerId: props.projectData.customer_id || null,
      manager: props.projectData.manager_name || '',
      executors: Array.isArray(props.projectData.performers)
        ? props.projectData.performers
            .map(p => (p && typeof p === 'object' ? p.id : p))
            .filter(Boolean)
        : [],
      plannedResults: props.projectData.planned_results ? 
        props.projectData.planned_results.map(result => result.description || result) : 
        ['', ''],
      comments: {
        projectName: '',
        shortName: '',
        projectGoal: '',
        projectTasks: '',
        projectDates: '',
        curator: '',
        customer: '',
        manager: '',
        executors: '',
        plannedResults: ''
      }
    }

    console.log('ProjectInfoDetails: Итоговые данные для редактирования:', editProvisions.value)
    console.log('ProjectInfoDetails: Открываем модальное окно...')

    showEditModal.value = true
  } catch (error) {
    console.error('Ошибка при открытии модального окна редактирования:', error)
    toast.error('Не удалось загрузить данные для редактирования')
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editProvisions.value = {}
  selectedEvent.value = null
  // Прокрутка будет восстановлена автоматически через watch
}

const updateEditProvisions = (newProvisions) => {
  editProvisions.value = { ...newProvisions }
}

const saveChanges = async () => {
  if (!props.projectData?.id) {
    toast.error('ID проекта не найден')
    return
  }

  isSaving.value = true

  try {
    // Подготавливаем данные для отправки
    const updateData = {
      name: editProvisions.value.projectName,
      name_clarification: editProvisions.value.projectNameClarification,
      short_name: editProvisions.value.shortName,
      goal: editProvisions.value.projectGoal,
      start_date: editProvisions.value.startDate,
      end_date: editProvisions.value.endDate,
      curator_id: editProvisions.value.curator,
      customer_id: editProvisions.value.customerId,
      planned_results: Array.isArray(editProvisions.value.plannedResults)
        ? editProvisions.value.plannedResults
            .map((res, idx) => {
              const description = typeof res === 'string' ? res : (res?.description || '')
              return { description: (description || '').trim(), order: idx }
            })
            .filter(item => item.description)
        : [],
      tasks: Array.isArray(editProvisions.value.projectTasks)
        ? editProvisions.value.projectTasks
            .map((t, idx) => {
              const description = typeof t === 'string' ? t : (t?.description || t?.title || '')
              return { description: (description || '').trim(), order: idx }
            })
            .filter(item => item.description)
        : [],
      executors: Array.isArray(editProvisions.value.executors)
        ? editProvisions.value.executors
            .map(id => {
              const n = Number(id)
              return Number.isFinite(n) ? n : null
            })
            .filter(Boolean)
        : []
    }

    // Обновляем проект
    await apiClient.patch(endpoints.project_ed.projects.detail(props.projectData.id), updateData)

    toast.success('Основная информация проекта успешно обновлена')
    closeEditModal()
    
    // Уведомляем родительский компонент об обновлении
    emit('project-updated')

  } catch (error) {
    console.error('Ошибка при сохранении изменений:', error)
    const errorMessage = error.response?.data?.detail || error.message || 'Произошла ошибка при сохранении'
    toast.error(`Не удалось сохранить изменения: ${errorMessage}`)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped lang="scss">
.info-section {
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary-text);
  line-height: 1.2;
}

.section-icon {
  width: 18px;
  height: 18px;
  color: var(--color-primary-text);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-content {
  margin-left: 1.5rem;
}

.clarifying-title-text {
  line-height: 1.6;
  color: var(--color-primary-text);
  margin-bottom: 0;
  font-weight: 500;
}

.goal-text {
  line-height: 1.6;
  color: var(--color-primary-text);
  margin-bottom: 0;
}

.loading-state {
  display: flex;
  align-items: center;
  color: var(--color-secondary-text);
  padding: 1rem 0;
}

.tasks-list {
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  display: flex;
  align-items: center;
}

.task-number {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--color-primary-text);
  min-width: 1.5rem;
  flex-shrink: 0;
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.task-text {
  color: var(--color-primary-text);
  font-weight: 500;
  line-height: 1.4;
}

.task-description {
  color: var(--color-secondary-text);
  font-size: 0.875rem;
  line-height: 1.4;
}


.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  line-height: 1.5;
}

.result-icon {
  width: 16px;
  height: 16px;
  color: var(--color-success);
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.result-text {
  color: var(--color-primary-text);
  flex: 1;
}

.text-muted {
  color: var(--color-secondary-text);
  font-style: italic;
  margin-bottom: 0;
}

.additional-info-text {
  line-height: 1.6;
  color: var(--color-primary-text);
  margin-bottom: 0;
  white-space: pre-wrap;
}

/* Стили для модального окна */
.modal-content {
  background-color: var(--color-primary-background);
}

.modal-body {
  background-color: var(--color-primary-background);
}
</style>
