<script setup>
defineProps({
  theme: { type: String, required: true, default: 'light' },
})

const series = [
  {
    name: 'Apple',
    data: [44, 55, 41, 67, 22, 43],
  },
  {
    name: 'Samsung',
    data: [13, 23, 20, 8, 13, 27],
  },
  {
    name: 'Huawei',
    data: [11, 17, 15, 15, 21, 14],
  },
  {
    name: 'Xiaomi',
    data: [21, 7, 25, 13, 22, 8],
  },
]

const options = {
  chart: { parentHeightOffset: 0, stacked: true, stackType: '100%', toolbar: { show: false } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  legend: { position: 'top' },
  plotOptions: { bar: { borderRadius: 8 } },
  xaxis: { categories: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь'] },
}
</script>

<template>
  <apexchart
    height="350"
    type="bar"
    :options="{ theme: { mode: theme }, ...options }"
    :series="series"
  ></apexchart>
</template>

<style scoped lang="scss"></style>
