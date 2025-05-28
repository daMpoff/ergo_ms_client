<template>
  <div class="container py-2 d-flex flex-column align-items-center justify-content-center" v-if="loaded" style="min-height: 80vh">
    <h2 class="mb-3 text-center fw-bolder fs-1" style="letter-spacing: -1px;">{{ testName }}</h2>

    <div v-if="!started" class="w-100 d-flex flex-column align-items-center justify-content-center" style="min-height: 50vh;">
      <div class="alert alert-light border fs-5 mb-5 text-center shadow-sm" style="max-width: 480px;">
        Ответьте на вопросы, чтобы узнать, какая IT-профессия вам ближе!
      </div>
      <button
        class="btn btn-success btn-lg px-5 py-3 text-white fw-semibold shadow-sm"
        style="border-radius: 8px; font-size: 1.35rem; min-width: 220px; box-shadow: none; letter-spacing: 1px;"
        @click="startTest"
      >
        Пройти тест
      </button>
    </div>

    <!-- Прохождение теста -->
    <div v-else-if="step < questions.length" class="w-100" style="max-width: 520px;">
      <div class="card mb-4 border shadow-sm" style="border-radius: 10px;">
        <div class="card-body px-4 py-4">
          <div class="mb-3 text-muted">
            <div class="d-flex align-items-center justify-content-between">
              <span class="fs-6 fw-semibold text-uppercase">Вопрос {{ step + 1 }} из {{ questions.length }}</span>
            </div>
            <div class="fs-5 fw-bold mb-3 mt-1 text-center">
              {{ questions[step]?.text }}
            </div>
          </div>
          <div class="mb-3">
            <div
              class="form-check d-flex align-items-center mb-2 px-0"
              :class="{'bg-body-tertiary': isChecked(answer.id)}"
              v-for="answer in currentAnswers"
              :key="answer.id"
              style="border-radius: 6px; transition: background 0.18s;"
            >
              <input
                class="form-check-input me-2"
                type="checkbox"
                :id="'answer-'+answer.id"
                :value="answer.id"
                v-model="selectedAnswers[questions[step].id]"
                style="width:1.2em; height:1.2em; border: 2px solid green;"
              />
              <label class="form-check-label fs-5 fw-normal" :for="'answer-'+answer.id" style="cursor:pointer;">
                {{ answer.text }}
              </label>
            </div>
          </div>
          <div class="d-flex justify-content-end">
            <button
              class="btn btn-success px-4 py-2 fw-semibold text-white"
              style="font-size:1.08rem; border-radius: 6px;"
              @click="nextStep"
              :disabled="!selectedAnswers[questions[step].id] || selectedAnswers[questions[step].id].length === 0"
            >
              {{ step === questions.length - 1 ? 'Завершить' : 'Далее' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Результаты -->
    <div v-else class="w-100">
      <h4 class="mb-4 text-center fw-bold" style="letter-spacing:1px;">Результаты теста</h4>
      <div v-if="bestRoleName" class="mb-5">
        <div class="alert alert-success text-center fs-4 mb-4 shadow-sm border-0" style="border-radius: 8px; background: #eafbee; color: #155724;">
          Ваша профессия: <span class="fw-bold">{{ bestRoleName }}</span>
        </div>
        <div class="row g-3 justify-content-center">
          <div
            class="col-12 col-md-6 col-lg-4"
            v-for="r in resultList"
            :key="r.roleId"
          >
            <div class="card border-0 shadow-sm h-100" style="border-radius: 10px; background: #fafbfc;">
              <div class="card-body px-4 py-4">
                <div class="fw-bold fs-5 mb-2 text-dark" style="letter-spacing: 0.5px;">
                  {{ getRoleName(r.roleId) }}
                </div>
                <div class="fs-4 fw-semibold" style="color:#218838;">
                  Баллы: <span>{{ r.score }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-5 d-flex justify-content-center">
          <button class="btn btn-success btn-lg text-light px-5 fw-semibold" style="border-radius: 8px;" @click="restart">
            Пройти снова
          </button>
        </div>
      </div>
      <div v-else class="alert alert-warning text-center shadow-sm border-0" style="border-radius: 8px;">
        Нет результата — выберите варианты.
      </div>
    </div>
  </div>
  <div v-else class="d-flex align-items-center justify-content-center" style="min-height: 80vh">
    <span class="spinner-border text-success" role="status"></span>
    <span class="ms-3">Загрузка…</span>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import { useRoute } from 'vue-router'

const route = useRoute()
const testId = route.params.testId || 1

const testName = ref('')
const questions = ref([])
const answers = ref([])
const roles = ref([])
const loaded = ref(false)
const step = ref(0)
const started = ref(false)

const selectedAnswers = reactive({})
const bestRoleId = ref(null)
const bestRoleName = ref('')
const resultList = ref([])

const currentAnswers = computed(() => {
  if (!questions.value.length) return []
  return answers.value.filter(a => a.question === questions.value[step.value].id)
})

function isChecked(answerId) {
  const arr = selectedAnswers[questions.value[step.value].id]
  return arr && arr.includes(answerId)
}

async function load() {
  loaded.value = false

  const qres = await apiClient.get(endpoints.expert_system.orientationQuestions, { test: testId })
  if (!qres.success) return
  questions.value = qres.data
  testName.value = qres.data?.[0]?.test_name || 'Профориентационный тест'

  const ares = await apiClient.get(endpoints.expert_system.orientationAnswers)
  if (ares.success) answers.value = ares.data
  else answers.value = []

  for (const q of questions.value) {
    selectedAnswers[q.id] = []
  }

  const rres = await apiClient.get(endpoints.expert_system.roles)
  if (rres.success) roles.value = rres.data

  loaded.value = true
}

function getRoleName(roleId) {
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.name : 'Неизвестно'
}

function startTest() {
  started.value = true
  step.value = 0
  for (const key in selectedAnswers) selectedAnswers[key] = []
  bestRoleId.value = null
  bestRoleName.value = ''
  resultList.value = []
}

function nextStep() {
  if (step.value < questions.value.length - 1) {
    step.value += 1
  } else {
    calculateResult()
  }
}

function calculateResult() {
  const scoreByRole = {}
  for (const q of questions.value) {
    const selected = selectedAnswers[q.id] || []
    for (const answerId of selected) {
      const answer = answers.value.find(a => a.id === answerId)
      if (answer) {
        const rid = typeof answer.role === 'object' ? answer.role.id : answer.role
        scoreByRole[rid] = (scoreByRole[rid] || 0) + (answer.weight || 1)
      }
    }
  }
  const sorted = Object.entries(scoreByRole)
    .map(([roleId, score]) => ({ roleId: Number(roleId), score }))
    .sort((a, b) => b.score - a.score)
  resultList.value = sorted
  if (sorted.length) {
    bestRoleId.value = sorted[0].roleId
    bestRoleName.value = getRoleName(bestRoleId.value)
  } else {
    bestRoleId.value = null
    bestRoleName.value = ''
  }
  step.value = questions.value.length
}

function restart() {
  started.value = false
  step.value = 0
  for (const key in selectedAnswers) selectedAnswers[key] = []
  bestRoleId.value = null
  bestRoleName.value = ''
  resultList.value = []
}

onMounted(load)
</script>
