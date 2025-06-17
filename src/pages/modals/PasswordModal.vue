<script setup>
import { KeyRound } from 'lucide-vue-next'

import CardModalBody from '@/pages/modals/CardModalBody.vue'
import UpdatePassword from '@/pages/settings/security/UpdatePassword.vue'
</script>

<template>
  <CardModalBody
    :icon="KeyRound"
    title="Изменить пароль"
    description="Смените пароль и сделайте свой аккаунт ещё более защищённым"
    modalId="PasswordModal"
    modalBig
  >
    <UpdatePassword />
  </CardModalBody>
</template>

<style scoped lang="scss"></style>
