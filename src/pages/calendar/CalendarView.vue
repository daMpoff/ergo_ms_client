<script setup>
import { computed, ref, watch } from 'vue'

import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import ruLocale from '@fullcalendar/core/locales/ru'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import { useCalendarStore } from '@/stores/calendarStore.js'

// Хранилище
const calendarStore = useCalendarStore()

const emits = defineEmits(['toggleCalendarMenu'])

// Клик по дате
const handleDateClick = (info) => {
  // Данные из календаря
  const eventStartDate = info.date
  const eventEndDate = new Date(eventStartDate)

  const currentTime = new Date()

  // Текущее время для начала события
  eventStartDate.setHours(currentTime.getHours())
  eventStartDate.setMinutes(currentTime.getMinutes())

  // Текущее время для окончания события + 15 минут
  eventEndDate.setHours(currentTime.getHours())
  eventEndDate.setMinutes(currentTime.getMinutes() + 15)

  calendarStore.setSelectedEvent({
    id: calendarStore.getNextEventId(),
    title: null,
    category: null,
    startDate: eventStartDate,
    endDate: eventEndDate,
    allDay: false,
  })
}

// Клик по событию
const handleEventClick = (info) => {
  calendarStore.setSelectedEvent({
    id: info.event.id,
    title: info.event.title,
    category: info.event.classNames[0],
    startDate: info.event.start,
    endDate: info.event.end,
    allDay: info.event.allDay,
  })
}

// ==========================================

// Список идентификаторов активных фильтров
const activeFiltersId = ref([])

// Слежка за изменениями
watch(
  () => calendarStore.activeFilterIds,
  (newValue) => {
    activeFiltersId.value = newValue
  },
  { immediate: true },
)

// Фильтрация событий по активным идентификаторам
const filteredEvents = computed(() => {
  return calendarStore.events.filter((event) => activeFiltersId.value.includes(event.classNames))
})

// Настройки календаря
const calendarOptions = computed(() => ({
  dateClick: handleDateClick,
  eventClick: handleEventClick,
  locales: [ruLocale],
  locale: 'RU',
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, bootstrap5Plugin],
  initialView: 'dayGridMonth',
  themeSystem: 'bootstrap5',
  contentHeight: 'auto',
  editable: true,
  customButtons: {
    menuButton: {
      text: '☰',
      click: function () {
        if (window.innerWidth > 992) return
        emits('toggleCalendarMenu', true)
      },
    },
  },
  buttonText: { prev: 'Назад', next: 'Вперёд', list: 'Список' },
  headerToolbar: {
    left: 'menuButton prev,next',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
  },
  titleFormat: { year: 'numeric', month: 'long' },
  events: filteredEvents.value,
}))
</script>

<template>
  <FullCalendar :options="calendarOptions" />
</template>

<style lang="scss">
// Календарь fullcalendar
.fc-header-toolbar {
  @media (width <= 1330px) {
    flex-direction: column;
    gap: 8px;
  }
  @media (width <= 1199px) {
    flex-direction: row;
  }
  @media (width <= 1100px) {
    flex-direction: column;
    gap: 8px;
  }
}

.fc-menuButton-button {
  @media (width > 992px) {
    display: none !important;
  }
}

.fc-toolbar-chunk:nth-child(1) .btn-group {
  @media (width > 992px) {
    margin-left: 0 !important;
  }
}

.fc-event {
  padding: 0.25rem 0.5rem;
  border: none;

  .fc-event-title {
    font-weight: 500;
  }
}

.calendarEventFilterPersonal {
  background-color: var(--bs-success-bg-subtle);
  .fc-event-title {
    color: var(--bs-success-text-emphasis);
  }
}

.calendarEventFilterBusiness {
  background-color: var(--bs-info-bg-subtle);
  .fc-event-title {
    color: var(--bs-info-text-emphasis);
  }
}

.calendarEventFilterHolidays {
  background-color: var(--bs-warning-bg-subtle);
  .fc-event-title {
    color: var(--bs-warning-text-emphasis);
  }
}
</style>
