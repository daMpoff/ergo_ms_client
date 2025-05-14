<template>
  <button class="btn btn-outline-primary btn-sm" @click="show = true">
    + Создать курс
  </button>

  <div v-if="show" class="modal-backdrop">
    <div class="modal-dialog">
      <div class="modal-content p-4">
        <button type="button" class="btn-close float-end" @click="close" />
        <h5 class="mb-3">Новый курс</h5>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <form @submit.prevent="onSubmit">
          <div class="mb-2">
            <label class="form-label">Название</label>
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
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Сохраняем...' : 'Создать' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const emit = defineEmits(['created', 'error'])

const show    = ref(false)
const loading = ref(false)
const error   = ref(null)
const form    = ref({ title: '', description: '' })

function close() {
  show.value = false
  form.value = { title: '', description: '' }
  error.value = null
}

async function onSubmit() {
  error.value   = null
  loading.value = true
  try {
    const res = await apiClient.post(endpoints.expert_system.courses, form.value)
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
</style>
