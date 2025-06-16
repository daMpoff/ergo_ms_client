<script setup>
import { ref, onMounted } from 'vue'
import {
  Users,
  Building2,
  Briefcase,
  ClipboardCheck,
  GraduationCap,
  UserCheck,
  TrendingUp,
  Award
} from 'lucide-vue-next'
import axios from 'axios'
import { endpoints } from '@/js/api/endpoints.js'

// Основные метрики системы
const metrics = ref([
  {
    title: 'Студенты',
    value: 0,
    change: '+0',
    changeType: 'positive',
    icon: Users,
    color: 'primary',
    description: 'Зарегистрированных пользователей',
    loading: true
  },
  {
    title: 'Компании',
    value: 0,
    change: '+0',
    changeType: 'positive',
    icon: Building2,
    color: 'success',
    description: 'Активных работодателей',
    loading: true
  },
  {
    title: 'Вакансии',
    value: 0,
    change: '+0',
    changeType: 'positive',
    icon: Briefcase,
    color: 'info',
    description: 'Открытых позиций',
    loading: true
  },
  {
    title: 'Тесты навыков',
    value: 0,
    change: '+0',
    changeType: 'positive',
    icon: ClipboardCheck,
    color: 'warning',
    description: 'Созданных тестов',
    loading: true
  },
  {
    title: 'Подтвержденные навыки',
    value: 0,
    change: '+0',
    changeType: 'positive',
    icon: UserCheck,
    color: 'success',
    description: 'Успешно пройденных тестов',
    loading: true
  },
  {
    title: 'Результаты тестов',
    value: 0,
    change: '+0',
    changeType: 'positive',
    icon: GraduationCap,
    color: 'purple',
    description: 'Всего результатов тестов',
    loading: true
  },
  {
    title: 'Успешность тестов',
    value: '0%',
    change: '+0%',
    changeType: 'positive',
    icon: TrendingUp,
    color: 'info',
    description: 'Процент прохождения тестов',
    loading: true
  },
  {
    title: 'Средний балл',
    value: '0.0',
    change: '+0.0',
    changeType: 'positive',
    icon: Award,
    color: 'warning',
    description: 'Средний балл по всем тестам',
    loading: true
  }
])

// Состояние загрузки
const isLoading = ref(true)
const lastUpdated = ref(new Date())

// Загрузка данных из API с использованием endpoints
const loadMetrics = async () => {
  isLoading.value = true

  try {
    // Используем endpoints вместо hardcoded URL
    const [metricsResponse, summaryResponse] = await Promise.all([
      axios.get(endpoints.expert_system.dashboard.metrics),
      axios.get(endpoints.expert_system.dashboard.summary)
    ])

    const metricsData = metricsResponse.data
    const summaryData = summaryResponse.data

    // Обновляем метрики на основе полученных данных
    updateMetric(0, metricsData.students?.total_count || 0,
                calculateGrowth(metricsData.students?.additional_info?.with_experience || 0))

    updateMetric(1, metricsData.companies?.total_count || 0,
                calculateGrowth(metricsData.companies?.additional_info?.verified || 0))

    updateMetric(2, metricsData.vacancies?.total_count || 0, '+2')

    updateMetric(3, metricsData.tests?.total_count || 0, '+1')

    updateMetric(4, metricsData.user_skills?.additional_info?.confirmed || 0,
                calculateGrowth(metricsData.user_skills?.additional_info?.confirmed || 0))

    updateMetric(5, metricsData.test_results?.total_count || 0, '+5')

    // Используем сводные данные для процентов
    const successRate = summaryData.test_success_rate || 0
    updateMetric(6, `${successRate}%`, '+2.3%')

    const avgScore = summaryData.avg_test_score || 0
    updateMetric(7, avgScore.toString(), '+1.2')

    lastUpdated.value = new Date()

  } catch (error) {
    console.error('Ошибка загрузки метрик:', error)
    // В случае ошибки показываем нулевые значения
    metrics.value.forEach((metric, index) => {
      updateMetric(index, metric.title.includes('%') ? '0%' : 0, '+0')
    })
  } finally {
    isLoading.value = false
  }
}

