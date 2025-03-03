<script setup></script>

<template>
  <h4 class="mb-3">Флажки, переключатели и радио кнопки</h4>
  <div class="row row-gap-4">
    <div class="col-12 col-lg-6">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
        <label class="form-check-label" for="flexCheckDefault"> Флажок по умолчанию </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked />
        <label class="form-check-label" for="flexCheckChecked"> Выбранный флажок </label>
      </div>
      <div class="form-check my-2">
        <input
          class="form-check-input"
          type="checkbox"
          value=""
          id="flexCheckIndeterminate"
          indeterminate
        />
        <label class="form-check-label" for="flexCheckIndeterminate"> Неопределённый флажок </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="" id="flexCheckDisabled" disabled />
        <label class="form-check-label" for="flexCheckDisabled"> Отключённый флажок </label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          value=""
          id="flexCheckCheckedDisabled"
          checked
          disabled
        />
        <label class="form-check-label" for="flexCheckCheckedDisabled">
          Отключённый выбранный флажок
        </label>
      </div>
    </div>
    <div class="col-12 col-lg-6">
      <div class="form-check">
        <input
          class="form-check-input"
          type="radio"
          name="flexRadioDefault"
          id="flexRadioDefault1"
        />
        <label class="form-check-label" for="flexRadioDefault1"> Радио по умолчанию </label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="radio"
          name="flexRadioDefault"
          id="flexRadioDefault2"
          checked
        />
        <label class="form-check-label" for="flexRadioDefault2"> Радио выбранное </label>
      </div>
      <div class="form-check mt-2">
        <input
          class="form-check-input"
          type="radio"
          name="flexRadioDisabled"
          id="flexRadioDisabled"
          disabled
        />
        <label class="form-check-label" for="flexRadioDisabled"> Отключенное радио </label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="radio"
          name="flexRadioDisabled"
          id="flexRadioCheckedDisabled"
          checked
          disabled
        />
        <label class="form-check-label" for="flexRadioCheckedDisabled">
          Отключенное выбранное радио
        </label>
      </div>
    </div>
    <div class="col-12 mt-2">
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" />
        <label class="form-check-label" for="flexSwitchCheckDefault"
          >Ввод флажка переключателя по умолчанию</label
        >
      </div>
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
          id="flexSwitchCheckChecked"
          checked
        />
        <label class="form-check-label" for="flexSwitchCheckChecked"
          >Выбран флажок переключателя ввода</label
        >
      </div>
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
          id="flexSwitchCheckDisabled"
          disabled
        />
        <label class="form-check-label" for="flexSwitchCheckDisabled"
          >Отключено переключение флажка ввода</label
        >
      </div>
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          role="switch"
          id="flexSwitchCheckCheckedDisabled"
          checked
          disabled
        />
        <label class="form-check-label" for="flexSwitchCheckCheckedDisabled"
          >Отключено переключение флажка в поле ввода</label
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
