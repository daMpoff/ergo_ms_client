<script setup>
import { UserRoundCog } from 'lucide-vue-next'

import CardModalBody from '@/pages/modals/CardModalBody.vue'
import AccountSettings from '@/pages/settings/account/AccountSettings.vue'
</script>

<template>
  <CardModalBody
    :icon="UserRoundCog"
    title="Настроить профиль"
    description="Настройте параметры профиля, включая имя, фото и личные данные"
    modalId="addAddressModal"
    modalBig
  >
    <AccountSettings />
  </CardModalBody>
</template>

<style scoped lang="scss"></style>
