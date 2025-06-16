<script setup>
import { ref, onMounted, computed } from 'vue'
import { endpoints } from '@/js/api/endpoints.js'
import { Target, TrendingUp, Users, Award, ChevronRight } from 'lucide-vue-next'
import axios from 'axios'

// Данные аналитики навыков
const skillsData = ref([])
const isLoading = ref(true)
const sortBy = ref('popularity') // popularity, success, alphabetical
const filterStatus = ref('all') // all, confirmed, unconfirmed

// Статистика по статусам
const statusStats = ref({
  total: 0,
  confirmed: 0,
  unconfirmed: 0,
  pending: 0
})

// Опции сортировки
const sortOptions = [
  { value: 'popularity', label: 'По популярности' },
  { value: 'success', label: 'По успешности' },
  { value: 'alphabetical', label: 'По алфавиту' }
]

// Опции фильтрации
const filterOptions = [
  { value: 'all', label: 'Все навыки' },
  { value: 'confirmed', label: 'Подтвержденные' },
  { value: 'unconfirmed', label: 'Неподтвержденные' }
]

// Загрузка данных навыков
const loadSkillsAnalytics = async () => {
  isLoading.value = true

  try {
    const response = await axios.get(endpoints.expert_system.dashboard.skillsAnalytics)

    // Обрабатываем данные напрямую из API
    skillsData.value = response.data

    // Обновляем статистику статусов
    const totalSkills = response.data.reduce((sum, skill) => sum + skill.total_users, 0)
    const confirmedSkills = response.data.reduce((sum, skill) => sum + skill.confirmed_users, 0)
    const unconfirmedSkills = response.data.reduce((sum, skill) => sum + skill.unconfirmed_users, 0)

    statusStats.value = {
      total: totalSkills,
      confirmed: confirmedSkills,
      unconfirmed: unconfirmedSkills,
      pending: totalSkills - confirmedSkills - unconfirmedSkills
    }

    applySorting()

  } catch (error) {
    console.error('Ошибка загрузки аналитики навыков:', error)
  } finally {
    isLoading.value = false
  }
}

// Обработка данных навыков
const processSkillsData = (skills, userSkills, tests, testResults) => {
  const skillsMap = new Map()

  // Инициализация данных для каждого навыка
  skills.forEach(skill => {
    skillsMap.set(skill.id, {
      id: skill.id,
      name: skill.name,
      totalUsers: 0,
      confirmedUsers: 0,
      unconfirmedUsers: 0,
      pendingUsers: 0,
      hasTest: false,
      testAttempts: 0,
      testPasses: 0,
      averageScore: 0,
      successRate: 0,
      trend: 'stable' // up, down, stable
    })
  })

  // Подсчет пользователей по навыкам
  userSkills.forEach(userSkill => {
    const skill = skillsMap.get(userSkill.skill_id)
    if (skill) {
      skill.totalUsers++
      switch(userSkill.status) {
        case 'confirmed':
          skill.confirmedUsers++
          break
        case 'unconfirmed':
          skill.unconfirmedUsers++
          break
        default:
          skill.pendingUsers++
      }
    }
  })

  // Добавление информации о тестах
  tests.forEach(test => {
    const skill = skills.find(s => s.name === test.skill)
    if (skill) {
      const skillData = skillsMap.get(skill.id)
      if (skillData) {
        skillData.hasTest = true

        // Подсчет результатов тестов для этого навыка
        const skillTestResults = testResults.filter(result => {
          const testInfo = tests.find(t => t.id === result.test)
          return testInfo && testInfo.skill === skill.name
        })

        skillData.testAttempts = skillTestResults.length
        skillData.testPasses = skillTestResults.filter(r => r.passed).length

        if (skillTestResults.length > 0) {
          const totalScore = skillTestResults.reduce((sum, r) => sum + r.score, 0)
          skillData.averageScore = Math.round(totalScore / skillTestResults.length)
          skillData.successRate = Math.round((skillData.testPasses / skillData.testAttempts) * 100)
        }
      }
    }
  })

  // Обновление статистики статусов
  statusStats.value.total = userSkills.length
  statusStats.value.confirmed = userSkills.filter(s => s.status === 'confirmed').length
  statusStats.value.unconfirmed = userSkills.filter(s => s.status === 'unconfirmed').length
  statusStats.value.pending = userSkills.filter(s => s.status !== 'confirmed' && s.status !== 'unconfirmed').length

  // Преобразование в массив и сортировка
  skillsData.value = Array.from(skillsMap.values())
  applySorting()
}

// Применение сортировки
const applySorting = () => {
  switch(sortBy.value) {
    case 'popularity':
      skillsData.value.sort((a, b) => b.totalUsers - a.totalUsers)
      break
    case 'success':
      skillsData.value.sort((a, b) => b.successRate - a.successRate)
      break
    case 'alphabetical':
      skillsData.value.sort((a, b) => a.name.localeCompare(b.name))
      break
  }
}

// Фильтрация данных
const filteredSkills = computed(() => {
  let filtered = skillsData.value

  switch(filterStatus.value) {
    case 'confirmed':
      filtered = filtered.filter(skill => skill.confirmedUsers > 0)
      break
    case 'unconfirmed':
      filtered = filtered.filter(skill => skill.unconfirmedUsers > 0)
      break
  }

  return filtered.slice(0, 10) // Показываем топ-10
})

// Обработчики событий
const handleSortChange = () => {
  applySorting()
}

const getSkillStatusColor = (skill) => {
  if (skill.confirmedUsers > skill.unconfirmedUsers) return 'success'
  if (skill.unconfirmedUsers > skill.confirmedUsers) return 'warning'
  return 'secondary'
}

const getSuccessRateColor = (rate) => {
  if (rate >= 80) return 'success'
  if (rate >= 60) return 'warning'
  return 'danger'
}

