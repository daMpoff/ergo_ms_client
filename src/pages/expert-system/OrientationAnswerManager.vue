<template>
  <div class="container py-4">
    <h2 class="mb-4">
      Ответы для вопроса "{{ questionText }}"
      <button class="btn btn-link" @click="$router.back()">← Назад</button>
    </h2>

    <div class="card card-body mb-4">
      <div class="row g-2">
        <div class="col-md-6">
          <input v-model="newText" class="form-control" placeholder="Текст ответа" />
        </div>
        <div class="col-md-2">
          <input v-model.number="newWeight" type="number" class="form-control" placeholder="Вес" />
        </div>
        <div class="col-md-4">
          <select v-model="newRole" class="form-select">
            <option disabled value="">Выберите роль</option>
            <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </div>
        <div class="col-12 text-end">
          <button class="btn btn-success" @click="addAnswer" :disabled="!newText||newRole===null">Добавить ответ</button>
        </div>
      </div>
    </div>

    <table class="table table-striped">
      <thead>
        <tr>
          <th>Текст</th>
          <th>Вес</th>
          <th>Роль</th>
          <th style="width:200px">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in answers" :key="a.id">
          <td v-if="editId!==a.id">{{ a.text }}</td>
          <td v-else><input v-model="editText" class="form-control form-control-sm" /></td>

          <td v-if="editId!==a.id">{{ a.weight }}</td>
          <td v-else><input v-model.number="editWeight" type="number" class="form-control form-control-sm" /></td>

          <td v-if="editId!==a.id">{{ a.role.name }}</td>
          <td v-else>
            <select v-model="editRole" class="form-select form-select-sm">
              <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </td>

          <td>
            <button
              v-if="editId!==a.id"
              class="btn btn-sm btn-primary me-2"
              @click="startEdit(a)"
            >Изменить</button>

            <button
              v-else
              class="btn btn-sm btn-success me-2"
              @click="saveEdit"
              :disabled="!editText||editRole===null"
            >Сохранить</button>

            <button
              class="btn btn-sm btn-danger"
              @click="deleteAnswer(a.id)"
            >Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const route = useRoute()
const questionId = route.params.questionId

const answers = ref([])
const roles   = ref([])
const questionText = ref('')

const newText   = ref('')
const newWeight = ref(0)
const newRole   = ref(null)

const editId     = ref(null)
const editText   = ref('')
const editWeight = ref(0)
const editRole   = ref(null)

const error = ref('')

async function load() {
  error.value = ''
  // все роли
  const rres = await apiClient.get(endpoints.expert_system.roles)
  if (rres.success) roles.value = rres.data

  // текст вопроса
  const qres = await apiClient.get(`${endpoints.expert_system.orientationQuestions}${questionId}/`)
  if (qres.success) questionText.value = qres.data.text

  // ответы
  const ares = await apiClient.get(endpoints.expert_system.orientationAnswers, { question: questionId })
  if (ares.success) answers.value = ares.data
  else error.value = 'Не удалось загрузить ответы'
}

async function addAnswer() {
  error.value = ''
    const payload = { 
      question: Number(questionId), 
      text: newText.value.trim(), 
      weight: newWeight.value, 
      role: newRole.value 
    } 
}

function startEdit(a) {
  editId.value     = a.id
  editText.value   = a.text
  editWeight.value = a.weight
  editRole.value   = a.role.id
}

async function saveEdit() {
  const url = `${endpoints.expert_system.orientationAnswers}${editId.value}/`
  const res = await apiClient.patch(url, {
    text: editText.value.trim(),
    weight: editWeight.value,
    role: editRole.value
  })
  if (res.success) {
    editId.value = null
    await load()
  } else {
    error.value = 'Ошибка сохранения: ' + JSON.stringify(res.errors)
  }
}

async function deleteAnswer(id) {
  if (!confirm('Удалить ответ?')) return
  const url = `${endpoints.expert_system.orientationAnswers}${id}/`
  const res = await apiClient.delete(url)
  if (res.success) await load()
  else error.value = 'Ошибка удаления'
}

onMounted(load)
</script>
