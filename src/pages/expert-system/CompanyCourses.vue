<template>
  <div>
    <div class="d-flex justify-content-end mb-3">
      <CreateCourse @created="fetchCourses" @error="$emit('error', $event)" />
    </div>
    <div class="row gy-3">
      <div class="col-md-4" v-for="course in courses" :key="course.id">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h6 class="card-title">{{ course.title }}</h6>
            <p class="card-text">{{ course.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import CreateCourse from '@/pages/expert-system/CreateCourse.vue'

const courses = ref([])

const emit = defineEmits(['error'])

async function fetchCourses() {
  try {
    const res = await apiClient.get(endpoints.expert_system.courses)
    if (res.success) {
      courses.value = res.data
    } else {
      throw new Error(JSON.stringify(res.errors))
    }
  } catch {
    emit('error', 'Не удалось загрузить курсы')
  }
}

onMounted(fetchCourses)
</script>
