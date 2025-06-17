<script setup>
import { onMounted, ref } from 'vue'
import Vue3Datatable from '@bhplugin/vue3-datatable'
import axios from 'axios'

const props = defineProps({
  cols: { type: Array, required: true, default: () => [] },
  users: { type: String, required: true, default: '' },
})

const loading = ref(true)
const rows = ref([])

onMounted(async () => {
  try {
    const response = await axios.get(props.users)
    rows.value = response.data.data
    loading.value = false
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error)
  }
})
</script>

<template>
  <div>
    <h4 class="mb-3">Таблица с сортировкой</h4>

    <vue3-datatable
      :rows="rows"
      :columns="cols"
      :loading="loading"
      :sortable="true"
      :pageSize="5"
      :pageSizeOptions="[5, 15, 25]"
      skin="table table-hover"
      paginationInfo="{0}-{1} из {2} записей"
      noDataContent="Нет данных"
    >
      <template #email="data">
        <a :href="`mailto:${data.value.email}`" class="text-primary">{{ data.value.email }}</a>
      </template>
      <template #isActive="data">
        <span :class="data.value.isActive ? 'text-success' : 'text-danger'">
          {{ data.value.isActive ? 'В сети' : 'Не в сети' }}
        </span>
      </template>
    </vue3-datatable>
  </div>
</template>

<style scoped lang="scss"></style>
