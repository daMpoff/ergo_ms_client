<template>
    <div>
      <h2 style="color: var(--color-accent);">Статистика</h2>
      <router-view /> <!-- Здесь будут отображаться подразделы -->
    </div>
    <div class="row">
      <div class="col-md-6 mb-4"><TechnologyPopularityChart /></div>
      <div class="col-md-6 mb-4"><TechnologiesCard /></div>
    </div>
  </template>
  
  <script setup>
import TechnologyPopularityChart from '@/pages/education_analytics_module/charts/TechnologyPopularityChart.vue'
import TechnologiesCard from '@/pages/education_analytics_module/cards/TechnologiesCard.vue';  
  </script>
