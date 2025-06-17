<script setup>
import { Doughnut } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const chartData = {
  labels: ['iPhone 16', 'Samsung S24', 'Xiaomi Redmi 10', 'Huawei  Mate 30'],
  datasets: [
    {
      backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
      data: [40, 20, 80, 10],
    },
  ],
}

const chartOptions = {
  responsive: true,
  borderRadius: 8,
}
</script>

<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<style scoped lang="scss"></style>
