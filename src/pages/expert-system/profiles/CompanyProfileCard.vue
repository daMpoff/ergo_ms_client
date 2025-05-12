<template>
  <div class="card mb-4">
    <div class="card-header bg-success text-white">
      <h4 class="mb-0">Личный кабинет компании</h4>
    </div>
    <div class="card-body">
      <p><strong>Компания:</strong> {{ company.company_name }}</p>
      <p><strong>Описание:</strong> {{ company.description }}</p>
      <p>
        <strong>Сайт:</strong>
        <a :href="company.website" target="_blank">{{ company.website }}</a>
      </p>
      <p><strong>Контактное лицо:</strong> {{ company.contact_person }}</p>
      <p><strong>E-mail:</strong> {{ company.contact_email }}</p>
      <p>
        <strong>Статус подтверждения:</strong>
        {{ company.is_verified ? 'Подтверждён' : 'Не подтверждён' }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  company: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
</style>
