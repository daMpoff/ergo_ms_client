<template>
    <div class="parent-layout">
      <!-- Навигационное меню -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div class="container">
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item">
                <a class="nav-link" href="#" 
                   :class="{active: currentTab === 'dashboard'}"
                   @click.prevent="currentTab = 'dashboard'">
                  Главная
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" 
                   :class="{active: currentTab === 'competences'}"
                   @click.prevent="currentTab = 'competences'">
                  Предметы
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" 
                   :class="{active: currentTab === 'progress'}"
                   @click.prevent="currentTab = 'progress'">
                  Прогресс
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" 
                   :class="{active: currentTab === 'plan'}"
                   @click.prevent="currentTab = 'plan'">
                  План развития
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" 
                   :class="{active: currentTab === 'reports'}"
                   @click.prevent="currentTab = 'reports'">
                  Отчеты
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
  
      <!-- Контентная область -->
      <div class="container">
        <!-- Dashboard -->
        <div v-if="currentTab === 'dashboard'" class="dashboard-tab">
          <div class="row mb-4">
            <div class="col">
              <h1>Мониторинг освоения компетенций</h1>
              <p class="lead">Система для отслеживания прогресса студентов и формирования индивидуальных планов развития</p>
            </div>
          </div>
  
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h2 class="card-title">{{ stats.competences }}</h2>
                  <p class="card-text">Компетенций в системе</p>
                  <button class="btn btn-primary" @click="currentTab = 'competences'">
                    Управление
                  </button>
                </div>
              </div>
            </div>
            
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h2 class="card-title">{{ stats.students }}</h2>
                  <p class="card-text">Студентов в системе</p>
                  <button class="btn btn-primary" @click="currentTab = 'progress'">
                    Прогресс
                  </button>
                </div>
              </div>
            </div>
            
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h2 class="card-title">{{ stats.plans }}</h2>
                  <p class="card-text">Индивидуальных планов</p>
                  <button class="btn btn-primary" @click="currentTab = 'plan'">
                    Планы развития
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <div class="row mt-4">
            <div class="col">
              <div class="card">
                <div class="card-header">
                  <h5 class="card-title mb-0">Последние уведомления</h5>
                </div>
                <div class="card-body">
                  <div v-if="notifications.length === 0" class="text-muted">
                    Нет новых уведомлений
                  </div>
                  <ul class="list-group list-group-flush" v-else>
                    <li v-for="(notification, index) in notifications" :key="index" 
                        class="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">{{ notification.title }}</h6>
                        <small class="text-muted">{{ notification.date }}</small>
                        <p class="mb-0 small">{{ notification.message }}</p>
                      </div>
                      <button class="btn btn-sm btn-outline-secondary" @click="dismissNotification(index)">
                        ×
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Компоненты -->
        <CompetenceManager v-if="currentTab === 'competences'" />
        <StudentProgress v-if="currentTab === 'progress'" />
        <DevelopmentPlan v-if="currentTab === 'plan'" />
        <ReportsDashboard v-if="currentTab === 'reports'" />
      </div>
    </div>
  </template>
  
  <script>
  import CompetenceManager from '@/pages/competencies/SubjectsManager.vue'
  import StudentProgress from '@/pages/competencies/StudentProgress.vue'
  import DevelopmentPlan from '@/pages/competencies/DevelopmentPlan.vue'
  
  export default {
    name: 'ParentLayout',
    components: {
      CompetenceManager,
      StudentProgress,
      DevelopmentPlan,
    },
    data() {
      return {
        currentTab: 'dashboard',
        stats: {
          competences: 24,
          students: 156,
          plans: 89
        },
        notifications: [
          {
            title: 'Новые тесты доступны',
            message: 'Доступны новые тесты по теме "Базы данных"',
            date: '15.06.2023'
          },
          {
            title: 'Обновление системы',
            message: 'Запланировано обновление системы на 20.06.2023',
            date: '10.06.2023'
          },
          {
            title: 'Собрание преподавателей',
            message: 'Собрание по обсуждению планов развития студентов',
            date: '05.06.2023'
          }
        ]
      }
    },
    methods: {
      dismissNotification(index) {
        this.notifications.splice(index, 1)
      }
    }
  }
  </script>
  
  <style scoped>
  .parent-layout {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }
  
  .navbar {
    margin-bottom: 20px;
  }
  
  .card {
    transition: transform 0.2s;
  }
  .card:hover {
    transform: translateY(-5px);
  }
  
  .nav-link {
    cursor: pointer;
  }
  </style>