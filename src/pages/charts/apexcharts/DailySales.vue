<script setup>
defineProps({
  theme: { type: String, required: true, default: 'light' },
})

const generateData = (count, range) => {
  const result = [count]
  for (let i = 0; i < count; i++) {
    const randomNumber = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
    result.push(randomNumber)
  }
  return result
}

const series = [
  { name: 'Январь', data: generateData(18, { min: 0, max: 90 }) },
  { name: 'Февраль', data: generateData(18, { min: 0, max: 90 }) },
  { name: 'Март', data: generateData(18, { min: 0, max: 90 }) },
  { name: 'Апрель', data: generateData(18, { min: 0, max: 90 }) },
  { name: 'Май', data: generateData(18, { min: 0, max: 90 }) },
  { name: 'Июнь', data: generateData(18, { min: 0, max: 90 }) },
  { name: 'Июль', data: generateData(18, { min: 0, max: 90 }) },
  { name: 'Август', data: generateData(18, { min: 0, max: 90 }) },
  { name: 'Сентябрь', data: generateData(18, { min: 0, max: 90 }) },
]

const options = {
  chart: { parentHeightOffset: 0, toolbar: { show: false }, animations: { enabled: false } },
  dataLabels: { enabled: false },
  colors: ['#008FFB'],
}
</script>

<template>
  <apexchart
    type="heatmap"
    height="350"
    :options="{ theme: { mode: theme }, ...options }"
    :series="series"
  ></apexchart>
</template>

<style scoped lang="scss"></style>
