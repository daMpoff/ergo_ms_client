<template>
    <div class="container my-projects-page">
        <h3 class="mb-3">Мои проекты</h3>

        <div class="row">
            <div class="col-12">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb bg-transparent px-0 mb-2">
                        <li class="breadcrumb-item">
                            <router-link to="/">
                                <Home class="lucide align-middle me-1" :size="18" />
                                Главная
                            </router-link>
                        </li>
                        <li class="breadcrumb-item">
                            <router-link to="/crm">
                                <Briefcase class="lucide align-middle me-1" :size="18" />
                                CRM
                            </router-link>
                        </li>
                        <li class="breadcrumb-item">
                            <router-link to="/crm/project-ed">
                                <FolderKanban class="lucide align-middle me-1" :size="18" />
                                Управление проектами
                            </router-link>
                        </li>
                        <li class="breadcrumb-item active" aria-current="page">
                            <List class="lucide align-middle me-1" :size="18" />
                            Мои проекты
                        </li>
                    </ol>
                </nav>
            </div>
        </div>

        <div class="filters-card">
            <div class="filters-grid">
                <div class="filter-item">
                    <label class="form-label">Краткое наименование проекта</label>
                    <input
                        v-model="filters.shortName"
                        type="text"
                        class="form-control"
                        placeholder="Начните ввод..."
                    />
                </div>
                <div class="filter-item">
                    <label class="form-label">Роль в проекте</label>
                    <select v-model="filters.role" class="form-select">
                        <option value="">Все</option>
                        <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                    </select>
                </div>
                <div class="filter-item">
                    <label class="form-label">Статус проекта</label>
                    <select v-model="filters.status" class="form-select">
                        <option value="">Все</option>
                        <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                    </select>
                </div>
            </div>
        </div>

        <ProjectTable :items="filteredProjects" @rowClick="onRowClick" />
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Home, Briefcase, FolderKanban, List } from 'lucide-vue-next'
import ProjectTable from '@/modules/crm/project-ed/components/ProjectTable.vue'


const roles = ['Руководитель', 'Исполнитель']
const statuses = ['Черновик', 'На утверждении', 'Отклонен', 'В работе', 'Завершен']

const filters = ref({ shortName: '', role: '', status: '' })

// Временные данные для визуализации страницы
const projects = ref([
    { id: 1, shortName: 'МП3.1-2025(ФИО)', name: 'Развитие воспитательной деятельности в рамках реализации образовательных программ (....)', role: 'Руководитель', status: 'Черновик' },
    { id: 2, shortName: 'МП3.2-2025(ФИО)', name: 'Название (....)', role: 'Руководитель', status: 'На утверждении' },
    { id: 3, shortName: 'ОП4.3-2025(ФИО)', name: 'Название (....)', role: 'Руководитель', status: 'Отклонен' },
    { id: 4, shortName: 'ОП1.2-2025(ФИО)', name: 'Название (....)', role: 'Руководитель', status: 'В работе' },
    { id: 5, shortName: 'ИП2.3-2025(ФИО)', name: 'Название (....)', role: 'Исполнитель', status: 'В работе' },
    { id: 6, shortName: 'НП2.3-2024(ФИО)', name: 'Название (....)', role: 'Исполнитель', status: 'Завершен' },
    { id: 7, shortName: 'УП1.1-2024(ФИО)', name: 'Название (....)', role: 'Руководитель', status: 'Завершен' },
    { id: 8, shortName: 'УП3.3-2024(ФИО)', name: 'Название (....)', role: 'Руководитель', status: 'Отклонен' },
])

const filteredProjects = computed(() => {
    const name = filters.value.shortName.trim().toLowerCase()
    const role = filters.value.role
    const status = filters.value.status

    return projects.value.filter(p => {
        const byName = !name || p.shortName.toLowerCase().includes(name)
        const byRole = !role || p.role === role
        const byStatus = !status || p.status === status
        return byName && byRole && byStatus
    })
})

const onRowClick = () => {
    // Заглушка: здесь будет переход на карточку проекта
    // router.push({ name: 'ProjectCard', params: { id: project.id } })
}
</script>

<style scoped lang="scss">
.my-projects-page { display: flex; flex-direction: column; gap: 1rem; }

.filters-card {
    /* Bootstrap docs-like callout (info) */
    background-color: rgba(var(--bs-info-rgb, 13, 202, 240), .075);
    border-radius: 1rem;
    padding: 1rem;
}

.filters-grid {
    display: grid;
    grid-template-columns: 1fr 220px 220px;
    gap: .75rem;

    @media (max-width: 992px) {
        grid-template-columns: 1fr 1fr;
    }
    @media (max-width: 576px) {
        grid-template-columns: 1fr;
    }
}

.filter-item { display: flex; flex-direction: column; }
</style>