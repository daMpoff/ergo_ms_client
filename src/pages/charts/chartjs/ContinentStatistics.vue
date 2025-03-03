<script setup>
import { Line } from 'vue-chartjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const chartData = {
  labels: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Ноя', 'Дек'],
  datasets: [
    {
      label: 'Евразия',
      data: [43, 40, 60, 54, 66, 82, 89, 81, 71, 59, 82, 71],
      borderColor: '#FF9200',
      backgroundColor: '#FFAD40',
      tension: 0.5,
    },
    {
      label: 'Африка',
      data: [17, 21, 22, 21, 23, 18, 11, 27, 17, 10, 28, 20],
      borderColor: '#FF4900',
      backgroundColor: '#FF7640',
      tension: 0.5,
    },
    {
      label: 'Америка',
      data: [84, 64, 99, 61, 85, 99, 61, 94, 96, 65, 82, 75],
      borderColor: '#04356C',
      backgroundColor: '#0D56A6',
      tension: 0.5,
    },
  ],
}

const chartOptions = {
  responsive: true,
  pointRadius: 0,
}
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<style scoped lang="scss"></style>
