<script setup>
import { ref, onMounted, computed } from 'vue'
import { endpoints } from '@/js/api/endpoints.js'
import { Building2, Briefcase, CheckCircle, AlertCircle, Users, TrendingUp, Eye, Filter } from 'lucide-vue-next'
import axios from 'axios'

// Данные компаний и вакансий из API
const companiesVacanciesData = ref([])
const popularVacancySkills = ref([])
const isLoading = ref(true)

// Статистика компаний (вычисляемая)
const companyStats = computed(() => {
  const total = companiesVacanciesData.value.length
  const verified = companiesVacanciesData.value.filter(c => c.is_verified).length
  const unverified = total - verified
  const withVacancies = companiesVacanciesData.value.filter(c => c.vacancy_count > 0).length

  return {
    total,
    verified,
    unverified,
    withVacancies
  }
})

// Статистика вакансий (вычисляемая)
const vacancyStats = computed(() => {
  const totalVacancies = companiesVacanciesData.value.reduce((sum, c) => sum + c.vacancy_count, 0)
  const totalApplications = companiesVacanciesData.value.reduce((sum, c) => sum + c.application_count, 0)
  const totalSkills = companiesVacanciesData.value.reduce((sum, c) => sum + c.unique_skills_required, 0)
  const averageSkillsRequired = companiesVacanciesData.value.length > 0
    ? Math.round(totalSkills / companiesVacanciesData.value.length)
    : 0

  return {
    total: totalVacancies,
    active: totalVacancies, // Предполагаем, что все активные
    applications: totalApplications,
    averageSkillsRequired
  }
})

// Топ компании по количеству вакансий
const topCompanies = computed(() => {
  return companiesVacanciesData.value
    .filter(company => company.vacancy_count > 0)
    .sort((a, b) => b.vacancy_count - a.vacancy_count)
    .slice(0, 5)
    .map(company => ({
      ...company,
      efficiency: company.vacancy_count > 0 ? 'Активная' : 'Без вакансий'
    }))
})

// Фильтры
const companyFilter = ref('all') // all, verified, unverified
const vacancyFilter = ref('all') // all, with_applications, no_applications

// Показать детали
const showDetails = ref(false)

// Загрузка данных компаний и вакансий из API
const loadCompaniesVacancies = async () => {
  isLoading.value = true

  try {
    const [companiesVacanciesResponse, popularSkillsResponse] = await Promise.all([
      axios.get(endpoints.expert_system.dashboard.companiesVacanciesStats),
      axios.get(endpoints.expert_system.dashboard.popularVacancySkills)
    ])

    companiesVacanciesData.value = companiesVacanciesResponse.data
    popularVacancySkills.value = popularSkillsResponse.data

  } catch (error) {
    console.error('Ошибка загрузки данных компаний и вакансий:', error)
  } finally {
    isLoading.value = false
  }
}

// Фильтрация компаний
const filteredCompanies = computed(() => {
  let filtered = companiesVacanciesData.value

  if (companyFilter.value === 'verified') {
    filtered = filtered.filter(c => c.is_verified)
  } else if (companyFilter.value === 'unverified') {
    filtered = filtered.filter(c => !c.is_verified)
  }

  return filtered
})

// Получение статуса компании
const getCompanyStatusColor = (isVerified) => {
  return isVerified ? 'success' : 'warning'
}

// Получение иконки статуса
const getCompanyStatusIcon = (isVerified) => {
  return isVerified ? CheckCircle : AlertCircle
}

onMounted(() => {
  loadCompaniesVacancies()
})
</script>

