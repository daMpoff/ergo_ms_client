<script setup></script>

<template>
  <div class="row row-gap-4">
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Группы списков по умолчанию</h4>
        <ul class="list-group">
          <li class="list-group-item">Элемент</li>
          <li class="list-group-item">Второй элемент</li>
          <li class="list-group-item">Третий элемент</li>
          <li class="list-group-item">Четвёртый элемент</li>
          <li class="list-group-item">И пятый</li>
        </ul>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Группа с активным элементом</h4>
        <ul class="list-group">
          <li class="list-group-item active" aria-current="true">Активный элемент</li>
          <li class="list-group-item">Второй элемент</li>
          <li class="list-group-item">Третий элемент</li>
          <li class="list-group-item">Четвёртый элемент</li>
          <li class="list-group-item">И пятый</li>
        </ul>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Группа с отключённым элементом</h4>
        <ul class="list-group">
          <li class="list-group-item disabled" aria-disabled="true">Отключенный элемент</li>
          <li class="list-group-item">Второй элемент</li>
          <li class="list-group-item">Третий элемент</li>
          <li class="list-group-item">Четвёртый элемент</li>
          <li class="list-group-item">И пятый</li>
        </ul>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Группа с кнопками</h4>
        <div class="list-group">
          <button
            type="button"
            class="list-group-item list-group-item-action active"
            aria-current="true"
          >
            Текущая кнопка
          </button>
          <button type="button" class="list-group-item list-group-item-action">
            Второй элемент кнопка
          </button>
          <button type="button" class="list-group-item list-group-item-action">
            Третий элемент кнопка
          </button>
          <button type="button" class="list-group-item list-group-item-action">
            Четвёртый элемент кнопка
          </button>
          <button type="button" class="list-group-item list-group-item-action" disabled>
            Отключенный элемент кнопка
          </button>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Поток</h4>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">Элемент</li>
          <li class="list-group-item">Второй элемент</li>
          <li class="list-group-item">Третий элемент</li>
          <li class="list-group-item">Четвёртый элемент</li>
          <li class="list-group-item">И пятый</li>
        </ul>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Пронумерованный список</h4>
        <ol class="list-group list-group-numbered">
          <li class="list-group-item">Элемент списка</li>
          <li class="list-group-item">Элемент списка</li>
          <li class="list-group-item">Элемент списка</li>
          <li class="list-group-item">Элемент списка</li>
          <li class="list-group-item">Элемент списка</li>
        </ol>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Цветной список</h4>
        <ul class="list-group">
          <li class="list-group-item list-group-item-success">
            Простой success элемент группы списка
          </li>
          <li class="list-group-item list-group-item-danger">
            Простой danger элемент группы списка
          </li>
          <li class="list-group-item list-group-item-warning">
            Простой warning элемент группы списка
          </li>
          <li class="list-group-item list-group-item-info">Простой info элемент группы списка</li>
          <li class="list-group-item list-group-item-dark">Простой dark элемент группы списка</li>
        </ul>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Список со значками</h4>
        <ul class="list-group">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Первый элемент списка
            <span class="badge bg-primary rounded-pill">14</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Второй элемент списка
            <span class="badge bg-primary rounded-pill">12</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Третий элемент списка
            <span class="badge bg-primary rounded-pill">8</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Четвёртый элемент списка
            <span class="badge bg-primary rounded-pill">6</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Пятый элемент списка
            <span class="badge bg-primary rounded-pill">4</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Список с флажками</h4>
        <ul class="list-group">
          <li class="list-group-item">
            <input class="form-check-input me-1" type="checkbox" value="" id="firstCheckbox" />
            <label class="form-check-label" for="firstCheckbox">Первый чекбокс</label>
          </li>
          <li class="list-group-item">
            <input class="form-check-input me-1" type="checkbox" value="" id="secondCheckbox" />
            <label class="form-check-label" for="secondCheckbox">Второй чекбокс</label>
          </li>
          <li class="list-group-item">
            <input class="form-check-input me-1" type="checkbox" value="" id="thirdCheckbox" />
            <label class="form-check-label" for="thirdCheckbox">Третий чекбокс</label>
          </li>
        </ul>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Список с радио</h4>
        <ul class="list-group">
          <li class="list-group-item">
            <input
              class="form-check-input me-1"
              type="radio"
              name="listGroupRadio"
              value=""
              id="firstRadio"
              checked
            />
            <label class="form-check-label" for="firstRadio">Первое радио</label>
          </li>
          <li class="list-group-item">
            <input
              class="form-check-input me-1"
              type="radio"
              name="listGroupRadio"
              value=""
              id="secondRadio"
            />
            <label class="form-check-label" for="secondRadio">Второе радио</label>
          </li>
          <li class="list-group-item">
            <input
              class="form-check-input me-1"
              type="radio"
              name="listGroupRadio"
              value=""
              id="thirdRadio"
            />
            <label class="form-check-label" for="thirdRadio">Третье радио</label>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
