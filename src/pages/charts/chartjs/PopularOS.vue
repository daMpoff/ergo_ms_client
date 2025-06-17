<script setup>
import { Pie } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const chartData = {
  labels: ['Windows', 'MacOS', 'Linux'],
  datasets: [
    {
      backgroundColor: ['#41B883', '#00D8FF', '#DD1B16'],
      data: [80, 35, 10],
    },
  ],
}

const chartOptions = {
  responsive: true,
  borderRadius: 8,
}
</script>

<template>
  <Pie :data="chartData" :options="chartOptions" />
</template>

<style scoped lang="scss"></style>
