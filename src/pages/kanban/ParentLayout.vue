<script setup>
import { EllipsisVertical, GripVertical, Plus } from 'lucide-vue-next'
import { DragHandle, SlickItem, SlickList } from 'vue-slicksort'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { ref } from 'vue'

import DropDown from '@/components/DropDown.vue'
import KanbanTask from '@/pages/kanban/KanbanTask.vue'
import KanbanEdit from '@/pages/kanban/KanbanEdit.vue'
import { useKanbanStore } from '@/stores/kanbanStore.js'

// Хранилище данных
const kanbanStore = useKanbanStore()

// Флаг для возможности копировать текст на карточках
const isCopyingText = ref(true)
</script>

<template>
  <PerfectScrollbar class="kanban-container">
    <SlickList axis="x" v-model:list="kanbanStore.columns" class="d-flex" useDragHandle>
      <SlickItem
        v-for="(column, i) in kanbanStore.columns"
        :key="column"
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
              <li class="dropdown-item" @click="kanbanStore.addTask(i)">Добавить задачу</li>
              <li class="dropdown-item">Изменить название</li>
              <li class="dropdown-item" @click="kanbanStore.deleteColumn(i)">Удалить блок</li>
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
            :key="task"
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
      </SlickItem>
      <div
        class="add-column d-inline-flex justify-content-center gap-1 p-2"
        @click="kanbanStore.addColumn()"
      >
        <Plus :size="24" />
        <h5 class="mb-0 text-nowrap">Добавить блок</h5>
      </div>
    </SlickList>
  </PerfectScrollbar>

  <KanbanEdit></KanbanEdit>
</template>

<style scoped lang="scss">
.kanban-container {
  height: 85dvh;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

// Стили при перетаскивании
.selected-card-task .kanban-card-task {
  transform: rotate(5deg);
}

// Кнопка добавления колонки
.add-column {
  color: var(--bs-secondary-text-emphasis);
  height: fit-content;
  cursor: pointer;

  transition: color $transition;

  &:hover {
    color: var(--bs-card-title-color);
  }
}
</style>
