<script setup>
import { ChartPie } from 'lucide-vue-next'

import CardModalBody from '@/pages/modals/CardModalBody.vue'
import CardOrderStatistics from '@/pages/dashboard/cards/CardOrderStatistics.vue'
</script>

<template>
  <CardModalBody
    :icon="ChartPie"
    title="Статистика заказов"
    description="Анализируйте статистику заказов для оптимизации и улучшения бизнеса"
    modalId="OrdersModal"
  >
    <CardOrderStatistics />
  </CardModalBody>
</template>

<style scoped lang="scss"></style>
