<script setup>
// Импорт всех карточек дашборда
import SystemMetricsCard from '@/components/DashboardCards/SystemMetricsCard.vue'
import SkillsAnalyticsCard from '@/components/DashboardCards/SkillsAnalyticsCard.vue'
import TestResultsCard from '@/components/DashboardCards/TestResultsCard.vue'
import StudentsOverviewCard from '@/components/DashboardCards/StudentsOverviewCard.vue'
import CompaniesVacanciesCard from '@/components/DashboardCards/CompaniesVacanciesCard.vue'
import PopularSkillsCard from '@/components/DashboardCards/PopularSkillsCard.vue'
</script>

<template>
  <div class="expert-system-dashboard">
    <div class="dashboard-header mb-4">
      <div class="row align-items-center">
        <div class="col">
          <h1 class="h3 mb-2">Экспертная система - Дашборд</h1>
          <p class="text-muted mb-0">
            Комплексная аналитика профориентации, тестирования навыков и трудоустройства
          </p>
        </div>
        <div class="col-auto">
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary">
              <i class="fas fa-download me-2"></i>Экспорт данных
            </button>
            <button class="btn btn-primary">
              <i class="fas fa-sync me-2"></i>Обновить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Первый ряд - Основные метрики системы -->
    <div class="row mb-4">
      <div class="col-12">
        <SystemMetricsCard />
      </div>
    </div>

    <!-- Второй ряд - Аналитика навыков и результатов тестов -->
    <div class="row mb-4">
      <div class="col-lg-8">
        <SkillsAnalyticsCard />
      </div>
      <div class="col-lg-4">
        <PopularSkillsCard />
      </div>
    </div>

    <!-- Третий ряд - Результаты тестов и верификация навыков -->
    <div class="row mb-4">
      <div class="col-lg-12">
        <TestResultsCard />
      </div>
    </div>

    <!-- Четвертый ряд - Студенты и группы -->
    <div class="row mb-4">
      <div class="col-lg-6">
        <StudentsOverviewCard />
      </div>
      <div class="col-lg-6">
        <CompaniesVacanciesCard />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.expert-system-dashboard {
  padding: 1.5rem;
  background-color: var(--bs-body-bg);
  min-height: 100vh;

  .dashboard-header {
    .h3 {
      color: var(--bs-body-color);
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .text-muted {
      font-size: 1rem;
    }

    .btn {
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
    }
  }

  // Общие стили для всех карточек
  :deep(.card) {
    border: 1px solid var(--bs-border-color);
    border-radius: 0.75rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    transition: box-shadow 0.15s ease-in-out;

    &:hover {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .card-header {
      background-color: var(--bs-body-bg);
      border-bottom: 1px solid var(--bs-border-color);
      padding: 1.25rem 1.25rem 1rem;

      .card-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--bs-body-color);
        margin-bottom: 0;
      }

      .card-subtitle {
        font-size: 0.875rem;
        color: var(--bs-secondary-color);
        margin-top: 0.25rem;
      }
    }

    .card-body {
      padding: 1.25rem;
    }

    .card-footer {
      background-color: var(--bs-body-bg);
      border-top: 1px solid var(--bs-border-color);
      padding: 0.75rem 1.25rem;
    }
  }

  // Адаптивность
  @media (max-width: 767.98px) {
    padding: 1rem;

    .dashboard-header {
      .col-auto {
        margin-top: 1rem;
      }

      .d-flex {
        flex-direction: column;
        gap: 0.5rem !important;

        .btn {
          width: 100%;
        }
      }
    }
  }
}
</style>