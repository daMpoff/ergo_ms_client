<script setup>
defineProps({
  theme: { type: String, required: true, default: 'light' },
})

const series = [44, 55, 41, 17, 15]

const options = {
  chart: { parentHeightOffset: 0, toolbar: { show: false }, animations: { enabled: false } },
  labels: ['Найм', 'Оборудование', 'Производство', 'Дизайн', 'Реклама'],
  legend: { position: 'bottom' },
}
</script>

<template>
  <apexchart
    type="donut"
    height="350"
    :options="{ theme: { mode: theme }, ...options }"
    :series="series"
  ></apexchart>
</template>

<style scoped lang="scss"></style>
