<script setup>
import { ref, onMounted, computed } from 'vue'
import { endpoints } from '@/js/api/endpoints.js'
import { Users, UserCheck, GraduationCap, TrendingUp, BookOpen, Award, Target } from 'lucide-vue-next'
import axios from 'axios'

// Данные студентов
const isLoading = ref(true)

// Статистика студентов из API
const studentOverview = ref({
  total_students: 0,
  students_with_experience: 0,
  students_with_role: 0,
  active_in_tests: 0,
  avg_skills_per_student: 0,
  avg_confirmed_skills: 0,
  avg_tests_per_student: 0,
  experience_percentage: 0,
  role_selection_percentage: 0,
  test_activity_percentage: 0
})

// Группы студентов
const studentGroups = ref([])

// Статистика по ролям
const roleStats = ref([])

// Активность студентов (последние действия)
const studentActivity = ref([])

// Фильтр по опыту
const experienceFilter = ref('all') // all, with, without

// Фильтр по группам
const groupFilter = ref('all')

// Загрузка данных студентов из API
const loadStudentsData = async () => {
  isLoading.value = true

  try {
    const [
      overviewResponse,
      groupsStatsResponse,
      roleStatsResponse,
      timelineResponse
    ] = await Promise.all([
      axios.get(endpoints.expert_system.dashboard.studentsOverview),
      axios.get(endpoints.expert_system.dashboard.studentGroupsStats),
      axios.get(endpoints.expert_system.dashboard.rolePopularityStats),
      axios.get(endpoints.expert_system.dashboard.studentActivityTimeline, {
        params: { days: 7 }
      })
    ])

    studentOverview.value = overviewResponse.data
    studentGroups.value = groupsStatsResponse.data
    roleStats.value = roleStatsResponse.data
    generateStudentActivity(timelineResponse.data)

  } catch (error) {
    console.error('Ошибка загрузки данных студентов:', error)
  } finally {
    isLoading.value = false
  }
}

// Генерация активности студентов на основе timeline
const generateStudentActivity = (timelineData) => {
  const activities = []

  // Обрабатываем данные активности за последние дни
  timelineData.forEach((day, index) => {
    if (day.applications_count > 0) {
      activities.push({
        type: 'application',
        icon: Target,
        student: `Студент ${index + 1}`,
        action: 'подал заявку на вакансию',
        details: `${day.applications_count} заявок`,
        time: `${index + 1} день назад`,
        color: 'primary'
      })
    }

    if (day.orientation_tests_count > 0) {
      activities.push({
        type: 'orientation',
        icon: Award,
        student: `Студент ${index + 2}`,
        action: 'прошел профориентационный тест',
        details: 'определение роли',
        time: `${index + 1} день назад`,
        color: 'success'
      })
    }
  })

  studentActivity.value = activities.slice(0, 8) // Последние 8 активностей
}

// Фильтрация студентов (для будущего использования)
const filteredStudents = computed(() => {
  // Здесь будет логика фильтрации, когда понадобится
  return []
})

// Получение цвета для процента
const getPercentageColor = (percentage) => {
  if (percentage >= 70) return 'success'
  if (percentage >= 40) return 'warning'
  return 'danger'
}

onMounted(() => {
  loadStudentsData()
})
</script>

