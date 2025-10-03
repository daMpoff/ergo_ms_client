<template>
    <div class="my-projects-list">
        <div v-if="filteredProjects.length === 0" class="text-center py-4">
            <p class="text-muted">У вас пока нет проектов</p>
            <router-link to="/project-ed/create" class="btn btn-primary">
                Создать первый проект
            </router-link>
        </div>

        <div v-else class="position-relative">
            <button
                class="btn btn-info text-white shadow-sm nav-btn left"
                type="button"
                @click="scrollLeft"
                aria-label="Прокрутить влево"
            >
                <ChevronLeft :size="20" class="d-block mx-auto" />
            </button>
            <div
                ref="scrollContainer"
                class="cards-scroll-container"
            >
                <div
                    v-for="project in filteredProjects"
                    :key="project.id"
                    class="project-card card h-100"
                    role="button"
                    @click="onRowClick(project)"
                >
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <h6 class="mb-0 text-truncate">{{ project.shortName }}</h6>
                        </div>
                        <div class="full-name small">
                            {{ project.name }}
                        </div>
                        <div class="text-muted small mb-3 text-truncate d-inline-flex align-items-center gap-1 role-line">
                            <User :size="14" />
                            <span>{{ project.role || '—' }}</span>
                        </div>
                        <div class="mt-auto d-flex align-items-center justify-content-between text-muted small">
                            <span class="text-truncate">{{ formatCreated(project) }}</span>
                            <span class="badge bg-secondary text-wrap ms-2">{{ project.status }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <button
                class="btn btn-info text-white shadow-sm nav-btn right"
                type="button"
                @click="scrollRight"
                aria-label="Прокрутить вправо"
            >
                <ChevronRight :size="20" class="d-block mx-auto" />
            </button>
        </div>

        
    </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, User } from 'lucide-vue-next'
import { getRelativeTime } from '@/modules/crm/project-ed/components/steps/js/timeUtils.js'

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
const scrollContainer = ref(null)

const scrollByAmount = 320

const scrollLeft = () => {
    if (scrollContainer.value) {
        scrollContainer.value.scrollBy({ left: -scrollByAmount, behavior: 'smooth' })
    }
}

const scrollRight = () => {
    if (scrollContainer.value) {
        scrollContainer.value.scrollBy({ left: scrollByAmount, behavior: 'smooth' })
    }
}

const formatCreated = (project) => {
    const created = project?.createdAt || project?.created_at || project?.created || project?.createdDate
    return created ? getRelativeTime(created) : ''
}

// Блокируем ручную прокрутку (колесо мыши/тач) — оставляем только кнопки
let wheelHandler = null
let touchMoveHandler = null

onMounted(() => {
    if (!scrollContainer.value) return
    wheelHandler = (e) => {
        // Разрешаем клики по карточкам, но блокируем горизонтальную прокрутку жестами
        if (e.deltaX !== 0 || e.deltaY !== 0) {
            e.preventDefault()
        }
    }
    touchMoveHandler = (e) => {
        e.preventDefault()
    }
    scrollContainer.value.addEventListener('wheel', wheelHandler, { passive: false })
    scrollContainer.value.addEventListener('touchmove', touchMoveHandler, { passive: false })
})

onBeforeUnmount(() => {
    if (!scrollContainer.value) return
    if (wheelHandler) {
        scrollContainer.value.removeEventListener('wheel', wheelHandler)
        wheelHandler = null
    }
    if (touchMoveHandler) {
        scrollContainer.value.removeEventListener('touchmove', touchMoveHandler)
        touchMoveHandler = null
    }
})

const onRowClick = (project) => {
    // Переходим к детальной странице проекта
    router.push({ name: 'ProjectEdProjectDetail', params: { id: project.id } })
}

// Кнопка "Еще..." удалена по требованию
</script>

<style scoped lang="scss">
.my-projects-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.cards-scroll-container {
    display: flex;
    gap: 1rem;
    overflow-x: auto; // нужен для программного скролла
    padding: .25rem;
    scroll-behavior: smooth;
    scrollbar-width: none; // скрыть в Firefox
}

.cards-scroll-container::-webkit-scrollbar {
    width: 0;
    height: 0; // скрыть в WebKit/Chromium
}
.cards-scroll-container::-webkit-scrollbar-thumb {
    background: transparent;
}

.project-card {
    min-width: 280px;
    max-width: 320px;
    border-radius: .75rem;
    cursor: pointer;
    transition: transform .15s ease, box-shadow .15s ease;
}
.project-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);
}

.nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    opacity: .40;
}
.nav-btn.left { left: 0; }
.nav-btn.right { right: 0; }

.full-name {
    color: var(--color-secondary-text);
    white-space: normal;
    overflow: visible;
    font-size: .65rem;
}

.role-line {
    margin-top: .25rem;
}
</style>


