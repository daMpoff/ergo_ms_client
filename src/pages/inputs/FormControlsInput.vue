<script setup></script>

<template>
  <h4 class="mb-3">Управление формой</h4>
  <div class="mb-2">
    <label for="emailInput" class="form-label">Адрес электронной почты</label>
    <input type="email" class="form-control" id="emailInput" placeholder="name@example.com" />
  </div>
  <div class="mb-2">
    <label for="readOnlyInput" class="form-label">Только для чтения</label>
    <input class="form-control" type="text" value="Только для чтения" id="readOnlyInput" readonly />
  </div>
  <div class="mb-2">
    <label for="dataListInput" class="form-label">Список данных</label>
    <input
      class="form-control"
      list="datalistOptions"
      id="dataListInput"
      placeholder="Введите для поиска..."
    />
    <datalist id="datalistOptions">
      <option value="Москва"></option>
      <option value="Санкт-Петербург"></option>
      <option value="Брянск"></option>
      <option value="Екатеринбург"></option>
      <option value="Волгоград"></option>
    </datalist>
  </div>
  <div class="mb-2">
    <label for="exampleFormControlSelect2" class="form-label">Множественный выбор</label>
    <select
      multiple=""
      class="form-select mb-2"
      id="exampleFormControlSelect2"
      aria-label="Multiple select example"
    >
      <option selected="">Открыть это меню выбора</option>
      <option value="1">Один</option>
      <option value="2">Два</option>
      <option value="3">Три</option>
    </select>
    <select
      class="form-select"
      id="exampleFormControlSelect3"
      size="2"
      aria-label="Size 2 select example"
    >
      <option selected="">Открыть это меню выбора</option>
      <option value="1">Один</option>
      <option value="2">Два</option>
      <option value="3">Три</option>
    </select>
  </div>
  <div class="mb-0">
    <label for="textareaInput" class="form-label">Текстовое поле</label>
    <textarea class="form-control" id="textareaInput" rows="3"></textarea>
  </div>
</template>

<style scoped lang="scss"></style>
