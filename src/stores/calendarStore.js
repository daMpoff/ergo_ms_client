import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { ref } from 'vue'
import { Offcanvas } from 'bootstrap/dist/js/bootstrap.bundle.min.js'

export const useCalendarStore = defineStore('calendarStore', () => {
  const toast = useToast()

  // ==== STATES ====

  // Ивенты
  const events = ref([
    {
      id: 1,
      title: 'Врач',
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 10, 15, 30),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), 10, 16, 30),
      classNames: 'calendarEventFilterPersonal',
      allDay: false,
    },
    {
      id: 2,
      title: 'Поездка на дачу',
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 14),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), 16),
      classNames: 'calendarEventFilterPersonal',
      allDay: true,
    },
    {
      id: 3,
      title: 'Собрание',
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 19),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), 21),
      classNames: 'calendarEventFilterBusiness',
      allDay: true,
    },
    {
      id: 4,
      title: 'Встреча',
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 18, 10),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 19, 50),
      classNames: 'calendarEventFilterBusiness',
      allDay: false,
    },
    {
      id: 5,
      title: 'День рождение',
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), 26),
      classNames: 'calendarEventFilterHolidays',
      allDay: true,
    },
    {
      id: 6,
      title: 'Супер мега корпоратив',
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 30),
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      classNames: 'calendarEventFilterHolidays',
      allDay: true,
    },
  ])
  const selectedEvent = ref(null)

  // Фильтры
  const filters = ref([
    { id: 'calendarEventFilterAll', name: 'Все', active: true },
    { id: 'calendarEventFilterPersonal', name: 'Личное', active: true },
    { id: 'calendarEventFilterBusiness', name: 'Бизнес', active: true },
    { id: 'calendarEventFilterHolidays', name: 'Праздники', active: true },
  ])
  const activeFilterIds = ref(filters.value.map((filter) => filter.id))

  // ==== GETTERS ====

  // Получение события по идентификатору
  const getEventById = (eventId) => {
    return events.value.findIndex((el) => el.id === +eventId)
  }

  // Получение следующего ID для карточки
  const getNextEventId = () => {
    const maxId = events.value.reduce((max, task) => Math.max(max, task.id), 0)
    return maxId + 1
  }

  // ==== ACTIONS ====

  // Выбор события
  const setSelectedEvent = (event) => {
    selectedEvent.value = event

    const bsOffcanvas = new Offcanvas('#calendarCanvas')
    bsOffcanvas.show()
  }

  // Очистка выбранного события
  const cleanSelectedEvent = () => (selectedEvent.value = null)

  // Добавление / обновление события
  const updateEvent = (event) => {
    const index = getEventById(event.id)
    if (index !== -1) {
      events.value.splice(index, 1, event)
      toast.success('Событие обновлено!')
    } else {
      events.value.push(event)
      toast.success('Событие добавлено!')
    }
  }

  // Удаление события
  const deleteEvent = (eventId) => {
    const index = events.value.findIndex((el) => el.id === +eventId)
    if (index !== -1) events.value.splice(index, 1)

    toast.success('Событие удалено!')
  }

  // Установка активных фильтров
  const setActiveFilters = (filterId) => {
    if (filterId === 'calendarEventFilterAll') {
      const allActive = filters.value[0].active
      filters.value.forEach((filter) => {
        filter.active = !allActive
      })
    } else {
      const allFilter = filters.value.find((filter) => filter.id === 'calendarEventFilterAll')
      const otherFilters = filters.value.filter((filter) => filter.id !== 'calendarEventFilterAll')

      // Состояние текущего фильтра
      const targetFilter = filters.value.find((filter) => filter.id === filterId)
      targetFilter.active = !targetFilter.active

      // Проверка состояния "Все"
      const allSelected = otherFilters.every((filter) => filter.active)
      allFilter.active = allSelected

      // Установка псевдокласса :indeterminate
      const allCheckbox = document.getElementById('calendarEventFilterAll')
      if (allCheckbox) {
        allCheckbox.indeterminate = !allSelected && otherFilters.some((filter) => filter.active)
      }
    }

    // Обновление списка активных фильтров и передача наверх
    activeFilterIds.value = filters.value
      .filter((filter) => filter.active && filter.id !== 'calendarEventFilterAll')
      .map((filter) => filter.id)
  }

  return {
    events,
    selectedEvent,
    filters,
    activeFilterIds,
    getEventById,
    getNextEventId,
    setSelectedEvent,
    cleanSelectedEvent,
    updateEvent,
    deleteEvent,
    setActiveFilters,
  }
})
