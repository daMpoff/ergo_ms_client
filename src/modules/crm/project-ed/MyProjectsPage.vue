<template>
    <div class="projects-page">
        <div class="container">
        <div class="row">
            <div class="col-12">
                <Breadcrumbs :items="breadcrumbItems" />
            </div>
        </div>

            <h3 class="page-title">Мои проекты</h3>

            <!-- Filters -->
            <div class="filters-section">
                <div class="row">
                    <div class="col-md-6 col-lg-4">
                    <label class="form-label">Краткое наименование проекта</label>
                    <input
                        v-model="filters.shortName"
                        type="text"
                        class="form-control"
                        placeholder="Начните ввод..."
                    />
                </div>
                    <div class="col-md-3 col-lg-2">
                    <label class="form-label">Роль в проекте</label>
                    <select v-model="filters.role" class="form-select">
                        <option value="">Все</option>
                        <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                    </select>
                </div>
                    <div class="col-md-3 col-lg-2">
                    <label class="form-label">Статус проекта</label>
                    <select v-model="filters.status" class="form-select">
                        <option value="">Все</option>
                        <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                    </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- Projects List -->
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
                <div 
                    v-for="project in filteredProjects" 
                    :key="project.id" 
                    class="project-item"
                    @click="onProjectClick(project)"
                >
                    <div class="project-main">
                        <div class="project-title-section">
                            <h4 class="project-title">{{ project.shortName }}</h4>
                            <span class="status-badge" :class="getStatusClass(project.status)">
                                {{ project.status }}
                            </span>
                        </div>
                        
                        <div v-if="project.nameClarification" class="project-clarification">
                            {{ project.nameClarification }}
                        </div>
                        
                        <p class="project-description">{{ project.name }}</p>
                        
                        <div class="project-meta">
                            <span class="role-badge" :class="getRoleClass(project.role)">
                                <User class="role-icon" :size="14" />
                                {{ project.role }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="project-actions">
                        <button class="btn btn-outline-primary btn-sm" @click.stop="onProjectClick(project)">
                            <ArrowRight class="me-1" :size="16" />
                            Открыть
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { Home, Briefcase, FolderKanban, List, Search, ArrowRight, User } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import { useUserStore } from '@/modules/cms/js/userStore.js'

const toast = useToast()
const userStore = useUserStore()

const roles = ['Руководитель', 'Куратор', 'Заказчик', 'Исполнитель']
const statuses = ['Черновик', 'На утверждении', 'Отклонен', 'В работе', 'Завершен']

const filters = ref({ shortName: '', role: '', status: '' })
const projects = ref([])
const isLoading = ref(false)

// Настройка breadcrumbs
const breadcrumbItems = ref([
    {
        label: 'Главная',
        to: '/crm/project-ed',
        icon: Home
    },
    {
        label: 'Мои проекты',
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

const onProjectClick = (project) => {
    // Заглушка: здесь будет переход на карточку проекта
    // router.push({ name: 'ProjectCard', params: { id: project.id } })
}

// Функции для стилизации
const getStatusClass = (status) => {
    const statusMap = {
        'Черновик': 'badge-warning',
        'На утверждении': 'badge-info',
        'Отклонен': 'badge-danger',
        'В работе': 'badge-success',
        'Завершен': 'badge-secondary'
    }
    return statusMap[status] || 'badge-secondary'
}

const getRoleClass = (role) => {
    const roleMap = {
        'Руководитель': 'badge-secondary',
        'Куратор': 'badge-warning',
        'Заказчик': 'badge-dark',
        'Исполнитель': 'badge-success'
    }
    return roleMap[role] || 'badge-secondary'
}

// Загрузка проектов пользователя
async function loadProjects() {
    isLoading.value = true
    try {
        const response = await apiClient.get(endpoints.project_ed.projects.list)
        const data = Array.isArray(response.data) ? response.data : (response.data?.results || [])
        
        // Преобразуем данные API в формат, ожидаемый компонентом
        const mappedProjects = data.map(project => ({
            id: project.id,
            shortName: project.short_name,
            nameClarification: project.name_clarification,
            name: project.name,
            role: project.user_role || getProjectRole(project), // Используем роль из API
            status: getProjectStatus(project.status)
        }))
        
        // Проверяем на дубликаты по ID
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

// Определение роли пользователя в проекте
function getProjectRole(project) {
    const currentUserId = userStore.user?.id
    
    if (!currentUserId) {
        return 'Неизвестно'
    }
    
    // Если пользователь - руководитель проекта
    if (project.manager === currentUserId || project.manager_id === currentUserId) {
        return 'Руководитель'
    }
    
    // Если пользователь - владелец проекта (считаем руководителем)
    if (project.owner === currentUserId || project.owner_id === currentUserId) {
        return 'Руководитель'
    }
    
    // Если пользователь - куратор проекта
    if (project.curator === currentUserId || project.curator_id === currentUserId) {
        return 'Куратор'
    }
    
    // Если пользователь - заказчик проекта
    if (project.customer === currentUserId || project.customer_id === currentUserId) {
        return 'Заказчик'
    }
    
    // По умолчанию считаем исполнителем
    return 'Исполнитель'
}

// Преобразование статуса проекта в читаемый вид
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

// Загружаем проекты при монтировании компонента
onMounted(async () => {
    // Инициализируем пользователя если еще не инициализирован
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
    color: #333;
}

.filters-section {
    background-color: rgba(var(--bs-info-rgb, 13, 202, 240), .075);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.projects-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.project-item {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    &:hover {
        border-color: #0d6efd;
        box-shadow: 0 2px 8px rgba(13, 110, 253, 0.1);
    }
    
    .project-main {
        flex: 1;
        
        .project-title-section {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
            
            .project-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #0d6efd;
                margin: 0;
                text-decoration: none;
                
                &:hover {
                    text-decoration: underline;
                }
            }
            
            .status-badge {
                border: 1px solid transparent;
                border-radius: 1rem;
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.025em;
                
                &.badge-warning {
                    border-color: #f59e0b;
                }
                
                &.badge-info {
                    border-color: #0dcaf0;
                }
                
                &.badge-danger {
                    border-color: #dc3545;
                }
                
                &.badge-success {
                    border-color: #198754;
                }
                
                &.badge-secondary {
                    border-color: #6c757d;
                }
            }
        }
        
        .project-clarification {
            color: #495057;
            font-size: 0.95rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
            padding: 0.25rem 0.5rem;
            background-color: #f8f9fa;
            border-radius: 0.25rem;
            border-left: 3px solid #0d6efd;
            display: inline-block;
        }
        
        .project-description {
            color: #6c757d;
            font-size: 0.875rem;
            line-height: 1.5;
            margin: 0 0 1rem 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .project-meta {
            display: flex;
            gap: 1rem;
            align-items: center;
            
            .role-badge {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                
                .role-icon {
                    display: flex;
                    align-items: center;
                }
            }
        }
    }
    
    .project-actions {
        display: flex;
        align-items: center;
    }
}

// Responsive
@media (max-width: 768px) {
    .project-item {
        flex-direction: column;
        gap: 1rem;
        
        .project-actions {
            align-self: flex-start;
        }
    }
    
    .project-meta {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 0.5rem !important;
    }
}
</style>