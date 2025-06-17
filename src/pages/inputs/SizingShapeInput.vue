<script setup></script>

<template>
  <h4 class="mb-3">Размер формы</h4>
  <h5 class="mb-2">Поля ввода</h5>
  <div class="mb-2">
    <label for="largeInput" class="form-label">Большое поле ввода</label>
    <input
      class="form-control form-control-lg"
      type="text"
      id="largeInput"
      placeholder="Большое поле ввода"
      aria-label="Пример .form-control-lg"
    />
  </div>
  <div class="mb-2">
    <label for="defaultSizeInput" class="form-label">Поле ввода по умолчанию</label>
    <input
      class="form-control"
      type="text"
      id="defaultSizeInput"
      placeholder="Поле ввода по умолчанию"
      aria-label="пример ввода по умолчанию"
    />
  </div>
  <div class="mb-2">
    <label for="smallInput" class="form-label">Маленькое поле ввода</label>
    <input
      class="form-control form-control-sm"
      type="text"
      id="smallInput"
      placeholder="Маленькое поле ввода"
      aria-label="Пример .form-control-sm"
    />
  </div>
  <h5 class="my-2">Меню выбора</h5>
  <div class="mb-2">
    <label for="largeSelect" class="form-label">Большое меню выбора</label>
    <select class="form-select form-select-lg" id="largeSelect">
      <option selected>Откройте это меню выбора</option>
      <option value="1">Один</option>
      <option value="2">Два</option>
      <option value="3">Три</option>
    </select>
  </div>
  <div class="mb-2">
    <label for="defaultSizeSelect" class="form-label">Меню выбора по умолчанию</label>
    <select class="form-select form-select" id="defaultSizeSelect">
      <option selected>Откройте это меню выбора</option>
      <option value="1">Один</option>
      <option value="2">Два</option>
      <option value="3">Три</option>
    </select>
  </div>
  <div class="mb-4">
    <label for="smallSelect" class="form-label">Маленькое меню выбора</label>
    <select class="form-select form-select-sm" id="smallSelect">
      <option selected>Откройте это меню выбора</option>
      <option value="1">Один</option>
      <option value="2">Два</option>
      <option value="3">Три</option>
    </select>
  </div>
</template>

<style scoped lang="scss"></style>