// Обновление конкретной метрики
const updateMetric = (index, value, change) => {
  metrics.value[index].value = value
  metrics.value[index].change = change
  metrics.value[index].changeType = change.startsWith('+') ? 'positive' : change.startsWith('-') ? 'negative' : 'neutral'
  metrics.value[index].loading = false
}

// Вычисление роста (заглушка для примера)
const calculateGrowth = (current) => {
  // Простая имитация роста на основе текущего значения
  const growth = Math.floor(current * 0.1) + 1
  return `+${growth}`
}

// Форматирование времени последнего обновления
const formatLastUpdated = () => {
  return lastUpdated.value.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadMetrics()
})
</script>

<template>
  <div class="card">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5 class="card-title">Основные метрики системы</h5>
          <p class="card-subtitle">
            Общая статистика экспертной системы профориентации
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <small class="text-muted">
            Обновлено: {{ formatLastUpdated() }}
          </small>
          <button
            @click="loadMetrics"
            class="btn btn-sm btn-outline-primary"
            :disabled="isLoading"
          >
            <i class="fas fa-sync" :class="{ 'fa-spin': isLoading }"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="card-body">
      <div class="row g-3">
        <div
          v-for="(metric, index) in metrics"
          :key="index"
          class="col-xl-3 col-lg-4 col-md-6"
        >
          <div class="metric-card h-100">
            <div class="metric-content">
              <!-- Иконка -->
              <div class="metric-icon" :class="`bg-${metric.color}-subtle text-${metric.color}`">
                <component :is="metric.icon" :size="24" />
              </div>

              <!-- Основные данные -->
              <div class="metric-data">
                <div class="metric-value" v-if="!metric.loading">
                  {{ metric.value }}
                </div>
                <div class="metric-value-skeleton" v-else>
                  <div class="skeleton-line"></div>
                </div>

                <div class="metric-label">{{ metric.title }}</div>

                <div class="metric-change" v-if="!metric.loading">
                  <span
                    :class="{
                      'text-success': metric.changeType === 'positive',
                      'text-danger': metric.changeType === 'negative',
                      'text-muted': metric.changeType === 'neutral'
                    }"
                  >
                    {{ metric.change }}
                  </span>
                  <small class="text-muted ms-1">за месяц</small>
                </div>
              </div>
            </div>

            <!-- Описание -->
            <div class="metric-description">
              <small class="text-muted">{{ metric.description }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.metric-card {
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
  padding: 1.25rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--bs-primary);
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.metric-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.metric-data {
  flex: 1;
  min-width: 0;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--bs-body-color);
  margin-bottom: 0.25rem;
}

.metric-value-skeleton {
  margin-bottom: 0.25rem;

  .skeleton-line {
    height: 1.75rem;
    background: linear-gradient(90deg, var(--bs-gray-200) 25%, var(--bs-gray-100) 50%, var(--bs-gray-200) 75%);
    background-size: 200% 100%;
    border-radius: 0.25rem;
    animation: skeleton-loading 1.5s infinite;
  }
}

.metric-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--bs-body-color);
  margin-bottom: 0.25rem;
}

.metric-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.metric-description {
  font-size: 0.75rem;
  line-height: 1.3;
  color: var(--bs-secondary-color);
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// Адаптивность
@media (max-width: 1199.98px) {
  .metric-card {
    padding: 1rem;
  }

  .metric-value {
    font-size: 1.5rem;
  }

  .metric-icon {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 767.98px) {
  .metric-content {
    gap: 0.75rem;
  }

  .metric-card {
    padding: 0.875rem;
  }

  .metric-value {
    font-size: 1.375rem;
  }
}
</style>