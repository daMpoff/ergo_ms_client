<script setup>
import { ref, onMounted } from 'vue'
import { AddGroup, GetGroupCategories } from '@/js/GroupsPolitics'
import ChangingPermissionsList from './ChangingPermissionsListAdd.vue'
import * as bootstrap from 'bootstrap'

const emit = defineEmits(['addGroup'])
const name = ref('')
const stopSubmit = ref(false)
const showErrorName = ref(false)
const showErrorLevel = ref(false)
const showErrorCategory =ref(false)
const categories = ref([])
const category = ref('')
const level = ref('')
const permissions = ref([])
const PermissionsChangingListsRef = ref(null)
const modalRef = ref(null) // Ссылка на модальное окно

let modalInstance = null

const submitForm = async () => {
  if (!name.value.trim() | !level.value.trim() | !category.value.trim()|!Number.isInteger(Number(level.value))) {
    console.log(!name.value.trim())
    console.log(!level.value.trim())
    console.log(!category.value.trim())
    console.log(!Number.isInteger(level.value))
    if(!category.value.trim()){
      showErrorCategory.value = true
      stopSubmit.value = false
    }
    else{
      showErrorCategory.value = false
    }
    if(!name.value.trim()) {
      showErrorName.value = true
      stopSubmit.value = false
    }
    else{
      showErrorName.value = false
    }
    if (!level.value.trim() | !Number.isInteger(Number(level.value))) {
      showErrorLevel.value = true
      stopSubmit.value = false
    }
    else{
      showErrorLevel.value =false
    }
  }
  else {
    console.log('1')
    showErrorName.value = false
    showErrorLevel.value = false
    const response = await AddGroup(name.value, category.value, level.value)
    await PermissionsChangingListsRef.value.changePermissions(name.value)
    name.value = ''
    level.value = ''
    category.value = ''
    stopSubmit.value = true

    emit('addGroup')

    if (modalInstance) {
      modalInstance.hide()
    }
  }
}

const loadCategories = async () => {
  try {
    const response = await GetGroupCategories()
    categories.value = response
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

onMounted(() => {
  loadCategories()
  modalInstance = new bootstrap.Modal(modalRef.value)
})
</script>

<template>
  <form @submit.prevent="submitForm" novalidate ref="modalRef">

    <div class="form-floating mb-3" v-auto-animate>
      <input
        type="text"
        id="nameInput"
        class="form-control"
        v-model="name"
        :class="{ 'is-invalid': showErrorName }"
        placeholder="Введите название группы"
      />
      <label for="nameInput">Введите название группы</label>
      <div v-if="showErrorName" class="invalid-feedback">Название обязательно для заполнения.</div>
    </div>

  <select 
    class="form-select"
    :class="{ 'is-invalid': showErrorCategory }"
    id="categorySelect" 
    v-model="category"
  >
    <option v-for="category in categories" :key="category.id" :value="category.name">
      {{ category.name }}
    </option>
  </select>
  <label for="categorySelect">Выбор категории</label>
  <div v-if="showErrorCategory" class="invalid-feedback">
    Необходимо выбрать категорию.
  </div>
    <br/>
    
<div class="form-floating mb-3" v-auto-animate>
      <input
        type="text"
        id="levelInput"
        class="form-control"
        v-model="level"
        :class="{ 'is-invalid': showErrorLevel }"
        placeholder="Введите уровень группы"
      />
      <label for="levelInput">Введите уровень группы</label>
      <div v-if="showErrorLevel" class="invalid-feedback">В поле уровня должно быть записано целое число.</div>
    </div>
    <ChangingPermissionsList :list="permissions" :category="category" ref="PermissionsChangingListsRef" />
    

    <div class="mt-3 text-end">
      <button type="submit" class="btn btn-primary" :data-bs-dismiss="stopSubmit ? 'modal' : ''">
        Добавить
      </button>
    </div>
  </form>
</template>