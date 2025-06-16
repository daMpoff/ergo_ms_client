<script setup>
import CardMonthStats from './cards/CardMonthStats.vue'
import CardPriorityChart from './cards/CardPriorityChart.vue'
import CardSectionDistribution from './cards/CardSectionDistribution.vue'
</script>

<template>
  <div class="dashboard-container">
    <div class="row g-4">
      <div class="col-12">
        <CardMonthStats />
      </div>
      <div class="col-md-6">
        <CardPriorityChart />
      </div>

      <div class="col-12">
        <CardSectionDistribution />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  padding: 1rem;
}

.row {
  margin: 0;
}

:deep(.priority-chart-card),
:deep(.card) {
  height: 480px;
  margin-bottom: 0;
}

:deep(.section-chart-card) {
  height: auto;
  margin-bottom: 0;
}
</style>
