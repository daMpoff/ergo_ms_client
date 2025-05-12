<script setup>
import { computed, ref } from 'vue'
import ModalCenter from '@/components/ModalCenter.vue'
import ChangePermissionForm from '@/pages/AdminPanel/PermissionsComponents/SubmitPermissionChange.vue'
import { DeletePermission, ChangePermission } from '@/js/GroupsPolitics'
import { watch } from 'vue'

const props = defineProps({
  headers: { type: Array, required: true },
  rows: { type: Array, required: true },
  rowsPerPage: { type: Number, default: 5 },
  searchQuery: { type: String, default: '' },
})
const emit = defineEmits(['updatePermissions'])
const data = ref(props.rows)

const rowselected = ref({
  name: '',
  category: '',
  mark:'',
  accession_type:'',
  path:'',
  component_id:''
})

const changingrow = (row)=>{
  rowselected.value ={
    name: row.name,
    category: row.category,
    mark: row.mark,
    accession_type: row.accession_type,
    path: row.path,
    component_id: row.component_id
  }
}

watch(() => props.rows, (newRows) => {
  data.value = [...newRows]
})
// Параметры пагинации
const filterStatus = ref('')
const currentPage = ref(1)

// Фильтрация и поиск
const filteredRows =  computed(() => {
  return data.value.filter((row) => {
    const matchesSearch = row.name.toLowerCase().includes(props.searchQuery.toLowerCase())
    const matchesFilter = filterStatus.value ? row.status === filterStatus.value : true
    return matchesSearch && matchesFilter
  })
})
const changePermission = () => {
  emit('updatePermissions')
}
// Пагинация
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.rowsPerPage
  const end = start + props.rowsPerPage
  return filteredRows.value.slice(start, end)
})

// Удаление прав
const deletePermission = async (permissionname) => {
    console.log(permissionname)
  const response =  await DeletePermission(permissionname)
  emit('updatePermissions')

}
</script>

<template>
  <div class="table-responsive">
    <table class="table table-hover">
      <thead>
        <tr>
          <th v-for="(header, index) in headers" :key="index" scope="col" class="fw-bold">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <tr v-for="row in paginatedRows" :key="row.id">
          <td>{{ row.name }}</td>
          <td>{{ row.category }}</td>
          <td>{{ row.mark }}</td>
          <td>{{ row.accession_type }}</td>
          <td>{{ row.path }}</td>
          <td>{{ row.component_id }}</td>
          <td>
            <div class="d-flex align-items-center flex-wrap gap-2">
              <button
                class="btn btn-sm btn-outline-primary"
                data-bs-toggle="modal"
                data-bs-target="#roleEdit"
                @click="changingrow(row)"
              >
                Изменить
              </button>
              <button @click="deletePermission(row.name)" class="btn btn-sm btn-outline-primary">
                Удалить
              </button>
              <ModalCenter title="Изменить разрешение" modalId="roleEdit" >
                <div class="bg-warning-subtle text-warning lh-sm rounded p-3 mb-3">
                  <b>Внимание!</b><br />
                  Изменив настройки разрешения, вы можете нарушить функциональность системных разрешений.
                  Пожалуйста, убедитесь, что вы абсолютно уверены, прежде чем продолжить.
                </div>
                <ChangePermissionForm @changePermission="changePermission()" :row="rowselected" />
              </ModalCenter>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss"></style>