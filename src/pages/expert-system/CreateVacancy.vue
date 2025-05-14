<template>
  <button class="btn btn-outline-primary btn-sm mb-3" @click="show = true">
    + Создать вакансию
  </button>

  <div v-if="show" class="modal-backdrop">
    <div class="modal-dialog">
      <div class="modal-content p-4">
        <button type="button" class="btn-close float-end" @click="close" />
        <h5 class="mb-3">Новая вакансия</h5>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <form @submit.prevent="onSubmit">
          <div class="mb-2">
            <label class="form-label">Заголовок</label>
            <input v-model="form.title" class="form-control" required />
          </div>

          <div class="mb-2">
            <label class="form-label">Описание</label>
            <textarea
              v-model="form.description"
              class="form-control"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="mb-3">
            <label class="form-label">Поиск навыков</label>
            <input
              type="text"
              class="form-control form-control-sm"
              v-model="searchTerm"
              placeholder="Введите часть названия навыка"
            />
          </div>

          <div class="mb-3 skills-list">
            <label class="form-label">Требуемые навыки</label>
            <div v-if="filteredSkills.length">
              <div
                v-for="skill in filteredSkills"
                :key="skill.id"
                class="form-check"
              >
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="`skill-${skill.id}`"
                  :value="skill.id"
                  v-model="form.required_skills"
                />
                <label
                  class="form-check-label"
                  :for="`skill-${skill.id}`"
                >
                  {{ skill.name }}
                </label>
              </div>
            </div>
            <div v-else class="text-muted">
              Навыки не найдены.
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-success"
            :disabled="loading"
          >
            {{ loading ? 'Сохраняем...' : 'Создать' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const emit = defineEmits(['created', 'error'])

const show            = ref(false)
const loading         = ref(false)
const error           = ref(null)
const searchTerm      = ref('')
const form            = ref({
  title: '',
  description: '',
  required_skills: []
})
const skills          = ref([])

function close() {
  show.value = false
  form.value = { title: '', description: '', required_skills: [] }
  searchTerm.value = ''
  error.value = null
}

// загрузка списка навыков
onMounted(async () => {
  try {
    const res = await apiClient.get(endpoints.expert_system.skills)
    if (!res.success) throw new Error(JSON.stringify(res.errors))
    skills.value = res.data
  } catch (err) {
    emit('error', err.message || 'Не удалось загрузить навыки')
  }
})

// вычисляемый список по фильтру
const filteredSkills = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return skills.value
  return skills.value.filter(s =>
    s.name.toLowerCase().includes(term)
  )
})

async function onSubmit() {
  error.value   = null
  loading.value = true

  try {
    const res = await apiClient.post(
      endpoints.expert_system.vacancies,
      form.value
    )
    if (!res.success) throw new Error(JSON.stringify(res.errors))
    emit('created')
    close()
  } catch (err) {
    error.value = err.message || 'Ошибка создания'
    emit('error', error.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-dialog {
  background: #fff;
  border-radius: .5rem;
  max-width: 480px;
  width: 100%;
}
.skills-list {
  max-height: 200px;
  overflow-y: auto;
  padding-left: 0.25rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.25rem;
}
</style>
