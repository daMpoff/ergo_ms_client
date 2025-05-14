<template>
  <div class="database-management card rounded-3 p-4 mb-4">
    <div class="container px-0">
      <!-- Заголовок и кнопки управления -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="mb-0 text-primary d-flex align-items-center">
          <Database :size="22" class="me-2"/>
          Управление данными
        </h3>
        <div class="d-flex gap-2">
          <button
            @click="$emit('download')"
            :disabled="isDownloading || isUploading"
            class="btn btn-primary d-flex align-items-center action-btn">
            <template v-if="isDownloading">
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Выгрузка...
            </template>
            <template v-else>
              <ArrowDownToLine :size="18" class="me-2"/>
              <span>Экспорт данных</span>
            </template>
          </button>
          <button
            @click="loadSampleData"
            :disabled="isDownloading || isUploading"
            class="btn btn-outline-primary d-flex align-items-center action-btn">
            <template v-if="isUploading">
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Загрузка...
            </template>
            <template v-else>
              <ArrowUpFromLine :size="18" class="me-2"/>
              <span>Загрузить примеры</span>
            </template>
          </button>
          <button
            @click="$emit('clear')"
            :disabled="isDownloading || isUploading"
            class="btn btn-outline-danger d-flex align-items-center action-btn">
            <Trash2 :size="18" class="me-2"/>
            <span>Очистить</span>
          </button>
        </div>
      </div>

      <div class="alert alert-info" role="alert">
        <Info :size="18" class="me-2 text-primary"/>
        <span>Используйте эти инструменты для управления данными в базе данных</span>
      </div>
    </div>
    <ToastNotification ref="toastRef" />
  </div>
</template>

<script setup>
import { Database, ArrowDownToLine, ArrowUpFromLine, Trash2, Info } from 'lucide-vue-next'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import { ref } from 'vue'
import ToastNotification from './ToastNotification.vue'

const toastRef = ref(null)

defineProps({
  isDownloading: Boolean,
  isUploading: Boolean
})

const emit = defineEmits(['download', 'clear', 'update:isUploading', 'reload'])

const loadSampleData = async () => {
  emit('update:isUploading', true)
  try {
    // Используем последовательную загрузку данных с ожиданием каждого запроса

    const steps = [
      // Сначала загрузим базовые данные
      { name: 'работодателей', endpoint: endpoints.learning_analytics.employers.loadSampleData },
      { delay: 500, message: 'Пауза после загрузки работодателей' },

      { name: 'специальностей', endpoint: endpoints.learning_analytics.specialities.loadSampleData },
      { delay: 500, message: 'Пауза после загрузки специальностей' },

      { name: 'учебных планов', endpoint: endpoints.learning_analytics.curriculums.loadSampleData },
      { delay: 500, message: 'Пауза после загрузки учебных планов' },

      { name: 'технологий', endpoint: endpoints.learning_analytics.technologies.loadSampleData },
      { delay: 500, message: 'Пауза после загрузки технологий' },

      { name: 'компетенций', endpoint: endpoints.learning_analytics.competencies.loadSampleData },
      { delay: 500, message: 'Пауза после загрузки компетенций' },

      // Теперь загрузим данные, которые зависят от предыдущих
      { name: 'базовых дисциплин', endpoint: endpoints.learning_analytics.baseDisciplines.loadSampleData },
      { delay: 500, message: 'Пауза после загрузки базовых дисциплин' },

      { name: 'дисциплин', endpoint: endpoints.learning_analytics.disciplines.loadSampleData },
      { delay: 800, message: 'Пауза после загрузки дисциплин' },

      { name: 'вакансий', endpoint: endpoints.learning_analytics.vacancies.loadSampleData },
      { delay: 1000, message: 'Пауза для гарантии загрузки вакансий' },

      // Загрузка данных с самыми сложными зависимостями
      { name: 'матриц академических компетенций', endpoint: endpoints.learning_analytics.acms.loadSampleData },
      { delay: 800, message: 'Пауза после загрузки ACM' },

      { name: 'профилей компетенций вакансий', endpoint: endpoints.learning_analytics.vcms.loadSampleData },
      { delay: 800, message: 'Пауза после загрузки VCM' },

      { name: 'матриц компетенций пользователей', endpoint: endpoints.learning_analytics.ucms.loadSampleData }
    ]


    for (const step of steps) {
      if (step.delay) {
        // Добавляем задержку между шагами, если указана
        await new Promise(resolve => setTimeout(resolve, step.delay))
        console.log(`Добавлена задержка ${step.delay}ms: ${step.message || 'для гарантии завершения предыдущих запросов'}`)
        continue
      }

      try {
        console.log(`Загрузка ${step.name}...`)
        const response = await apiClient.post(step.endpoint)
        console.log(`✓ Загрузка ${step.name} успешно завершена`, response.data)


        // Небольшая пауза после каждого шага для снижения нагрузки
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`✗ Ошибка при загрузке ${step.name}:`, error.response?.data || error.message)
        // Показываем уведомление, но продолжаем загрузку других данных
        toastRef.value?.show(`Ошибка при загрузке ${step.name}. Проверьте консоль для деталей.`, 'warning')

        // Добавляем увеличенную паузу после ошибки
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    toastRef.value?.show(`Примерные данные успешно загружены`, 'success')
    // Обновляем таблицы после успешной загрузки
    emit('reload')
  } catch (error) {
    console.error('Общая ошибка при загрузке примерных данных:', error)
    toastRef.value?.show('Произошла ошибка при загрузке примерных данных. Проверьте консоль для получения дополнительной информации.', 'error')
  } finally {
    emit('update:isUploading', false)
  }
}
</script>

<style scoped>
.database-management {
  background: rgba(--bs-body-bg, 0.8);
  border: 1px solid var(--bs-border-color);
  box-shadow: 0 4px 24px 0 rgba(60, 72, 88, 0.08), 0 1.5px 4px 0 rgba(60, 72, 88, 0.04);
  transition: box-shadow 0.2s;
}

.database-management:hover {
  box-shadow: 0 8px 32px 0 rgba(60, 72, 88, 0.16), 0 3px 8px 0 rgba(60, 72, 88, 0.08);
}

.action-btn {
  min-width: 170px;
  transition: all 0.18s cubic-bezier(.4,0,.2,1);
  font-weight: 500;
  letter-spacing: 0.01em;
  box-shadow: 0 1px 2px 0 rgba(60,72,88,0.04);
}

.action-btn:not(:disabled):hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 12px 0 rgba(60,72,88,0.10);
  z-index: 1;
}

.d-flex.gap-2 {
  gap: 1.1rem !important;
}

h3 {
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.alert {
  background-color: var(--bs-tertiary-bg);
  color: var(--bs-secondary-color);
  border: none;
  box-shadow: 0 1px 4px 0 rgba(60,72,88,0.04);
  display: flex;
  align-items: center;
  font-size: 1.05rem;
  font-weight: 500;
}

.spinner-border {
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}
</style>
