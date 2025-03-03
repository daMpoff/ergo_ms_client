<script setup></script>

<template>
  <h4 class="mb-3">HTML5 формы</h4>
  <div class="mb-2 row">
    <label for="text5Input" class="col-md-2 col-form-label">Текст</label>
    <div class="col-md-10">
      <input class="form-control" type="text" value="Текст" id="text5Input" />
    </div>
  </div>
  <div class="mb-2 row">
    <label for="search5Input" class="col-md-2 col-form-label">Поиск</label>
    <div class="col-md-10">
      <input class="form-control" type="search" id="search5Input" />
    </div>
  </div>
  <div class="mb-2 row">
    <label for="email5Input" class="col-md-2 col-form-label">Почта</label>
    <div class="col-md-10">
      <input class="form-control" type="email" value="example@site.com" id="email5Input" />
    </div>
  </div>
  <div class="mb-2 row">
    <label for="url5Input" class="col-md-2 col-form-label">Ссылка</label>
    <div class="col-md-10">
      <input class="form-control" type="url" value="https://example.com" id="url5Input" />
    </div>
  </div>
  <div class="mb-2 row">
    <label for="tel5Input" class="col-md-2 col-form-label">Телефон</label>
    <div class="col-md-10">
      <input class="form-control" type="tel" value="(123) 456-78-90" id="tel5Input" />
    </div>
  </div>
  <div class="mb-2 row">
    <label for="password5Input" class="col-md-2 col-form-label">Пароль</label>
    <div class="col-md-10">
      <input class="form-control" type="password" value="abc123" id="password5Input" />
    </div>
  </div>
  <div class="mb-2 row">
    <label for="number5Input" class="col-md-2 col-form-label">Число</label>
    <div class="col-md-10">
      <input class="form-control" type="number" value="35" id="number5Input" />
    </div>
  </div>
  <div class="mb-2 row">
    <label for="datetime5Input" class="col-md-2 col-form-label text-nowrap">Дата и время</label>
    <div class="col-md-10">
      <input
        class="form-control"
        type="datetime-local"
        value="2025-06-18T12:30:00"
        id="datetime5Input"
      />
    </div>
  </div>
  <div class="mb-2 row">
    <label for="date5Input" class="col-md-2 col-form-label text-nowrap">Дата</label>
    <div class="col-md-10">
      <input class="form-control" type="date" value="2025-06-18" id="date5Input" />
    </div>
  </div>
  <div class="mb-2 row">
    <label for="month5Input" class="col-md-2 col-form-label text-nowrap">Месяц</label>
    <div class="col-md-10">
      <input class="form-control" type="month" value="2025-06" id="month5Input" />
    </div>
  </div>
  <div class="mb-2 row">
    <label for="week5Input" class="col-md-2 col-form-label text-nowrap">Неделя</label>
    <div class="col-md-10">
      <input class="form-control" type="week" value="2025-W25" id="week5Input" />
    </div>
  </div>
  <div class="mb-2 row">
    <label for="time5Input" class="col-md-2 col-form-label text-nowrap">Время</label>
    <div class="col-md-10">
      <input class="form-control" type="time" value="12:30:00" id="time5Input" />
    </div>
  </div>
  <div class="mb-2 row">
    <label for="сolorInput" class="col-md-2 form-label">Цвет</label>
    <div class="col-md-10">
      <input
        type="color"
        class="form-control"
        id="сolorInput"
        value="#3E88FE"
        title="Выбери свой цвет"
      />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
