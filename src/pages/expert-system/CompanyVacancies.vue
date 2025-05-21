<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <CreateVacancy
        @created="fetchVacancies"
        @error="$emit('error', $event)"
      />
      <input
        v-model="searchTerm"
        type="text"
        class="form-control fs-5 form-control-sm w-50 mt-2"
        placeholder="Поиск вакансий..."
      />
    </div>

    <div class="row mt-2 gy-4">
      <div class="col-md-4" v-for="vac in filteredVacancies" :key="vac.id">
        <div class="card h-100 shadow-lg border-success vacancy-card">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0 fs-4">{{ vac.title }}</h5>
          </div>
          <div class="card-body d-flex flex-column">
            <p class="card-text mb-4">{{ vac.description }}</p>
            <div class="mb-4">
              <strong>Навыки:</strong>
              <div class="mt-2">
                <span
                  v-for="skill in vac.required_skills_info"
                  :key="skill.id"
                  class="badge bg-success me-1 mb-1"
                >
                  {{ skill.name }}
                </span>
                <span v-if="!vac.required_skills_info.length" class="text-muted">
                  нет
                </span>
              </div>
            </div>

            <div class="mt-auto d-flex justify-content-end gap-2">
              <EditVacancy
                :vacancy="vac"
                @updated="fetchVacancies"
                @error="$emit('error', $event)"
              />
              <button
                class="btn btn-danger btn-sm"
                @click="deleteVacancy(vac.id)"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!filteredVacancies.length" class="col-12 text-center text-muted py-5">
        Вакансии не найдены.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import CreateVacancy from '@/pages/expert-system/CreateVacancy.vue'
import EditVacancy from '@/pages/expert-system/EditVacancy.vue'

const emit = defineEmits(['error'])
const vacancies = ref([])
const searchTerm = ref('')

async function fetchVacancies() {
  try {
    const res = await apiClient.get(endpoints.expert_system.vacancies)
    if (res.success) vacancies.value = res.data
    else throw new Error(JSON.stringify(res.errors))
  } catch (err) {
    emit('error', err.message || 'Не удалось загрузить вакансии')
  }
}

async function deleteVacancy(id) {
  try {
    const res = await apiClient.delete(
      `${endpoints.expert_system.vacancies}${id}/`
    )
    if (!res.success) throw new Error(JSON.stringify(res.errors))
    await fetchVacancies()
  } catch (err) {
    emit('error', err.message || 'Ошибка при удалении')
  }
}

const filteredVacancies = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return vacancies.value
  return vacancies.value.filter(v =>
    v.title.toLowerCase().includes(term) ||
    v.description.toLowerCase().includes(term) ||
    v.required_skills_info.some(s =>
      s.name.toLowerCase().includes(term)
    )
  )
})

onMounted(fetchVacancies)
</script>

<style scoped>
.vacancy-card {
  padding: 0;
  border: 2px solid green;
  transition: transform .2s, box-shadow .2s;
}
.vacancy-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 128, 0, 0.3);
}
.card-header h5 {
  font-size: 1.1rem;
}
.badge {
  font-size: 0.8rem;
}
</style>
