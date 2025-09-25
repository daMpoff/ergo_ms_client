<template>
    <div class="events-table">
        <!-- Панель фильтров (минимум, оставим фильтр по проекту при наличии пропсов) -->
        <div class="filters card p-3 mb-3">
            <div class="row g-2 align-items-end">
                <div class="col-12 col-lg-3">
                    <label class="form-label mb-1">Категория политики/проекта</label>
                    <select class="form-select" v-model="filters.category">
                        <option :value="null">Все</option>
                        <option v-for="c in projectCategories" :key="c" :value="c">{{ c }}</option>
                    </select>
                </div>
                <div class="col-12 col-lg-3">
                    <label class="form-label mb-1">Подкатегория</label>
                    <select class="form-select" v-model="filters.subcategory">
                        <option :value="null">Все</option>
                        <option v-for="s in projectSubcategories" :key="s" :value="s">{{ s }}</option>
                    </select>
                </div>
                <div class="col-12 col-lg-3">
                    <label class="form-label mb-1">Блок мероприятий</label>
                    <select class="form-select" v-model="filters.blockId">
                        <option :value="null">Все</option>
                        <option v-for="b in blockOptions" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                </div>
                <div class="col-12 col-lg-3">
                    <label class="form-label mb-1">Срок реализации (год)</label>
                    <select class="form-select" v-model.number="filters.year">
                        <option :value="null">Все</option>
                        <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Карточки блоков мероприятий -->
        <div class="block-list">
            <div v-if="isLoading" class="p-4 text-center">Загрузка...</div>
            <template v-else>
                <div v-for="block in visibleBlocks" :key="block.id" class="card block-card mb-3">
                    <div class="card-header d-flex align-items-center justify-content-between gap-2 header-toggle" role="button" @click="toggleBlock(block)">
                        <div class="d-flex flex-column">
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge text-bg-secondary rounded-pill code-badge">{{ block.code || block.short_code || '—' }}</span>
                                <div class="title-text">{{ block.name || block.title || 'Без названия' }}</div>
                            </div>
                            <div class="small text-secondary-custom mt-1 d-flex align-items-center gap-3 flex-wrap">
                                    <span class="d-inline-flex align-items-center gap-1">
                                        <Users class="icon-center" />
                                        <span>{{ getLeadersCount(block) }} руководителей</span>
                                    </span>
                                    <span class="d-inline-flex align-items-center gap-1">
                                        <ListChecks class="icon-center" />
                                        <span>{{ getEventsCount(block) }} {{ pluralizeEvents(getEventsCount(block)) }}</span>
                                    </span>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <component :is="block._expanded ? ChevronUp : ChevronDown" class="icon-center" />
                        </div>
                    </div>

                    <div v-if="block._expanded" class="card-body pt-3 pb-3">
                        <div v-if="block._loading" class="p-2 text-center">Загрузка мероприятий...</div>
                        <div v-else>
                            <div v-if="(block.events || []).length === 0" class="empty-hint">Мероприятий нет</div>

                            <div class="list-group">
                                <div v-for="ev in block.events" :key="ev.id" class="list-group-item event-item px-0">
                                    <!-- Заголовок мероприятия -->
                                    <div :class="['event-item-header','d-flex','align-items-center','justify-content-between', { 'is-open': ev._showResults }]" role="button" @click="ev._showResults = !ev._showResults">
                                        <div class="d-flex flex-column flex-grow-1 event-item-main">
                                            <div class="d-flex align-items-center gap-3">
                                                <span class="badge text-bg-secondary rounded-pill code-badge">{{ ev.code ?? ev.id ?? '-' }}</span>
                                                <div class="event-title-link">{{ ev.name || ev.kpiName || 'Без названия' }}</div>
                                            </div>
                                            <div v-if="ev.start_year || ev.end_year" class="event-item-meta text-muted small d-flex align-items-center gap-1 mt-1">
                                                <Calendar class="icon-center" />
                                                <span>
                                                    {{ ev.start_year && ev.end_year ? (ev.start_year === ev.end_year ? ev.start_year : (ev.start_year + ' — ' + ev.end_year)) : (ev.start_year || ev.end_year) }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="d-flex align-items-center gap-2">
                                            <component :is="ev._showResults ? ChevronUp : ChevronDown" class="icon-center chevron" />
                                        </div>
                                    </div>

                                    <!-- Спойлер с результатами -->
                                    <div v-if="ev._showResults" class="mt-2 ps-3 pe-2 pb-2">
                                        <div class="text-muted mb-1 years-th">Основные результаты:</div>
                                        <template v-if="splitResults(ev.results || ev.description).length <= 1">
                                            <div class="cell text-prewrap px-3 py-2">{{ splitResults(ev.results || ev.description)[0] ?? (ev.results || ev.description || '—') }}</div>
                                        </template>
                                        <ol v-else class="mb-0 ps-3">
                                            <li v-for="(item, idx) in splitResults(ev.results || ev.description)" :key="idx">{{ item }}</li>
                                        </ol>
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
import { ChevronDown, ChevronUp, Eye, EyeOff, FileText, Users, ListChecks, Calendar } from 'lucide-vue-next'

const props = defineProps({
    projects: { type: Array, default: () => [] },
})

const toast = useToast()

const projects = computed(() => props.projects)
const filters = ref({ projectId: null, category: null, subcategory: null, blockId: null, year: null })

const isLoading = ref(false)
const blocksData = ref([])

function getCategoryLabel(block) {
    const c = block.category ?? block.project_category ?? block.project?.category
    const cName = block.category_name ?? block.project?.category_name
    if (typeof c === 'object' && c) {
        return c.name ?? c.title ?? c.label ?? String(c.id ?? '')
    }
    return cName ?? (typeof c === 'number' ? String(c) : c)
}

function getSubcategoryLabel(block) {
    const s = block.subcategory ?? block.project_subcategory ?? block.project?.subcategory
    const sName = block.subcategory_name ?? block.project?.subcategory_name
    if (typeof s === 'object' && s) {
        return s.name ?? s.title ?? s.label ?? String(s.id ?? '')
    }
    return sName ?? (typeof s === 'number' ? String(s) : s)
}

const projectCategories = computed(() => {
    const set = new Set()
    for (const b of blocksData.value) {
        const label = getCategoryLabel(b)
        if (label) set.add(label)
    }
    return Array.from(set)
})

const projectSubcategories = computed(() => {
    const set = new Set()
    for (const b of blocksData.value) {
        const catOk = !filters.value.category || getCategoryLabel(b) === filters.value.category
        const label = getSubcategoryLabel(b)
        if (label && catOk) set.add(label)
    }
    return Array.from(set)
})

const blockOptions = computed(() => {
    return blocksData.value.map(b => ({ id: b.id, name: b.name || b.title || (b.code || b.short_code || 'Без названия') }))
})

const yearOptions = computed(() => {
    const current = new Date().getFullYear()
    const start = current - 5
    const end = current + 10
    const arr = []
    for (let y = start; y <= end; y++) arr.push(y)
    return arr
})

const visibleBlocks = computed(() => {
    let list = blocksData.value

    // фильтр по проекту
    if (filters.value.projectId) {
        list = list.filter((b) => {
            const pid = b.project_id || b.projectId || b.project?.id
            return !pid || pid === filters.value.projectId
        })
    }

    // фильтр по категории/подкатегории
    if (filters.value.category) {
        list = list.filter((b) => getCategoryLabel(b) === filters.value.category)
    }
    if (filters.value.subcategory) {
        list = list.filter((b) => getSubcategoryLabel(b) === filters.value.subcategory)
    }

    // фильтр по блоку
    if (filters.value.blockId) {
        list = list.filter((b) => b.id === filters.value.blockId)
    }

    // фильтр по году: блок отображается, если год попадает в диапазон хотя бы одного мероприятия блока,
    // либо попадает в диапазон полей самого блока (если указано)
    if (filters.value.year !== null && filters.value.year !== undefined) {
        const year = Number(filters.value.year)
        list = list.filter((b) => {
            const bStart = Number(b.start_year || b.startYear)
            const bEnd = Number(b.end_year || b.endYear)
            const inBlock = (Number.isFinite(bStart) && Number.isFinite(bEnd) && bStart <= year && year <= bEnd)
            if (inBlock) return true
            const events = Array.isArray(b.events) ? b.events : []
            return events.some((ev) => {
                const s = Number(ev.start_year || ev.startYear)
                const e = Number(ev.end_year || ev.endYear)
                return Number.isFinite(s) && Number.isFinite(e) && s <= year && year <= e
            })
        })
    }

    return list
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
        // если выбран год, сразу скроем несоответствующие мероприятия
        const year = Number(filters.value.year)
        if (filters.value.year !== null && filters.value.year !== undefined && Number.isFinite(year)) {
            block.events = block.events.filter((ev) => {
                const s = Number(ev.start_year || ev.startYear)
                const e = Number(ev.end_year || ev.endYear)
                return Number.isFinite(s) && Number.isFinite(e) && s <= year && year <= e
            })
        }
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

function splitResults(text) {
    if (!text) return []
    return String(text)
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(Boolean)
}

function getLeadersCount(block) {
    const leaders = block.leaders || block.managers || block.heads || []
    if (Array.isArray(leaders)) return leaders.length
    if (typeof leaders === 'number') return leaders
    if (typeof leaders === 'string') {
        const n = Number(leaders)
        return Number.isFinite(n) ? n : 0
    }
    return Number(block.leaders_count || block.managers_count || block.heads_count) || 0
}

function getEventsCount(block) {
    // показываем уже загруженное число, иначе пробуем из возможных полей
    const loaded = (block.events || []).length
    if (loaded > 0) return loaded
    const candidates = [block.events_count, block.count, block.total_events]
    for (const v of candidates) {
        const n = Number(v)
        if (Number.isFinite(n) && n > 0) return n
    }
    return 0
}

function pluralizeEvents(n) {
    const num = Math.abs(Number(n)) || 0
    const mod10 = num % 10
    const mod100 = num % 100
    if (mod10 === 1 && mod100 !== 11) return 'мероприятие'
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'мероприятия'
    return 'мероприятий'
}

onMounted(fetchBlocks)
</script>

<style scoped lang="scss">
.block-list { display: block; }
.block-card {
    border: 1px solid var(--bs-border-color, #dee2e6);
    border-radius: .75rem;
    background-color: var(--color-primary-background);
    overflow: hidden;
}
.block-card .card-header { background-color: var(--color-primary-background); }
.block-card .card-header.header-toggle { cursor: pointer; user-select: none; }
.code-badge { font-variant-numeric: tabular-nums; }
.title-text { font-weight: 600; }
.cell {
    width: 100%;
    min-height: 40px;
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
.cell.text-center { justify-content: center; text-align: center; }
.empty-hint { padding: 1rem; text-align: center; color: var(--color-secondary-text); }
.filters.card { background-color: var(--color-primary-background); border-color: var(--bs-border-color, #dee2e6); }
.years-th { font-weight: 600; }
.icon-center {
    width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
}
.list-group-item { background: transparent; }
.event-item {
    background: var(--color-primary-background);
    border: 1px solid var(--bs-border-color, #dee2e6);
    border-radius: .5rem;
    overflow: hidden;
    padding: 0; /* убираем внутренний отступ list-group-item */
    margin-bottom: .5rem; /* добавляем зазор для видимости нижней границы */
}
.list-group .event-item:last-child { margin-bottom: .5rem; }
.block-card .card-body { padding-bottom: 1rem; }
.event-item-header { padding: .75rem .75rem .5rem .75rem; }
.event-item-header:hover { background-color: var(--color-hover-background, #f1f3f5); }
.event-item-header.is-open { background-color: var(--bs-secondary-bg, #f8f9fa); border-bottom-color: var(--color-border); }
.event-item-meta { padding: 0 .75rem .5rem 0; }
/* hover только на шапке элемента */
.chevron { transition: transform .15s ease-in-out; }
.event-title-link { text-decoration: none; cursor: pointer; font-weight: 400; }
.text-secondary-custom { color: var(--color-secondary-text); }
</style>


