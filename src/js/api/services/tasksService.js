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
  const fetchSubtasks = async (parentTaskId) => {
    if (!parentTaskId) return [];
    
    isLoading.value = true;
    try {
      const response = await apiClient.get(endpoints.crm.tasks.sectionTasks, { 
        parenttask_id: parseInt(parentTaskId) 
      });
      
      if (!response.success) {
        throw new Error('Ошибка при загрузке подзадач');
      }
      
      const data = response.data;
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Некорректный формат данных от API');
      }
      
      // Собираем все подзадачи из всех секций в один массив
      const allSubtasks = data.data.flatMap(section => 
        section.cards.map(task => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          description: task.description || '',
          is_completed: task.is_completed || false,
          parenttask_id: parentTaskId,
          section_id: section.id,
          user_id: task.user_id,
          deadline: task.deadline || null
        }))
      );
      
      return allSubtasks;
    } catch (error) {
      toast.error('Ошибка при загрузке подзадач: ' + error.message);
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  // Загрузка данных с сервера только для текущего пользователя
  const fetchColumns = async (project_id) => {
    if (!project_id) return;
  
    isLoading.value = true;
    try {
      const response = await apiClient.get(endpoints.crm.tasks.sectionTasks, { 
        project_id: parseInt(project_id) 
      });
      
      if (!response.success) {
        throw new Error('Ошибка при загрузке данных');
      }
    
      const data = response.data;
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Некорректный формат данных от API');
      }
  
      // Формируем структуру колонок с задачами и подзадачами
      columns.value = data.data.map(section => ({
        id: section.id,
        title: section.title,
        cards: section.cards.map(task => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          description: task.description || '',
          is_completed: task.is_completed || false,
          assignee_id: task.assignee_id || null,
          deadline: task.deadline || null,
          project_id: task.project_id,
          parenttask_id: task.parenttask_id,
          subtasks: task.subtasks.map(subtask => ({
            id: subtask.id,
            title: subtask.text || subtask.title,
            priority: subtask.priority,
            description: subtask.description || '',
            is_completed: subtask.isdone || false,
            user_id: subtask.user_id,
            deadline: subtask.deadline || null
          })),
          image: task.image,
          attachments: task.attachments,
          comments: task.description,
        }))
      }));
  
    } catch (error) {
      toast.error('Ошибка при загрузке данных: ' + error.message);
    } finally {
      isLoading.value = false;
    }
  };
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
    return null
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
      user_id: currentUserId.value,
      isdone: taskData.isdone || false,
      dateofcreation: new Date().toISOString()
    }

    await apiClient.post(endpoints.crm.tasks.add_task, requestData)

    // Проверяем структуру ответа

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
      toast.error('Необходимо авторизоваться');
      return false;
    }
  
    try {
      // Проверяем существование задачи
      const task = getTaskById(taskId);
      if (!task) {
        toast.error('Задача не найдена');
        return false;
      }
  
      // Подтверждение удаления
      if (!confirm(`Удалить задачу "${task.title}"?`)) {
        return false;
      }
  
      // Отправляем запрос на удаление
      const response = await apiClient.delete(
        endpoints.crm.tasks.delete_task.replace('{id}', taskId)
      );
  
      if (!response.success) {
        throw new Error(response.error || 'Не удалось удалить задачу');
      }
  
      // Обновляем локальное состояние
      columns.value = columns.value.map(section => ({
        ...section,
        cards: section.cards.filter(card => card.id !== taskId)
      }));
  
      toast.success('Задача успешно удалена');
      return true;
  
    } catch (error) {
      console.error('Delete task error:', error);
      toast.error(error.message || 'Ошибка при удалении задачи');
      return false;
    }
  };

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
    fetchSubtasks
  }
})