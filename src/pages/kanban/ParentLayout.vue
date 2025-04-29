<script setup>
import { EllipsisVertical, GripVertical, Plus, Bell, Calendar, Flag } from 'lucide-vue-next'
import { DragHandle, SlickItem, SlickList } from 'vue-slicksort'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { ref, onMounted, watch } from 'vue'
import Cookies from 'js-cookie'
import { useToast } from 'vue-toastification'
import DropDown from '@/components/DropDown.vue'
import KanbanTask from '@/pages/kanban/KanbanTask.vue'
import KanbanTaskViewing from '@/pages/kanban/KanbanTaskViewing.vue'
import { useKanbanStore } from '@/js/api/services/tasksService'
import { useRoute } from 'vue-router'

const props = defineProps({
  project_id: {
    type: [Number, String],
    required: true
  }
})

const route = useRoute()
const projectId = ref(null)

const kanbanStore = useKanbanStore()
const toast = useToast()
const isCopyingText = ref(true)
const newSectionName = ref('')
const isAddingSection = ref(false)
const isAddingTask = ref(-1)
const newTaskData = ref({
  title: '',
  description: '',
  dueDate: null,
  priority: 0,
  reminders: []
})
const showDatePicker = ref(false)
const showReminderPicker = ref(false)
const reminderDate = ref(null)
const priorityOptions = [
  { value: 1, label: 'критическая', color: 'danger' },
  { value: 2, label: 'важная', color: 'warning' },
  { value: 3, label: 'срочная', color: 'info' },
  { value: 4, label: 'рутинная', color: 'secondary' }
]
// Загрузка данных канбан-доски при изменении project_id
watch(() => props.project_id, (newVal) => {
  if (newVal) {
    kanbanStore.fetchColumns(newVal)
  }
})
// Добавляем реактивное отслеживание изменений в хранилище
watch(() => kanbanStore.columns, () => {
  // Можно добавить дополнительную логику при изменении колонок
}, { deep: true })


// Fetching project_id from the query parameter
onMounted(() => {
  projectId.value = route.query.project_id;
  if (projectId.value) {
    kanbanStore.fetchColumns(projectId.value)
  }
})

const startAddingSection = () => {
  isAddingSection.value = true
  newSectionName.value = ''
}

const submitNewSection = async () => {
  if (!newSectionName.value.trim()) {
    toast.error('Введите название раздела')
    return
  }
  
  try {
    await kanbanStore.addSection({
      section_name: newSectionName.value.trim(),
      project_id: projectId.value 
    })
    isAddingSection.value = false
    newSectionName.value = ''
    // После успешного добавления обновляем данные
    await kanbanStore.fetchColumns(props.project_id)
  } catch (error) {
    console.error('Ошибка при создании раздела:', error)
    toast.error('Ошибка при создании раздела')
  }
}

const startAddingTask = (columnIndex) => {
  isAddingTask.value = columnIndex
  newTaskData.value = {
    title: '',
    description: '',
    dueDate: null,
    priority: 0,
    reminders: []
  }
}

const submitNewTask = async (columnIndex) => {
  if (!newTaskData.value.title?.trim()) {
    toast.error('Введите название задачи');
    return;
  }

  const taskData = {
    text: newTaskData.value.title.trim(),
    section_id: kanbanStore.columns[columnIndex]?.id,
    description: newTaskData.value.description?.trim() || null,
    deadline: newTaskData.value.dueDate ? formatDateTimeForAPI(newTaskData.value.dueDate) : null,
    priority: newTaskData.value.priority || 1,
    user_id: parseInt(Cookies.get('userId')) || null,
    project_id: props.project_id,
    isdone: false,
    dateofcreation: new Date().toISOString()
  };

  if (!taskData.section_id) {
    toast.error('Не удалось определить раздел для задачи');
    return;
  }

  try {
    // Создание задачи через API и получение новой задачи
    const newTask = await kanbanStore.createTask(taskData);
    
    // Добавляем задачу в соответствующую колонку локально
    const column = kanbanStore.columns.find(col => col.id === taskData.section_id);
    if (column) {
      column.cards.push(newTask);
    } else {
      console.warn(`Раздел с ID ${taskData.section_id} не найден`);
      // Если колонка не найдена, делаем полное обновление
      await kanbanStore.fetchColumns(props.project_id);
    }
    
    // Очистка формы добавления задачи
    isAddingTask.value = -1;
    newTaskData.value = {
      title: '',
      description: '',
      dueDate: null,
      priority: 0,
      reminders: []
    };

    toast.success('Задача успешно добавлена');
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    toast.error('Ошибка при создании задачи');
  }
};
// Вспомогательная функция для форматирования даты
function formatDateTimeForAPI(date) {
  return new Date(date).toISOString()
}
// Остальные вспомогательные функции остаются без изменений




