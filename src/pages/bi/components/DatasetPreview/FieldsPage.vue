<template>
    <div class="fields-page">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Имя</th>
            <th>Источник поля</th>
            <th>Тип</th>
            <th>Агрегация</th>
            <th>Описание</th>
            <th class="text-end">…</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(f, idx) in fields" :key="f.id" class="hover:cursor-pointer">
            <td>{{ idx + 1 }}</td>
            <td>
              <input v-model="f.name" class="form-control form-control-sm text-white" placeholder="Имя…"/>
            </td>
            <td>
              <button class="source-btn" @click="onSourceClick(f)">
                {{ f.source }}
              </button>
            </td>
            <td>
              <select class="form-select form-select-sm text-white" v-model="f.type">
                <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </td>
            <td>
              <select class="form-select form-select-sm text-white" v-model="f.aggregation">
                <option value="none">Нет</option>
                <option value="sum">Сумма</option>
                <option value="avg">Среднее</option>
                <option value="min">Минимум</option>
                <option value="max">Максимум</option>
              </select>
            </td>
            <td>
              <input v-model="f.description" class="form-control form-control-sm text-white" placeholder="Описание…"/>
            </td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-danger rounded" @click="removeField(idx)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  
    <transition name="fade">
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <!-- Плавный scale для окна -->
       <transition name="scale">
  <div class="modal-window">
    <div class="modal-header">
      <h5>Настройка поля</h5>
      <button class="close-btn" @click="closeModal">×</button>
    </div>
    <SourceSettings :field="modalField" title="Настройки источника поля" :modal-id="modalId" @close="closeModal"/>
  </div>
</transition>
    </div>
  </transition>
  </template>
  
  <script setup>
  import { reactive, ref, computed, defineProps, defineEmits } from 'vue'
  import SourceSettings from '@/pages/bi/components/DatasetPreview/SourceSettings.vue'

const props = defineProps({
  tables: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['drop-table','remove-table'])
  
  const fields = reactive([
    { id: 1, name: 'Column_1', source: 'csv.column_1', type: 'string', aggregation: 'none', description: '' },
    { id: 2, name: 'Column_2', source: 'csv.column_2', type: 'integer', aggregation: 'none', description: '' },
  ])
  
  // опции типов
  const typeOptions = [
    { value: 'geopolygon', label: 'Геополигон' },
    { value: 'geopoint',   label: 'Геоточка'   },
    { value: 'date',       label: 'Дата'       },
    { value: 'date&time',  label: 'Дата и время'},
    { value: 'float',      label: 'Дробное число' },
    { value: 'bool',       label: 'Логический' },
    { value: 'string',     label: 'Строка'     },
    { value: 'integer',    label: 'Целое число'},
  ]
  
  // состояние модалки
  const showModal   = ref(false)
  const modalField = ref(null)

  // Делаем modalId уникальным (или можно просто строку)
  const modalId = computed(() => `source-settings-modal-${modalField.value?.id ?? 'new'}`)
  
  // открываем окно и передаём туда выбранную строку
  function onSourceClick(field) {
    modalField.value = field
    showModal.value  = true
  }
  
  // закрыть окно
  function closeModal() {
    showModal.value  = false
    modalField.value = null
  }
  
  function removeField(idx) {
    fields.splice(idx, 1)
  }
  </script>
  
  <style scoped lang="scss">
  .table td,
  .table th {
    vertical-align: middle;
  }
  
  /* Убрать все нижние границы в теле и оставить только шапку */
  :deep(.table tbody td) { border-bottom: none !important; }
  :deep(.table thead th) { border-bottom: 0.5px solid rgba(255,255,255,0.2); }
  
  /* Ховер строки */
  :deep(.table-hover tbody tr:hover) {
    background-color: rgba(255,255,255,0.05);
  }
  
  /* Инпуты/селекты */
  :deep(input.form-control),
  :deep(select.form-select) {
    background: transparent !important;
    border: none !important;
    border-radius: 5px !important;
    padding: .25rem .5rem;
    color: inherit;
    transition: background-color .2s ease, border-radius .2s ease;
  }
  :deep(input.form-control:hover),
  :deep(select.form-select:hover),
  :deep(input.form-control:focus),
  :deep(select.form-select:focus) {
    background-color: rgba(255,255,255,0.15) !important;
    border-radius: 12px !important;
    outline: none !important;
    box-shadow: none !important;
  }
  :deep(select.form-select) {
    appearance: none;
    background-image: none !important;
    padding-right: 1.5rem;
  }
  :deep(select.form-select::-ms-expand) {
    display: none;
  }
  
  /* Кнопка-источник */
  .source-btn {
    width: 100%;
    text-align: left;
    background: transparent !important;
    border: none !important;
    padding: .25rem .5rem;
    border-radius: 5px !important;
    color: inherit;
    display: flex;
    align-items: center;
    transition: background-color .2s ease, border-radius .2s ease;
  }
  .source-btn:hover,
  .source-btn:focus {
    background-color: rgba(255,255,255,0.15) !important;
    border-radius: 12px !important;
    outline: none !important;
  }
  
  /* ========== Fade (оверлей) ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========== Scale (окно) ========== */
.scale-enter-active,
.scale-leave-active {
  transition: transform .3s ease, opacity .3s ease;
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

/* ========== Существующие стили модалки ========== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.modal-window {
  background: #2a2a2a;
  width: 1200px;
  height: 750px;
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  overflow-y: hidden;
}
.modal-header {
  display: flex;
  align-items: center;        /* вертикально центрируем контент */
  justify-content: space-between; /* заголовок слева, кнопка справа */
  padding-bottom: 1rem;        /* пространство под header */
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.modal-header h5 {
  margin: 0;
  font-size: 1.25rem;
  color: #fff;
}
.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;  /* размер крестика */
  line-height: 1;     /* чтобы он именно по центру строки был */
  cursor: pointer;
  color: #fff;
  padding: 0;         /* можно вынести padding в modal-header */
}
  </style>  