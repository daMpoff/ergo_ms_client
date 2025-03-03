<script setup>
defineProps({
  theme: { type: String, required: true, default: 'light' },
})

const series = [
  {
    name: 'React JS',
    data: [
      [16.4, 5.4],
      [21.7, 2],
      [25.4, 3],
      [19, 2],
      [10.9, 1],
      [13.6, 3.2],
      [10.9, 7.4],
      [10.9, 0],
      [10.9, 8.2],
      [16.4, 0],
    ],
  },
  {
    name: 'Vue JS',
    data: [
      [36.4, 13.4],
      [1.7, 11],
      [5.4, 8],
      [9, 17],
      [1.9, 4],
      [3.6, 12.2],
      [1.9, 14.4],
      [1.9, 9],
      [1.9, 13.2],
      [1.4, 7],
    ],
  },
  {
    name: 'Angular JS',
    data: [
      [21.7, 3],
      [23.6, 3.5],
      [24.6, 3],
      [29.9, 3],
      [21.7, 20],
      [23, 2],
      [10.9, 3],
      [28, 4],
      [27.1, 0.3],
      [16.4, 4],
    ],
  },
]

const options = {
  chart: { zoom: { enabled: true, type: 'xy' }, parentHeightOffset: 0, toolbar: { show: false } },
  legend: { position: 'top' },
  colors: ['#0036fa', '#04fa00', '#fa3a00'],
  grid: { show: true, xaxis: { lines: { show: true } } },
  xaxis: { tickAmount: 10 },
  yaxis: { tickAmount: 7 },
}
</script>

<template>
  <apexchart
    height="350"
    type="scatter"
    :options="{ theme: { mode: theme }, ...options }"
    :series="series"
  ></apexchart>
</template>

<style scoped lang="scss"></style>
