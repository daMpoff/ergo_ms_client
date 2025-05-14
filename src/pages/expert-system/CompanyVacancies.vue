<template>
  <div>
    <div class="d-flex justify-content-end mb-3">
      <CreateVacancy @created="fetchVacancies" @error="$emit('error', $event)" />
    </div>
    <div class="row gy-3">
      <div class="col-md-4" v-for="vac in vacancies" :key="vac.id">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h6 class="card-title">{{ vac.title }}</h6>
            <p class="card-text">{{ vac.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import CreateVacancy from '@/pages/expert-system/CreateVacancy.vue'

const vacancies = ref([])

async function fetchVacancies() {
  try {
    const res = await apiClient.get(endpoints.expert_system.vacancies)
    if (res.success) vacancies.value = res.data
    else throw new Error(JSON.stringify(res.errors))
  } catch (err) {
    emit('error', err.message || 'Не удалось загрузить вакансии')
  }
}

onMounted(fetchVacancies)
</script>
