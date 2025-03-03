<script setup>
import { ref } from 'vue'
import { Building, CreditCard, Sparkles, Wallet } from 'lucide-vue-next'

import CardModalBody from '@/pages/modals/CardModalBody.vue'
import CardPlan from '@/pages/billing/CardPlan.vue'

const plans = ref([
  {
    id: 1,
    icon: Sparkles,
    title: 'Базовый',
    description: 'Простой. Для всех.',
    price: 0,
    points: [
      'Доступ к основным функциям',
      'До 500 запросов в день',
      'Ограниченный объём данных',
      'Стандартная поддержка',
      'Один профиль',
    ],
    currentPlan: true,
  },
  {
    id: 2,
    icon: CreditCard,
    title: 'Стандартный',
    description: 'Для малого и среднего бизнеса',
    price: 1990,
    points: [
      'Все функции Базового плана',
      'До 1000 запросов в день',
      'Расширенный доступ к данным',
      'Поддержка через чат',
      'Сколько угодно профилей',
    ],
    currentPlan: false,
  },
  {
    id: 3,
    icon: Building,
    title: 'Расширенный',
    description: 'Решение для крупных организаций',
    price: 4990,
    points: [
      'Все функции Стандартного плана',
      'Неограниченные запросы',
      'Приоритетная поддержка',
      'Доступ к аналитике',
      'Индивидуальная настройка',
    ],
    currentPlan: false,
  },
])
</script>

<template>
  <CardModalBody
    :icon="Wallet"
    title="Тарифные планы"
    description="Ознакомьтесь с доступными тарифами и выберите идеальный для ваших нужд"
    modalId="pricingModal"
    modalBig
  >
    <div class="row mx-0 px-lg-5 gy-5">
      <div v-for="(plan, index) in plans" :key="index" class="col-xl mb-md-0">
        <CardPlan v-bind="plan" />
      </div>
    </div>
  </CardModalBody>
</template>

<style scoped lang="scss"></style>
