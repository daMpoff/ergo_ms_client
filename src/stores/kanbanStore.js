import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { Offcanvas } from 'bootstrap/dist/js/bootstrap.bundle.min.js'

export const useKanbanStore = defineStore('kanbanStore', () => {
  const toast = useToast()

  // ==== STATES ====
  const columns = ref([
    {
      id: 1,
      title: 'Список задач',
      cards: [
        {
          id: 1,
          title: 'Разработка прототипа интерфейса главной страницы',
          tag: 'UI/UX',
          image: null,
          attachments: 4,
          comments: 12,
        },
        {
          id: 2,
          title: 'Настройка REST API для получения списка пользователей',
          tag: 'API',
          image: null,
          attachments: 2,
          comments: 8,
        },
      ],
    },
    {
      id: 2,
      title: 'В процессе',
      cards: [
        {
          id: 3,
          title: 'Интеграция REST API',
          tag: 'API',
          image: null,
          attachments: 8,
          comments: 17,
        },
        {
          id: 4,
          title: 'Поиск картинок для страниц',
          tag: 'UI/UX',
          image: '/src/assets/kanban-image.png',
          attachments: 10,
          comments: 18,
        },
      ],
    },
    {
      id: 3,
      title: 'Готово',
      cards: [
        {
          id: 5,
          title: 'Подключение библиотек для стилизации',
          tag: 'UI/UX',
          image: null,
          attachments: 1,
          comments: 4,
        },
        {
          id: 6,
          title: 'Создание базы данных для проекта',
          tag: 'Dev',
          image: null,
          attachments: 6,
          comments: 21,
        },
      ],
    },
  ])
  const editableTask = ref(null)

  // ==== GETTERS ====

  // Получение всех задач отдельным списком
  const getAllTasks = () => {
    return columns.value.flatMap((column) => column.cards)
  }

  const getTaskById = (id) => {
    return getAllTasks().find((task) => task.id === id)
  }

  // Получение следующего ID для карточки
  const getNextTaskId = () => {
    const allTasks = getAllTasks()
    const maxId = allTasks.reduce((max, task) => Math.max(max, task.id), 0)
    return maxId + 1
  }

  // ==== ACTIONS ====

  // Выбор задачи
  const setSelectedTask = (task) => {
    editableTask.value = task

    const bsOffcanvas = new Offcanvas('#kanbanCanvas')
    bsOffcanvas.show()
  }

  // Очистка выбранной задачи
  const cleanSelectedTask = () => (editableTask.value = null)

  // Добавление колонки
  const addColumn = () => {
    columns.value.push({
      id: columns.value.length + 1,
      title: 'Новый блок',
      cards: [],
    })
  }

  // Удаление колонки
  const deleteColumn = (columnId) => {
    columns.value.splice(columnId, 1)
  }

  // Обновление информации о задаче
  const updateTask = (info) => {
    const tasks = getAllTasks()

    const taskItem = tasks.find((t) => t.id === info.id)
    if (taskItem) {
      Object.assign(taskItem, info)
    }

    toast.success('Задача обновлена!')
  }

  // Добавление задачи
  const addTask = (columnId) => {
    columns.value[columnId].cards.push({
      id: getNextTaskId(),
      title: 'Новая задача',
      tag: 'Без тега',
      color: 'dark',
      image: null,
      attachments: 0,
      comments: 0,
    })

    toast.success('Задача добавлена!')
  }

  // Удаление задачи
  const deleteTask = (taskId) => {
    console.log(columns.value)
    let columnIndex = -1
    let taskIndex = -1

    // Поиск задачи по id
    columns.value.some((column, colIdx) => {
      const idx = column.cards.findIndex((task) => task.id === taskId)
      if (idx !== -1) {
        columnIndex = colIdx
        taskIndex = idx
        return true
      }
      return false
    })

    if (columnIndex !== -1 && taskIndex !== -1) {
      columns.value[columnIndex].cards.splice(taskIndex, 1)
    }

    toast.success('Задача удалена!')
  }

  return {
    columns,
    editableTask,
    getAllTasks,
    getTaskById,
    getNextTaskId,
    setSelectedTask,
    cleanSelectedTask,
    addColumn,
    deleteColumn,
    updateTask,
    addTask,
    deleteTask,
  }
})
