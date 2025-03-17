<script setup>
import { ref, watch } from 'vue'
import { ChevronLeft, Cog, Minus } from 'lucide-vue-next'
import {
  ChatMenuSection,
  EmailMenuSection,
  SettingsMenuSection,
  UserMenuSection,
  MapsMenuSection,
  BillingMenuSection,
  CalendarMenuSection,
  ChartsMenuSection,
  ComponentsMenuSection,
  InputsMenuSection,
  KanbanMenuSection,
  TablesMenuSection,
  ModalWindowsMenuSection,
  ShortcodesMenuSection,
} from '@/js/menu-sections.js'

import MenuGroup from '@/components/menu/MenuGroup.vue'
import { useRoute } from 'vue-router'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isVisible: Boolean,
})

watch(
  () => props.isVisible,
  (newValue) => {
    if (!newValue) {
      isHovering.value = true
    }
  },
)

const emit = defineEmits(['left-padding'])

// Состояние меню
const isCollapsed = ref(false)
const isHovering = ref(true)

// Переключение состояния
const toggleMenu = () => {
  isCollapsed.value = !isCollapsed.value
  emit('left-padding', isCollapsed.value ? '120px' : '280px')
}

// Наведение на меню
const handleMouseEnter = () => {
  if (isCollapsed.value) isHovering.value = true
}
const handleMouseLeave = () => {
  if (isCollapsed.value) isHovering.value = false
}

// Текущая группа
const route = useRoute()
const openGroupId = ref(null)

watch(
  () => route.matched,
  (newMatched) => {
    for (let i of menuSections) {
      if (i.routeName === newMatched[0].name) {
        openGroupId.value = i.id
      }
    }
  },
  { immediate: false },
)

const toggleGroup = (id) => {
  openGroupId.value = openGroupId.value === id ? null : id
}

// Список секций меню
const menuSections = [
  UserMenuSection,
  SettingsMenuSection,
  EmailMenuSection,
  ChatMenuSection,
  MapsMenuSection,
  BillingMenuSection,
  CalendarMenuSection,
  ChartsMenuSection,
  ComponentsMenuSection,
  InputsMenuSection,
  KanbanMenuSection,
  TablesMenuSection,
  ModalWindowsMenuSection,
  ShortcodesMenuSection,
]

// Список разделителей
const separators = (index) => {
  switch (index) {
    case 1:
      return 'Шаблоны'
  }
}
</script>

<template>
  <aside
    class="side-menu card p-0"
    :class="{ collapsed: isCollapsed, hovering: isHovering, 'is-hidden': !isVisible }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="side-menu__header side-header">
      <RouterLink to="/" class="side-menu__logo">
        <div class="side-header__icon">
          <Cog :size="32" />
        </div>
        <div class="side-header__title text-smooth-animation" :class="{ hidden: !isHovering }">
          ERGO MS
        </div>
      </RouterLink>
      <div class="side-menu__toggle">
        <button @click="toggleMenu" class="btn btn-primary">
          <ChevronLeft :class="{ rotated: isCollapsed }" :size="20" class="menu-group__chevron" />
        </button>
      </div>
    </div>
    <div class="side-header__shadow" style="display: block"></div>
    <PerfectScrollbar :tag="'ul'" class="side-menu__list p-3" :class="{ short: !isHovering }">
      <li v-for="(section, index) in menuSections" :key="index">
        <MenuGroup
          :is-hovering="isHovering"
          :is-collapsed="!isCollapsed"
          :is-open="openGroupId === section.id"
          :data="section"
          @toggle="toggleGroup(section.id)"
        />
        <div v-if="[1].includes(index)" class="side-menu__divider side-divider py-3">
          <div class="side-divider__icon"><Minus :size="20" /></div>
          <div class="side-divider__name text-smooth-animation" :class="{ hidden: !isHovering }">
            {{ separators(index) }}
          </div>
        </div>
      </li>
    </PerfectScrollbar>
  </aside>
</template>

<style lang="scss" scoped>
// Меню
.side-menu {
  position: fixed;
  inline-size: 260px;
  padding: $padding-external;
  height: 100dvh;

  transform: translateX(0);
  z-index: 1005;

  transition: all $transition;

  &.is-hidden {
    transform: translateX(-110%);
  }

  &.collapsed {
    width: 84px;
  }

  &.hovering {
    width: 260px;
  }
}

// Шапка меню
.side-header {
  position: relative;
  padding: 15px 0 15px 26px;

  a {
    @include flex-row-gap($padding-internal, center);
    text-decoration: none;
  }
}

// Тень
.side-header__shadow {
  position: absolute;
  top: 3.3125rem;
  width: 100%;
  height: 2rem;
  background: linear-gradient(var(--bs-card-bg) 41%, rgba(255, 255, 255, 0));
  pointer-events: none;
  z-index: 2;

  transition: background $transition;
}

// Иконка логотипа
.side-header__icon {
  width: 32px;
  height: 32px;
  color: var(--color-primary-text);
}

// Заголовок
.side-header__title {
  flex-grow: 1;

  color: var(--color-primary-text);
  font-size: $font-size-h1;
  font-weight: bold;
  white-space: nowrap;
  text-overflow: ellipsis;
  user-select: none;

  overflow: hidden;
}

// Кнопка переключения
.side-menu__toggle {
  position: absolute;
  top: 50%;
  right: 0;

  transform: translate(50%, -50%);
  cursor: pointer;

  border: 6px solid var(--bs-body-bg);
  border-radius: 50%;
  transition: border 0.5s ease;

  button {
    @include flex-row-gap(0, center, center);

    border-radius: 50%;
    height: 26px;
    width: 26px;
    padding: 0;
  }
}

// Анимация иконки
.menu-group__chevron {
  transition: transform 0.3s ease;

  &.rotated {
    transform: rotate(180deg);
  }
}

// Список меню
.side-menu__list {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;

  list-style: none;
  padding: 0;
  margin: 0;

  &.short {
    overflow: hidden;
  }
}

// Разделитель
.side-divider {
  @include flex-row-gap($padding-internal, center);
  padding: $padding-internal $padding-external;
  overflow: hidden;

  &__name,
  &__icon {
    user-select: none;
    color: var(--color-secondary-text);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
