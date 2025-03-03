<script setup>
import { ChartLine } from 'lucide-vue-next'

import CardModalBody from '@/pages/modals/CardModalBody.vue'
import CardFinanceTab from '@/pages/dashboard/cards/CardFinanceTab.vue'
</script>

<template>
  <CardModalBody
    :icon="ChartLine"
    title="Доходы и расходы"
    description="Изучите графики доходов, расходов и чистой выгоды для планирования бюджета"
    modalId="BenefitModal"
  >
    <CardFinanceTab />
  </CardModalBody>
</template>

<style scoped lang="scss"></style>
