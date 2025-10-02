<template>
    <div class="my-projects-list">
        <ProjectTable :items="filteredProjects" @rowClick="onRowClick" />
        <button class="btn btn-secondary w-100" @click="goToMyProjects">Еще...</button>
    </div>
    
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ProjectTable from '@/modules/crm/project-ed/components/ProjectTable.vue'

// Входные данные (можно передать извне). Если не передали — покажем примеры для визуализации.
const props = defineProps({
    projects: {
        type: Array,
        default: () => [],
    },
})

const fallbackProjects = []

const filters = ref({ shortName: '', role: '', status: '' })

const sourceProjects = computed(() => (props.projects && props.projects.length ? props.projects : fallbackProjects))

const filteredProjects = computed(() => {
    const name = filters.value.shortName.toLowerCase()
    const role = filters.value.role
    const status = filters.value.status

    return sourceProjects.value.filter(p => {
        const byName = !name || p.shortName.toLowerCase().includes(name)
        const byRole = !role || p.role === role
        const byStatus = !status || p.status === status
        return byName && byRole && byStatus
    })
})

const router = useRouter()

const onRowClick = () => {}
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


