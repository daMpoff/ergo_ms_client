<script setup>
import { computed, ref, watch } from 'vue'
import DatasetListPage from '@/modules/bi/Datasets/DatasetListPage.vue'
import ConnectionListPage from '@/modules/bi/Connections/ConnectionListPage.vue'
import ChartListPage from '@/modules/bi/Charts/ChartListPage.vue'
import DashboardListPage from '@/modules/bi/Dashboards/DashboardListPage.vue'

const props = defineProps({
  isDatasetSidebarOpen: Boolean,
  currentPage:          String
})

const emit = defineEmits(['close'])

const isClosing = ref(false)

const titleMap = {
  datasets: 'Датасеты',
  connections: 'Подключения',
  charts: 'Чарты',
  dashboards: 'Дашборды'
}

const title = computed(() => titleMap[props.currentPage] || '')

const handleClose = () => {
  isClosing.value = true
  setTimeout(() => {
    emit('close')
    isClosing.value = false
  }, 300) // Длительность анимации
}

watch(() => props.isDatasetSidebarOpen, (newValue) => {
  if (!newValue) {
    isClosing.value = false
  }
})
</script>

<template>
  <div v-if="isDatasetSidebarOpen" class="sidebar-overlay" @click="handleClose"></div>
  
  <div
    class="offcanvas offcanvas-start"
    :class="{ show: isDatasetSidebarOpen && !isClosing, closing: isClosing }"
    :style="{ visibility: isDatasetSidebarOpen ? 'visible' : 'hidden', width: '768px', left: '260px' }"
    tabindex="-1"
  >
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">
        {{ currentPage === 'datasets' ? 'Датасеты'
            : currentPage === 'connections' ? 'Подключения'
            : currentPage === 'charts' ? 'Чарты'
            : currentPage === 'dashboards' ? 'Дашборды'
            : '' }}
      </h5>
      <button type="button" class="btn-close" @click="handleClose" aria-label="Закрыть" />
    </div>

    <div class="offcanvas-body p-0" style="overflow-y: hidden;">
      <component
        :is="{
          datasets:    DatasetListPage,
          connections: ConnectionListPage,
          charts:      ChartListPage,
          dashboards:  DashboardListPage
        }[ currentPage ]"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  cursor: pointer;
  transition: opacity 0.3s ease-in-out;
}

.banner-wrapper {
  height: 260px;
  border-radius: 10px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0)), url('/src/assets/carousel/photo-3.png');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.banner-content {
  color: var(--color-primary-background);
  padding-left: 30px;
  max-width: 560px;
}

.card-section {
  padding: 20px;
  display: flex;
  flex-direction: column;
  background-color: var(--color-primary-background);
  border-radius: 15px;
}

.storage-sidebar {
  position: fixed;
  top: 0;
  left: 260px;
  width: 768px;
  height: 100vh;
  background-color: var(--color-primary-background);
  z-index: 1050;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;

  &.show {
    transform: translateX(0);
  }

  display: flex;
  flex-direction: column;
}

.offcanvas {
  position: fixed;
  top: 0;
  left: 260px;
  width: 768px;
  height: 100vh;
  background-color: var(--color-primary-background);
  z-index: 1050;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;

  &.show {
    transform: translateX(0);
  }

  &.closing {
    transform: translateX(-100%);
  }
}

.header {
  flex: 0 0 auto;
}

.body {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
}
</style>