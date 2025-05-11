<template>
  <div class="container py-4">
    <div v-if="profile.student_profile" class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0">Личный кабинет студента</h4>
      </div>
      <div class="card-body">
        <p><strong>Имя:</strong> {{ profile.student_profile.first_name }}</p>
        <p><strong>Фамилия:</strong> {{ profile.student_profile.last_name }}</p>
        <p>
          <strong>Группа:</strong>
          {{ profile.student_profile.study_group?.name || 'Не указана' }}
        </p>
        <p>
          <strong>Опыт в IT:</strong>
          {{ profile.student_profile.has_experience ? 'Есть' : 'Нет' }}
        </p>
      </div>
    </div>

    <div v-else-if="profile.company_profile" class="card mb-4">
      <div class="card-header bg-success text-white">
        <h4 class="mb-0">Личный кабинет компании</h4>
      </div>
      <div class="card-body">
        <p><strong>Компания:</strong> {{ profile.company_profile.company_name }}</p>
        <p><strong>Описание:</strong> {{ profile.company_profile.description }}</p>
        <p>
          <strong>Сайт:</strong>
          <a :href="profile.company_profile.website" target="_blank">
            {{ profile.company_profile.website }}
          </a>
        </p>
        <p><strong>Контактное лицо:</strong> {{ profile.company_profile.contact_person }}</p>
        <p><strong>Контактный e-mail:</strong> {{ profile.company_profile.contact_email }}</p>
        <p>
          <strong>Статус подтверждения:</strong>
          {{ profile.company_profile.is_verified ? 'Подтверждён' : 'Не подтверждён' }}
        </p>
      </div>
    </div>

    <div v-else class="alert alert-warning">
      Профиль не найден. Пожалуйста, убедитесь, что вы вошли в систему.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const profile = ref({})

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/auth/profile/')
    profile.value = data
  } catch (err) {
    console.error('Не удалось загрузить профиль:', err)
  }
})
</script>

<style scoped>
.card {
  max-width: 600px;
  margin: 0 auto;
}
</style>
