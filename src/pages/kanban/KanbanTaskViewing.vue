<script setup>
import { computed, ref } from 'vue'
import { useKanbanStore } from '@/js/api/services/tasksService'
import { SquarePlus } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
const kanbanStore = useKanbanStore()
const newSubtaskText = ref('')
const toast = useToast()
const currentTask = computed(() => kanbanStore.editableTask)

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

const addSubtask = () => {
  if (newSubtaskText.value.trim()) {
    const newSubtask = {
      id: Date.now(), // временный ID
      title: newSubtaskText.value.trim(),
      is_completed: false
    }
    subtasks.value = [...subtasks.value, newSubtask]
    newSubtaskText.value = ''
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

  const success = await kanbanStore.deleteTask(currentTask.value.id);
  if (success) {
    closeModal();
  }
};


const closeModal = () => {
  kanbanStore.cleanSelectedTask()
}
</script>

<template>
  <div v-if="currentTask" class="modal-overlay" @click.self="closeModal">
    <div class="viewing-task-window">
      <button @click="closeModal" class="close-button">×</button>
      
      <div class="window-container">
        <div class="task-grid">
          <!-- Первая строка - чекбокс и название задачи -->
          <div class="grid-row">
            <div class="grid-cell icon-cell">
              <button class="toggle-button" :class="{ 'is-checked': isChecked }" @click="isChecked = !isChecked">
                <svg v-if="isChecked" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                </svg>
              </button>
            </div>
            <div class="grid-cell input-cell">
              <div class="text-field">
                <input type="text" v-model="taskTitle" placeholder="Название задачи" class="task-input">
              </div>
            </div>
          </div>

          <!-- Вторая строка - описание задачи -->
          <div class="grid-row">
            <div class="grid-cell icon-cell"></div>
            <div class="grid-cell input-cell">
              <div class="text-field">
                <input type="text" v-model="taskDescription" placeholder="Описание" class="description-input">
              </div>
            </div>
          </div>

          <!-- Третья строка - исполнитель -->
          <div class="grid-row">
            <div class="grid-cell icon-cell">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon">
                <path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z"/>
              </svg>
            </div>
            <div class="grid-cell input-cell">
              <select v-model="selectedWorker" class="combo-box">
                <option disabled value="">Выберите исполнителя</option>
                <option v-for="worker in workers" :key="worker.id" :value="worker.id">{{ worker.name }}</option>
              </select>
            </div>
          </div>

          <!-- Четвертая строка - срок выполнения -->
          <div class="grid-row">
            <div class="grid-cell icon-cell">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon">
                <path fill="currentColor" d="M19 19H5V8h14m-3-7v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1V1m-1 11h-5v5h5v-5z"/>
              </svg>
            </div>
            <div class="grid-cell input-cell">
              <input type="date" v-model="deadline" class="date-picker">
            </div>
          </div>

          <!-- Пятая строка - приоритет -->
          <div class="grid-row">
            <div class="grid-cell icon-cell">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon">
                <path fill="currentColor" d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
              </svg>
            </div>
            <div class="grid-cell input-cell">
              <select v-model="selectedPriority" class="combo-box">
                <option disabled value="">Выберите приоритет</option>
                <option value="1">Приоритет 1 (критическая)</option>
                <option value="2">Приоритет 2 (важная)</option>
                <option value="3">Приоритет 3 (срочная)</option>
                <option value="4">Приоритет 4 (рутинная)</option>
              </select>
            </div>
          </div>

          <!-- Шестая строка - подзадачи -->
          <div class="grid-row scroll-row">
            <div class="grid-cell icon-cell">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon">
                <path fill="currentColor" d="M3 17v2h6v-2H3M3 5v2h10V5H3m10 16v-2h8v-2h-8v-2h-2v6h2M7 9v2H3v2h4v2h2V9H7m14 4v-2H11v2h10m-6-4h2V7h4V5h-4V3h-2v6z"/>
              </svg>
            </div>
            <div class="grid-cell scroll-cell">
              <div class="subtasks-container">
                <div v-for="subtask in subtasks" :key="subtask.id" class="subtask-item">
                  <input 
                    type="checkbox" 
                    :checked="subtask.is_completed" 
                    @change="toggleSubtask(subtask.id)"
                    class="subtask-checkbox"
                  >
                  <span :class="{ 'completed': subtask.is_completed }">{{ subtask.title }}</span>
                  <button @click="deleteSubtask(subtask.id) " style = "border: none; background-color: white;">×</button>
                </div>
                <div class="subtask-item">
                  <input 
                    type="text" 
                    v-model="newSubtaskText" 
                    placeholder="Добавить подзадачу" 
                    @keyup.enter="addSubtask"
                    class="description-input"
                  >
                  <button @click="addSubtask" style ="border: none; background-color: white;">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Седьмая строка - кнопки -->
          <div class="grid-row button-row">
            <div class="grid-cell icon-cell"></div>
            <div class="grid-cell button-cell">
              <button class="action-button delete-button" @click="deleteTask">Удалить задачу</button>
              <button class="action-button save-button" @click="saveTask">Сохранить задачу</button>
            </div>
          </div>
        </div>
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
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.viewing-task-window {
  position: relative;
  width: 400px;
  height: 500px;
  background-color: white;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  z-index: 1001;
  color: #333;
}

.window-container {
  padding: 20px;
}

.task-grid {
  display: grid;
  grid-template-columns: 55px 1fr;
  grid-template-rows: 55px 40px 40px 45px 40px 1fr 35px;
  min-height: 100%;
}

.grid-row {
  display: contents;
}

.grid-cell {
  padding: 5px;
}

.icon-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.input-cell {
  display: flex;
  align-items: center;
}

.scroll-row {
  display: contents;
}

.scroll-cell {
  overflow-y: auto;
  max-height: 150px;
}

.button-row {
  display: contents;
}

.button-cell {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
}

.toggle-button {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  color: #000;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.toggle-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.toggle-button.is-checked {
  color: #f44336;
}

.icon {
  color: #333;
  width: 20px;
  height: 20px;
}

.text-field {
  width: 100%;
}

.task-input, .description-input {
  width: 100%;
  height: 30px;
  padding: 5px;
  border: none;
  border-bottom: 1px solid #ccc;
  background: transparent;
  font-size: 16px;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.task-input:focus, .description-input:focus {
  outline: none;
  border-bottom: 2px solid #f44336;
}

.combo-box {
  width: 256px;
  height: 36px;
  padding: 5px;
  border: none;
  border-bottom: 1px solid #ccc;
  background: transparent;
  font-size: 14px;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.combo-box:focus {
  outline: none;
  border-bottom: 2px solid #f44336;
}

.date-picker {
  width: 140px;
  height: 36px;
  padding: 5px;
  border: none;
  border-bottom: 1px solid #ccc;
  background: transparent;
  font-size: 14px;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.date-picker:focus {
  outline: none;
  border-bottom: 2px solid #f44336;
}

.subtasks-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-right: 5px;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px;
}

.subtask-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.completed {
  text-decoration: line-through;
  color: #757575;
}

.action-button {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: background-color 0.3s;
}

.delete-button {
  background-color: #cb2c20;
  color: white;
}

.delete-button:hover {
  background-color: #cb2c20;
}

.save-button {
  background-color: #cb2c20;
  color: white;
}

.save-button:hover {
  background-color: #cb2c20;
}
</style>