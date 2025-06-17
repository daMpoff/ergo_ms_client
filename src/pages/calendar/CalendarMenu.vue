<script setup>
import { ref } from 'vue'
import { DatePicker } from 'v-calendar'
import { useCalendarStore } from '@/stores/calendarStore.js'

// Хранилище
const calendarStore = useCalendarStore()

defineEmits(['toggleCalendarMenu'])

// Дата из мини-календаря
const dateFromMiniCalendar = ref(new Date())

// Добавление события по нажатию на кнопку "Добавить событие"
const addEvent = () => {
  // Данные из мини-календаря
  const eventStartDate = new Date(dateFromMiniCalendar.value)
  const eventEndDate = new Date(eventStartDate)
  eventEndDate.setHours(eventStartDate.getHours() + 24)

  calendarStore.setSelectedEvent({
    id: +Date.now(),
    eventTitle: null,
    category: null,
    startDate: eventStartDate,
    endDate: eventEndDate,
    allDay: true,
  })
}
</script>

<template>
  <div class="mb-1 d-flex justify-content-between align-items-center">
    <button class="btn btn-primary w-100" @click="addEvent">Добавить событие</button>
    <button class="close-menu btn btn-close ms-3" @click="$emit('toggleCalendarMenu')"></button>
  </div>
  <div class="pt-4">
    <DatePicker v-model="dateFromMiniCalendar" expanded borderless />
  </div>
  <div class="pb-2">
    <h5 class="fw-bold mb-2">Фильтры</h5>
    <ul class="list-unstyled mb-0">
      <li
        v-for="filter in calendarStore.filters"
        :key="filter.id"
        class="hover-section rounded p-2"
      >
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            :id="filter.id"
            :checked="filter.active"
            @change="calendarStore.setActiveFilters(filter.id)"
          />
          <label class="form-check-label w-100" :for="filter.id" style="cursor: pointer">
            {{ filter.name }}
          </label>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.flatpickr-input {
  display: none;
}

.close-menu {
  @media (width > 992px) {
    display: none;
  }
}

input[id='calendarEventFilterAll']:checked {
  background-color: var(--bs-danger);
  box-shadow: 0 0.125rem 0.25rem 0 rgba(var(--bs-danger-rgb), 0.4);
}

input[id='calendarEventFilterPersonal']:checked {
  background-color: var(--bs-success);
  box-shadow: 0 0.125rem 0.25rem 0 rgba(var(--bs-success-rgb), 0.4);
}

input[id='calendarEventFilterBusiness']:checked {
  background-color: var(--bs-blue);
  box-shadow: 0 0.125rem 0.25rem 0 rgba(var(--bs-blue-rgb), 0.4);
}

input[id='calendarEventFilterHolidays']:checked {
  background-color: var(--bs-warning);
  box-shadow: 0 0.125rem 0.25rem 0 rgba(var(--bs-warning-rgb), 0.4);
}
</style>
