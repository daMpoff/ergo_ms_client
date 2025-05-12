<script setup>
import { ref, onMounted, watch } from 'vue'
import { GetGroupCategories, ChangeGroup} from '@/js/GroupsPolitics'
import ChangingPermissionsList from './ChangingPermissionsList.vue'
const allCategoryPermissions = ref([])
const startlist1 = ref([])
const emit = defineEmits(['changeGroup'])
const oldname = ref('')
const showErrorName = ref(false)
const showErrorLevel = ref(false)
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

watch(() => props.row, async (newRow) => {
  await loadCategories()
 await ChangingGroup(newRow)
})

const submitForm = async () => {
  if (!name.value.trim()) {
    showError.value = true
  } else {
    PermissionsChangingListsRef.value.changePermissions()
    showError.value = false
    console.log(oldname.value, name.value, category.value, level.value)
    await ChangeGroup(oldname.value, name.value, category.value, level.value)
    emit('changeGroup')
  }
}

const loadCategories = async () => {
  try {
    const response = await GetGroupCategories()
    categories.value = response
    console.log(categories.value)
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
      <label for="categorySelect">Выбор категории</label>
      <select class="form-select" id="categorySelect" v-model="category" @change="changecategory">
        <option v-for="category in categories" :key="category.id" :value="category.name">
          {{ category.name }}
        </option>
      </select>
    </div>
    <br />

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
  
    <ChangingPermissionsList :list="permissions" :group_name="oldname" :category="category" ref="PermissionsChangingListsRef" />
    

    <div class="mt-3 text-end">
      <button type="submit" class="btn btn-primary" :data-bs-dismiss="name !== '' && category !== '' && level !== '' ? 'modal' : ''">
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