<script setup>
defineProps({
  theme: { type: String, required: true, default: 'light' },
})

const series = [
  {
    name: 'Сеть',
    data: [10, 41, 35, 51, 49, 62, 69],
  },
]

const options = {
  chart: { parentHeightOffset: 0, toolbar: { show: false } },
  dataLabels: { enabled: false },
  stroke: { curve: 'straight' },
  colors: ['#fac400'],
  xaxis: { categories: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00'] },
}
</script>

<template>
  <apexchart
    height="350"
    type="line"
    :options="{ theme: { mode: theme }, ...options }"
    :series="series"
  ></apexchart>
</template>

<style scoped lang="scss"></style>
