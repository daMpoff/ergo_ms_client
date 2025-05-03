<template>
    <div class="test" ref="container" @dragover.prevent @drop="handleDrop">
      <div v-if="tables.length === 0">
        Перетащите нужные таблицы для формирования связей
      </div>
  
      <ul class="dropped-list" v-else>
        <li v-for="(table, index) in tables"
            :key="index"
            class="table-item"
            :ref="el => tableRefs[index] = el">
          <Table class="icon" />
          <span class="table-name">{{ table.name || (table.schema + '.' + table.table) }}</span>
          <button class="remove-btn" @click="removeTable(index)">
            <X class="icon" />
          </button>
        </li>
      </ul>
  
      <svg class="join-lines">
        <line v-for="(link, idx) in joinLinks"
              :key="idx"
              :x1="link.x1"
              :y1="link.y1"
              :x2="link.x2"
              :y2="link.y2"
              :stroke="link.valid ? '#888' : '#e53935'"
              stroke-width="2"
              stroke-dasharray="4 2" />
      </svg>
    </div>
  </template>
  
  <script setup>
  import { Table, X } from 'lucide-vue-next'
  import { ref, reactive, nextTick, watch } from 'vue'
  
  const props = defineProps({
    tables: Array
  })
  const emit = defineEmits(['drop-table', 'remove-table'])
  
  const tableRefs = reactive({})
  const container = ref(null)
  
  const joinLinks = ref([])
  
  function handleDrop(event) {
    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'))
      emit('drop-table', data)
      nextTick(() => updateLinks())
    } catch (err) {
      console.error('Ошибка drop:', err)
    }
  }
  
  function removeTable(index) {
    emit('remove-table', index)
    nextTick(() => updateLinks())
  }
  
  function updateLinks() {
    if (props.tables.length < 2) {
      joinLinks.value = []
      return
    }
  
    const containerRect = container.value.getBoundingClientRect()
  
    joinLinks.value = props.tables.slice(1).map((_, i) => {
      const sourceEl = tableRefs[0]?.getBoundingClientRect()
      const targetEl = tableRefs[i + 1]?.getBoundingClientRect()
  
      if (!sourceEl || !targetEl) return null
  
      const x1 = sourceEl.left + sourceEl.width / 2 - containerRect.left
      const y1 = sourceEl.top + sourceEl.height / 2 - containerRect.top
      const x2 = targetEl.left + targetEl.width / 2 - containerRect.left
      const y2 = targetEl.top + targetEl.height / 2 - containerRect.top
  
      return {
        x1,
        y1,
        x2,
        y2,
        valid: Math.random() > 0.3 // временная проверка
      }
    }).filter(Boolean)
  }
  
  watch(() => props.tables.length, () => {
    nextTick(() => updateLinks())
  })
  </script>
  
  <style scoped lang="scss">
  .test {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    flex-direction: column;
    color: #ccc;
    border: 2px dashed rgba(255, 255, 255, 0.2);
    padding: 20px;
    border-radius: 6px;
    text-align: center;
  }
  
  .dropped-list {
    list-style: none;
    padding: 0;
    margin-top: 12px;
    width: 100%;
    max-width: 280px;
  
    .table-item {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      padding: 6px 10px;
      border-radius: 6px;
      margin-bottom: 4px;
      justify-content: space-between;
      gap: 10px;
    }
  
    .icon {
      width: 16px;
      height: 16px;
      color: #ccc;
      flex-shrink: 0;
    }
  
    .table-name {
      flex-grow: 1;
      text-align: left;
      color: #eee;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  
    .remove-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
  
      &:hover .icon {
        color: #f66;
      }
    }
  }
  
  .join-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }
  </style>
  