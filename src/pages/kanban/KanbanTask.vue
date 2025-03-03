<script setup>
import { MessageSquareText, Paperclip, Settings2 } from 'lucide-vue-next'
import { computed } from 'vue'
import { useKanbanStore } from '@/stores/kanbanStore.js'

// Хранилище
const kanbanStore = useKanbanStore()

const props = defineProps({
  task: { type: Object, required: true, default: () => {} },
})

// Цвет тега
const tagBackground = computed(() => {
  switch (props.task.tag) {
    case 'UI/UX':
      return 'success'
    case 'API':
      return 'indigo'
    case 'Dev':
      return 'primary'
    default:
      return 'secondary'
  }
})
</script>

<template>
  <div class="d-flex align-items-center justify-content-between mb-2">
    <span
      class="small px-2 py-1 rounded"
      :class="`bg-${tagBackground}-subtle text-${tagBackground}`"
    >
      {{ props.task.tag }}
    </span>

    <div
      class="hover-section text-secondary-emphasis p-1 rounded"
      @click="kanbanStore.setSelectedTask(props.task.id)"
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
</template>

<style scoped lang="scss"></style>
