<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { verifyConfirmationCode } from '@/js/auth';

const codeChecked = ref(false)
const router = useRouter()

// Форма
const form = reactive({
  code: '',
})

// Ошибки валидации
const errors = reactive({
  code: null,
})


const countdownTime = ref(10)
const isCooldown = ref(false)
const countdownMessage = ref('Повторить')

// Запуск обратного отсчета
const startCountdown = () => {
  if (isCooldown.value) return

  isCooldown.value = true
  countdownMessage.value = `Повторить через ${countdownTime.value} сек.`

  let remainingTime = countdownTime.value
  const timer = setInterval(() => {
    remainingTime -= 1
    
    if (remainingTime > 0) 
    {
      countdownMessage.value = `Повторить через ${remainingTime} сек.`
    } 
    else 
    {
      clearInterval(timer)
      isCooldown.value = false
      countdownMessage.value = 'Повторить'
    }
  }, 1000)
}

const submitForm = async () => { 

}
</script>

<template>
  <div class="d-flex justify-content-center align-items-center" style="height: 100vh">
    <div class="card" style="width: 500px">
      <div class="auth__title mb-4 fs-3 fw-bold text-center">Подтвердите почту</div>

      <div class="auth__email mb-4">
        Введите код подтверждения отправленный на ваш электронный адрес:
        <a
          :href="`mailto:`"
          class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
          >{{ }}</a
        >
      </div>

      <form @submit.prevent="submitForm" novalidate>
        <div class="form-floating mb-3 no-select" v-auto-animate>
          <input  type="code"
                  id="code"
                  class="form-control no-select"
                  :class="{ 'is-invalid': errors.code }"
                  v-model="form.code"
                  placeholder="code"
          />
          <label for="code" class="no-select">Код подтверждения</label>
          <div v-if="errors.code" class="invalid-feedback no-select">
            {{ errors.code }}
          </div>
        </div>

        <button class="btn btn-primary w-100" type="submit" :disabled="codeChecked">
          <span
            v-if="codeChecked"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          {{ codeChecked ? 'Выполняется проверка кода...' : 'Проверка кода' }}
        </button>
      </form>

      <div class="mt-3 text-center">
        Не получили письмо?
        <span
          @click="startCountdown"
          :class="isCooldown ? 'text-muted' : 'link-primary'"
          :style="{ cursor: isCooldown ? 'not-allowed' : 'pointer' }"
        >
          {{ countdownMessage }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
