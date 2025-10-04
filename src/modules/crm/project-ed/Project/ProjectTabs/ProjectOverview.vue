<template>
    <div class="overview-grid">
        <div class="overview-main">
            <!-- Дашборд проекта -->
            <ProjectDashboard :project-data="projectData" />
            
            <div class="placeholder-card">
                <div class="placeholder-card__header">
                    <h6 class="mb-0">Ход работ</h6>
                </div>
                <div class="placeholder-card__body">
                    <p class="mb-0 text-muted">Сводка задач, прогресса и активностей.</p>
                </div>
            </div>
            
            <!-- Информация о проекте -->
            <ProjectInfoDetails :project-data="projectData" />
        </div>
        <aside class="overview-aside">
            <ProjectInfoActionBar 
              :project-data="projectData"
              @project-submitted="onProjectSubmitted"
            />
            <ProjectInfo 
              :project-roles="projectRoles" 
              :status-label="projectStatusLabel" 
              :status-variant="projectStatusVariant"
              :start-date="projectStartDate"
              :end-date="projectEndDate"
              :performers="projectPerformers"
            />
        </aside>
    </div>
    
    
</template>

<script setup>
import { computed } from 'vue'
import ProjectDashboard from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectDashboard.vue'
import ProjectInfo from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectInfo.vue'
import ProjectInfoActionBar from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectInfoActionBar.vue'
import ProjectInfoDetails from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectInfoDetails.vue'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

const projectRoles = computed(() => {
  if (!props.projectData) {
    return {
      manager: null,
      client: null,
      curator: null
    }
  }
  
  return {
    manager: props.projectData.manager_data ? {
      full_name: `${props.projectData.manager_data.first_name || ''} ${props.projectData.manager_data.last_name || ''}`.trim() || props.projectData.manager_data.username,
      avatar_url: props.projectData.manager_data.avatar_url
    } : null,
    client: props.projectData.customer_data ? {
      full_name: `${props.projectData.customer_data.first_name || ''} ${props.projectData.customer_data.last_name || ''}`.trim() || props.projectData.customer_data.username,
      avatar_url: props.projectData.customer_data.avatar_url
    } : null,
    curator: props.projectData.curator_data ? {
      full_name: `${props.projectData.curator_data.first_name || ''} ${props.projectData.curator_data.last_name || ''}`.trim() || props.projectData.curator_data.username,
      avatar_url: props.projectData.curator_data.avatar_url
    } : null
  }
})

const projectStatusLabel = computed(() => {
  if (!props.projectData) return ''
  const map = {
    draft: 'Черновик',
    pending: 'На утверждении',
    rejected: 'Отклонен',
    active: 'В работе',
    completed: 'Завершен'
  }
  const raw = props.projectData.status
  return map[raw] || raw || ''
})

const projectStatusVariant = computed(() => {
  if (!props.projectData) return 'secondary'
  const map = {
    draft: 'secondary',
    pending: 'warning',
    rejected: 'danger',
    active: 'primary',
    completed: 'success'
  }
  const raw = props.projectData.status
  return map[raw] || 'secondary'
})

const projectStartDate = computed(() => {
  if (!props.projectData) return ''
  const d = props.projectData.start_date || props.projectData.start_at || props.projectData.start || props.projectData.startDate
  return d || ''
})

const projectEndDate = computed(() => {
  if (!props.projectData) return ''
  const d = props.projectData.end_date || props.projectData.end_at || props.projectData.end || props.projectData.endDate || props.projectData.deadline
  return d || ''
})

const projectPerformers = computed(() => {
  return Array.isArray(props.projectData?.performers) ? props.projectData.performers : []
})

// Обработчик события отправки проекта на рассмотрение
const onProjectSubmitted = (updatedProjectData) => {
  // Эмитим событие наверх для обновления данных проекта
  emit('project-updated', updatedProjectData)
}

const emit = defineEmits(['project-updated'])
</script>

<style scoped lang="scss">
.overview-grid {
  display: grid;
  grid-template-columns: 1fr 340px; /* основная колонка + правая панель */
  gap: 1rem;
}

.overview-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.placeholder-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.placeholder-card__header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: #f8f9fa;
}

.placeholder-card__body {
  padding: 0.75rem 1rem;
}

.overview-aside {
  position: sticky;
  top: 0.75rem;
  align-self: start;
}
</style>