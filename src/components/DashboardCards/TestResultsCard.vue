<script setup>
import { ref, onMounted, computed } from 'vue'
import { ClipboardCheck, TrendingUp, Target, Award, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import axios from 'axios'
import { endpoints } from '@/js/api/endpoints.js'

// Основные данные результатов тестов
const isLoading = ref(true)

// Аналитика результатов из API
const analytics = ref({
  total_attempts: 0,
  passed_attempts: 0,
  failed_attempts: 0,
  average_score: 0,
  success_rate: 0,
  score_90_100: 0,
  score_80_89: 0,
  score_70_79: 0,
  score_60_69: 0,
  score_below_60: 0,
  unique_tests: 0,
  unique_users: 0
})

// Сложные тесты (все данные)
const allDifficultTests = ref([])

// Пагинация для сложных тестов
const currentPage = ref(1)
const testsPerPage = ref(5)
const showAllTests = ref(false)

// Период анализа
const analysisPeriod = ref('month') // week, month, quarter

// Вычисляемые распределения баллов
const scoreDistribution = computed(() => [
  {
    range: '90-100',
    count: analytics.value.score_90_100,
    percentage: analytics.value.total_attempts > 0 ? Math.round((analytics.value.score_90_100 / analytics.value.total_attempts) * 100) : 0,
    color: 'success'
  },
  {
    range: '80-89',
    count: analytics.value.score_80_89,
    percentage: analytics.value.total_attempts > 0 ? Math.round((analytics.value.score_80_89 / analytics.value.total_attempts) * 100) : 0,
    color: 'info'
  },
  {
    range: '70-79',
    count: analytics.value.score_70_79,
    percentage: analytics.value.total_attempts > 0 ? Math.round((analytics.value.score_70_79 / analytics.value.total_attempts) * 100) : 0,
    color: 'warning'
  },
  {
    range: '60-69',
    count: analytics.value.score_60_69,
    percentage: analytics.value.total_attempts > 0 ? Math.round((analytics.value.score_60_69 / analytics.value.total_attempts) * 100) : 0,
    color: 'secondary'
  },
  {
    range: '0-59',
    count: analytics.value.score_below_60,
    percentage: analytics.value.total_attempts > 0 ? Math.round((analytics.value.score_below_60 / analytics.value.total_attempts) * 100) : 0,
    color: 'danger'
  }
])

// Отображаемые сложные тесты с пагинацией
const displayedDifficultTests = computed(() => {
  if (showAllTests.value) {
    const startIndex = (currentPage.value - 1) * testsPerPage.value
    const endIndex = startIndex + testsPerPage.value
    return allDifficultTests.value.slice(startIndex, endIndex)
  } else {
    return allDifficultTests.value.slice(0, 3) // Показываем только первые 3 теста по умолчанию
  }
})

// Общее количество страниц
const totalPages = computed(() => {
  return Math.ceil(allDifficultTests.value.length / testsPerPage.value)
})

// Умная пагинация - вычисляем какие страницы показывать
const paginationPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const maxVisible = 5 // Максимальное количество видимых номеров страниц

  if (total <= maxVisible) {
    // Если страниц мало, показываем все
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  // Вычисляем диапазон страниц для отображения
  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  let end = Math.min(total, start + maxVisible - 1)

  // Корректируем начало, если конец упирается в максимум
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// Показывать ли многоточие
const showStartEllipsis = computed(() => {
  return paginationPages.value.length > 0 && paginationPages.value[0] > 2
})

const showEndEllipsis = computed(() => {
  const lastPage = paginationPages.value[paginationPages.value.length - 1]
  return paginationPages.value.length > 0 && lastPage < totalPages.value - 1
})

// Загрузка результатов тестов из API
const loadTestResults = async () => {
  isLoading.value = true

  try {
    const [analyticsResponse, difficultTestsResponse] = await Promise.all([
      axios.get(endpoints.expert_system.dashboard.testResultsAnalytics),
      axios.get(endpoints.expert_system.dashboard.difficultTests)
    ])

    analytics.value = analyticsResponse.data
    allDifficultTests.value = difficultTestsResponse.data

  } catch (error) {
    console.error('Ошибка загрузки результатов тестов:', error)
  } finally {
    isLoading.value = false
  }
}

// Переключение режима отображения
const toggleShowAllTests = () => {
  showAllTests.value = !showAllTests.value
  if (!showAllTests.value) {
    currentPage.value = 1
  }
}

// Навигация по страницам
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const goToFirstPage = () => {
  currentPage.value = 1
}

const goToLastPage = () => {
  currentPage.value = totalPages.value
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Получение цвета для процента успешности
const getSuccessColor = (rate) => {
  if (rate >= 80) return 'success'
  if (rate >= 60) return 'warning'
  return 'danger'
}

// Получение иконки для процента успешности
const getSuccessIcon = (rate) => {
  if (rate >= 80) return CheckCircle
  if (rate >= 60) return Target
  return AlertCircle
}

onMounted(() => {
  loadTestResults()
})
</script>

<template>
  <div class="card h-100">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="card-title">Результаты тестов</h5>
          <p class="card-subtitle">
            Аналитика прохождения тестов навыков
          </p>
        </div>

        <select v-model="analysisPeriod" class="form-select form-select-sm" style="width: auto;">
          <option value="week">За неделю</option>
          <option value="month">За месяц</option>
          <option value="quarter">За квартал</option>
        </select>
      </div>
    </div>

    <div class="card-body">
      <!-- Загрузка -->
      <div v-if="isLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p class="text-muted mt-2">Загрузка результатов тестов...</p>
      </div>

      <div v-else>
        <!-- Основные метрики -->
        <div class="row g-3 mb-4">
          <div class="col-6">
            <div class="metric-box text-center">
              <div class="metric-icon bg-primary-subtle text-primary mb-2">
                <ClipboardCheck :size="24" />
              </div>
              <div class="metric-value">{{ analytics.total_attempts }}</div>
              <div class="metric-label">Всего попыток</div>
            </div>
          </div>

          <div class="col-6">
            <div class="metric-box text-center">
              <div class="metric-icon bg-success-subtle text-success mb-2">
                <CheckCircle :size="24" />
              </div>
              <div class="metric-value">{{ analytics.success_rate }}%</div>
              <div class="metric-label">Успешность</div>
              <div class="metric-change text-success">
                +2.3%
              </div>
            </div>
          </div>
        </div>

        <!-- Распределение баллов -->
        <div class="mb-4">
          <h6 class="mb-3">Распределение баллов</h6>
          <div class="score-distribution">
            <div
              v-for="item in scoreDistribution"
              :key="item.range"
              class="score-range"
            >
              <div class="score-range-header">
                <span class="score-range-label">{{ item.range }}</span>
                <span class="score-range-count">{{ item.count }}</span>
              </div>
              <div class="progress mb-1" style="height: 8px;">
                <div
                  :class="`progress-bar bg-${item.color}`"
                  :style="`width: ${item.percentage}%`"
                ></div>
              </div>
              <small class="text-muted">{{ item.percentage }}%</small>
            </div>
          </div>
        </div>

        <!-- Сложные тесты -->
        <div v-if="allDifficultTests.length > 0">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="mb-0">
              <AlertCircle :size="18" class="text-warning me-2" />
              Тесты, требующие внимания
            </h6>
            <div class="d-flex align-items-center gap-2">
              <small class="text-muted">
                Показано {{ displayedDifficultTests.length }} из {{ allDifficultTests.length }}
              </small>
              <button
                @click="toggleShowAllTests"
                class="btn btn-sm btn-outline-primary"
              >
                {{ showAllTests ? 'Свернуть' : 'Показать все' }}
              </button>
            </div>
          </div>

          <div class="difficult-tests">
            <div
              v-for="test in displayedDifficultTests"
              :key="test.test_name"
              class="difficult-test-item"
            >
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <div class="fw-medium">{{ test.test_name }}</div>
                  <small class="text-muted">{{ test.skill_name }}</small>
                </div>
                <div class="text-end">
                  <div class="d-flex align-items-center">
                    <component
                      :is="getSuccessIcon(test.pass_rate)"
                      :size="16"
                      :class="`text-${getSuccessColor(test.pass_rate)} me-1`"
                    />
                    <span :class="`text-${getSuccessColor(test.pass_rate)} fw-medium`">
                      {{ test.pass_rate }}%
                    </span>
                  </div>
                  <small class="text-muted">{{ test.total_attempts }} попыток</small>
                </div>
              </div>
              <div class="mt-2">
                <div class="progress" style="height: 4px;">
                  <div
                    :class="`progress-bar bg-${getSuccessColor(test.pass_rate)}`"
                    :style="`width: ${test.pass_rate}%`"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Умная пагинация для режима "Показать все" -->
          <div v-if="showAllTests && totalPages > 1" class="d-flex justify-content-center align-items-center mt-3">
            <nav aria-label="Навигация по сложным тестам" class="smart-pagination">
              <ul class="pagination pagination-sm mb-0">
                <!-- Переход к первой странице -->
                <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
                  <button
                    class="page-link"
                    @click="goToFirstPage"
                    :disabled="currentPage === 1"
                    title="Первая страница"
                  >
                    <ChevronsLeft :size="14" />
                  </button>
                </li>

                <!-- Предыдущая страница -->
                <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
                  <button
                    class="page-link"
                    @click="prevPage"
                    :disabled="currentPage === 1"
                    title="Предыдущая страница"
                  >
                    <ChevronLeft :size="14" />
                  </button>
                </li>

                <!-- Первая страница, если есть многоточие -->
                <li v-if="showStartEllipsis" class="page-item">
                  <button class="page-link" @click="goToPage(1)">1</button>
                </li>

                <!-- Многоточие в начале -->
                <li v-if="showStartEllipsis" class="page-item disabled">
                  <span class="page-link pagination-ellipsis">...</span>
                </li>

                <!-- Номера страниц -->
                <li
                  v-for="page in paginationPages"
                  :key="page"
                  class="page-item"
                  :class="{ 'active': currentPage === page }"
                >
                  <button class="page-link" @click="goToPage(page)">
                    {{ page }}
                  </button>
                </li>

                <!-- Многоточие в конце -->
                <li v-if="showEndEllipsis" class="page-item disabled">
                  <span class="page-link pagination-ellipsis">...</span>
                </li>

                <!-- Последняя страница, если есть многоточие -->
                <li v-if="showEndEllipsis" class="page-item">
                  <button class="page-link" @click="goToPage(totalPages)">{{ totalPages }}</button>
                </li>

                <!-- Следующая страница -->
                <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
                  <button
                    class="page-link"
                    @click="nextPage"
                    :disabled="currentPage === totalPages"
                    title="Следующая страница"
                  >
                    <ChevronRight :size="14" />
                  </button>
                </li>

                <!-- Переход к последней странице -->
                <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
                  <button
                    class="page-link"
                    @click="goToLastPage"
                    :disabled="currentPage === totalPages"
                    title="Последняя страница"
                  >
                    <ChevronsRight :size="14" />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <!-- Если нет сложных тестов -->
        <div v-else class="text-center py-3">
          <CheckCircle :size="48" class="text-success mb-2" />
          <p class="text-muted mb-0">Все тесты показывают хорошие результаты</p>
        </div>
      </div>
    </div>

    <!-- Футер -->
    <div class="card-footer">
      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          Средний балл: <strong>{{ analytics.average_score }}</strong>
        </small>
        <button class="btn btn-sm btn-outline-primary">
          Детальный отчет
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.metric-box {
  padding: 1rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--bs-primary);
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }
}

.metric-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  margin: 0 auto;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--bs-body-color);
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
  margin-bottom: 0.25rem;
}

