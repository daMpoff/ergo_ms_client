<script setup>
import { CreditCard } from 'lucide-vue-next'

import CardModalBody from '@/pages/modals/CardModalBody.vue'
import CreditCardForm from '@/pages/settings/billing/CreditCardForm.vue'
</script>

<template>
  <CardModalBody
    :icon="CreditCard"
    title="Добавить карту"
    description="Привяжите банковскую карту, чтобы сделать платежи быстрее и удобнее"
    modalId="addCardModal"
  >
    <CreditCardForm />
  </CardModalBody>
</template>

<style scoped lang="scss"></style>
