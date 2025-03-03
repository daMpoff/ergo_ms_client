<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

import StandardMap from '@/pages/maps/StandardMap.vue'
import MarkMap from '@/pages/maps/MarkMap.vue'
import LineMap from '@/pages/maps/LineMap.vue'
import DynamicMap from '@/pages/maps/DynamicMap.vue'
import PolygonMap from '@/pages/maps/PolygonMap.vue'

const mapWidth = ref('100%')
const mapHeight = ref('500px')

// Получение текущей темы
const currentTheme = ref('light')
let observer

onMounted(() => {
  // Слежка за изменениями атрибута data-bs-theme
  observer = new MutationObserver(() => {
    currentTheme.value = document.documentElement.getAttribute('data-bs-theme') || 'light'
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-bs-theme'],
  })

  // Установка текущее значение
  currentTheme.value = document.documentElement.getAttribute('data-bs-theme') || 'light'
})
onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <div class="card mb-4">
    <h4 class="mb-3">Базовая карта</h4>
    <div class="rounded overflow-hidden">
      <StandardMap :width="mapWidth" :height="mapHeight" :theme="currentTheme" />
    </div>
  </div>
  <div class="card mb-4">
    <h4 class="mb-3">Карта с меткой</h4>
    <div class="rounded overflow-hidden">
      <MarkMap :width="mapWidth" :height="mapHeight" :theme="currentTheme" />
    </div>
  </div>
  <div class="card mb-4">
    <h4 class="mb-3">Карта с полигонами</h4>
    <div class="rounded overflow-hidden">
      <PolygonMap :width="mapWidth" :height="mapHeight" :theme="currentTheme" />
    </div>
  </div>
  <div class="card mb-4">
    <h4 class="mb-3">Карта с линией</h4>
    <div class="rounded overflow-hidden">
      <LineMap :width="mapWidth" :height="mapHeight" :theme="currentTheme" />
    </div>
  </div>
  <div class="card">
    <h4 class="mb-3">Динамическая карта</h4>
    <div class="rounded overflow-hidden">
      <DynamicMap :width="mapWidth" :height="mapHeight" :theme="currentTheme" />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
