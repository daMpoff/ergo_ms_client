<template>
  <div class="project-review-summary" v-if="shouldShowReviewSummary">
    <div class="project-review-summary__header">
      <h6 class="mb-0">Результаты проверки экспертной группы</h6>
    </div>
    <div class="project-review-summary__body">
      <div class="review-next-steps" v-if="nextSteps">
        <div class="alert" :class="nextStepsAlertClass">
          <i :class="nextStepsIcon"></i>
          {{ nextSteps.message }}
        </div>
      </div>

      <div class="review-status">
        <div class="review-status-item">
          <i :class="reviewStatusIcon" :style="{ color: reviewStatusColor }"></i>
          <span class="review-status-text">{{ reviewStatusText }}</span>
        </div>
        <div class="review-version-info" v-if="versionInfo">
          <small class="text-muted">
            <i class="bi bi-tag me-1"></i>
            Версия проекта: {{ versionInfo.version_number }}
            <span v-if="versionInfo.title"> - {{ versionInfo.title }}</span>
          </small>
        </div>
      </div>

      <div class="reviewers-info" v-if="reviewersData">
        <div class="reviewers-stats">
          <div class="reviewers-stat-item">
            <span class="reviewers-stat-label">Всего экспертов:</span>
            <span class="reviewers-stat-value">{{ reviewersData.total }}</span>
          </div>
          <div class="reviewers-stat-item" v-if="reviewersData.started > 0">
            <span class="reviewers-stat-label">Работают:</span>
            <span class="reviewers-stat-value in-progress">{{ reviewersData.started }}</span>
          </div>
          <div class="reviewers-stat-item" v-if="reviewersData.completed > 0">
            <span class="reviewers-stat-label">Завершили:</span>
            <span class="reviewers-stat-value completed">{{ reviewersData.completed }}</span>
          </div>
          <div class="reviewers-stat-item" v-if="reviewersData.pending > 0">
            <span class="reviewers-stat-label">Ожидают:</span>
            <span class="reviewers-stat-value pending">{{ reviewersData.pending }}</span>
          </div>
        </div>
      </div>

      <div class="review-comments" v-if="reviewComments && reviewComments.length > 0">
        <h6 class="review-comments-title">
          <i class="bi bi-exclamation-triangle me-1"></i>
          Замечания экспертов
        </h6>
        <div class="review-comments-list">
          <div 
            v-for="(comment, index) in reviewComments" 
            :key="index"
            class="review-comment-item"
          >
            <div class="review-comment-header">
              <span class="review-comment-author">{{ comment.author }}</span>
              <span class="review-comment-date">{{ formatDate(comment.date) }}</span>
            </div>
            <div class="review-comment-text">{{ comment.text }}</div>
            <div class="review-comment-type" v-if="comment.type">
              <span class="badge" :class="getCommentTypeClass(comment.type)">
                {{ getCommentTypeLabel(comment.type) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

// Определяем, нужно ли показывать блок проверки
const shouldShowReviewSummary = computed(() => {
  const pd = props.projectData
  if (!pd) return false
  
  // Показываем для проектов в статусах проверки
  return pd.status === 'pending' || pd.status === 'rejected' || 
         pd.status === 'in_progress' || pd.status === 'needs_revision'
})

// Данные о проверяющих (теперь получаем с API)
const reviewersData = computed(() => {
  const pd = props.projectData
  if (!pd || !pd.current_review) return null
  
  const review = pd.current_review
  return {
    total: review.experts_count || 0,
    reviewed: review.decided_experts_count || 0,
    pending: review.pending_experts_count || 0,
    started: review.started_experts_count || 0,
    completed: review.completed_experts_count || 0
  }
})

// Информация о версии проекта
const versionInfo = computed(() => {
  const pd = props.projectData
  if (!pd || !pd.current_review || !pd.current_review.version_info) return null
  
  return pd.current_review.version_info
})

// Замечания экспертов (моковые данные)
const reviewComments = computed(() => {
  // В реальности эти данные будут приходить с API
  const mockComments = [
    {
      author: 'Иванов И.И.',
      date: '2024-01-15',
      text: 'Необходимо уточнить детали бюджета в разделе 3.2',
      type: 'warning'
    },
    {
      author: 'Петрова А.А.',
      date: '2024-01-16',
      text: 'Отличная проработка технической части проекта',
      type: 'success'
    }
  ]
  return mockComments
})

// Статус проверки
const reviewStatusText = computed(() => {
  const pd = props.projectData
  if (!pd) return ''
  
  if (pd.status === 'pending') {
    return 'Проект ожидает начала проверки экспертной группой'
  } else if (pd.status === 'in_progress') {
    return 'Проект находится в процессе проверки экспертной группой'
  } else if (pd.status === 'rejected') {
    return 'Проект отклонен экспертной группой'
  } else if (pd.status === 'needs_revision') {
    return 'Проект требует доработки по замечаниям экспертов'
  }
  return ''
})

const reviewStatusIcon = computed(() => {
  const pd = props.projectData
  if (!pd) return 'bi bi-clock'
  
  if (pd.status === 'pending') {
    return 'bi bi-clock-history'
  } else if (pd.status === 'in_progress') {
    return 'bi bi-hourglass-split'
  } else if (pd.status === 'rejected') {
    return 'bi bi-x-circle'
  } else if (pd.status === 'needs_revision') {
    return 'bi bi-exclamation-triangle'
  }
  return 'bi bi-clock'
})

const reviewStatusColor = computed(() => {
  const pd = props.projectData
  if (!pd) return '#6c757d'
  
  if (pd.status === 'pending') {
    return '#ffc107'
  } else if (pd.status === 'in_progress') {
    return '#0dcaf0'
  } else if (pd.status === 'rejected') {
    return '#dc3545'
  } else if (pd.status === 'needs_revision') {
    return '#fd7e14'
  }
  return '#6c757d'
})

// Следующие шаги
const nextSteps = computed(() => {
  const pd = props.projectData
  if (!pd) return null
  
  if (pd.status === 'pending') {
    return {
      message: `Ожидается назначение экспертов для проверки`,
      type: 'warning'
    }
  } else if (pd.status === 'in_progress') {
    const pendingCount = reviewersData.value?.pending || 0
    const startedCount = reviewersData.value?.started || 0
    return {
      message: `В процессе проверки: ${startedCount} экспертов работают, ${pendingCount} ожидают`,
      type: 'info'
    }
  } else if (pd.status === 'rejected') {
    return {
      message: 'Необходимо устранить замечания и подать проект на повторное рассмотрение',
      type: 'danger'
    }
  } else if (pd.status === 'needs_revision') {
    return {
      message: 'Необходимо устранить замечания экспертов и подать проект на повторное рассмотрение',
      type: 'warning'
    }
  }
  return null
})

const nextStepsAlertClass = computed(() => {
  if (!nextSteps.value) return ''
  return `alert-${nextSteps.value.type}`
})

const nextStepsIcon = computed(() => {
  if (!nextSteps.value) return ''
  
  if (nextSteps.value.type === 'warning') {
    return 'bi bi-hourglass-split me-2'
  } else if (nextSteps.value.type === 'danger') {
    return 'bi bi-exclamation-triangle me-2'
  } else if (nextSteps.value.type === 'info') {
    return 'bi bi-info-circle me-2'
  }
  return ''
})

// Вспомогательные функции
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU')
}

const getCommentTypeClass = (type) => {
  const classes = {
    'success': 'bg-success',
    'warning': 'bg-warning',
    'danger': 'bg-danger',
    'info': 'bg-info'
  }
  return classes[type] || 'bg-secondary'
}

const getCommentTypeLabel = (type) => {
  const labels = {
    'success': 'Положительно',
    'warning': 'Замечание',
    'danger': 'Критично',
    'info': 'Информация'
  }
  return labels[type] || 'Замечание'
}
</script>

<style scoped lang="scss">
.project-review-summary {
  background: var(--color-primary-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.project-review-summary__header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-secondary-background);
}

.project-review-summary__body {
  padding: 0.75rem 1rem;
}

.review-status {
  margin-bottom: 1rem;
}

.review-status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.review-status-text {
  font-weight: 500;
  color: var(--color-primary-text);
}

.review-version-info {
  margin-left: 1.5rem;
  padding-left: 0.5rem;
  border-left: 2px solid var(--color-border);
}

.reviewers-info {
  margin-bottom: 1rem;
}

.reviewers-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.reviewers-stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.reviewers-stat-label {
  font-size: 0.75rem;
  color: var(--color-secondary-text);
  text-transform: uppercase;
  font-weight: 500;
}

.reviewers-stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary-text);
  
  &.pending {
    color: #ffc107;
  }
  
  &.in-progress {
    color: #0dcaf0;
  }
  
  &.completed {
    color: #198754;
  }
}

.review-comments {
  margin-bottom: 1rem;
}

.review-comments-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-primary-text);
}

.review-comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.review-comment-item {
  padding: 0.75rem;
  background: var(--color-secondary-background);
  border-radius: 6px;
  border-left: 3px solid var(--color-border);
}

.review-comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.review-comment-author {
  font-weight: 500;
  color: var(--color-primary-text);
}

.review-comment-date {
  font-size: 0.75rem;
  color: var(--color-secondary-text);
}

.review-comment-text {
  margin-bottom: 0.5rem;
  color: var(--color-primary-text);
  line-height: 1.4;
}

.review-comment-type {
  display: flex;
  justify-content: flex-end;
}

.review-next-steps {
  .alert {
    margin: 0;
    font-size: 0.875rem;
    border-radius: 6px;
  }
}

// Адаптивность
@media (max-width: 768px) {
  .reviewers-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .review-comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>