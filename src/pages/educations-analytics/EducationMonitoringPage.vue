<template>
    <div>
      <h2>Мониторинг</h2>
      <router-view /> <!-- Здесь будут отображаться подразделы -->
    </div>
    <div class="row">
    <div ><TechnologyPopularityChart /></div>
  </div>
  </template>
  
  <script setup>
import TechnologyPopularityChart from '@/pages/dashboard/analytics/charts/TechnologyPopularityChart.vue'
  </script>