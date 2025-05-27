<template>
  <div class="container py-4">
    <h2 class="mb-4">Профориентационный тест</h2>

    <div v-if="!testStarted && !showResult" class="d-flex flex-column justify-content-center align-items-center" style="min-height: 350px;">
      <button
        class="btn btn-lg btn-success text-white"
        @click="startTest"
        :disabled="questions.length === 0"
        style="font-size: 1.5rem;"
      >
        Пройти тест
      </button>
      <div v-if="questions.length === 0" class="alert alert-warning mt-3 text-center w-100">
        Нет доступных вопросов в тесте. Обратитесь к администратору.
      </div>
    </div>
    <div v-if="testStarted && !showResult">
      <div v-if="currentQuestion">
        <div class="mb-2">Вопрос {{ currentIndex + 1 }} из {{ questions.length }}</div>
        <h4 class="mb-3">{{ currentQuestion.text }}</h4>
        <div v-for="ans in currentQuestion.answers" :key="ans.id" class="form-check mb-2">
          <input
            class="form-check-input"
            type="checkbox"
            :id="'ans-'+ans.id"
            :value="ans.id"
            v-model="selectedAnswers[currentIndex]"
          >
          <label class="form-check-label" :for="'ans-'+ans.id">
            {{ ans.text }}
          </label>
        </div>
        <div class="mt-4 d-flex justify-content-between">
          <button
            class="btn btn-secondary"
            @click="goBack"
            :disabled="currentIndex === 0"
          >Назад</button>
          <button
            v-if="currentIndex < questions.length - 1"
            class="btn btn-success text-white"
            @click="goNext"
            :disabled="!selectedAnswers[currentIndex] || selectedAnswers[currentIndex].length === 0"
          >Далее</button>
          <button
            v-else
            class="btn btn-success text-white"
            @click="finishTest"
            :disabled="!selectedAnswers[currentIndex] || selectedAnswers[currentIndex].length === 0"
          >Завершить</button>
        </div>
      </div>
      <div v-else>
        <p>Нет вопросов в этом тесте.</p>
      </div>
    </div>

    <div v-if="showResult">
      <h2 class="mb-4">Результаты теста</h2>
      <div v-if="resultList.length">
        <div class="row">
          <div class="col-md-4 mb-4" v-for="role in resultList" :key="role.id">
            <div class="card h-100">
              <div class="card-body">
                <h4 class="card-title">{{ role.name }}</h4>
                <p class="card-text">
                  Вероятность: <strong>{{ role.percent }}%</strong>
                </p>
                <div class="progress" style="height: 22px;">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    :style="{ width: role.percent + '%' }"
                    :aria-valuenow="role.percent"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >{{ role.percent }}%</div>
                </div>
                <button
                  v-if="!selectedRoleId"
                  class="btn btn-outline-success w-100 mt-3"
                  @click="chooseProfession(role.id)"
                >Выбрать</button>
                <div v-else-if="selectedRoleId === role.id" class="alert alert-success mt-3">
                  Вы выбрали эту профессию!
                </div>
              </div>
              <div v-if="selectedRoleId === role.id && recommendedCourses.length" class="card-footer">
                <strong>Рекомендуемые курсы:</strong>
                <ul>
                  <li v-for="course in recommendedCourses" :key="course.id">{{ course.name }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <button class="btn btn-secondary mt-4" @click="restartTest">Пройти заново</button>
      </div>
      <div v-else>
        <p>Результаты не определены. Возможно, тест был прерван.</p>
        <button class="btn btn-secondary mt-4" @click="restartTest">Пройти заново</button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const route = useRoute()
const testId = route.params.testId

const questions = ref([])
const currentIndex = ref(0)
const showResult = ref(false)
const testStarted = ref(false)
const selectedAnswers = ref([])
const resultList = ref([])
const selectedRoleId = ref(null)
const recommendedCourses = ref([])

const currentQuestion = computed(() => questions.value[currentIndex.value])

async function fetchQuestionsAndAnswers() {
  const qres = await apiClient.get(endpoints.expert_system.orientationQuestions, { test: testId })
  if (!qres.success || !qres.data.length) {
    questions.value = []
    return
  }
  const answersMap = {}
  for (const q of qres.data) {
    const ares = await apiClient.get(endpoints.expert_system.orientationAnswers, { question: q.id })
    answersMap[q.id] = ares.success ? ares.data : []
  }
  questions.value = qres.data.map(q => ({
    ...q,
    answers: answersMap[q.id]
  }))
  selectedAnswers.value = Array(questions.value.length).fill().map(() => [])
}

function startTest() {
  testStarted.value = true
  currentIndex.value = 0
  selectedAnswers.value = Array(questions.value.length).fill().map(() => [])
}


function goBack() {
  if (currentIndex.value > 0) currentIndex.value--
}
function goNext() {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value++
}

function finishTest() {
  const scoreMap = {}
  let totalScore = 0
  questions.value.forEach((q, idx) => {
    (selectedAnswers.value[idx] || []).forEach(ansId => {
      const ans = q.answers.find(a => a.id === ansId)
      if (ans && ans.role) {
        if (!scoreMap[ans.role.id]) {
          scoreMap[ans.role.id] = { score: 0, name: ans.role.name }
        }
        scoreMap[ans.role.id].score += ans.weight || 1
        totalScore += ans.weight || 1
      }
    })
  })
  const resultArr = Object.entries(scoreMap)
    .map(([roleId, obj]) => ({
      id: +roleId,
      name: obj.name,
      percent: totalScore ? Math.round(obj.score * 100 / totalScore) : 0,
      raw: obj.score,
    }))
    .filter(r => r.percent > 0)
    .sort((a, b) => b.percent - a.percent)
  resultList.value = resultArr
  showResult.value = true
  selectedRoleId.value = null
  recommendedCourses.value = []
  testStarted.value = false
}

async function chooseProfession(roleId) {
  selectedRoleId.value = roleId
  await apiClient.post(endpoints.expert_system.setStudentProfession, {
    profession_id: roleId
  })
  const resp = await apiClient.get(endpoints.expert_system.recommendedCourses, {
    role: roleId
  })
  recommendedCourses.value = resp.success ? resp.data : []
}
function restartTest() {
  showResult.value = false
  testStarted.value = false
  currentIndex.value = 0
  selectedAnswers.value = Array(questions.value.length).fill().map(() => [])
  selectedRoleId.value = null
  recommendedCourses.value = []
}

onMounted(fetchQuestionsAndAnswers)
</script>

<style scoped>
.progress-bar {
  font-weight: bold;
  font-size: 1.1em;
}
.card {
  min-height: 240px;
}
</style>
