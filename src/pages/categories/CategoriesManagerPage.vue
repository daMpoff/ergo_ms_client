<template>
  <div class="container py-4">
    <h2>Менеджер категорий</h2>
    <button class="btn btn-primary mb-2" @click="showAddRootInput = true" v-if="!showAddRootInput">
      Добавить корневую категорию
    </button>
    <div v-if="showAddRootInput" class="mb-3">
      <input v-model="newRootCategoryName" class="form-control d-inline-block w-auto" placeholder="Название категории" @keyup.enter="addCategory(null)" />
      <button class="btn btn-success ms-2" @click="addCategory(null)">Сохранить</button>
      <button class="btn btn-secondary ms-1" @click="cancelAddRoot">Отмена</button>
    </div>
    <CategoryTree
      :categories="categories"
      @add="addCategory"
      @edit="editCategory"
      @delete="deleteCategory"
    />
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { endpoints } from '@/js/api/endpoints'
import { apiClient } from '@/js/api/manager'
import CategoryTree from './CategoryTree.vue' // Ниже будет пример CategoryTree.vue

const categories = ref([])
const error = ref('')
const showAddRootInput = ref(false)
const newRootCategoryName = ref('')

async function fetchCategories() {
  error.value = ''
  try {
    const resp = await apiClient.get(endpoints.categories.list)
    categories.value = resp.data
  } catch (e) {
    error.value = 'Ошибка загрузки категорий'
  }
}

async function addCategory(parentId) {
  let name
  if (parentId === null) {
    name = newRootCategoryName.value.trim()
    if (!name) return
  } else {
    name = prompt('Название подкатегории:')
    if (!name) return
  }
  try {
    await apiClient.post(endpoints.categories.create, { name, parent: parentId })
    showAddRootInput.value = false
    newRootCategoryName.value = ''
    await fetchCategories()
  } catch (e) {
    error.value = 'Ошибка добавления'
  }
}

async function editCategory(category) {
  const name = prompt('Новое название:', category.name)
  if (!name) return
  try {
    // Обычно редактирование — это PUT или PATCH, не POST!
    await apiClient.patch(endpoints.categories.update(category.id), { name })
    await fetchCategories()
  } catch (e) {
    error.value = 'Ошибка редактирования'
  }
}


async function deleteCategory(category) {
  if (!confirm('Удалить категорию и все вложенные?')) return
  try {
    console.log('Удаление категории:', category.id, endpoints.categories.delete(category.id))
    await apiClient.delete(endpoints.categories.delete(category.id))
    await fetchCategories()
  } catch (e) {
    error.value = 'Ошибка удаления: ' + (e.response?.data?.detail || e.message)
  }
}


function cancelAddRoot() {
  showAddRootInput.value = false
  newRootCategoryName.value = ''
}

onMounted(fetchCategories)
</script>
