<script setup>
import { ref, watch } from 'vue'
import { GetGroupCategories, ChangeGroup} from '@/js/GroupsPolitics'
import ChangingPermissionsList from './ChangingPermissionsList.vue'
import { Modal } from 'bootstrap'
const emit = defineEmits(['changeGroup'])
const oldname = ref('')
const stopSubmit = ref(false)
const showErrorName = ref(false)
const showErrorLevel = ref(false)
const showErrorCategory =ref(false)
const categories = ref([])
const category = ref('')
const level = ref('')
const name = ref('')
const permissions = ref([])
const showError = ref(false)
const PermissionsChangingListsRef = ref(null)
const props = defineProps({
  row: { type: Object, required: true },
})

const modalRef = ref(null)

watch(() => props.row, async (newRow) => {
  await loadCategories()
 await ChangingGroup(newRow)
})

const submitForm = async () => {
  if (!name.value.trim() | !category.value.trim() | !String(level.value).trim() | !Number.isInteger(Number(level.value))) {
    
    if(!category.value.trim())
    {
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
    if (!String(level.value).trim()|!Number.isInteger(Number(level.value))) {
      showErrorLevel.value = true
      stopSubmit.value = false
    }
    else{
      showErrorLevel.value =false
    }
  } 
  else {
    PermissionsChangingListsRef.value.changePermissions()

    await ChangeGroup(oldname.value, name.value, category.value, level.value)
    console.log('Че?')
    showErrorCategory.value = false
    showErrorLevel.value=false
    showErrorName.value = false
    stopSubmit.value = true
    emit('changeGroup')

    const modalInstance = Modal.getInstance(modalRef.value)
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

const ChangingGroup = async (prop) => {
  permissions.value = prop.permissions
  oldname.value = prop.name
  name.value = prop.name
  category.value = prop.category
  level.value = prop.level
}
const changecategory = async()=>{
  permissions.value = []
}

</script>

<template>
  <form @submit.prevent="submitForm" ref="modalRef">
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
    v-model="category" @change="changecategory"
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
  
    <ChangingPermissionsList :list="permissions" :group_name="oldname" :category="category" ref="PermissionsChangingListsRef" />
    

    <div class="mt-3 text-end">
      <button type="submit" class="btn btn-primary"  :data-bs-dismiss="stopSubmit ? 'modal' : ''" >
        Изменить
      </button>
    </div>
  </form>
</template>

<style scoped>
.list-group-item {
  cursor: pointer;
}
</style>