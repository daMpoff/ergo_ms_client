<template>
  <div class="container py-4">
    <h2 class="mb-4">Профориентационный тест</h2>

    <div v-if="loading" class="text-center">Загрузка вопросов…</div>
    <div v-else>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-else-if="questions.length">
        <p>Вопрос {{ currentIndex + 1 }} из {{ questions.length }}</p>
        <h5 class="mb-3">{{ currentQuestion.text }}</h5>

        <div
          v-for="ans in currentAnswers"
          :key="ans.id"
          class="form-check mb-2"
        >
          <input
            class="form-check-input"
            type="radio"
            :id="'ans-' + ans.id"
            :name="'q' + currentQuestion.id"
            :value="ans.id"
            v-model="selected[currentQuestion.id]"
          />
          <label class="form-check-label" :for="'ans-' + ans.id">
            {{ ans.text }}
          </label>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button
            class="btn btn-secondary"
            :disabled="currentIndex === 0"
            @click="prev"
          >
            Назад
          </button>

          <button
            v-if="currentIndex < questions.length - 1"
            class="btn btn-primary"
            :disabled="!selected[currentQuestion.id]"
            @click="next"
          >
            Далее
          </button>

          <button
            v-else
            class="btn btn-success"
            :disabled="!selected[currentQuestion.id]"
            @click="submit"
          >
            Завершить
          </button>
        </div>
      </div>
      <div v-else class="text-center">Вопросы не найдены.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const route = useRoute()
const router = useRouter()
const testId = route.params.testId

const questions = ref([])
const answersMap = ref({})
const selected = ref({})         
const currentIndex = ref(0)
const loading = ref(false)
const error = ref('')
const currentQuestion = computed(() => questions.value[currentIndex.value] || {})
const currentAnswers  = computed(() => answersMap.value[currentQuestion.value.id] || [])

async function loadTest() {
  loading.value = true
  error.value = ''

  try {
    const qres = await apiClient.get(endpoints.expert_system.orientationQuestions, { test: testId })
    if (!qres.success) throw new Error('Не удалось загрузить вопросы')
    questions.value = qres.data

    await Promise.all(
      questions.value.map(async q => {
        const ares = await apiClient.get(endpoints.expert_system.orientationAnswers, { question: q.id })
        if (!ares.success) throw new Error(`Не удалось загрузить ответы для вопроса ${q.id}`)

        answersMap.value[q.id] = ares.data
      })
    )
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function next() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  }
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

async function submit() {
  loading.value = true
  error.value = ''

  try {
    const rres = await apiClient.post(endpoints.expert_system.orientationResults, {
      test: testId
    })
    if (!rres.success) throw new Error('Не удалось сохранить результат теста')
    const resultId = rres.data.id

    const roleScores = {}  
    for (const q of questions.value) {
      const ansId = selected.value[q.id]
      const ans = answersMap.value[q.id].find(a => a.id === ansId)
      if (!ans) continue
      const rid = ans.role.id
      if (!roleScores[rid]) {
        roleScores[rid] = { name: ans.role.name, score: 0 }
      }
      roleScores[rid].score += ans.weight
    }

    const maxPerRole = {}
    for (const q of questions.value) {
      for (const a of answersMap.value[q.id]) {
        const rid = a.role.id
        if (!maxPerRole[rid] || a.weight > maxPerRole[rid]) {
          maxPerRole[rid] = a.weight
        }
      }
    }
    const maxSumPerRole = {}
    for (const rid in maxPerRole) {
      maxSumPerRole[rid] = questions.value.reduce((sum, q) => {
        const weights = answersMap.value[q.id]
          .filter(a => a.role.id == rid)
          .map(a => a.weight)
        const mx = weights.length ? Math.max(...weights) : 0
        return sum + mx
      }, 0)
    }
    let bestRoleId = null, bestScore = -Infinity
    for (const rid in roleScores) {
      if (roleScores[rid].score > bestScore) {
        bestScore = roleScores[rid].score
        bestRoleId = rid
      }
    }
    const percent = maxSumPerRole[bestRoleId]
      ? Math.round((bestScore / maxSumPerRole[bestRoleId]) * 100)
      : 0

    await apiClient.put(
      `${endpoints.expert_system.orientationResults}${resultId}/`,
      { best_role: bestRoleId, best_score: percent }
    )

    await Promise.all(
      Object.entries(selected.value).map(([questionId, answerId]) =>
        apiClient.post(endpoints.expert_system.orientationUserAnswers, {
          result: resultId,
          question: questionId,
          answer: answerId
        })
      )
    )
    router.push({ name: 'OrientationResult', params: { resultId } })

  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadTest)
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}
</style>
