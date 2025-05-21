<template>
  <div class="vacancy-detail">
    <div class="d-flex align-items-center mb-5">
      <button class="btn btn-outline-secondary me-3 rounded-circle d-flex align-items-center justify-content-center"
        @click="$router.back()" aria-label="Назад" style="width: 40px; height: 40px;">
        <ArrowLeftCircle class="text-primary" />
      </button>
      <h4 class="text-primary fw-bold mb-0">Назад</h4>
    </div>

    <div v-if="loading" class="text-center my-5 py-5">
      <div class="mb-3">
        <Loader />
      </div>
      <h5 class="text-muted">Загружаем информацию о вакансии...</h5>
    </div>

    <div v-else-if="error" class="alert alert-danger d-flex align-items-center" role="alert">
      <AlertTriangle class="me-2" />
      <div class="fw-medium">{{ error }}</div>
    </div>

    <div v-else class="container px-0">
      <div class="vacancy-banner mb-4 p-4 rounded-4 position-relative overflow-hidden">
        <div class="position-relative z-1">
          <h2 class="h3 title-block mb-3 text-white">{{ vacancy.title }}</h2>
          <div class="d-flex align-items-center">
            <Building class="text-white me-2" />
            <router-link :to="`/company/${vacancy.employer}`" class="text-decoration-none text-secondary title-block">
              {{ vacancy.employer_name }}
            </router-link>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Описание -->
        <div class="col-md-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <div class="d-flex align-items-center mb-3">
                <div class="icon-box bg-primary bg-opacity-10 text-primary me-3">
                  <FileText :size="30" />
                </div>
                <h5 class="mb-0 title-block">Описание</h5>
              </div>
              <p class="card-text bg-light p-3 rounded-3">{{ vacancy.description || 'Нет описания' }}</p>
            </div>
          </div>
        </div>

        <!-- Требуемые навыки -->
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <div class="d-flex align-items-center mb-3">
                <div class="icon-box bg-primary bg-opacity-10 text-primary me-3">
                  <Lightbulb :size="30" />
                </div>
                <h5 class="mb-0 fw-semibold">Требуемые навыки</h5>
              </div>
              <div class="d-flex flex-wrap gap-1 mt-3">
                <span v-for="skill in vacancy.required_skills_info" :key="skill.id"
                  class="badge badge-skill select-none">
                  {{ skill.name }}
                </span>
                <span v-if="!vacancy.required_skills_info.length" class="text-muted fst-italic">
                  Навыки не указаны
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Действия -->
      <div class="d-flex flex-column flex-md-row gap-3 pt-4">
        <button class="btn btn-gradient-success px-4 py-3 d-flex align-items-center justify-content-center flex-grow-1"
          @click="applyVacancy(vacancy.id)">
          <Send class="me-2" :size="16" />
          <span class="font-italic">Откликнуться на вакансию</span>
        </button>

        <button class="btn btn-outline-primary px-4 py-3 d-flex align-items-center justify-content-center flex-grow-1"
          @click="shareVacancy">
          <ExternalLink class="me-2" width="18" height="18" />
          <span class="fw-medium">Поделиться</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import { ArrowLeftCircle, Loader, AlertTriangle, Building, FileText, Lightbulb, Send, ExternalLink } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const vacancy = ref(null)
const loading = ref(true)
const error = ref(null)
const applied = ref([])

async function fetchVacancy() {
  loading.value = true
  error.value = null

  try {
    const res = await apiClient.get(
      endpoints.expert_system.vacancies + route.params.id
    )

    if (!res.success) throw new Error(JSON.stringify(res.errors))

    vacancy.value = {
      ...res.data,
      required_skills_info: res.data.required_skills_info || []
    }
  } catch (err) {
    error.value = 'Не удалось загрузить данные вакансии'
    console.error('Ошибка загрузки вакансии:', err)
  } finally {
    loading.value = false
  }
}

async function applyVacancy(id) {
  try {
    const res = await apiClient.post(endpoints.expert_system.candidate_applications, {
      vacancy: id
    })

    if (!res.success) throw new Error(JSON.stringify(res.errors))
    applied.value.push(id)
    router.push({ name: 'Vacancies' })
  } catch (err) {
    error.value = 'Не удалось откликнуться на вакансию'
    console.error('Ошибка отклика:', err)
  }
}

function shareVacancy() {
  if (navigator.share) {
    navigator.share({
      title: vacancy.value.title,
      text: `Интересная вакансия: ${vacancy.value.title}`,
      url: window.location.href
    }).catch(console.error)
  } else {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Ссылка скопирована в буфер обмена'))
      .catch(() => alert('Не удалось скопировать ссылку'))
  }
}

onMounted(() => {
  fetchVacancy()
})
</script>

<style scoped>
.title-block {
  font-weight: bold;
}

.vacancy-banner {
  background: linear-gradient(135deg, #ff0011 0%, #42aaff 100%);
  box-shadow: 0 0.5rem 1.5rem rgba(13, 110, 253, 0.3);
}

.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-skill {
  background: linear-gradient(45deg, rgba(13, 110, 253, 0.1), rgba(13, 110, 253, 0.2));
  color: black;
  border-radius: 2rem;
  padding: 0.5em 1em;
  font-weight: 600;
  transition: all 0.3s ease;
}

.badge-skill:hover {
  transform: translateY(-2px);
  background: linear-gradient(45deg, rgba(13, 110, 253, 0.2), rgba(13, 110, 253, 0.3));
}

.btn-gradient-success {
  background: linear-gradient(45deg, #198754, #28a745);
  border: none;
  color: white;
  font-size: 1.1rem;
  box-shadow: 0 0.25rem 1rem rgba(40, 167, 69, 0.3);
  transition: all 0.3s ease;
}

.btn-gradient-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1.5rem rgba(40, 167, 69, 0.4);
}

.btn-outline-primary {
  border-width: 2px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover {
  box-shadow: 0 0.5rem 1.5rem rgba(167, 167, 167, 0.4);
}
</style>
