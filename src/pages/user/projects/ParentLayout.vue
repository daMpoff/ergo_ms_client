<!-- ParentLayout.vue -->
<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchUserProjects, fetchPersonalUserProjects, fetchInvitedUserProjects } from '@/js/api/services/projectsService.js'
import CardProject from '@/pages/user/projects/CardProject.vue'
import ParentLayoutKanban from '@/pages/kanban/ParentLayout.vue'

const route = useRoute()
const userProjects = ref([])
const selectedProjectId = ref(null) // Для хранения выбранного project_id

// Функция загрузки проектов в зависимости от текущего маршрута
const loadProjects = async () => {
  try {
    if (route.name === 'Projects') {
      userProjects.value = await fetchUserProjects();
    } else if (route.name === 'PersonalProjects') {
      userProjects.value = await  fetchPersonalUserProjects(); 
    } else if (route.name === 'InvitedProjects') {
      userProjects.value = await fetchInvitedUserProjects();
    }
  } catch (error) {
    console.error('Ошибка загрузки проектов:', error);
  }
};

// Загрузка данных при монтировании и изменении маршрута
onMounted(loadProjects)
watch(() => route.name, loadProjects)

const leaveProject = (projectId) => {
  userProjects.value = userProjects.value.filter((project) => project.id !== projectId)
}

// Open Kanban Board in a new window
const openKanbanInNewWindow = (projectId) => {
  const url = `/kanban?project_id=${projectId}`; // Assuming the Kanban board expects `project_id` in the URL
  window.open(url, '_blank'); // Opens Kanban in a new window
}

// Обработка выбора проекта
const handleSelectProject = (projectId) => {
  openKanbanInNewWindow(projectId);
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
        :project_id="project.id" 
        :icon="project.icon"
        :icon-background="project.iconBackground"
        :title="project.name"
        :caption="project.caption"
        :date="project.date"
        :hours="project.hours"
        :tasks="project.tasks"
        :deadline="project.deadline"
        @leaveProject="leaveProject(project.id)"
        @selectProject="handleSelectProject"
      />
    </div>
  </div>
  <ParentLayoutKanban v-if="selectedProjectId" :project_id="selectedProjectId" />
</template>

<style scoped lang="scss"></style>