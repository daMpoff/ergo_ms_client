<script setup>
import { ref, onMounted, watch } from 'vue'
import {GetGroupCategories, ChangePermission } from '@/js/GroupsPolitics'
const emit = defineEmits(['changePermission'])

const showErrorName = ref(false)
const categories = ref([])
const showErrorComponentId = ref(false)
const showErrorPath = ref(false)
const category = ref('')
const accession_type = ref('')
const mark = ref('')
const path = ref('')
const component_id = ref('')
const name = ref('')
const showError = ref(false)
const oldname = ref('')
const props = defineProps({
  row: { type: Object, required: true },
})
watch(props, (newProps) => {
  oldname.value= newProps.row.name
  name.value = newProps.row.name
  category.value = newProps.row.category
  let acsst = newProps.row.accession_type
      if(acsst =='Доступ к Странице') {
        acsst = 'PageAccession'
      }
      else if(acsst == 'Доступ к Компоненту') {
        acsst = 'ComponentAccession'
      }
      else if(acsst == 'Доступ к Панели администратора') {
        acsst = 'AdminPanelAccession'
      }
  mark.value = newProps.row.mark
  accession_type.value = acsst
  path.value = newProps.row.path
  component_id.value = newProps.row.component_id
})

const changeAccessionType = () => {
  component_id.value = ''
}

const submitForm = async () => {
  if (!name.value.trim() & !category.value.trim() & !accession_type.value.trim() & !path.value.trim() & !component_id.value.trim()) {
    if (!name.value.trim()) {
      showErrorName.value = true
    }
    if (!category.value.trim()) {
      showErrorCategory.value = true
    }
    if (!accession_type.value.trim()) {
      showErrorAccessionType.value = true
    }
    if (!path.value.trim()) {
      showErrorPath.value = true
    }
    if (!component_id.value.trim()) {
      showErrorComponentId.value = true
    }
  } 
  else {
    showError.value = false
    console.log(oldname.value, name.value, mark.value, category.value, accession_type.value, path.value, component_id.value)
    let s =await ChangePermission(oldname.value, name.value, mark.value, category.value, accession_type.value, path.value, component_id.value)
    console.log(s) 
    emit('changePermission')
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
  oldname.value = props.row.name
  name.value = props.row.name
  category.value = props.row.category
  accession_type.value = props.row.accession_type
  mark.value = props.row.mark
  path.value = props.row.path
  component_id.value = props.row.component_id
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
<br/>

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
      <input :disabled="accession_type == 'ComponentAccession' || accession_type == 'AdminPanelAccession'? false : true"
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

    <br/>

    <div class="mt-3 text-end">
      <button type="submit" class="btn btn-primary" :data-bs-dismiss="name !== '' && category !== '' && mark !== '' ? 'modal' : ''">
        Изменить
      </button>
    </div>
  </form>
</template>