<template>
    <div class="projects-page">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <Breadcrumbs :items="breadcrumbItems" />
                </div>
            </div>
            <h3 class="page-title">Проекты на утверждении</h3>
            <ProjectFilters v-model="filters" :roles="roles" :statuses="statuses" />
        </div>
        <div class="container">
            <div v-if="isLoading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
                <p class="mt-2">Загрузка проектов...</p>
            </div>
            
            <div v-else-if="filteredProjects.length === 0" class="text-center py-4">
                <p class="text-muted">Проекты не найдены</p>
            </div>
            
            <div v-else class="projects-list">
                <ProjectListItem
                    v-for="project in filteredProjects"
                    :key="project.id"
                    :project="project"
                    @open="onProjectClick"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { Home, List } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import ProjectListItem from '@/modules/crm/project-ed/components/ProjectListItem.vue'
import ProjectFilters from '@/modules/crm/project-ed/components/ProjectFilters.vue'
import { apiClient } from '@/js/api/manager.js'
import { projectEdEndpoints } from '@/modules/crm/project-ed/js/endpoints.js'
import { useUserStore } from '@/core/cms/js/userStore.js'

const toast = useToast()
const userStore = useUserStore()

const roles = ['Руководитель', 'Куратор', 'Заказчик', 'Исполнитель']
const statuses = ['Черновик', 'На утверждении', 'Отклонен', 'В работе', 'Завершен']

const filters = ref({ shortName: '', role: '', status: '' })
const projects = ref([])
const isLoading = ref(false)

const breadcrumbItems = ref([
    {
        label: 'Главная',
        to: '/crm/project-ed',
        icon: Home
    },
    {
        label: 'Проекты на утверждении',
        icon: List
    }
])

const filteredProjects = computed(() => {
    const name = filters.value.shortName.trim().toLowerCase()
    const role = filters.value.role
    const status = filters.value.status

    return projects.value.filter(p => {
        const byName = !name || p.shortName?.toLowerCase().includes(name)
        const byRole = !role || p.role === role
        const byStatus = !status || p.status === status
        return byName && byRole && byStatus
    })
})

import { useRouter } from 'vue-router'
import { slugify as translitSlugify } from 'transliteration'
const router = useRouter()

const onProjectClick = (project) => {
    const slug = translitSlugify(project.name || project.shortName || 'project').toLowerCase()
    router.push({ name: 'ProjectEdProjectDetail', params: { slug }, query: { from: 'projects-on-apply' } })
}

async function loadProjects() {
    isLoading.value = true
    try {
        const response = await apiClient.get(projectEdEndpoints.project_ed.projects.exportForReview)
        const data = Array.isArray(response.data?.results) ? response.data.results : []

        const mappedProjects = data.map(project => ({
            id: project.id,
            shortName: project.short_name,
            nameClarification: project.name_clarification,
            name: project.name,
            role: project.user_role || getProjectRole(project),
            status: getProjectStatus(project.status),
            executors_count: project.executors_count || 0,
            executors: project.performers || [],
            created_at: project.created_at,
            updated_at: project.updated_at
        }))

        const uniqueProjects = []
        const seenIds = new Set()
        for (const project of mappedProjects) {
            if (!seenIds.has(project.id)) {
                seenIds.add(project.id)
                uniqueProjects.push(project)
            }
        }
        projects.value = uniqueProjects
    } catch (error) {
        toast.error('Ошибка при загрузке проектов: ' + (error.response?.data?.detail || error.message))
        projects.value = []
    } finally {
        isLoading.value = false
    }
}

function getProjectRole(project) {
    const currentUserId = userStore.user?.id
    if (!currentUserId) return ''
    if (project.manager === currentUserId || project.manager_id === currentUserId) return 'Руководитель'
    if (project.owner === currentUserId || project.owner_id === currentUserId) return 'Руководитель'
    if (project.curator === currentUserId || project.curator_id === currentUserId) return 'Куратор'
    if (project.customer === currentUserId || project.customer_id === currentUserId) return 'Заказчик'
    try {
        const execs = project.executors || project.performers || []
        if (Array.isArray(execs)) {
            const has = execs.some(e => (
                e === currentUserId || e?.id === currentUserId || e?.user_id === currentUserId || e?.user?.id === currentUserId
            ))
            if (has) return 'Исполнитель'
        }
    } catch {}
    return ''
}

function getProjectStatus(status) {
    const statusMap = {
        'draft': 'Черновик',
        'pending': 'На утверждении',
        'rejected': 'Отклонен',
        'active': 'В работе',
        'completed': 'Завершен'
    }
    return statusMap[status] || status
}

onMounted(async () => {
    if (!userStore.isInitialized) {
        await userStore.initializeUser()
    }
    loadProjects()
})
</script>

<style scoped lang="scss">
.projects-page {
    padding: 1rem 0;
}

.page-title {
    margin: 1rem 0;
    color: var(--color-primary-text);
}

.projects-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>