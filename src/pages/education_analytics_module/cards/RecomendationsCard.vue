<template>
    <div class="recommendations-container container-fluid p-0">
      <div class="card shadow-sm border-0 rounded-3">
        <div class="card-body p-4">
          <!-- Заголовок и описание -->
          <div class="mb-4">
            <h2 class="mb-2 fw-bold">Персонализированные рекомендации</h2>
            <p class="text-muted mb-0">Подборка материалов для вашего профессионального роста</p>
          </div>
  
          <!-- Табы категорий -->
          <ul class="nav nav-tabs mb-4" id="recommendationsTab" role="tablist">
            <li 
              v-for="category in categories"
              :key="category.id"
              class="nav-item"
              role="presentation"
            >
              <button
                @click="selectCategory(category.id)"
                :class="{ active: selectedCategory === category.id }"
                class="nav-link"
                type="button"
              >
                {{ category.name }}
              </button>
            </li>
          </ul>
  
          <!-- Контент рекомендаций -->
          <div class="tab-content">
            <div class="tab-pane fade show active">
              <div v-if="filteredRecommendations.length" class="row g-4">
                <div 
                  v-for="recommendation in filteredRecommendations"
                  :key="recommendation.id"
                  class="col-12 col-md-6 col-lg-4"
                >
                  <div class="card h-100 border-0 shadow-sm hover-shadow transition-all">
                    <div class="card-body d-flex flex-column">
                      <!-- Бейдж типа -->
                      <span 
                        class="badge mb-3 align-self-start"
                        :class="`bg-${getBadgeVariant(recommendation.type)}-subtle text-${getBadgeVariant(recommendation.type)}`"
                      >
                        {{ getTypeName(recommendation.type) }}
                      </span>
                      
                      <!-- Заголовок и описание -->
                      <h5 class="card-title">{{ recommendation.title }}</h5>
                      <p class="card-text text-muted mb-3">{{ recommendation.description }}</p>
                      
                      <!-- Мета-информация -->
                      <div class="mt-auto">
                        <div class="d-flex gap-3 text-muted small mb-3">
                          <span v-if="recommendation.duration" class="d-flex align-items-center gap-1">
                            <i class="bi bi-clock"></i>
                            {{ recommendation.duration }}
                          </span>
                          <span v-if="recommendation.level" class="d-flex align-items-center gap-1">
                            <i class="bi bi-bar-chart"></i>
                            {{ recommendation.level }}
                          </span>
                        </div>
                        
                        <!-- Кнопка действия -->
                        <a 
                          :href="recommendation.link" 
                          target="_blank"
                          class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                        >
                          Изучить
                          <i class="bi bi-arrow-right"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Сообщение, если нет рекомендаций -->
              <div v-else class="text-center py-5">
                <div class="mb-3">
                  <i class="bi bi-info-circle text-muted" style="font-size: 2.5rem;"></i>
                </div>
                <h5 class="text-muted">Рекомендации не найдены</h5>
                <p class="text-muted">Попробуйте выбрать другую категорию</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  
  const categories = ref([
    { id: 'courses', name: 'Курсы' },
    { id: 'books', name: 'Книги' },
    { id: 'articles', name: 'Статьи' },
    { id: 'practices', name: 'Практики' },
    { id: 'events', name: 'Мероприятия' }
  ]);
  
  const recommendations = ref([
    {
      id: 1,
      category: 'courses',
      type: 'video',
      title: 'Vue 3 - Полное руководство',
      description: 'Подробный курс по Vue 3, включая Composition API, Vuex и Router',
      duration: '15 часов',
      level: 'Средний',
      link: '#'
    },
    {
      id: 2,
      category: 'courses',
      type: 'interactive',
      title: 'Основы Composition API',
      description: 'Интерактивный курс по работе с новой системой реактивности Vue',
      duration: '8 часов',
      level: 'Начальный',
      link: '#'
    },
    {
      id: 3,
      category: 'books',
      type: 'book',
      title: 'Vue.js в действии',
      description: 'Лучшая книга для глубокого понимания Vue.js',
      level: 'Начальный-Средний',
      link: '#'
    },
    {
      id: 4,
      category: 'articles',
      type: 'article',
      title: 'Оптимизация производительности во Vue',
      description: '10 практических советов по ускорению вашего Vue-приложения',
      link: '#'
    },
    {
      id: 5,
      category: 'practices',
      type: 'practice',
      title: 'Реализация анимаций во Vue',
      description: 'Практическое руководство по созданию плавных анимаций',
      duration: '2 часа практики',
      level: 'Средний',
      link: '#'
    },
    {
      id: 6,
      category: 'events',
      type: 'event',
      title: 'VueConf 2023',
      description: 'Главная конференция по Vue.js с участием создателя фреймворка',
      duration: '2 дня',
      link: '#'
    }
  ]);
  
  const selectedCategory = ref('courses');
  
  onMounted(() => {
    selectedCategory.value = 'courses';
  });
  
  const selectCategory = (categoryId) => {
    selectedCategory.value = categoryId;
  };
  
  const getTypeName = (type) => {
    const types = {
      video: 'Видеокурс',
      interactive: 'Интерактив',
      book: 'Книга',
      article: 'Статья',
      practice: 'Практика',
      event: 'Мероприятие'
    };
    return types[type] || type;
  };
  
  const getBadgeVariant = (type) => {
    const variants = {
      video: 'primary',
      interactive: 'success',
      book: 'info',
      article: 'warning',
      practice: 'danger',
      event: 'purple'
    };
    return variants[type] || 'secondary';
  };
  
  const filteredRecommendations = computed(() => {
    return recommendations.value.filter(r => r.category === selectedCategory.value);
  });
  </script>
  
  <style scoped>
  .recommendations-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .hover-shadow {
    transition: all 0.2s ease;
  }
  
  .hover-shadow:hover {
    transform: translateY(-2px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  }
  
  .transition-all {
    transition: all 0.2s ease;
  }
  
  .nav-tabs .nav-link {
    color: var(--bs-gray-600);
    font-weight: 500;
    border: none;
    padding: 0.75rem 1.25rem;
    position: relative;
  }
  
  .nav-tabs .nav-link:hover {
    color: var(--bs-primary);
  }
  
  .nav-tabs .nav-link.active {
    color: var(--bs-primary);
    background: transparent;
    border: none;
  }
  
  .nav-tabs .nav-link.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--bs-primary);
  }
  
  .bg-purple-subtle {
    background-color: rgba(111, 66, 193, 0.1) !important;
  }
  
  .text-purple {
    color: #6f42c1 !important;
  }
  </style>