<script setup>
defineProps({
  theme: { type: String, required: true, default: 'light' },
})

const series = [
  {
    data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380],
  },
]

const options = {
  chart: { parentHeightOffset: 0, toolbar: { show: false }, animations: { enabled: false } },
  plotOptions: {
    bar: {
      borderRadius: 4,
      borderRadiusApplication: 'end',
      horizontal: true,
    },
  },
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
