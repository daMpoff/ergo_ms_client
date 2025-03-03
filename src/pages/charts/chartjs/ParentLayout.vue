<script setup>
import MonthlyStatistics from '@/pages/charts/chartjs/MonthlyStatistics.vue'
import WeeklyStatistics from '@/pages/charts/chartjs/WeeklyStatistics.vue'
import ContinentStatistics from '@/pages/charts/chartjs/ContinentStatistics.vue'
import SectionsDevices from '@/pages/charts/chartjs/SectionsDevices.vue'
import PopularCities from '@/pages/charts/chartjs/PopularCities.vue'
import BrowsersUsed from '@/pages/charts/chartjs/BrowsersUsed.vue'
import PopularDevices from '@/pages/charts/chartjs/PopularDevices.vue'
import PopularOS from '@/pages/charts/chartjs/PopularOS.vue'
</script>

<template>
  <div class="row row-gap-4">
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Месячная статистика</h4>
        <MonthlyStatistics />
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Недельная статистика</h4>
        <WeeklyStatistics />
      </div>
    </div>
  </div>
  <div class="card my-4">
    <h4 class="mb-3">Статистика по континентам</h4>
    <ContinentStatistics />
  </div>
  <div class="row row-gap-4">
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Устройства по разделам</h4>
        <SectionsDevices />
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Города</h4>
        <PopularCities />
      </div>
    </div>
  </div>
  <div class="card my-4">
    <h4 class="mb-3">Используемые браузеры</h4>
    <BrowsersUsed />
  </div>
  <div class="row row-gap-4">
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Популярные устройства</h4>
        <PopularDevices />
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Популярные OS</h4>
        <PopularOS />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
