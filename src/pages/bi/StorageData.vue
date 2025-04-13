<script setup>
import { ref, watch, computed } from 'vue'
import { DatasetDTO } from './components/dto/dataset'
import axios from 'axios'
import Cookies from 'js-cookie'
import SimpleTableDataSet from '@/pages/bi/components/SimpleTableDataSet.vue'

const props = defineProps({
  isDatasetSidebarOpen: Boolean
})

const datasets = ref([])
const search = ref('')
const sort = ref('new')

const cols = [
  { key: 'name', label: 'Название' },
  { key: 'owner_username', label: 'Автор' },
  { key: 'created_at', label: 'Дата', format: val => new Date(val).toLocaleDateString() },
  { key: 'actions', label: '' }
]

const fetchDatasets = async () => {
  const token = Cookies.get('token')
  if (!token) return

  try {
    const res = await axios.get('http://localhost:8000/api/bi_analysis/storage_data/', {
      headers: { Authorization: `Bearer ${token}` }
    })

    datasets.value = res.data.map(item => new DatasetDTO({
      id: item.id,
      name: item.name || item.json_data?.name || '—',
      owner_username: item.owner_username,
      created_at: item.created_at,
      storage_type: item.storage_type
    }))

    console.log('📦 Загружены датасеты:', datasets.value)
  } catch (e) {
    console.error('Ошибка при запросе:', e.response?.data || e.message)
  }
}

watch(() => props.isDatasetSidebarOpen, (newVal) => {
  if (newVal) {
    fetchDatasets()
  }
})

const transformedData = computed(() => {
  const term = search.value.toLowerCase()
  let list = [...datasets.value]

  if (term) {
    list = list.filter(d =>
      d.name?.toLowerCase().includes(term) ||
      d.owner_username?.toLowerCase().includes(term)
    )
  }

  switch (sort.value) {
    case 'new':
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break
    case 'old':
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break
    case 'az':
      list.sort((a, b) => a.name.localeCompare(b.name)); break
    case 'za':
      list.sort((a, b) => b.name.localeCompare(a.name)); break
  }

  return list
})
</script>

<template>
  <div class="fixed top-0 right-0 w-full sm:w-[540px] h-full bg-zinc-900 text-white z-50 shadow-xl border-l border-zinc-700 flex flex-col" style="padding-left: 1rem; padding-right: 1rem;">
    <div class="space-y-4 flex-1 overflow-auto">
      <div class="flex gap-3" style="display: flex; flex-wrap: nowrap; margin-top: 1rem;">
        <input class="form-control" placeholder="Введите для поиска..." style="width: 25rem;" v-model="search" />
        <select class="form-select" style="width: 11rem;" v-model="sort">
          <option value="new">Сначала новые</option>
          <option value="old">Сначала старые</option>
          <option value="az">А-Я</option>
          <option value="za">Я-А</option>
        </select>
        <button type="button" class="btn btn-primary" style="width: 10rem;">Создать датасет</button>
      </div>
      <div style="margin-top: 1rem;">
        <SimpleTableDataSet :cols="cols" :users="transformedData" :isDatasetSidebarOpen="props.isDatasetSidebarOpen"/>
      </div>
    </div>
  </div>
</template>