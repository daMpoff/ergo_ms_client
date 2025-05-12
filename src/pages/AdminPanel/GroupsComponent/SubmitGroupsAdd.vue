<script setup>
import { ref, onMounted } from 'vue'
import { AddGroup, GetGroupCategories } from '@/js/GroupsPolitics'
import ChangingPermissionsList from './ChangingPermissionsListAdd.vue'
const emit = defineEmits(['addGroup'])
const name = ref('')
const stopSubmit = ref(false)
const showErrorName = ref(false)
const showErrorLevel = ref(false)
const categories = ref([])
const category = ref('')
const level = ref('')
const permissions = ref([])
const PermissionsChangingListsRef = ref(null)
const submitForm = async () => {
  if (!name.value.trim() & !Number.isInteger(level.value)) {
    if(!name.value.trim()) {
      showErrorName.value = true
        console.log(name.value)
    }
    if (!Number.isInteger(level.value)) {
      showErrorLevel.value = true
    }
  }

  else {
    showErrorName.value = false
    showErrorLevel.value = false
    const response = await AddGroup(name.value, category.value, level.value)
    await PermissionsChangingListsRef.value.changePermissions(name.value)
    emit('addGroup')
    name.value = ''
    level.value = ''
    category.value = ''
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
})
</script>

<template>
  <form @submit.prevent="submitForm" novalidate>

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

    <div>
    <label for="categorySelect">выбор категории</label>
    <select class="form-select" id="categorySelect" v-model="category">
      <option v-for="category in categories" :key="category.id" :value="category.name">
        {{ category.name }}
      </option>
    </select>
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
      <div v-if="showErrorLevel" class="invalid-feedback">Уровень обязательно для заполнения.</div>
    </div>
    <ChangingPermissionsList :list="permissions" :category="category" ref="PermissionsChangingListsRef" />
    

    <div class="mt-3 text-end">
      <button type="submit" class="btn btn-primary" :data-bs-dismiss="name !== '' && category !== '' && level !== '' ? 'modal' : ''">
        Добавить
      </button>
    </div>
  </form>
</template>