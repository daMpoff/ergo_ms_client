<template>
  <div class="modal-backdrop">
    <div class="modal-dialog">
      <div class="modal-content p-4">
        <button
          type="button"
          class="btn-close float-end"
          @click="close"
        ></button>
        <h4 class="mb-3">Регистрация профиля студента</h4>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <form @submit.prevent="onSubmit">
          <div class="mb-2">
            <label class="form-label">Имя</label>
            <input
              v-model="form.first_name"
              type="text"
              class="form-control"
              required
            />
          </div>

          <div class="mb-2">
            <label class="form-label">Фамилия</label>
            <input
              v-model="form.last_name"
              type="text"
              class="form-control"
              required
            />
          </div>

          <div class="mb-2">
            <label class="form-label">Учебная группа</label>
            <select
              v-model="form.study_group"
              class="form-select"
              required
            >
              <option disabled value="">Выберите группу</option>
              <option
                v-for="g in groups"
                :key="g.id"
                :value="g.id"
              >
                {{ g.name }}
              </option>
            </select>
          </div>

          <div class="form-check mb-3">
            <input
              class="form-check-input"
              type="checkbox"
              id="experienceCheck"
              v-model="form.has_experience"
            />
            <label class="form-check-label" for="experienceCheck">
              Есть опыт в IT
            </label>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100"
            :disabled="loading"
          >
            {{ loading ? 'Сохраняем...' : 'Сохранить профиль' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

export default {
  name: 'StudentRegister',
  data() {
    return {
      form: {
        first_name: '',
        last_name: '',
        study_group: null,
        has_experience: false
      },
      groups: [],
      loading: false,
      error: null
    }
  },
  async created() {
    // подгружаем список групп для селекта
    const res = await apiClient.get(endpoints.expert_system.studyGroups)
    if (res.success) {
      this.groups = res.data
    }
  },
  methods: {
    close() {
      this.$router.back()
    },
    async onSubmit() {
      this.error = null
      this.loading = true

      try {
        // POST-создание профиля. Поле `user` берётся автоматически на бэкенде
        const resp = await apiClient.post(
          endpoints.expert_system.students,
          this.form
        )

        if (!resp.success) {
          const msg = typeof resp.errors === 'string'
            ? resp.errors
            : Object.values(resp.errors).flat().join(' ')
          throw new Error(msg)
        }

        // по успеху — просто закрываем модалку (можно редиректить куда нужно)
        console.log(this.form.has_experience)
        if(this.form.has_experience){
          this.$router.push({ name: 'Addskillforstudent'})
        }
        else{
          this.close()
        }
          

      } catch (err) {
        this.error = err.message || 'Ошибка при сохранении профиля'
      } finally {
        this.loading = false
      }
    }
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
  max-width: 420px;
  width: 100%;
}
</style>
