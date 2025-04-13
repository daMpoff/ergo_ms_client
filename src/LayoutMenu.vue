<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'

import MenuList from '@/components/menu/MenuList.vue'
import TheHeader from '@/components/header/TheHeader.vue'
import StorageSidebar from '@/pages/bi/components/StorageSidebar.vue'

const leftPadding = ref('280px')

const isMenuVisible = ref(window.innerWidth >= 1200)
const isMenuToggledManually = ref(false)
const isOverlayVisible = ref(false)

const updateMenuVisibility = () => {
  if (window.innerWidth >= 1200) {
    isMenuVisible.value = true
    isOverlayVisible.value = false
    isMenuToggledManually.value = false
  } else if (!isMenuToggledManually.value) {
    isMenuVisible.value = false
    isOverlayVisible.value = false
  }
}

const toggleMenu = (isVisible) => {
  isMenuToggledManually.value = true
  isMenuVisible.value = isVisible
  isOverlayVisible.value = isVisible && window.innerWidth < 1200
}

const closeMenu = () => {
  isMenuVisible.value = false
  isOverlayVisible.value = false
  isMenuToggledManually.value = false
}

// === StorageSidebar state ===
const isDatasetSidebarOpen = ref(false)
let bsSidebar = null

async function initSidebar() {
  await nextTick()

  const el = document.getElementById('datasetSidebar')
  if (!el) {
    console.warn('datasetSidebar не найден в DOM')
    return
  }

  const bootstrap = await import('bootstrap')
  bsSidebar = new bootstrap.Offcanvas(el, { backdrop: false, scroll: true })

  el.addEventListener('shown.bs.offcanvas', () => {
    isDatasetSidebarOpen.value = true
  })
  el.addEventListener('hidden.bs.offcanvas', () => {
    isDatasetSidebarOpen.value = false
  })
}

function leftToggle(val) {
  leftPadding.value = val
}

const openDatasetSidebar = () => {
  if (!bsSidebar) {
    initSidebar().then(() => {
      bsSidebar?.show()
    })
  } else {
    bsSidebar.show()
  }
}

onMounted(() => {
  updateMenuVisibility()
  window.addEventListener('resize', updateMenuVisibility)
  initSidebar()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMenuVisibility)
})
</script>

<template>
  <div class="layout-container">
    <MenuList
      @left-padding="leftToggle"
      :is-visible="isMenuVisible"
      @open-datasets="openDatasetSidebar"
    />
    <div class="layout-page" :style="{ paddingLeft: leftPadding }">
      <div class="pt-4 container-xxl">
        <TheHeader @toggleMenu="toggleMenu" />
      </div>
      <div class="py-4 container-xxl">
        <RouterView :key="$route.path" />
      </div>
    </div>
  </div>

  <div @click="closeMenu" class="layout-overlay" :class="{ active: isOverlayVisible }"></div>

  <StorageSidebar :isDatasetSidebarOpen="isDatasetSidebarOpen" />
</template>

<style scoped lang="scss">
.layout-page {
  padding-inline-start: v-bind(leftPadding);
  transition: padding-inline-start $transition;
}

.layout-overlay {
  z-index: 1004;
}

@media (width < 1200px) {
  .layout-page {
    padding-inline-start: 0;
  }
}
</style>
