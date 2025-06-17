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
  labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  datasets: [{ label: 'Посещаемость', data: [40, 38, 45, 41, 36, 24, 19] }],
}

const chartOptions = {
  responsive: true,
  backgroundColor: '#7309AA',
  hoverBackgroundColor: '#A13DD5',
  borderRadius: 8,
  categoryPercentage: 0.5,
  indexAxis: 'y',
}
</script>

<template>
  <Bar id="weekly-statistics-chart" :options="chartOptions" :data="chartData" />
</template>

<style scoped lang="scss"></style>
