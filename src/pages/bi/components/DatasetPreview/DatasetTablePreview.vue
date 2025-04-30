<template>
    <div class="preview-main">
        <div class="main-title">
            <div class="title-lable" style="font-weight: bold; margin-right: 2rem;">Предпросмотр</div>
            <div class="title-input">
                <div class="input-label-left" style="width: auto;">Количество строк:</div>
                <input class="form-control form-control-sm" type="text" id="smallInput" placeholder="10" v-model="pageSizeInput" min="1" max="1000" @input="handleInput" />
                <div class="input-label-right">не больше 1000</div>
            </div>
        </div>
        <div class="main-grid">
            <Vue3Datatable :columns="cols" :rows="rows" :loading="loading" :page-size="pageSize" skin="table table-hover" noDataContent="Нет данных"/>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import Vue3Datatable from '@bhplugin/vue3-datatable'

const cols = ref([
  { title: 'ID', field: 'id' },
  { title: 'Имя', field: 'name' },
  { title: 'Возраст', field: 'age' },
  { title: 'Город', field: 'city' }
])

const rows = ref([
  { id: 1, name: 'Анна', age: 25, city: 'Москва' },
  { id: 2, name: 'Иван', age: 32, city: 'Санкт-Петербург' },
  { id: 3, name: 'Мария', age: 29, city: 'Новосибирск' },
  { id: 4, name: 'Пётр', age: 41, city: 'Екатеринбург' },
  { id: 5, name: 'Олег', age: 22, city: 'Казань' },
  { id: 6, name: 'Светлана', age: 36, city: 'Самара' },
  { id: 7, name: 'Дмитрий', age: 28, city: 'Уфа' },
  { id: 8, name: 'Елена', age: 33, city: 'Ростов-на-Дону' },
  { id: 9, name: 'Николай', age: 45, city: 'Челябинск' },
  { id: 10, name: 'Вера', age: 27, city: 'Пермь' }
])
const loading = ref(false)

const pageSize = ref(10)
const pageSizeInput = ref('10')

function handleInput(e) {
  const raw = e.target.value.replace(/\D/g, '')
  pageSizeInput.value = raw

  const parsed = parseInt(raw)
  if (!isNaN(parsed)) {
    const clamped = Math.min(1000, Math.max(1, parsed))
    pageSize.value = clamped
    pageSizeInput.value = String(clamped)
  }
}
</script>

<style scoped lang="scss">
.preview-main {
    margin: 5px 0 5px 5px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.main-title {
    display: flex;
    justify-content: start;
    align-items: center;
    height: 25px;
    width: auto;
}

.title-input {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.input-label-left,
.input-label-right {
    min-width: 100px;
    text-align: right;
}

input {
    max-width: 70px;
}

.main-grid{
    text-align: left;
    max-height: 330px; // или сколько нужно
    overflow-y: auto;
    overflow-x: auto;
}

:deep(.bh-pagination-wrapper) {
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1e1e1e;
  border-top: 1px solid #444;
  font-size: 14px;
  color: #ccc;
}

:deep(.bh-pagination) {
  display: flex;
  gap: 4px;
  list-style: none;
  padding: 0;
  margin: 0;
}

:deep(.bh-page-item) {
  padding: 4px 10px;
  background: #2a2a2a;
  color: #ccc;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

:deep(.bh-page-item:hover) {
  background: #444;
}

:deep(.bh-page-active) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

:deep(.bh-pagination-info),
:deep(.bh-pagination-wrapper > div:first-child),
:deep(.bh-pagination-wrapper > span) {
  display: none !important;
}

:deep(th .bh-flex) {
  font-weight: bold !important;
}
</style>