const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<template>
  <PerfectScrollbar class="kanban-container">
    <SlickList axis="x" v-model:list="kanbanStore.columns" class="d-flex" useDragHandle>
      <SlickItem
        v-for="(column, i) in kanbanStore.columns"
        :key="column.id"
        :index="i"
        class="kanban-column mx-2 flex-shrink-0"
        style="width: 18rem"
      >
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div class="d-inline-flex gap-1 text-truncate">
            <DragHandle style="cursor: move"><GripVertical :size="18" /></DragHandle>
            <h5
              class="mb-0 text-truncate user-select-none"
              contenteditable="true"
              style="outline: none"
            >
              {{ column.title }}
            </h5>
            <h5 class="mb-0 user-select-none">({{ column.cards.length }})</h5>
          </div>
          <DropDown dropdownMenuClass="hover-section dropdown-menu-end bg-light-subtle">
            <template #main>
              <EllipsisVertical :size="19" />
            </template>
            <template #list>
              <li class="dropdown-item">Изменить название</li>
              <li class="dropdown-item" @click="kanbanStore.deleteColumn(i)">Удалить раздел</li>
            </template>
          </DropDown>
        </div>

        <SlickList
          axis="y"
          v-model:list="kanbanStore.columns[i].cards"
          group="tasks"
          helper-class="selected-card-task"
          :distance="10"
          @sort-start="isCopyingText = false"
          @sort-end="isCopyingText = true"
          @sort-cancel="isCopyingText = true"
        >
          <SlickItem
            v-for="(task, j) in kanbanStore.columns[i].cards"
            :key="task.id"
            :index="j"
            class="my-2"
          >
            <div
              class="kanban-card-task card"
              :class="{ 'user-select-none': !isCopyingText }"
              style="cursor: grab"
            >
              <KanbanTask :task="task" />
            </div>
          </SlickItem>
        </SlickList>

        <!-- блок добавления подзадач -->
        <div v-if="isAddingTask === i" class="card p-3 mb-3">
          <input
            v-model="newTaskData.title"
            type="text"
            class="form-control mb-3"
            placeholder="Название задачи"
            autofocus
          />
          <textarea
            v-model="newTaskData.description"
            class="form-control mb-3"
            placeholder="Описание"
            rows="2"
          ></textarea>
          
          <!-- Date and Priority Row -->
          <div class="d-flex justify-content-between mb-3">
            <div class="d-flex align-items-center gap-2">
              <button 
                class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                @click="showDatePicker = !showDatePicker"
              >
                <Calendar :size="16" />
                <span>{{ newTaskData.dueDate ? formatDate(newTaskData.dueDate) : 'Дата' }}</span>
              </button>
              <input
                v-if="showDatePicker"
                v-model="newTaskData.dueDate"
                type="date"
                class="form-control form-control-sm"
                style="width: 140px"
                @change="showDatePicker = false"
              />
            </div>
            
            <div class="dropdown">
              <button 
                class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <Flag :size="16" :color="priorityOptions.find(p => p.value === newTaskData.priority)?.color" />
                <span>{{ priorityOptions.find(p => p.value === newTaskData.priority)?.label || 'Приоритет' }}</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li v-for="option in priorityOptions" :key="option.value">
                  <a class="dropdown-item" href="#" @click.prevent="newTaskData.priority = option.value">
                    <Flag :size="14" :color="option.color" class="me-2" />
                    {{ option.label }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Reminders Section (Отключено, так как API пока не поддерживает) -->
          <div v-if="false" class="mb-3">
            <div class="d-flex align-items-center gap-2 mb-2">
              <Bell :size="16" />
              <h6 class="mb-0">Напоминания</h6>
              <button 
                class="btn btn-sm btn-outline-secondary ms-auto"
                @click="showReminderPicker = !showReminderPicker"
              >
                Добавить
              </button>
            </div>
            
            <div v-if="showReminderPicker" class="d-flex align-items-center gap-2 mb-2">
              <input
                v-model="reminderDate"
                type="datetime-local"
                class="form-control form-control-sm"
              />
              <button class="btn btn-sm btn-primary" @click="addReminder">
                OK
              </button>
            </div>
            
            <div v-if="newTaskData.reminders.length" class="reminders-list">
              <div v-for="(reminder, index) in newTaskData.reminders" :key="index" class="d-flex align-items-center justify-content-between mb-1">
                <small>{{ formatDate(reminder) }}</small>
                <button 
                  class="btn btn-sm btn-link text-danger p-0"
                  @click="removeReminder(index)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          
          <!-- Bottom Section -->
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-secondary" @click="isAddingTask = -1">
                Отмена
              </button>
              <button class="btn btn-sm btn-primary" @click="submitNewTask(i)">
                Добавить
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="add-task d-flex align-items-center gap-2 p-2" @click="startAddingTask(i)">
          <Plus :size="16" />
          <span class="text-nowrap">Добавить задачу</span>
        </div>
      </SlickItem>
     <!-- Окончание блока с добавлением подзадач -->
      <!-- Section Addition Block -->
      <div v-if="!isAddingSection" class="add-column d-inline-flex justify-content-center gap-1 p-2" @click="startAddingSection">
    <Plus :size="24" />
    <h5 class="mb-0 text-nowrap">Добавить раздел</h5>
  </div>

     <div v-else class="kanban-column mx-2 flex-shrink-0" style="width: 18rem">
    <div class="card p-3">
      <input
        v-model="newSectionName"
        type="text"
        class="form-control mb-2"
        placeholder="Название раздела"
        @keyup.enter="submitNewSection"
        autofocus
      />
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-primary" @click="submitNewSection">
          Добавить
        </button>
        <button class="btn btn-sm btn-outline-secondary" @click="isAddingSection = false">
          Отмена
        </button>
      </div>
    </div>
  </div>
    </SlickList>
  </PerfectScrollbar>

  <KanbanEdit></KanbanEdit>
  <KanbanTaskViewing v-if="kanbanStore.editableTask" :task="kanbanStore.editableTask" />
</template>

<style scoped lang="scss">
.kanban-container {
  height: 85dvh;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.selected-card-task .kanban-card-task {
  transform: rotate(5deg);
}

.add-column {
  color: var(--bs-secondary-text-emphasis);
  height: fit-content;
  cursor: pointer;
  transition: color $transition;

  &:hover {
    color: var(--bs-card-title-color);
  }
}

.add-task {
  color: var(--bs-secondary-text-emphasis);
  cursor: pointer;
  transition: color $transition;
  border-radius: var(--bs-border-radius);
  margin-top: 0.5rem;

  &:hover {
    color: var(--bs-card-title-color);
    background-color: var(--bs-tertiary-bg);
  }
}

.reminders-list {
  max-height: 100px;
  overflow-y: auto;
  padding: 0.25rem;
  background-color: var(--bs-tertiary-bg);
  border-radius: var(--bs-border-radius);
}

.dropdown-toggle::after {
  margin-left: 0.25em;
}
</style>