<script setup>
import { ref, onMounted } from 'vue'
import { endpoints } from '@/js/api/endpoints.js'
import { TrendingUp, Award, Users, Target, ChevronUp, ChevronDown, Minus } from 'lucide-vue-next'
import axios from 'axios'

// Данные популярных навыков
const popularSkills = ref([])
const isLoading = ref(true)

// Период анализа
const timePeriod = ref('month') // week, month, quarter

// Тип сортировки
const sortType = ref('confirmed') // confirmed, total, success_rate

// Количество навыков для отображения
const limit = ref(10)

// Опции периода
const periodOptions = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' }
]

// Загрузка популярных навыков из API
const loadPopularSkills = async () => {
  isLoading.value = true

  try {
    const response = await axios.get(endpoints.expert_system.dashboard.popularSkills, {
      params: {
        limit: limit.value
      }
    })

    popularSkills.value = response.data.map(skill => ({
      ...skill,
      trend: generateTrend(),
      trendValue: Math.floor(Math.random() * 21) - 10
    }))

  } catch (error) {
    console.error('Ошибка загрузки популярных навыков:', error)
  } finally {
    isLoading.value = false
  }
}

// Генерация тренда (заглушка)
const generateTrend = () => {
  const trends = ['up', 'down', 'stable']
  return trends[Math.floor(Math.random() * trends.length)]
}

// Получение иконки тренда
const getTrendIcon = (trend) => {
  switch(trend) {
    case 'up': return ChevronUp
    case 'down': return ChevronDown
    default: return Minus
  }
}

// Получение цвета тренда
const getTrendColor = (trend) => {
  switch(trend) {
    case 'up': return 'success'
    case 'down': return 'danger'
    default: return 'secondary'
  }
}

// Получение цвета рейтинга
const getRankColor = (index) => {
  if (index === 0) return 'warning' // золото
  if (index === 1) return 'secondary' // серебро
  if (index === 2) return 'warning' // бронза
  return 'primary'
}

// Обработчик изменения сортировки
const handleSortChange = () => {
  loadPopularSkills()
}

onMounted(() => {
  loadPopularSkills()
})
</script>

<template>
  <div class="card h-100">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="card-title">Популярные навыки</h5>
          <p class="card-subtitle">
            Топ навыки по количеству подтверждений
          </p>
        </div>

        <div class="d-flex flex-column gap-2">
          <select
            v-model="timePeriod"
            class="form-select form-select-sm"
            @change="loadPopularSkills"
          >
            <option
              v-for="option in periodOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <select
            v-model="sortType"
            class="form-select form-select-sm"
            @change="handleSortChange"
          >
            <option value="confirmed">По подтверждениям</option>
            <option value="total">По общему числу</option>
            <option value="success_rate">По успешности</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card-body p-0">
      <!-- Загрузка -->
      <div v-if="isLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p class="text-muted mt-2">Загрузка популярных навыков...</p>
      </div>

      <!-- Список навыков -->
      <div v-else class="popular-skills-list">
        <div
          v-for="(skill, index) in popularSkills"
          :key="skill.skill_id"
          class="skill-item"
          :class="{ 'top-skill': index < 3 }"
        >
          <div class="skill-rank">
            <div
              class="rank-badge"
              :class="`bg-${getRankColor(index)}-subtle text-${getRankColor(index)}`"
            >
              {{ index + 1 }}
            </div>
          </div>

          <div class="skill-info flex-grow-1">
            <div class="d-flex justify-content-between align-items-start">
              <div class="skill-name">
                <h6 class="mb-1">{{ skill.skill_name }}</h6>
                <div class="skill-stats">
                  <small class="text-muted">
                    {{ skill.total_users }} пользователей
                  </small>
                  <span class="mx-1">•</span>
                  <small class="text-success">
                    {{ skill.confirmed_users }} подтверждено
                  </small>
                </div>
              </div>

              <!-- Тренд -->
              <div class="skill-trend">
                <div class="d-flex align-items-center">
                  <component
                    :is="getTrendIcon(skill.trend)"
                    :size="16"
                    :class="`text-${getTrendColor(skill.trend)}`"
                  />
                  <small
                    :class="`text-${getTrendColor(skill.trend)} ms-1`"
                    v-if="skill.trend !== 'stable'"
                  >
                    {{ Math.abs(skill.trendValue || 0) }}
                  </small>
                </div>
              </div>
            </div>

            <!-- Прогресс подтверждений -->
            <div class="skill-progress mt-2">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-muted">Подтверждения</small>
                <small class="fw-medium">
                  {{ skill.total_users > 0 ? Math.round((skill.confirmed_users / skill.total_users) * 100) : 0 }}%
                </small>
              </div>
              <div class="progress" style="height: 6px;">
                <div
                  class="progress-bar bg-success"
                  :style="`width: ${skill.total_users > 0 ? (skill.confirmed_users / skill.total_users) * 100 : 0}%`"
                ></div>
              </div>
            </div>

            <!-- Информация о тесте -->
            <div v-if="skill.has_test" class="skill-test-info mt-2">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <Target :size="14" class="text-primary me-1" />
                  <small class="text-muted">Тест:</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <div class="d-flex align-items-center">
                    <small class="text-muted me-1">Успешность:</small>
                    <span
                      class="badge badge-sm"
                      :class="{
                        'bg-success-subtle text-success': skill.success_rate >= 80,
                        'bg-warning-subtle text-warning': skill.success_rate >= 60 && skill.success_rate < 80,
                        'bg-danger-subtle text-danger': skill.success_rate < 60
                      }"
                    >
                      {{ skill.success_rate }}%
                    </span>
                  </div>
                  <div class="d-flex align-items-center">
                    <Award :size="14" class="text-warning me-1" />
                    <small class="fw-medium">{{ skill.avg_score }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Если нет данных -->
        <div v-if="popularSkills.length === 0" class="text-center py-4">
          <p class="text-muted">Популярные навыки не найдены</p>
        </div>
      </div>
    </div>

    <!-- Футер -->
    <div class="card-footer">
      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          Показано топ-{{ popularSkills.length }} навыков
        </small>
        <button class="btn btn-sm btn-outline-primary">
          Все навыки
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.popular-skills-list {
  max-height: 600px;
  overflow-y: auto;
}

.skill-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--bs-border-color);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--bs-gray-50);
  }

  &:last-child {
    border-bottom: none;
  }

  &.top-skill {
    background-color: var(--bs-warning-bg-subtle);
    border-color: var(--bs-warning-border-subtle);
  }
}

.skill-rank {
  flex-shrink: 0;
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
}

.skill-info {
  min-width: 0;
}

.skill-name h6 {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--bs-body-color);
}

.skill-stats {
  font-size: 0.8rem;
  line-height: 1.2;
}

.skill-trend {
  flex-shrink: 0;
}

.skill-progress {
  .progress {
    background-color: var(--bs-gray-200);
  }
}

.skill-test-info {
  padding: 0.5rem;
  background-color: var(--bs-gray-50);
  border-radius: 0.375rem;
  font-size: 0.8rem;
}

.badge-sm {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
}

// Стилизация прокрутки
.popular-skills-list {
  scrollbar-width: thin;
  scrollbar-color: var(--bs-gray-300) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--bs-gray-300);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--bs-gray-400);
  }
}

// Адаптивность
@media (max-width: 767.98px) {
  .skill-item {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .rank-badge {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }

  .skill-name h6 {
    font-size: 0.9rem;
  }

  .skill-stats {
    font-size: 0.75rem;
  }

  .skill-test-info {
    padding: 0.375rem;
    font-size: 0.75rem;
  }
}
</style>