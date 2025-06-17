<script setup>
defineProps({
  theme: { type: String, required: true, default: 'light' },
})

const series = [40, 55, 70]

const options = {
  chart: { parentHeightOffset: 0, toolbar: { show: false }, animations: { enabled: false } },
  labels: ['Комментарии', 'Реакции', 'Поделились'],
  stroke: { lineCap: 'round' },
  plotOptions: { radialBar: { dataLabels: { total: { show: true, label: 'Среднее' } } } },
}
</script>

<template>
  <apexchart
    type="radialBar"
    height="350"
    :options="{ theme: { mode: theme }, ...options }"
    :series="series"
  ></apexchart>
</template>

<style scoped lang="scss"></style>
