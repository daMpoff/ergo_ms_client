<script setup>
import { Bubble } from 'vue-chartjs'
import { Chart as ChartJS, Legend, LinearScale, PointElement, Tooltip } from 'chart.js'

ChartJS.register(PointElement, LinearScale, Tooltip, Legend)

const chartData = {
  datasets: [
    {
      label: 'Yandex',
      backgroundColor: '#f87979',
      data: [
        { x: 5, y: 14, r: 20 },
        { x: 15, y: 15, r: 10 },
        { x: 30, y: 35, r: 25 },
        { x: 20, y: 25, r: 5 },
        { x: 40, y: 10, r: 10 },
        { x: 30, y: 22, r: 30 },
      ],
    },
    {
      label: 'Chrome',
      backgroundColor: '#7C8CF8',
      data: [
        { x: 10, y: 30, r: 20 },
        { x: 20, y: 20, r: 15 },
        { x: 15, y: 8, r: 40 },
        { x: 35, y: 25, r: 20 },
        { x: 30, y: 13, r: 5 },
        { x: 25, y: 8, r: 30 },
      ],
    },
  ],
}

const chartOptions = {
  responsive: true,
}
</script>

<template>
  <Bubble :data="chartData" :options="chartOptions" />
</template>

<style scoped lang="scss"></style>
