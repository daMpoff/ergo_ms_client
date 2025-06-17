<script setup>
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js'
import { Radar } from 'vue-chartjs'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const chartData = {
  labels: ['Аккаунт', 'Почта', 'Мессенджер', 'Календарь', 'Канбан', 'Настройки', 'Панель'],
  datasets: [
    {
      label: 'Компьютер',
      backgroundColor: 'rgba(179,181,198,0.2)',
      borderColor: 'rgba(179,181,198,1)',
      data: [63, 76, 51, 42, 69, 55, 74],
    },
    {
      label: 'Телефон',
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: 'rgba(255,99,132,1)',
      data: [75, 79, 84, 73, 53, 64, 55],
    },
  ],
}
const chartOptions = {}
</script>

<template>
  <Radar :data="chartData" :options="chartOptions" />
</template>

<style scoped lang="scss"></style>