<template>
  <div class="card h-100">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="card-title">Обзор студентов</h5>
          <p class="card-subtitle">
            Статистика и активность студентов в системе
          </p>
        </div>

        <div class="d-flex gap-2">
          <select v-model="experienceFilter" class="form-select form-select-sm" style="width: auto;">
            <option value="all">Все студенты</option>
            <option value="with">С опытом</option>
            <option value="without">Без опыта</option>
          </select>

          <select v-model="groupFilter" class="form-select form-select-sm" style="width: auto;">
            <option value="all">Все группы</option>
            <option value="no_group">Без группы</option>
            <option
              v-for="group in studentGroups"
              :key="group.group_id || 'no_group'"
              :value="group.group_id"
            >
              {{ group.group_name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="card-body">
      <!-- Загрузка -->
      <div v-if="isLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p class="text-muted mt-2">Загрузка данных студентов...</p>
      </div>

      <div v-else>
        <!-- Основная статистика -->
        <div class="row g-3 mb-4">
          <div class="col-md-3 col-6">
            <div class="stat-card text-center">
              <div class="stat-icon bg-primary-subtle text-primary">
                <Users :size="24" />
              </div>
              <div class="stat-value">{{ studentOverview.total_students }}</div>
              <div class="stat-label">Всего студентов</div>
            </div>
          </div>

          <div class="col-md-3 col-6">
            <div class="stat-card text-center">
              <div class="stat-icon bg-success-subtle text-success">
                <UserCheck :size="24" />
              </div>
              <div class="stat-value">{{ studentOverview.students_with_experience }}</div>
              <div class="stat-label">С опытом в IT</div>
              <div class="stat-percentage text-success">
                {{ studentOverview.experience_percentage }}%
              </div>
            </div>
          </div>

          <div class="col-md-3 col-6">
            <div class="stat-card text-center">
              <div class="stat-icon bg-info-subtle text-info">
                <GraduationCap :size="24" />
              </div>
              <div class="stat-value">{{ studentOverview.students_with_role }}</div>
              <div class="stat-label">Выбрали роль</div>
              <div class="stat-percentage text-info">
                {{ studentOverview.role_selection_percentage }}%
              </div>
            </div>
          </div>

          <div class="col-md-3 col-6">
            <div class="stat-card text-center">
              <div class="stat-icon bg-warning-subtle text-warning">
                <Target :size="24" />
              </div>
              <div class="stat-value">{{ studentOverview.active_in_tests }}</div>
              <div class="stat-label">Проходят тесты</div>
              <div class="stat-percentage text-warning">
                {{ studentOverview.test_activity_percentage }}%
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Группы студентов -->
          <div class="col-lg-6 mb-4">
            <h6 class="mb-3">Распределение по группам</h6>
            <div class="groups-list">
              <div
                v-for="group in studentGroups.slice(0, 6)"
                :key="group.group_id || 'no_group'"
                class="group-item"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-medium">{{ group.group_name }}</div>
                    <small class="text-muted">
                      {{ group.with_experience }} с опытом, {{ group.without_experience }} без опыта
                    </small>
                  </div>
                  <div class="text-end">
                    <div class="fw-bold">{{ group.total_students }}</div>
                    <small class="text-muted">студентов</small>
                  </div>
                </div>
                <div class="mt-2">
                  <div class="progress" style="height: 4px;">
                    <div
                      class="progress-bar bg-primary"
                      :style="`width: ${studentOverview.total_students > 0 ? (group.total_students / studentOverview.total_students) * 100 : 0}%`"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Популярные роли -->
          <div class="col-lg-6 mb-4">
            <h6 class="mb-3">Популярные роли</h6>
            <div class="roles-list">
              <div
                v-for="(role, index) in roleStats.slice(0, 5)"
                :key="role.role_id"
                class="role-item"
              >
                <div class="d-flex align-items-center">
                  <div class="role-rank">
                    <span class="badge bg-primary-subtle text-primary">
                      {{ index + 1 }}
                    </span>
                  </div>
                  <div class="flex-grow-1 ms-3">
                    <div class="fw-medium">{{ role.role_name }}</div>
                    <small class="text-muted">{{ role.description?.slice(0, 60) }}...</small>
                  </div>
                  <div class="role-count">
                    <span class="badge bg-success">{{ role.students_count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Последняя активность -->
        <div class="mt-4">
          <h6 class="mb-3">Последняя активность</h6>
          <div class="activity-list">
            <div
              v-for="(activity, index) in studentActivity"
              :key="index"
              class="activity-item"
            >
              <div class="d-flex align-items-start">
                <div class="activity-icon" :class="`bg-${activity.color}-subtle text-${activity.color}`">
                  <component :is="activity.icon" :size="16" />
                </div>
                <div class="flex-grow-1 ms-3">
                  <div class="activity-content">
                    <strong>{{ activity.student }}</strong>
                    {{ activity.action }}
                    <span class="text-muted">{{ activity.details }}</span>
                  </div>
                  <small class="text-muted">{{ activity.time }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Футер -->
    <div class="card-footer">
      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          Активных студентов: {{ studentOverview.active_in_tests }} из {{ studentOverview.total_students }}
        </small>
        <button class="btn btn-sm btn-outline-primary">
          Подробная статистика
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stat-card {
  padding: 1rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--bs-primary);
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  margin: 0 auto 0.75rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--bs-body-color);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--bs-secondary-color);
  margin-bottom: 0.25rem;
}

.stat-percentage {
  font-size: 0.75rem;
  font-weight: 600;
}

.groups-list, .roles-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-item, .role-item {
  padding: 0.75rem;
  background-color: var(--bs-gray-50);
  border-radius: 0.375rem;
  border: 1px solid var(--bs-border-color);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--bs-gray-100);
    border-color: var(--bs-primary);
  }
}

.role-rank {
  flex-shrink: 0;
}

.role-count {
  flex-shrink: 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--bs-border-color);

  &:last-child {
    border-bottom: none;
  }
}

.activity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.activity-content {
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.progress {
  background-color: var(--bs-gray-200);
}

.activity-list {
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
}

// Адаптивность
@media (max-width: 767.98px) {
  .stat-card {
    padding: 0.75rem;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .group-item, .role-item {
    padding: 0.5rem;
  }

  .activity-item {
    padding: 0.375rem 0;
  }

  .activity-icon {
    width: 28px;
    height: 28px;
  }

  .activity-content {
    font-size: 0.8rem;
  }
}
</style>