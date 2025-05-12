<script setup>
import { ref, onMounted } from 'vue'
import { AddPermission, GetGroupCategories } from '@/js/GroupsPolitics'

const emit = defineEmits(['addPermission'])
const name = ref('')
const showErrorName = ref(false)
const showErrorCategory = ref(false)
const showErrorMark = ref(false)
const showErrorPath = ref(false)
const showErrorComponentId = ref(false)
const categories = ref([])
const category = ref('')
const mark = ref('')
const accession_type = ref('')
const path = ref('')
const component_id = ref('')
const submitForm = async () => {
    console.log( mark.value)
  if (!name.value.trim() & !Number.isInteger(mark.value)& !category.value.trim() & !accession_type.value.trim() & !path.value.trim() & !component_id.value.trim()) {
    if(!name.value.trim()) {
      showErrorName.value = true
        console.log(name.value)
    }
    if (!Number.isInteger(mark.value)) {
      showErrorMark.value = true
      console.log(mark.value)
    }
    if (!category.value.trim()) {
      showErrorCategory.value = true
    }
    if (!path.value.trim()) {
      showErrorPath.value = true
    }
    if (!component_id.value.trim()) {
      showErrorComponentId.value = true
    }
  }

  else {
    showErrorName.value = false
    showErrorLevel.value = false
    let markv = Number(mark.value)
    const response = await AddPermission(name.value, markv, category.value, accession_type.value, path.value, component_id.value)
    emit('addPermission')
    name.value = ''
    mark.value = ''
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

const changeAccessionType = () => {
  component_id.value = ''
}
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
        placeholder="Введите название разрешения"
      />
      <label for="nameInput">Введите название разрешения</label>
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

    <div>
    <label for="accessionTypeSelect">выбор типа доступа</label>
    <select class="form-select" id="accessionTypeSelect" v-model="accession_type" @change="changeAccessionType">
      <option value="PageAccession">Доступ к странице</option>
      <option value="ComponentAccession">Доступ к компоненту</option>
      <option value="AdminPanelAccession">Доступ к панели администратора</option>
    </select>
  </div>
<br/>
<div class="form-floating mb-3" v-auto-animate>
      <input
        type="text"
        id="markInput"
        class="form-control"
        v-model="mark"
        :class="{ 'is-invalid': showErrorMark }"
        placeholder="Введите маркер"
      />
      <label for="markInput">Введите маркер</label>
      <div v-if="showErrorMark" class="invalid-feedback">Маркер обязательно для заполнения.</div>
    </div>

<div class="form-floating mb-3" v-auto-animate>
      <input
        type="text"
        id="pathInput"
        class="form-control"
        v-model="path"
        :class="{ 'is-invalid': showErrorPath }"
        placeholder="Введите путь"
      />
      <label for="pathInput">Введите путь</label>
      <div v-if="showErrorPath" class="invalid-feedback">Путь обязательно для заполнения.</div>
    </div>

<div class="form-floating mb-3" v-auto-animate>
      <input :disabled="accession_type == 'ComponentAccession'? false : true"
        type="text"
        id="componentIdInput"
        class="form-control"
        v-model="component_id"
        :class="{ 'is-invalid': showErrorComponentId }"
        placeholder="Введите id компонента"
      />
      <label for="componentIdInput">Введите id компонента</label>
      <div v-if="showErrorComponentId" class="invalid-feedback">id компонента обязательно для заполнения.</div>
    </div>

    <div class="mt-3 text-end">
      <button type="submit" class="btn btn-primary" :data-bs-dismiss="name !== '' && category !== '' && mark !== '' ? 'modal' : ''">
        Добавить
      </button>
    </div>
  </form>
</template>