<template>
  <div class="container py-4">
    <h2>Менеджер тегов</h2>
    <button class="btn btn-primary mb-2" @click="addTag">Добавить тег</button>
    <ul>
      <li v-for="tag in tags" :key="tag.id">
        {{ tag.name }}
        <button @click="editTag(tag)">Редактировать</button>
        <button @click="deleteTag(tag)">Удалить</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const tags = ref([])

const fetchTags = async () => {
  const { data } = await axios.get('/api/tags/')
  tags.value = data
}

const addTag = async () => {
  const name = prompt('Название тега:')
  if (name) {
    await axios.post('/api/tags/', { name })
    fetchTags()
  }
}

const editTag = async (tag) => {
  const name = prompt('Новое название:', tag.name)
  if (name) {
    await axios.patch(`/api/tags/${tag.id}/`, { name })
    fetchTags()
  }
}

const deleteTag = async (tag) => {
  if (confirm('Удалить тег?')) {
    await axios.delete(`/api/tags/${tag.id}/`)
    fetchTags()
  }
}

onMounted(fetchTags)
</script>
