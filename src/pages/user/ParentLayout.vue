<script setup>
import { ref } from 'vue'
import { LayoutGrid, Link, UserRound } from 'lucide-vue-next'

import MainInfo from '@/pages/user/CardMain.vue'
import NavigationButtons from '@/components/NavigationButtons.vue'

const navigationButtons = ref([
  { icon: LayoutGrid, title: 'Все', link: 'Projects' },
  { icon: UserRound, title: 'Личные', link: 'Kanban' },
  { icon: Link, title: 'Приглашённые', link: 'Calendar' },
  
])
</script>

<template>
  <div class="rounded overflow-hidden mb-4">
    <MainInfo />
  </div>

  <div class="mb-4">
    <NavigationButtons :data="navigationButtons" />
  </div>

  <RouterView></RouterView>
</template>

<style lang="scss" scoped></style>
