<script setup></script>

<template>
  <h4 class="mb-3">Выбор файлов</h4>
  <div class="mb-2">
    <label for="formFile" class="form-label">Пример ввода файла по умолчанию</label>
    <input class="form-control" type="file" id="formFile" />
  </div>
  <div class="mb-2">
    <label for="formFileMultiple" class="form-label">Пример ввода нескольких файлов</label>
    <input class="form-control" type="file" id="formFileMultiple" multiple />
  </div>
  <div class="mb-2">
    <label for="formFileDisabled" class="form-label">Пример отключённого ввода файла</label>
    <input class="form-control" type="file" id="formFileDisabled" disabled />
  </div>
  <div class="mb-2">
    <label for="formFileSm" class="form-label">Пример небольшого ввода файла</label>
    <input class="form-control form-control-sm" id="formFileSm" type="file" />
  </div>
  <div>
    <label for="formFileLg" class="form-label">Пример большого ввода файла</label>
    <input class="form-control form-control-lg" id="formFileLg" type="file" />
  </div>
</template>

<style scoped lang="scss"></style>
