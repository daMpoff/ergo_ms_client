<template>
    <div>
      <h2>Мониторинг</h2>
      <router-view /> <!-- Здесь будут отображаться подразделы -->
    </div>
    <div class="row">
    <div class="col-xxl-8 mb-4 order-0"><TechnologyPopularityChart /></div>
  </div>
  </template>
  
  <script setup>
import TechnologyPopularityChart from '@/pages/dashboard/analytics/charts/TechnologyPopularityChart.vue'
  </script>