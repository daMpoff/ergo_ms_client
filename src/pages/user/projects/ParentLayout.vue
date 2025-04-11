<!-- ParentLayout.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { fetchUserProjects } from '@/js/api/services/projectsService.js' // Импортируем функцию
import CardProject from '@/pages/user/projects/CardProject.vue'

const userProjects = ref([])


// Загрузка данных при монтировании компонента
onMounted(async () => {
  userProjects.value = await fetchUserProjects() // Используем импортированную функцию
})

const leaveProject = (projectId) => {
  userProjects.value = userProjects.value.filter((project) => project.id !== projectId)
}
</script>

<template>
  <div class="row" v-auto-animate>
    <div
      v-for="(project, index) in userProjects"
      :key="index"
      class="col-12 col-sm-6 col-lg-4 mb-4"
    >
      <CardProject
        :icon="project.icon"
        :icon-background="project.iconBackground"
        :title="project.name"
        :caption="project.caption"
        :date="project.date"
        :hours="project.hours"
        :tasks="project.tasks"
        :deadline="project.deadline"
        @leaveProject="leaveProject(project.id)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>