<template>
  <div class="card h-100">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="card-title">Компании и вакансии</h5>
          <p class="card-subtitle">
            Статистика работодателей и открытых позиций
          </p>
        </div>

        <div class="d-flex gap-2 align-items-center">
          <button
            @click="showDetails = !showDetails"
            class="btn btn-sm btn-outline-secondary"
          >
            <Eye :size="16" class="me-1" />
            {{ showDetails ? 'Скрыть' : 'Детали' }}
          </button>

          <button @click="loadCompaniesVacancies" class="btn btn-sm btn-outline-primary">
            <TrendingUp :size="16" />
          </button>
        </div>
      </div>
    </div>

    <div class="card-body">
      <!-- Загрузка -->
      <div v-if="isLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p class="text-muted mt-2">Загрузка данных компаний...</p>
      </div>

      <div v-else>
        <!-- Основная статистика -->
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="stat-box">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-primary-subtle text-primary me-3">
                  <Building2 :size="24" />
                </div>
                <div>
                  <div class="stat-value">{{ companyStats.total }}</div>
                  <div class="stat-label">Компаний</div>
                  <small class="text-success">{{ companyStats.verified }} подтверждено</small>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="stat-box">
              <div class="d-flex align-items-center">
                <div class="stat-icon bg-info-subtle text-info me-3">
                  <Briefcase :size="24" />
                </div>
                <div>
                  <div class="stat-value">{{ vacancyStats.total }}</div>
                  <div class="stat-label">Вакансий</div>
                  <small class="text-info">{{ vacancyStats.applications }} заявок</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Топ компании -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="mb-0">Топ работодатели</h6>
            <select v-model="companyFilter" class="form-select form-select-sm" style="width: auto;">
              <option value="all">Все компании</option>
              <option value="verified">Подтвержденные</option>
              <option value="unverified">Неподтвержденные</option>
            </select>
          </div>

          <div class="companies-list">
            <div
              v-for="(company, index) in topCompanies"
              :key="company.company_id"
              class="company-item"
            >
              <div class="d-flex align-items-center">
                <div class="company-rank me-3">
                  <span class="badge bg-primary">{{ index + 1 }}</span>
                </div>

                <div class="company-info flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <div class="d-flex align-items-center">
                        <h6 class="mb-0 me-2">{{ company.company_name }}</h6>
                        <component
                          :is="getCompanyStatusIcon(company.is_verified)"
                          :size="16"
                          :class="`text-${getCompanyStatusColor(company.is_verified)}`"
                        />
                      </div>
                      <small class="text-muted">{{ company.contact_person }}</small>
                    </div>

                    <div class="text-end">
                      <div class="fw-bold text-primary">{{ company.vacancy_count }}</div>
                      <small class="text-muted">вакансий</small>
                    </div>
                  </div>

                  <!-- Дополнительная информация -->
                  <div v-if="showDetails && company.description" class="mt-2">
                    <small class="text-muted">{{ company.description.slice(0, 100) }}...</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Популярные навыки в вакансиях -->
        <div class="mb-4">
          <h6 class="mb-3">Востребованные навыки</h6>
          <div class="skills-grid">
            <div
              v-for="skill in popularVacancySkills"
              :key="skill.skill_id"
              class="skill-badge"
            >
              <div class="skill-name">{{ skill.skill_name }}</div>
              <div class="skill-stats">
                <span class="skill-count">{{ skill.vacancy_count }}</span>
                <span class="skill-percentage">{{ skill.percentage_of_vacancies }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Дополнительная статистика -->
        <div v-if="showDetails" class="additional-stats">
          <div class="row g-3">
            <div class="col-6">
              <div class="mini-stat">
                <div class="mini-stat-icon bg-success-subtle text-success">
                  <CheckCircle :size="20" />
                </div>
                <div>
                  <div class="mini-stat-value">{{ companyStats.withVacancies }}</div>
                  <div class="mini-stat-label">Активных компаний</div>
                </div>
              </div>
            </div>

            <div class="col-6">
              <div class="mini-stat">
                <div class="mini-stat-icon bg-warning-subtle text-warning">
                  <Users :size="20" />
                </div>
                <div>
                  <div class="mini-stat-value">{{ vacancyStats.averageSkillsRequired }}</div>
                  <div class="mini-stat-label">Навыков на вакансию</div>
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
          {{ companyStats.total > 0 ? Math.round((companyStats.verified / companyStats.total) * 100) : 0 }}% компаний подтверждено
        </small>
        <button class="btn btn-sm btn-outline-primary">
          Управление компаниями
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stat-box {
  padding: 1rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
  background-color: var(--bs-gray-50);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--bs-body-color);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
  margin-bottom: 0.25rem;
}

.companies-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.company-item {
  padding: 1rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
  background-color: var(--bs-body-bg);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--bs-primary);
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }
}

.company-rank {
  flex-shrink: 0;
}

.company-info {
  min-width: 0;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.skill-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--bs-primary-bg-subtle);
  border: 1px solid var(--bs-primary-border-subtle);
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--bs-primary-bg-subtle);
    border-color: var(--bs-primary);
    transform: translateY(-1px);
  }
}

.skill-name {
  font-weight: 500;
  color: var(--bs-primary);
  font-size: 0.875rem;
}

.skill-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.skill-count {
  font-weight: 600;
  color: var(--bs-body-color);
  font-size: 0.875rem;
}

.skill-percentage {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
}

.additional-stats {
  padding: 1rem;
  background-color: var(--bs-gray-50);
  border-radius: 0.5rem;
  border: 1px solid var(--bs-border-color);
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mini-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 0.375rem;
  flex-shrink: 0;
}

.mini-stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--bs-body-color);
  line-height: 1.2;
}

.mini-stat-label {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
}

// Адаптивность
@media (max-width: 767.98px) {
  .stat-box {
    padding: 0.75rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .company-item {
    padding: 0.75rem;
  }

  .skills-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .skill-badge {
    padding: 0.5rem 0.75rem;
  }

  .skill-name {
    font-size: 0.8rem;
  }

  .skill-count {
    font-size: 0.8rem;
  }

  .mini-stat {
    gap: 0.5rem;
  }

  .mini-stat-icon {
    width: 36px;
    height: 36px;
  }

  .mini-stat-value {
    font-size: 1.1rem;
  }
}

// Анимация появления элементов
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.company-item, .skill-badge {
  animation: fadeInUp 0.3s ease-out;
}

// Стилизация для различных статусов компаний
.company-item {
  &.verified {
    border-left: 4px solid var(--bs-success);
  }

  &.unverified {
    border-left: 4px solid var(--bs-warning);
  }
}
</style>