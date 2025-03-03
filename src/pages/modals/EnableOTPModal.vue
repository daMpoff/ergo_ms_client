<script setup>
import { Smartphone } from 'lucide-vue-next'
import CardModalBody from '@/pages/modals/CardModalBody.vue'
import TwoStepsPage from '@/pages/auth/TwoStepsPage.vue'
</script>

<template>
  <CardModalBody
    :icon="Smartphone"
    title="2FA аутентификация"
    description="Активируйте двухфакторную защиту для максимальной безопасности аккаунта"
    modalId="OTPModal"
  >
    <TwoStepsPage />
  </CardModalBody>
</template>

<style scoped lang="scss"></style>
