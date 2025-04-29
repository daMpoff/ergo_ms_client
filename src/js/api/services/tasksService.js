import { apiClient } from '../manager';
import { endpoints } from '../endpoints';
import Cookies from 'js-cookie';

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { Offcanvas } from 'bootstrap/dist/js/bootstrap.bundle.min.js'

export const useKanbanStore = defineStore('kanbanStore', () => {
  const toast = useToast()
  const columns = ref([])
  const editableTask = ref(null)
  const isLoading = ref(false)
  const currentUserId = ref(null)

  // Инициализация - получаем ID пользователя из кук
  const initialize = () => {
    currentUserId.value = parseInt(Cookies.get('userId')) || null
    if (!currentUserId.value) {
      toast.error('Пользователь не авторизован')
    }
  }

  // Получение всех задач текущего пользователя
  const getAllTasks = () => {
    if (!currentUserId.value) return []
    return columns.value.flatMap(column => 
      column.cards.filter(card => card.user_id === currentUserId.value)
    )
  }

  // Получение задачи по ID (только если она принадлежит текущему пользователю)
  const getTaskById = (id) => {
    const task = getAllTasks().find(task => task.id === id)
    if (!task) {
      toast.error('Задача не найдена или у вас нет доступа')
    }
    return task
  }

  // Генерация следующего ID
  const getNextTaskId = () => {
    const allTasks = getAllTasks()
    return allTasks.length > 0 ? Math.max(...allTasks.map(t => t.id)) + 1 : 1
  }

  // Загрузка данных с сервера только для текущего пользователя
  const fetchColumns = async (project_id) => {
    if (!project_id) {
      return
    }
  
    isLoading.value = true
    try {
      const response = await apiClient.get(endpoints.crm.tasks.sectionTasks, { project_id: parseInt(project_id) });
      if (!response.success) {
        throw new Error('Ошибка при загрузке данных')
      }
    
      const data = response.data
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Некорректный формат данных от API')
      }
  
      // Сохраняем текущие задачи перед обновлением
      const currentTasks = {};
      columns.value.forEach(column => {
        column.cards.forEach(task => {
          currentTasks[task.id] = task;
        });
      });
  
      // Обновляем колонки, сохраняя локальные изменения
      columns.value = data.data.map(section => ({
        id: section.id,
        title: section.title,
        cards: section.cards
          .map(task => ({
            ...(currentTasks[task.id] || {}), // Сохраняем локальные изменения если есть
            id: task.id,
            title: task.title,
            priority: task.priority,
            description: task.description || '',
            is_completed: task.is_completed || false,
            assignee_id: task.assignee_id || null,
            deadline: task.deadline || null,
            project_id: task.project_id,
            subtasks: task.subtasks || [],
            image: task.image,
            attachments: task.attachments,
            comments: task.comments,
          }))
      }))
    } catch (error) {
      toast.error('Ошибка при загрузке данных: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }
  // Выбор задачи (только если она принадлежит пользователю)
  const setSelectedTask = (task) => {
    
    editableTask.value = task
    const bsOffcanvas = new Offcanvas('#kanbanCanvas')
    bsOffcanvas.show()
  }

  // Очистка выбранной задачи
  const cleanSelectedTask = () => (editableTask.value = null)

  // Создание нового раздела
  const addSection = async (sectionData) => {
    if (!currentUserId.value) {
      toast.error('Необходимо авторизоваться');
      return null;
    }
  
    isLoading.value = true;
    
    try {
      const requestData = {
        section_name: sectionData.section_name,
        project_id: sectionData.project_id || 1
      };
  
      // 1. Делаем запрос
      const response = await apiClient.post(
        endpoints.crm.tasks.add_section,
        requestData,
        true
      );
  
      // 2. Анализируем ответ сервера (безопасно)
      const responseData = response?.data || response;
      
      // 3. Пытаемся извлечь ID раздела (все возможные варианты)
      const sectionId = responseData?.id 
                      || responseData?.data?.id 
                      || responseData?.result?.id 
                      || responseData?.item?.id;
  
      // 4. Пытаемся извлечь название раздела
      const sectionName = responseData?.name 
                        || responseData?.section_name 
                        || responseData?.data?.name 
                        || sectionData.section_name;
  
      // 6. Создаем новую секцию
      const newSection = {
        id: sectionId,
        title: sectionName,
        cards: []
      };
  
      // 7. Обновляем список секций
      columns.value = [...columns.value, newSection];
      
      // 8. Уведомление об успехе
      toast.success(`Раздел "${sectionName}" успешно создан!`);
      return newSection;
  
    } catch (error) {
      console.error('Ошибка создания раздела:', {
        error: error.message,
        response: error.response?.data
      });
      
      // 9. Улучшенная обработка ошибок
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Ошибка при создании раздела';
      
      toast.error(errorMessage.includes('Network Error') 
        ? 'Проблемы с соединением' 
        : errorMessage);
      
      return null;
    } finally {
      isLoading.value = false;
    }
  };
// Создание новой задачи
const createTask = async (taskData) => {
  if (!currentUserId.value) {
    toast.error('Необходимо авторизоваться')
    return
  }

  isLoading.value = true
  try {
    if (!taskData.text || !taskData.section_id) {
      throw new Error('Не указаны обязательные поля (text и section_id)')
    }

    const requestData = {
      text: taskData.text,
      section_id: taskData.section_id,
      description: taskData.description || null,
      deadline: taskData.deadline || null,
      priority: taskData.priority || 1,
      parenttask_id: taskData.parenttask_id || 1,
      user_id: currentUserId.value,
      isdone: taskData.isdone || false,
      dateofcreation: new Date().toISOString()
    }

    const response = await apiClient.post(endpoints.crm.tasks.add_task, 
       requestData,
    );

    const responseData = response

    // Возвращаем полный объект задачи с ID
    return {
      id: responseData.id,
      title: responseData.text,
      section_id: responseData.section_id,
      isdone: responseData.isdone || false,
      dateofcreation: responseData.dateofcreation,
      priority: responseData.priority || 1,
      description: responseData.description || '',
      user_id: currentUserId.value,
      subtasks: [],
      deadline: responseData.deadline || null
    }

  } catch (error) {
    console.error('Ошибка при создании задачи:', error)
    toast.error(error.message || 'Ошибка при создании задачи')
    throw error
  } finally {
    isLoading.value = false
  }
}
  // Обновление информации о задаче
  const updateTask = async (info) => {
    if (!currentUserId.value) {
      toast.error('Необходимо авторизоваться')
      return
    }

    try {
      // Проверяем, что задача принадлежит пользователю
      const originalTask = getTaskById(info.id)
      if (!originalTask || originalTask.user_id !== currentUserId.value) {
        toast.error('У вас нет прав для редактирования этой задачи')
        return
      }

      const response = await fetch(`http://localhost:8000/api/crm/tasks/task-update/${info.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': Cookies.get('csrftoken') || '',
        },
        body: JSON.stringify({
          ...info,
          user_id: currentUserId.value
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const updatedTask = data.data || data

      // Обновляем задачу в хранилище
      columns.value.forEach(column => {
        const taskIndex = column.cards.findIndex(t => t.id === info.id)
        if (taskIndex !== -1) {
          column.cards[taskIndex] = {
            ...column.cards[taskIndex],
            ...updatedTask
          }
        }
      })

      toast.success('Задача обновлена!')
      return updatedTask
    } catch (error) {
      toast.error(`Ошибка при обновлении задачи: ${error.message}`)
      throw error
    }
  }

  // Удаление задачи
  const deleteTask = async (taskId) => {
    if (!currentUserId.value) {
      toast.error('Необходимо авторизоваться')
      return
    }

    try {
      // Проверяем, что задача принадлежит пользователю
      const task = getTaskById(taskId)
      if (!task || task.user_id !== currentUserId.value) {
        toast.error('У вас нет прав для удаления этой задачи')
        return
      }

      const response = await fetch(`http://localhost:8000/api/crm/tasks/task-delete/${taskId}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken') || '',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Удаляем задачу из хранилища
      columns.value.forEach(column => {
        const taskIndex = column.cards.findIndex(t => t.id === taskId)
        if (taskIndex !== -1) {
          column.cards.splice(taskIndex, 1)
        }
      })

      toast.success('Задача удалена!')
    } catch (error) {
      toast.error(`Ошибка при удалении задачи: ${error.message}`)
      throw error
    }
  }

  // Инициализация при создании хранилища
  initialize()

  return {
    columns,
    editableTask,
    isLoading,
    currentUserId,
    addSection,
    createTask,
    getAllTasks,
    getTaskById,
    getNextTaskId,
    setSelectedTask,
    cleanSelectedTask,
    updateTask,
    deleteTask,
    fetchColumns,
  }
})