<script setup>
import { ArrowLeftRight } from 'lucide-vue-next'

import CardModalBody from '@/pages/modals/CardModalBody.vue'
import CardTransactions from '@/pages/dashboard/cards/CardTransactions.vue'
</script>

<template>
  <CardModalBody
    :icon="ArrowLeftRight"
    title="Транзакции"
    description="Просмотрите подробную историю всех ваших транзакций и операций"
    modalId="TransactionsModal"
  >
    <CardTransactions />
  </CardModalBody>
</template>

<style scoped lang="scss"></style>
