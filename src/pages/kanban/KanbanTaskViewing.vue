<script setup>
import { computed, ref } from 'vue'
import { useKanbanStore } from '@/js/api/services/tasksService'
import { SquarePlus } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
const kanbanStore = useKanbanStore()
const newSubtaskText = ref('')
const toast = useToast()
const currentTask = computed(() => kanbanStore.editableTask)
const isLoading = ref(false) // Добавляем состояние загрузки

const isChecked = computed({
  get: () => currentTask.value?.is_completed || false,
  set: (value) => {
    if (currentTask.value) {
      currentTask.value.is_completed = value
    }
  }
})

const taskTitle = computed({
  get: () => currentTask.value?.title || '',
  set: (value) => {
    if (currentTask.value) {
      currentTask.value.title = value
    }
  }
})

const taskDescription = computed({
  get: () => currentTask.value?.description || '',
  set: (value) => {
    if (currentTask.value) {
      currentTask.value.description = value
    }
  }
})

const selectedPriority = computed({
  get: () => currentTask.value?.priority?.toString() || '',
  set: (value) => {
    if (currentTask.value) {
      currentTask.value.priority = parseInt(value)
    }
  }
})

const workers = [
  { id: '1', name: 'Иван Иванов' },
  { id: '2', name: 'Петр Петров' },
  { id: '3', name: 'Сидор Сидоров' }
]

const selectedWorker = computed({
  get: () => currentTask.value?.assignee_id?.toString() || '',
  set: (value) => {
    if (currentTask.value) {
      currentTask.value.assignee_id = parseInt(value)
    }
  }
})

const deadline = computed({
  get: () => currentTask.value?.deadline || '',
  set: (value) => {
    if (currentTask.value) {
      currentTask.value.deadline = value
    }
  }
})

const subtasks = computed({
  get: () => currentTask.value?.subtasks || [],
  set: (value) => {
    if (currentTask.value) {
      currentTask.value.subtasks = value
    }
  }
})

const addSubtask = async () => {
  if (!newSubtaskText.value.trim()) return
  
  try {
    isLoading.value = true
    
    // Создаем данные для подзадачи
    const subtaskData = {
      text: newSubtaskText.value.trim(),
      section_id: currentTask.value.section_id, // предполагаем, что section_id есть у родительской задачи
      parenttask_id: currentTask.value.id, // ID текущей задачи как родительской
      isdone: false,
      priority: currentTask.value.priority || 0,
      user_id: currentTask.value.assignee_id // или другой ID пользователя
    }
    
    // Вызываем метод из сервиса
    const createdSubtask = await kanbanStore.createSubtask(subtaskData)
    
    // Добавляем подзадачу в локальный список
    subtasks.value = [
      ...subtasks.value, 
      {
        id: createdSubtask.id,
        title: createdSubtask.text,
        is_completed: createdSubtask.isdone
      }
    ]
    
    newSubtaskText.value = ''
    toast.success('Подзадача успешно добавлена')
    
  } catch (error) {
    console.error('Ошибка при создании подзадачи:', error)
    toast.error(error.message || 'Ошибка при создании подзадачи')
  } finally {
    isLoading.value = false
  }
}


const toggleSubtask = (subtaskId) => {
  subtasks.value = subtasks.value.map(subtask => 
    subtask.id === subtaskId 
      ? { ...subtask, is_completed: !subtask.is_completed } 
      : subtask
  )
}

const deleteSubtask = (subtaskId) => {
  subtasks.value = subtasks.value.filter(subtask => subtask.id !== subtaskId)
}

const saveTask = () => {
  if (currentTask.value) {
    kanbanStore.updateTask(currentTask.value)
    closeModal()
  }
}

const deleteTask = async () => {
  if (!currentTask.value?.id) return;
  
  try {
    const confirmed = confirm('Вы уверены, что хотите удалить эту задачу и все подзадачи?');
    if (!confirmed) return;
    
    const { success} = await kanbanStore.deleteTask(currentTask.value.id);
    
    if (success) {
      closeModal();
    }
  } catch (error) {
    toast.error(error.message || 'Произошла ошибка при удалении');
  }
};

const closeModal = () => {
  kanbanStore.cleanSelectedTask()
}
</script>
<template>
  <div v-if="currentTask" class="modal-overlay" @click.self="closeModal">
    <div class="task-modal">
      <button class="close-btn" @click="closeModal">×</button>

      <h2 class="modal-title">{{ isChecked ? 'Редактировать задачу' : 'Новая задача' }}</h2>

      <div class="form-group">
        <label class="form-label">Название задачи</label>
        <input v-model="taskTitle" placeholder="Введите название задачи" class="input-field" />
      </div>

      <div class="form-group">
        <label class="form-label">Описание</label>
        <input v-model="taskDescription" placeholder="Добавьте описание задачи" class="input-field" />
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label class="form-label">Исполнитель</label>
          <select v-model="selectedWorker" class="select-field">
            <option disabled value="">Выберите исполнителя</option>
            <option v-for="worker in workers" :key="worker.id" :value="worker.id">{{ worker.name }}</option>
          </select>
        </div>

        <div class="form-group half">
          <label class="form-label">Срок выполнения</label>
          <input type="date" v-model="deadline" class="input-field date-field" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Приоритет</label>
        <select v-model="selectedPriority" class="select-field">
          <option disabled value="">Выберите приоритет</option>
          <option value="1">Критический</option>
          <option value="2">Высокий</option>
          <option value="3">Средний</option>
          <option value="4">Низкий</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Подзадачи</label>
        <div class="subtasks-list">
          <div v-for="subtask in subtasks" :key="subtask.id" class="subtask-item">
            <input type="checkbox" v-model="subtask.is_completed" @change="toggleSubtask(subtask.id)" />
            <span :class="{ completed: subtask.is_completed }">{{ subtask.title }}</span>
            <button class="delete-subtask" @click="deleteSubtask(subtask.id)">✕</button>
          </div>
          <div class="add-subtask">
            <input
              v-model="newSubtaskText"
              placeholder="Добавить подзадачу..."
              @keyup.enter="addSubtask"
              class="input-field"
            />
            <button class="btn-icon" @click="addSubtask">+</button>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-secondary" @click="deleteTask" :disabled="!currentTask?.id">
          Удалить задачу
        </button>
        <button class="btn btn-primary" @click="saveTask">
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.task-modal {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 500px;
  max-width: 90%;
  position: relative;
  animation: fadeInUp 0.3s ease-in-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.modal-title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.half {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
  color: #555;
}

.input-field,
.select-field {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

.input-field:focus,
.select-field:focus {
  border-color: #cb2c20;
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.1);
}

.date-field {
  padding: 0.6rem 0.8rem;
}

.subtasks-list {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 0.6rem;
  min-height: 100px;
  max-height: 200px;
  overflow-y: auto;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  margin-bottom: 0.3rem;
  background: #f9f9f9;
  border-radius: 6px;
}

.subtask-item:last-child {
  margin-bottom: 0;
}

.completed {
  text-decoration: line-through;
  color: #aaa;
}

.delete-subtask {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: #cb2c20;
  cursor: pointer;
}

.add-subtask {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-icon {
  background: #cb2c20;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  font-size: 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-icon:hover {
  background: #cb2c20;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #cb2c20;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #cb2c20;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
  border: none;
}

.btn-secondary:hover {
  background-color: #ccc;
}
</style>