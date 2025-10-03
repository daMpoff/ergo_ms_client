<template>
    <div class="overview-grid">
        <div class="overview-main">
            <!-- Здесь позже будут дашборды и метрики проекта -->
            <div class="placeholder-card">
                <h5 class="mb-2">Дашборды проекта</h5>
                <p class="mb-0 text-muted">Здесь отобразим ключевые метрики проекта.</p>
            </div>
            <div class="placeholder-card">
                <h5 class="mb-2">Ход работ</h5>
                <p class="mb-0 text-muted">Сводка задач, прогресса и активностей.</p>
            </div>
        </div>
        <aside class="overview-aside">
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
import ProjectInfo from '@/modules/crm/project-ed/Project/ProjectTabs/components/ProjectInfo.vue'

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
  padding: 1rem;
}

.overview-aside {
  position: sticky;
  top: 0.75rem;
  align-self: start;
}
</style>