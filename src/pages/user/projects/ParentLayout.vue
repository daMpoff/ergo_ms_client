<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchUserProjects, fetchPersonalUserProjects, fetchInvitedUserProjects } from '@/js/api/services/projectsService.js'
import CardProject from '@/pages/user/projects/CardProject.vue'

const route = useRoute()
const userProjects = ref([])

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

onMounted(loadProjects)
watch(() => route.name, loadProjects)

const leaveProject = (projectId) => {
  userProjects.value = userProjects.value.filter((project) => project.id !== projectId)
}

// Открытие канбан-доски в новом окне
const openKanbanBoard = (projectId) => {
  const url = `/kanban?project_id=${projectId}`; // Предполагаем, что в канбане используется project_id в URL
  window.open(url, '_blank'); // Открывает канбан в новом окне
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
        @viewTasks="openKanbanBoard" 
      />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