.metric-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.score-distribution {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.score-range {
  padding: 0.75rem;
  background-color: var(--bs-gray-50);
  border-radius: 0.375rem;
}

.score-range-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.score-range-label {
  font-weight: 500;
  font-size: 0.875rem;
}

.score-range-count {
  font-weight: 600;
  color: var(--bs-primary);
}

.difficult-tests {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.difficult-test-item {
  padding: 0.75rem;
  background-color: var(--bs-warning-bg-subtle);
  border: 1px solid var(--bs-warning-border-subtle);
  border-radius: 0.375rem;
}

.progress {
  background-color: var(--bs-gray-200);
}

// Умная пагинация
.smart-pagination {
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.25rem;

    .page-link {
      border: 1px solid var(--bs-border-color);
      color: var(--bs-primary);
      background-color: var(--bs-body-bg);
      border-radius: 0.375rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
      min-width: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background-color: var(--bs-primary-bg-subtle);
        border-color: var(--bs-primary);
        transform: translateY(-1px);
      }

      &:focus {
        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .page-item {
      &.active .page-link {
        background-color: var(--bs-primary);
        border-color: var(--bs-primary);
        color: white;
        font-weight: 600;

        &:hover {
          transform: none;
        }
      }

      &.disabled .page-link {
        color: var(--bs-secondary-color);
        background-color: var(--bs-secondary-bg);
        border-color: var(--bs-border-color);
      }
    }

    .pagination-ellipsis {
      color: var(--bs-secondary-color);
      background-color: transparent !important;
      border-color: transparent !important;
      cursor: default;

      &:hover {
        background-color: transparent !important;
        transform: none !important;
      }
    }
  }
}

// Адаптивность
@media (max-width: 767.98px) {
  .metric-box {
    padding: 0.75rem;
  }

  .metric-value {
    font-size: 1.5rem;
  }

  .metric-icon {
    width: 40px;
    height: 40px;
  }

  .score-range {
    padding: 0.5rem;
  }

  .difficult-test-item {
    padding: 0.5rem;
  }

  .smart-pagination {
    .pagination {
      gap: 0.125rem;

      .page-link {
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
        min-width: 2rem;
      }
    }
  }
}

@media (max-width: 575.98px) {
  .smart-pagination {
    .pagination {
      .page-link {
        padding: 0.25rem 0.375rem;
        font-size: 0.75rem;
        min-width: 1.75rem;
      }
    }
  }
}

// Анимации
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.difficult-test-item {
  animation: fadeIn 0.3s ease-out;
}

.page-item {
  animation: fadeIn 0.2s ease-out;
}
</style>