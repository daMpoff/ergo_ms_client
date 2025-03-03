<script setup>
defineProps({
  theme: { type: String, required: true, default: 'light' },
})

const series = [
  { name: 'Посещения', data: [31, 54, 49, 63, 74, 109, 130] },
  { name: 'Покупки', data: [11, 24, 19, 32, 45, 63, 74] },
  { name: 'Продажи', data: [21, 38, 29, 43, 59, 72, 92] },
]

const options = {
  chart: { parentHeightOffset: 0, toolbar: { show: false } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  legend: { position: 'top' },
  xaxis: { categories: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00'] },
}
</script>

<template>
  <apexchart
    height="350"
    type="area"
    :options="{ theme: { mode: theme }, ...options }"
    :series="series"
  ></apexchart>
</template>

<style scoped lang="scss"></style>
