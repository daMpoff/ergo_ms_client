<template>
    <div class="project-create-page">
        <!-- Breadcrumbs -->
        <Breadcrumbs :items="breadcrumbItems" />

        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">Создание проекта</h1>
            <!-- Toggle buttons: Паспорт проекта / Отчеты по проекту -->
            <div class="d-flex mt-3">
                <div class="btn-group" role="group" aria-label="Переключатели разделов проекта">
                    <button
                        type="button"
                        class="btn btn-sm d-inline-flex align-items-center"
                        :class="[
                            activeSection === 'passport' ? 'btn-primary project-toggle' : 'btn-outline-primary project-toggle-outline',
                            { active: activeSection === 'passport' }
                        ]"
                        @click="activeSection = 'passport'"
                    >
                        <FileText class="me-2" :size="16" />
                        <span class="d-inline-flex align-items-center">Паспорт проекта</span>
                    </button>
                    <button
                        type="button"
                        class="btn btn-sm d-inline-flex align-items-center"
                        :class="[
                            activeSection === 'reports' ? 'btn-primary project-toggle' : 'btn-outline-primary project-toggle-outline',
                            { active: activeSection === 'reports' }
                        ]"
                        @click="activeSection = 'reports'"
                    >
                        <BarChart class="me-2" :size="16" />
                        <span class="d-inline-flex align-items-center">Отчеты по проекту</span>
                    </button>
                </div>
            </div>
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
import { Home, Plus, List, FileText, BarChart } from 'lucide-vue-next'
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

// Локальное состояние активного раздела (переключатели над разделителем)
const activeSection = ref('passport')
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

/* Синий цвет переключателей независимо от темы */
.project-toggle {
    --bs-btn-bg: #0d6efd;
    --bs-btn-border-color: #0d6efd;
    --bs-btn-hover-bg: #0b5ed7;
    --bs-btn-hover-border-color: #0a58ca;
    --bs-btn-active-bg: #0a58ca;
    --bs-btn-active-border-color: #0a53be;
}

/* Контурная синяя для неактивной кнопки с белым фоном */
.project-toggle-outline {
    --bs-btn-color: #0d6efd;
    --bs-btn-border-color: #0d6efd;
    --bs-btn-bg: #ffffff;
    --bs-btn-hover-color: #0b5ed7;
    --bs-btn-hover-bg: #e7f1ff;
    --bs-btn-hover-border-color: #0b5ed7;
    --bs-btn-active-color: #0a58ca;
    --bs-btn-active-bg: #d6e8ff;
    --bs-btn-active-border-color: #0a58ca;
}
</style>