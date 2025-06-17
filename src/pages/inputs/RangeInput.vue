<script setup></script>

<template>
  <h4 class="mb-3">Диапазон</h4>
  <div class="mb-2">
    <label for="customRange1" class="form-label">Стандартный диапазон</label>
    <input type="range" class="form-range" id="customRange1" />
  </div>
  <div class="mb-2">
    <label for="customRange2" class="form-label">Минимум и максимум</label>
    <input type="range" class="form-range" min="0" max="5" id="customRange2" />
  </div>
  <div class="mb-2">
    <label for="customRange3" class="form-label">С шагами</label>
    <input type="range" class="form-range" min="0" max="5" step="0.5" id="customRange3" />
  </div>
  <div class="mb-1">
    <label for="disabledRange" class="form-label">Отключённый диапазон</label>
    <input type="range" class="form-range" id="disabledRange" disabled />
  </div>
</template>

<style scoped lang="scss"></style>
