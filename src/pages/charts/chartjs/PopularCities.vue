<script setup>
import { PolarArea } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, RadialLinearScale, Tooltip } from 'chart.js'

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend)

const chartData = {
  labels: ['Москва', 'Берлин', 'Париж', 'Нью-Йорк', 'Лондон'],
  datasets: [
    {
      backgroundColor: ['#F39F18', '#158078', '#EE9374', '#310062', '#1F75FE'],
      data: [63, 34, 29, 78, 66],
    },
  ],
}

const chartOptions = {
  responsive: true,
  borderRadius: 8,
}
</script>

<template>
  <PolarArea :data="chartData" :options="chartOptions" />
</template>

<style scoped lang="scss"></style>
