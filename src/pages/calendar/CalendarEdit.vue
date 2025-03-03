<script setup>
import { reactive, watch } from 'vue'
import { DatePicker } from 'v-calendar'
import { useCalendarStore } from '@/stores/calendarStore.js'

// Хранилище
const calendarStore = useCalendarStore()

// Слежка за изменениями
watch(
  () => calendarStore.selectedEvent,
  (newValue) => {
    formData.id = newValue?.id
    formData.title = newValue?.title
    formData.category = newValue?.category
    formData.dateStart = newValue?.startDate
    formData.dateEnd = newValue?.endDate
    formData.allDay = newValue?.allDay
  },
)

// Данные формы
const formData = reactive({
  id: calendarStore.selectedEvent?.id,
  title: calendarStore.selectedEvent?.title,
  category: calendarStore.selectedEvent?.category,
  dateStart: calendarStore.selectedEvent?.startDate,
  dateEnd: calendarStore.selectedEvent?.endDate,
  allDay: calendarStore.selectedEvent?.allDay,
})

// Ошибки валидации
const errors = reactive({
  title: null,
  category: null,
  dateStart: null,
  dateEnd: null,
})

const validate = () => {
  let isValid = true

  // Проверка имени
  if (!formData.title) {
    errors.title = 'Название обязательно.'
    isValid = false
  } else if (formData.title.length < 3) {
    errors.title = 'Название должно быть не менее 3 символов.'
    isValid = false
  } else {
    errors.title = null
  }

  // Проверка категории
  if (!formData.category) {
    errors.category = 'Выберите категорию.'
    isValid = false
  } else {
    errors.category = null
  }

  // Проверка начала даты
  if (!formData.dateStart) {
    errors.dateStart = 'Дата обязательна.'
    isValid = false
  } else {
    errors.date = null
  }

  // Проверка конца даты
  if (!formData.dateEnd) {
    errors.dateEnd = 'Дата обязательна.'
    isValid = false
  } else {
    errors.date = null
  }

  return isValid
}

// Отправка формы
const handleSubmit = () => {
  if (!validate()) return

  calendarStore.updateEvent({
    id: +formData.id,
    title: formData.title,
    classNames: formData.category,
    start: formData.dateStart,
    end: formData.dateEnd,
    allDay: formData.allDay,
  })

  calendarStore.cleanSelectedEvent()
}

// Удаление события по кнопке
const deleteEvent = (eventId) => {
  calendarStore.deleteEvent(eventId)
  calendarStore.cleanSelectedEvent()
}
</script>

<template>
  <div class="offcanvas offcanvas-end" tabindex="-1" id="calendarCanvas">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">Редактирование события</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
      <div class="pt-1">
        <form @submit.prevent="handleSubmit" novalidate>
          <div class="mb-3">
            <label for="name" class="form-label">Название</label>
            <input
              v-model="formData.title"
              type="text"
              id="name"
              placeholder="Название события"
              class="form-control"
              :class="{ 'is-invalid': errors.title }"
              required
            />
            <div v-if="errors.title" class="invalid-feedback">{{ errors.title }}</div>
          </div>

          <div class="mb-3">
            <label for="category" class="form-label">Категория</label>
            <select
              id="category"
              class="form-select"
              v-model="formData.category"
              :class="{ 'is-invalid': errors.category }"
            >
              <option value="" disabled>Выберите категорию</option>
              <option
                value="calendarEventFilterPersonal"
                :selected="formData.category === 'calendarEventFilterPersonal'"
              >
                Личное
              </option>
              <option
                value="calendarEventFilterBusiness"
                :selected="formData.category === 'calendarEventFilterBusiness'"
              >
                Бизнес
              </option>
              <option
                value="calendarEventFilterHolidays"
                :selected="formData.category === 'calendarEventFilterHolidays'"
              >
                Праздники
              </option>
            </select>
            <div v-if="errors.category" class="invalid-feedback">
              {{ errors.category }}
            </div>
          </div>

          <div class="mb-3">
            <label for="date" class="form-label">Дата начала</label>
            <DatePicker
              v-model="formData.dateStart"
              mode="dateTime"
              is24hr
              :popover="{ visibility: 'focus' }"
            >
              <template #default="{ inputValue, inputEvents }">
                <input
                  type="text"
                  id="date-start"
                  class="form-control"
                  v-on="inputEvents"
                  :value="inputValue"
                  :class="{ 'is-invalid': errors.dateStart }"
                  required
                />
              </template>
            </DatePicker>
            <div v-if="errors.dateStart" class="invalid-feedback">{{ errors.dateStart }}</div>
          </div>

          <div class="mb-3">
            <label for="date" class="form-label">Дата конца</label>
            <DatePicker
              v-model="formData.dateEnd"
              mode="dateTime"
              is24hr
              :popover="{ visibility: 'focus' }"
            >
              <template #default="{ inputValue, inputEvents }">
                <input
                  type="text"
                  id="date-end"
                  class="form-control"
                  v-on="inputEvents"
                  :value="inputValue"
                  :class="{ 'is-invalid': errors.dateEnd }"
                  required
                />
              </template>
            </DatePicker>
            <div v-if="errors.dateEnd" class="invalid-feedback">{{ errors.dateEnd }}</div>
          </div>

          <div class="mb-3">
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="flexSwitchCheck"
                :checked="formData.allDay"
                @change="formData.allDay = !formData.allDay"
              />
              <label class="form-check-label" for="flexSwitchCheckChecked">Весь день</label>
            </div>
            <div v-if="errors.title" class="invalid-feedback">{{ errors.title }}</div>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" data-bs-dismiss="offcanvas">
              {{ calendarStore.getEventById(formData.id) === -1 ? 'Добавить' : 'Обновить' }}
            </button>
            <button
              v-if="calendarStore.getEventById(formData.id) !== -1"
              type="reset"
              class="btn btn-secondary"
              data-bs-dismiss="offcanvas"
              @click="deleteEvent(formData.id)"
            >
              Удалить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
