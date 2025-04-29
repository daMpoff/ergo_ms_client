<script setup>
import { MessageSquareText, Paperclip, Settings2 } from 'lucide-vue-next'
import { computed } from 'vue'
import { useKanbanStore } from '@/js/api/services/tasksService'
const kanbanStore = useKanbanStore()

const props = defineProps({
  task: { type: Object, required: true, default: () => {} },
})

const priorityLabel = computed(() => {
  switch (props.task.priority) {
    case 1: return 'критическая'
    case 2: return 'важная'
    case 3: return 'срочная'
    case 4: return 'рутинная'
    default: return 'Другое'
  }
})

const priorityBackground = computed(() => {
  switch (props.task.priority) {
    case 1: return 'danger'
    case 2: return 'warning'
    case 3: return 'info'
    case 4: return 'secondary'
    default: return 'secondary'
  }
})

const handleTaskClick = () => {
  kanbanStore.setSelectedTask(props.task)
}
</script>

<template>
  <div 
    class="task-container"
    @click="handleTaskClick"
    style="cursor: pointer;"
  >
    <div class="d-flex align-items-center justify-content-between mb-2">
      <span
        class="small px-2 py-1 rounded"
        :class="`bg-${priorityBackground}-subtle text-${priorityBackground}`"
      >
        {{ priorityLabel }}
      </span>

      <div
        class="hover-section text-secondary-emphasis p-1 rounded"
        @click.stop="kanbanStore.setSelectedTask(props.task)"
      >
        <Settings2 :size="20" />
      </div>
    </div>
    <h6 class="mb-2">{{ props.task.title }}</h6>

    <div v-if="props.task.image" class="mb-2">
      <img :src="props.task.image" :alt="props.task.title" class="img-fluid rounded" />
    </div>
    <div v-if="props.task.attachments || props.task.comments" class="d-flex gap-2">
      <div class="d-inline-flex align-items-center gap-1">
        <Paperclip :size="16" />
        <span>{{ props.task.attachments }}</span>
      </div>
      <div class="d-inline-flex align-items-center gap-1">
        <MessageSquareText :size="16" />
        <span>{{ props.task.comments }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-container {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: white;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.task-container:hover {
  background-color: #f8f9fa;
}

.hover-section:hover {
  background-color: #e9ecef;
}
</style>