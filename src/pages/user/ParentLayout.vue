<!-- ParentLayout.vue -->
<script setup>
import { ref } from 'vue'
import { LayoutGrid, Link, UserRound, SquarePlus } from 'lucide-vue-next'

import MainInfo from '@/pages/user/CardMain.vue'
import NavigationButtons from '@/components/NavigationButtons.vue'

const mainButtons = ref([
  { icon: LayoutGrid, title: 'Все', link: 'Projects' },
  { icon: UserRound, title: 'Личные', link: 'Kanban' },
  { icon: Link, title: 'Приглашённые', link: 'Calendar' },
])

const createButton = ref({ 
  icon: SquarePlus, 
  title: 'Создать проект', 
  link: 'Maps',
  class: 'create-btn' // Добавляем класс для стилизации
})
</script>

<template>
  <div class="rounded overflow-hidden mb-4">
    <MainInfo />
  </div>

  <div class="mb-4 d-flex justify-content-between align-items-center navigation-container">
    <NavigationButtons :data="mainButtons" />
    <RouterLink
      :to="{ name: createButton.link }"
      class="btn fw-bold text-center create-project-btn"
      active-class="btn-primary"
    >
      <div class="d-flex align-items-center justify-content-center gap-1">
        <div class="icon-flex"><component :is="createButton.icon" :size="20" /></div>
        <div class="fw-bold">{{ createButton.title }}</div>
      </div>
    </RouterLink>
  </div>

  <RouterView></RouterView>
</template>

<style lang="scss" scoped>
.navigation-container {
  position: relative;
  padding-right: 1rem; // Добавляем отступ справа
}

.create-project-btn {
  margin-left: auto; // Выравниваем кнопку вправо
  white-space: nowrap;
  position: relative;
  z-index: 2; // Чтобы кнопка была поверх градиента
  
  &:not(.btn-primary):hover {
    background-color: var(--bs-primary-bg-subtle);
    color: var(--bs-primary);
  }
}

// Адаптация для мобильных устройств
@media (max-width: 768px) {
  .navigation-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .create-project-btn {
    margin-left: 0;
    width: 100%;
  }
}
</style>