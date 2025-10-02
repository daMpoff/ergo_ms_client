<template>
    <div class="my-projects-list">
        <ProjectTable :items="filteredProjects" @rowClick="onRowClick">
            <template #empty>
                <div class="text-center py-4">
                    <p class="text-muted">У вас пока нет проектов</p>
                    <router-link to="/project-ed/create" class="btn btn-primary">
                        Создать первый проект
                    </router-link>
                </div>
            </template>
        </ProjectTable>
        <button v-if="filteredProjects.length > 0" class="btn btn-secondary w-100" @click="goToMyProjects">Еще...</button>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ProjectTable from '@/modules/crm/project-ed/components/ProjectTable.vue'

// Входные данные - проекты передаются из родительского компонента
const props = defineProps({
    projects: {
        type: Array,
        default: () => [],
    },
})

const filters = ref({ shortName: '', role: '', status: '' })

// Используем переданные проекты
const filteredProjects = computed(() => {
    const name = filters.value.shortName.toLowerCase()
    const role = filters.value.role
    const status = filters.value.status

    return props.projects.filter(p => {
        const byName = !name || p.shortName.toLowerCase().includes(name)
        const byRole = !role || p.role === role
        const byStatus = !status || p.status === status
        return byName && byRole && byStatus
    })
})

const router = useRouter()

const onRowClick = (project) => {
    // Переходим к детальной странице проекта
    router.push({ name: 'ProjectEdProjectDetail', params: { id: project.id } })
}

const goToMyProjects = () => {
    router.push({ name: 'ProjectEdMyProjects' })
}
</script>

<style scoped lang="scss">
.my-projects-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.filters-card {
    background-color: var(--bs-primary-bg-subtle, #cfe2ff);
    border: 1px solid var(--bs-border-color, #dee2e6);
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

.filter-item {
    display: flex;
    flex-direction: column;
}

/* стили таблицы перенесены в общий компонент */
</style>


