<template>
    <div class="project-create-page">
        <!-- Breadcrumbs -->
        <Breadcrumbs :items="breadcrumbItems" />

        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">Создание проекта</h1>
        </div>

        <!-- Page Content -->
        <div class="page-content">
            <div class="container">
                <!-- Многоэтапная форма создания проекта -->
                <ProjectCreateForm @project-created="handleProjectCreated" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Home, Plus, List } from 'lucide-vue-next'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import ProjectCreateForm from '@/modules/crm/project-ed/components/ProjectCreateForm.vue'

// Настройка breadcrumbs
const breadcrumbItems = ref([
    {
        label: 'Главная',
        to: '/crm/project-ed',
        icon: Home
    },
    {
        label: 'Мои проекты',
        to: '/crm/project-ed/my-projects',
        icon: List
    },
    {
        label: 'Создание проекта',
        icon: Plus
    }
])

// Обработка создания проекта
const handleProjectCreated = (projectData) => {
    console.log('Проект создан:', projectData)
    // Здесь можно добавить логику перенаправления или уведомления
    // Например, перенаправление на страницу созданного проекта
    // router.push(`/crm/project-ed/projects/${projectData.id}`)
}
</script>

<style scoped lang="scss">
.project-create-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}


.page-header {
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 1rem;
}

.page-title {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
    color: #212529;
}

.page-content {
    flex: 1;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}
</style>