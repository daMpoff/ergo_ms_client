<template>
  <div class="container py-4">
    <h2 class="mb-4">
      Вопросы теста: "{{ testName }}"
      <button class="btn btn-link" @click="$router.back()">← Назад</button>
    </h2>

    <div class="mb-3 d-flex">
      <input v-model="newText" class="form-control me-2" placeholder="Текст нового вопроса" />
      <button class="btn btn-sm btn-success text-light me-2" @click="addQuestion" :disabled="!newText">Добавить вопрос</button>
    </div>

    <ul class="list-group">
      <li v-for="q in questions" :key="q.id" class="list-group-item d-flex justify-content-between align-items-center">
        <div v-if="editId !== q.id">{{ q.text }}</div>
        <div v-else class="flex-grow-1 me-2">
          <input v-model="editText" class="form-control form-control-sm" @keyup.enter="saveEdit" />
        </div>

        <div>
          <button
            v-if="editId !== q.id"
            class="btn btn-sm btn-primary me-2"
            @click="startEdit(q)"
          >Переименовать</button>
          <button
            v-else
            class="btn btn-sm btn-success me-2"
            @click="saveEdit"
            :disabled="!editText"
          >Сохранить</button>

          <button
            class="btn btn-sm btn-secondary me-2"
            @click="$router.push({ name: 'OrientationAnswerManager', params: { questionId: q.id } })"
          >Ответы</button>

          <button
            class="btn btn-sm btn-danger"
            @click="deleteQuestion(q.id)"
          >Удалить</button>
        </div>
      </li>
    </ul>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const route = useRoute()
const router = useRouter()
const testId = route.params.testId

const questions = ref([])
const testName = ref('')
const newText = ref('')
const editId = ref(null)
const editText = ref('')
const error = ref('')

async function fetchQuestions() {
  error.value = ''
  // загрузим тест, чтобы взять имя
  const tres = await apiClient.get(`${endpoints.expert_system.orientationTests}${testId}/`)
  testName.value = tres.success ? tres.data.name : ''
  // и вопросы
  const qres = await apiClient.get(endpoints.expert_system.orientationQuestions, { test: testId })
  if (qres.success) questions.value = qres.data
  else error.value = 'Не удалось загрузить вопросы'
}

async function addQuestion() {
  const res = await apiClient.post(endpoints.expert_system.orientationQuestions, {
    test: testId,
    text: newText.value.trim()
  })
  if (res.success) {
    newText.value = ''
    await fetchQuestions()
  } else {
    error.value = 'Ошибка: ' + JSON.stringify(res.errors)
  }
}

function startEdit(q) {
  editId.value = q.id
  editText.value = q.text
}

async function saveEdit() {
  const id = editId.value
  if (!editText.value.trim()) return
  const url = `${endpoints.expert_system.orientationQuestions}${id}/`
  const res = await apiClient.patch(url, { text: editText.value.trim() })
  if (res.success) {
    editId.value = null
    editText.value = ''
    await fetchQuestions()
  } else {
    error.value = 'Ошибка: ' + JSON.stringify(res.errors)
  }
}

async function deleteQuestion(id) {
  if (!confirm('Удалить вопрос?')) return
  const url = `${endpoints.expert_system.orientationQuestions}${id}/`
  const res = await apiClient.delete(url)
  if (res.success) await fetchQuestions()
  else error.value = 'Ошибка удаления'
}

onMounted(fetchQuestions)
</script>
