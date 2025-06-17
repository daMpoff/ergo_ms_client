<script setup>
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartData = {
  labels: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Ноя', 'Дек'],
  datasets: [{ label: 'Посещаемость', data: [40, 34, 38, 39, 34, 49, 51, 54, 40, 34, 32, 24] }],
}

const chartOptions = {
  responsive: true,
  backgroundColor: '#0C5DA5',
  hoverBackgroundColor: '#408DD2',
  borderRadius: 8,
  categoryPercentage: 0.4,
  indexAxis: 'x',
}
</script>

<template>
  <Bar :options="chartOptions" :data="chartData" />
</template>

<style scoped lang="scss"></style>
