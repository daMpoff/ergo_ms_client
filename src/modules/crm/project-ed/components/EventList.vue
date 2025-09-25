<template>
    <div class="events-table">
        <!-- Панель фильтров (минимум, оставим фильтр по проекту при наличии пропсов) -->
        <div class="filters card p-3 mb-3">
            <div class="row g-2 align-items-end">
                <div class="col-12 col-lg-6">
                    <label class="form-label mb-1">Наименование политики/стратегического проекта</label>
                    <select class="form-select" v-model="filters.projectId">
                        <option :value="null">Все</option>
                        <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Список блоков мероприятий со спойлерами -->
        <div class="table-card">
            <div v-if="isLoading" class="p-3 text-center">Загрузка...</div>
            <template v-else>
                <div v-for="block in visibleBlocks" :key="block.id" class="mb-2">
                    <!-- Заголовок блока -->
                    <div class="row g-2 px-2 pb-2 align-items-stretch header-sub">
                        <div class="col-2 col-lg-2">
                            <div class="cell text-center">{{ block.code || block.short_code || '—' }}</div>
                        </div>
                        <div class="col-8 col-lg-8">
                            <div class="cell">{{ block.name || block.title || 'Без названия' }}</div>
                        </div>
                        <div class="col-2 col-lg-2">
                            <button class="btn btn-outline-secondary w-100" @click="toggleBlock(block)">
                                {{ block._expanded ? 'Свернуть' : 'Показать мероприятия' }}
                            </button>
                        </div>
                    </div>

                    <!-- Тело блока: список мероприятий -->
                    <div v-if="block._expanded" class="px-2 pb-3">
                        <div v-if="block._loading" class="p-2 text-center">Загрузка мероприятий...</div>
                        <div v-else>
                            <div v-if="(block.events || []).length === 0" class="empty-hint">Мероприятий нет</div>
                            <div v-for="ev in block.events" :key="ev.id" class="table-row row g-2 align-items-stretch">
                                <div class="col-2 col-lg-2">
                                    <div class="cell text-center">{{ ev.code ?? ev.id ?? '-' }}</div>
                                </div>
                                <div class="col-8 col-lg-8">
                                    <div class="cell" :title="ev.name || ev.kpiName">
                                        <div class="fw-semibold">{{ ev.name || ev.kpiName || 'Без названия' }}</div>
                                        <div v-if="ev._showResults" class="mt-2 small text-muted">
                                            <span class="years-th">Основные результаты:</span>
                                            <div class="mt-1">{{ ev.results || ev.description || '—' }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-2 col-lg-2">
                                    <div class="d-flex flex-column gap-2 w-100">
                                        <button class="btn btn-outline-primary" @click.stop="ev._showResults = !ev._showResults">
                                            {{ ev._showResults ? 'Скрыть результаты' : 'Показать результаты' }}
                                        </button>
                                        <button class="btn btn-outline-secondary" @click.stop="$emit('rowClick', ev)">Открыть</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="visibleBlocks.length === 0" class="empty-hint">Нет данных</div>
            </template>
        </div>
    </div>
    
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import { useToast } from 'vue-toastification'

const props = defineProps({
    projects: { type: Array, default: () => [] },
})

const toast = useToast()

const projects = computed(() => props.projects)
const filters = ref({ projectId: null })

const isLoading = ref(false)
const blocksData = ref([])

const visibleBlocks = computed(() => {
    if (!filters.value.projectId) return blocksData.value
    return blocksData.value.filter((b) => {
        // если блоки привязаны к проектам, попытаемся учесть common поля
        const pid = b.project_id || b.projectId || b.project?.id
        return !pid || pid === filters.value.projectId
    })
})

function normalizeArray(data) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.results)) return data.results
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
}

async function fetchBlocks() {
    try {
        isLoading.value = true
        const resp = await apiClient.get(endpoints.project_ed.event_blocks.list)
        const list = normalizeArray(resp.data)
        blocksData.value = list.map((b) => ({ ...b, _expanded: false, _loading: false, events: [] }))
    } catch {
        toast.error('Не удалось загрузить блоки мероприятий')
    } finally {
        isLoading.value = false
    }
}

async function fetchBlockEvents(block) {
    try {
        block._loading = true
        const resp = await apiClient.get(endpoints.project_ed.event_blocks.events(block.id))
        const list = normalizeArray(resp.data)
        block.events = list.map((ev) => ({ ...ev, _showResults: false }))
    } catch {
        toast.error('Не удалось загрузить мероприятия блока')
    } finally {
        block._loading = false
    }
}

async function toggleBlock(block) {
    block._expanded = !block._expanded
    if (block._expanded && (block.events || []).length === 0) {
        await fetchBlockEvents(block)
    }
}

onMounted(fetchBlocks)
</script>

<style scoped lang="scss">
.table-card {
    border: 1px solid var(--bs-border-color, #dee2e6);
    border-radius: .75rem;
    background-color: var(--color-primary-background);
}
.table-header { padding: .5rem; }
.th {
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: .5rem .75rem;
    border-radius: .5rem;
    background-color: var(--color-primary-background);
    border: 1px solid var(--bs-border-color, #dee2e6);
    font-weight: 600;
}
.table-row { padding: .25rem .5rem .75rem .5rem; }
.table-row { cursor: pointer; }
.table-row > div { display: flex; }
.cell {
    width: 100%;
    min-height: 44px;
    display: flex;
    align-items: center;
    height: 100%;
    flex: 1 1 auto;
    padding: .5rem .75rem;
    border-radius: .5rem;
    background-color: var(--bs-secondary-bg, #f8f9fa);
    border: 1px solid var(--bs-border-color, #dee2e6);
    white-space: normal;
    word-break: break-word;
}
.cell.align-top { align-items: center; }

/* Многострочное красивое обрезание */
.clamp-6 { display: -webkit-box; -webkit-line-clamp: 6; line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; }
.clamp-8 { display: -webkit-box; -webkit-line-clamp: 8; line-clamp: 8; -webkit-box-orient: vertical; overflow: hidden; }
.cell.text-center { justify-content: center; text-align: center; }
.empty-hint { padding: 1rem; text-align: center; color: var(--color-secondary-text); }
.filters.card { background-color: var(--color-primary-background); border-color: var(--bs-border-color, #dee2e6); }
.years-th span { font-weight: 600; }
.table-row:hover .cell { background-color: var(--color-hover-background, #f1f3f5); }
</style>


