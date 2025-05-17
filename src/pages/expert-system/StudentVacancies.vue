<template>
  <section class="student-vacancies-list py-4">
    <h4 class="mb-3">Вакансии для студентов</h4>

    <div class="row">
      <aside class="col-md-3 mb-4">
        <div class="card p-3">
          <h6>Фильтр по навыкам</h6>
          <ul class="list-unstyled mb-2">
            <li class="form-check mb-2">
              <input
                class="form-check-input"
                type="checkbox"
                id="filter-my-skills"
                v-model="useMySkills"
              />
              <label class="form-check-label" for="filter-my-skills">
                Выбрать мои навыки
              </label>
            </li>
            <li
              v-for="skill in skills"
              :key="skill.id"
              class="form-check ps-3 mb-1"
            >
              <input
                class="form-check-input"
                type="checkbox"
                :id="`filter-skill-${skill.id}`"
                :value="skill.id"
                v-model="manualSelected"
                :disabled="useMySkills"
              />
              <label class="form-check-label small" :for="`filter-skill-${skill.id}`">
                {{ skill.name }}
              </label>
            </li>
          </ul>
          <button class="btn btn-sm btn-outline-secondary" @click="clearFilters">
            Сбросить
          </button>
        </div>
      </aside>
      <div class="col-md-9">
        <ul class="list-group">
          <li v-if="loading" class="list-group-item text-center text-muted">
            Загрузка вакансий…
          </li>
          <li v-else-if="!filteredVacancies.length" class="list-group-item text-center text-muted">
            Нет доступных вакансий.
          </li>
          <li
            v-for="vac in filteredVacancies"
            :key="vac.id"
            class="list-group-item d-flex align-items-center"
          >
            <div class="vacancy-info flex-grow-1">
              <h6 class="mb-1">
                <router-link :to="`/vacancy/${vac.id}`">{{ vac.title }}</router-link>
              </h6>
              <small class="d-block text-muted mb-1">
                Компания:
                <router-link :to="`/company/${vac.employer}`">
                  {{ vac.employer_name }}
                </router-link>
              </small>
              <div class="vacancy-skills text-truncate mb-1">
                <span
                  v-for="skill in vac.required_skills_info"
                  :key="skill.id"
                  class="badge bg-secondary me-1"
                >
                  {{ skill.name }}
                </span>
                <span v-if="!vac.required_skills_info.length" class="text-muted">
                  Нет навыков
                </span>
              </div>
              <small class="text-muted">Соответствие: {{ vac.match_score }}%</small>
            </div>
            <button
              class="btn btn-success btn-sm ms-3"
              :disabled="applied.includes(vac.id)"
              @click="applyVacancy(vac.id)"
            >
              {{ applied.includes(vac.id) ? 'Откликнуто' : 'Откликнуться' }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const emit = defineEmits(['error'])
const skills = ref([])
const vacancies = ref([])
const manualSelected = ref([])
const useMySkills = ref(false)
const mySkills = ref([])
const applied = ref([])
const loading = ref(false)

// 1) загрузка всех навыков
async function fetchSkills() {
  try {
    const res = await apiClient.get(endpoints.expert_system.skills)
    if (!res.success) throw new Error(JSON.stringify(res.errors))
    skills.value = res.data
  } catch (err) {
    emit('error', err.message || 'Не удалось загрузить навыки')
  }
}

// 2) загрузка вакансий
async function fetchVacancies() {
  loading.value = true
  try {
    const res = await apiClient.get(endpoints.expert_system.vacancies)
    if (!res.success) throw new Error(JSON.stringify(res.errors))
    vacancies.value = res.data
  } catch (err) {
    emit('error', err.message || 'Не удалось загрузить вакансии')
  } finally {
    loading.value = false
  }
}

// 3) загрузка навыков текущего студента
async function fetchMySkills() {
  try {
    const res = await apiClient.get(endpoints.expert_system.getUserSkills)
    if (!res.success) throw new Error(JSON.stringify(res.errors))
    // ожидаем [{id, name, status}, ...]
    mySkills.value = res.data.map(s => s.id)
  } catch (err) {
    emit('error', err.message || 'Не удалось загрузить мои навыки')
  }
}

// 4) при переключении «Выбрать мои навыки» подставляем в manualSelected
watch(useMySkills, async val => {
  if (val) {
    await fetchMySkills()
    manualSelected.value = [...mySkills.value]
  } else {
    manualSelected.value = []
  }
})

// 5) добавляем match_score в вакансии
const vacanciesWithScore = computed(() =>
  vacancies.value.map(vac => {
    const reqIds = vac.required_skills_info.map(s => s.id)
    const matched = reqIds.filter(id => manualSelected.value.includes(id)).length
    return {
      ...vac,
      match_score: reqIds.length ? Math.round((matched / reqIds.length) * 100) : 0
    }
  })
)

// 6) фильтрация: OR — хотя бы один навык совпадает
const filteredVacancies = computed(() => {
  if (!manualSelected.value.length) return vacanciesWithScore.value
  return vacanciesWithScore.value.filter(vac => {
    const reqIds = vac.required_skills_info.map(s => s.id)
    return manualSelected.value.some(id => reqIds.includes(id))
  })
})

function clearFilters() {
  useMySkills.value = false
  manualSelected.value = []
}

async function applyVacancy(id) {
  try {
    const res = await apiClient.post(
      endpoints.expert_system.candidate_applications,
      { vacancy: id }
    )
    if (!res.success) throw new Error(JSON.stringify(res.errors))
    applied.value.push(id)
  } catch (err) {
    emit('error', err.message || 'Не удалось откликнуться')
  }
}

onMounted(async () => {
  await Promise.all([fetchSkills(), fetchVacancies(), fetchMySkills()])
})
</script>

<style scoped>
.student-vacancies-list h4 {
  font-size: 1.5rem;
}
.list-group-item {
  padding: .75rem 1rem;
}
.vacancy-info {
  min-width: 0;
}
.vacancy-skills {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.form-check-input {
  width: 1rem;
  height: 1rem;
}
</style>
