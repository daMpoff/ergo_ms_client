<script setup>
defineProps({
  theme: { type: String, required: true, default: 'light' },
})

const series = [
  {
    name: 'iPhone 16',
    data: [80, 50, 30, 40, 100, 20],
  },
  {
    name: 'Samsung Galaxy S24',
    data: [20, 30, 40, 80, 20, 80],
  },
  {
    name: 'Huawei Mate 30 Pro',
    data: [44, 76, 78, 13, 43, 10],
  },
]

const options = {
  chart: { parentHeightOffset: 0, toolbar: { show: false }, animations: { enabled: false } },
  stroke: { width: 2 },
  fill: { opacity: 0.5 },
  markers: { size: 0 },
  xaxis: { categories: ['Память', 'OS', 'Батарея', 'Камера', 'Цена', 'Дизайн'] },
}
</script>

<template>
  <apexchart
    type="radar"
    height="350"
    :options="{ theme: { mode: theme }, ...options }"
    :series="series"
  ></apexchart>
</template>

<style scoped lang="scss"></style>