onMounted(() => {
  loadSkillsAnalytics()
})
</script>

<template>
  <div class="card h-100">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="card-title">Аналитика навыков</h5>
          <p class="card-subtitle">
            Детальная статистика по всем навыкам в системе
          </p>
        </div>

        <div class="d-flex gap-2">
          <!-- Фильтр по статусу -->
          <select
            v-model="filterStatus"
            class="form-select form-select-sm"
            style="width: auto;"
          >
            <option
              v-for="option in filterOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <!-- Сортировка -->
          <select
            v-model="sortBy"
            @change="handleSortChange"
            class="form-select form-select-sm"
            style="width: auto;"
          >
            <option
              v-for="option in sortOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Статистика статусов -->
      <div class="row g-2 mt-2">
        <div class="col-auto">
          <div class="status-badge bg-primary-subtle text-primary">
            <small><strong>{{ statusStats.total }}</strong> всего</small>
          </div>
        </div>
        <div class="col-auto">
          <div class="status-badge bg-success-subtle text-success">
            <small><strong>{{ statusStats.confirmed }}</strong> подтверждено</small>
          </div>
        </div>
        <div class="col-auto">
          <div class="status-badge bg-warning-subtle text-warning">
            <small><strong>{{ statusStats.unconfirmed }}</strong> неподтверждено</small>
          </div>
        </div>
      </div>
    </div>

    <div class="card-body">
      <!-- Загрузка -->
      <div v-if="isLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p class="text-muted mt-2">Загрузка аналитики навыков...</p>
      </div>

      <!-- Таблица навыков -->
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Навык</th>
              <th>Пользователи</th>
              <th>Статус</th>
              <th>Тест</th>
              <th>Успешность</th>
              <th>Средний балл</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="skill in filteredSkills" :key="skill.id" class="skill-row">
              <!-- Название навыка -->
              <td>
                <div class="skill-name">
                  <strong>{{ skill.name }}</strong>
                  <div class="skill-trend" v-if="skill.trend !== 'stable'">
                    <TrendingUp
                      :size="16"
                      :class="{
                        'text-success': skill.trend === 'up',
                        'text-danger': skill.trend === 'down'
                      }"
                    />
                  </div>
                </div>
              </td>

              <!-- Пользователи -->
              <td>
                <div class="users-info">
                  <div class="fw-bold">{{ skill.totalUsers }}</div>
                  <small class="text-muted">
                    {{ skill.confirmedUsers }}/<span class="text-warning">{{ skill.unconfirmedUsers }}</span>
                  </small>
                </div>
              </td>

              <!-- Статус -->
              <td>
                <span
                  :class="`badge bg-${getSkillStatusColor(skill)}-subtle text-${getSkillStatusColor(skill)}`"
                >
                  <Users :size="12" class="me-1" />
                  {{ skill.confirmedUsers > skill.unconfirmedUsers ? 'Популярный' : 'Развивающийся' }}
                </span>
              </td>

              <!-- Тест -->
              <td>
                <div v-if="skill.hasTest" class="test-info">
                  <div class="d-flex align-items-center">
                    <Target :size="16" class="text-primary me-2" />
                    <div>
                      <div class="fw-medium">{{ skill.testAttempts }}</div>
                      <small class="text-muted">попыток</small>
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted">
                  <small>Нет теста</small>
                </div>
              </td>

              <!-- Успешность -->
              <td>
                <div v-if="skill.hasTest && skill.testAttempts > 0">
                  <div class="progress mb-1" style="height: 6px;">
                    <div
                      :class="`progress-bar bg-${getSuccessRateColor(skill.successRate)}`"
                      :style="`width: ${skill.successRate}%`"
                    ></div>
                  </div>
                  <small :class="`text-${getSuccessRateColor(skill.successRate)}`">
                    {{ skill.successRate }}% ({{ skill.testPasses }}/{{ skill.testAttempts }})
                  </small>
                </div>
                <div v-else class="text-muted">
                  <small>—</small>
                </div>
              </td>

              <!-- Средний балл -->
              <td>
                <div v-if="skill.hasTest && skill.testAttempts > 0">
                  <div class="d-flex align-items-center">
                    <Award :size="16" class="text-warning me-2" />
                    <span class="fw-medium">{{ skill.averageScore }}</span>
                  </div>
                </div>
                <div v-else class="text-muted">
                  <small>—</small>
                </div>
              </td>

              <!-- Действия -->
              <td>
                <button class="btn btn-sm btn-outline-primary">
                  <ChevronRight :size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Если нет данных -->
        <div v-if="filteredSkills.length === 0" class="text-center py-4">
          <p class="text-muted">Навыки не найдены</p>
        </div>
      </div>
    </div>

    <!-- Футер карточки -->
    <div class="card-footer">
      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          Показано {{ filteredSkills.length }} из {{ skillsData.length }} навыков
        </small>
        <button class="btn btn-sm btn-outline-primary">
          Посмотреть все навыки
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
}

.skill-row {
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--bs-gray-50);
  }
}

.skill-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.skill-trend {
  display: flex;
  align-items: center;
}

.users-info {
  text-align: center;
}

.test-info {
  .fw-medium {
    font-size: 0.875rem;
  }
}

.progress {
  background-color: var(--bs-gray-200);
}

.table th {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--bs-gray-700);
  border-bottom: 2px solid var(--bs-gray-200);
}

.table td {
  font-size: 0.875rem;
  border-bottom: 1px solid var(--bs-gray-200);
  vertical-align: middle;
}

// Адаптивность
@media (max-width: 767.98px) {
  .table-responsive {
    font-size: 0.8rem;
  }

  .status-badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .skill-name strong {
    font-size: 0.875rem;
  }
}
</style>