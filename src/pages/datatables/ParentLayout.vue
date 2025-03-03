<script setup>
import '@bhplugin/vue3-datatable/dist/style.css'
import { ref } from 'vue'

import SimpleTable from '@/pages/datatables/SimpleTable.vue'
import SortingTable from '@/pages/datatables/SortingTable.vue'
import SearchTable from '@/pages/datatables/SearchTable.vue'
import CheckboxTable from '@/pages/datatables/CheckboxTable.vue'
import CustomFilterTable from '@/pages/datatables/CustomFilterTable.vue'

const cols = ref([
  {
    field: 'id',
    title: 'ID',
    isUnique: true,
    type: 'number',
    cellClass: 'text-dark-emphasis',
    headerClass: 'fw-bold text-dark-emphasis',
  },
  {
    field: 'firstName',
    title: 'Имя',
    cellClass: 'text-dark-emphasis',
    headerClass: 'fw-bold text-dark-emphasis',
  },
  {
    field: 'lastName',
    title: 'Фамилия',
    cellClass: 'text-dark-emphasis',
    headerClass: 'fw-bold text-dark-emphasis',
  },
  {
    field: 'email',
    title: 'Эл. почта',
    cellClass: 'text-dark-emphasis',
    headerClass: 'fw-bold text-dark-emphasis',
  },
  {
    field: 'age',
    title: 'Возраст',
    type: 'number',
    cellClass: 'text-dark-emphasis',
    headerClass: 'fw-bold text-dark-emphasis',
  },
  {
    field: 'dob',
    title: 'Дата рождения',
    type: 'date',
    cellClass: 'text-dark-emphasis',
    headerClass: 'fw-bold text-dark-emphasis',
  },
  {
    field: 'address',
    title: 'Город',
    cellClass: 'text-dark-emphasis',
    headerClass: 'fw-bold text-dark-emphasis',
  },
  {
    field: 'isActive',
    title: 'Подписка',
    type: 'bool',
    cellClass: 'text-dark-emphasis',
    headerClass: 'fw-bold text-dark-emphasis',
  },
])
const users = ref('/src/pages/datatables/data.json')
</script>

<template>
  <div class="card mb-4">
    <SimpleTable :cols="cols" :users="users" />
  </div>
  <div class="card mb-4">
    <SortingTable :cols="cols" :users="users" />
  </div>
  <div class="card mb-4">
    <CheckboxTable :cols="cols" :users="users" />
  </div>
  <div class="card mb-4">
    <SearchTable :cols="cols" :users="users" />
  </div>
  <div class="card mb-4">
    <CustomFilterTable :cols="cols" :users="users" />
  </div>
</template>

<style lang="scss">
.bh-page-item {
  border-radius: var(--bs-border-radius) !important;
}

.bh-page-item.bh-active {
  border-color: var(--bs-primary) !important;
  background-color: var(--bs-primary) !important;

  &:hover {
    background-color: var(--bs-primary) !important;
  }
}

.bh-page-item:not(.bh-active):hover {
  color: var(--bs-primary) !important;
  border-color: var(--bs-primary) !important;
  background-color: var(--bs-primary-bg-subtle) !important;
}

.bh-table-responsive input[type='checkbox']:checked + div,
.bh-table-responsive input[type='checkbox']:indeterminate + div {
  border-color: var(--bs-primary) !important;
  background-color: var(--bs-primary) !important;
}

.\!bh-text-primary {
  color: var(--bs-primary) !important;
}
</style>
