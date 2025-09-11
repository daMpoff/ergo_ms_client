<template>
    <div class="events-table">
        <!-- Панель фильтров, как на скриншоте -->
        <div class="filters card p-3 mb-3">
            <div class="row g-2 align-items-end">
                <div class="col-12 col-lg-5">
                    <label class="form-label mb-1">Наименование политики/стратегического проекта</label>
                    <select class="form-select" v-model="filters.projectId">
                        <option :value="null">Все</option>
                        <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
                    </select>
                </div>
                <div class="col-6 col-lg-4">
                    <label class="form-label mb-1">Наименование блока мероприятий</label>
                    <select class="form-select" v-model="filters.block">
                        <option :value="null">Все</option>
                        <option v-for="b in blocks" :key="b" :value="b">{{ b }}</option>
                    </select>
                </div>
                <div class="col-6 col-lg-3">
                    <label class="form-label mb-1">Срок реализации</label>
                    <select class="form-select" v-model="filters.year">
                        <option :value="null">Все</option>
                        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Шапка таблицы по стилю ProjectTable -->
        <div class="table-card">
            <div class="table-header row g-2 align-items-center">
                <div class="col-2 col-lg-2"><div class="th text-center">Код мероприятия</div></div>
                <div class="col-3 col-lg-3"><div class="th">Наименование мероприятия</div></div>
                <div class="col-4 col-lg-4"><div class="th text-center">Основные результаты</div></div>
                <div class="col-1 col-lg-1"><div class="th text-center">Срок реализации</div></div>
                <div class="col-2 col-lg-2"><div class="th text-center">Руководители проектов</div></div>
            </div>

            <!-- Группы по блокам -->
            <div v-for="group in groupedFilteredItems" :key="group.key">
                <!-- Строка-заголовок блока: 2 контейнера -->
                <div class="row g-2 px-2 pb-2 align-items-stretch header-sub">
                    <div class="col-2 col-lg-2"><div class="cell text-center">{{ group.blockCode || '—' }}</div></div>
                    <div class="col-10 col-lg-10"><div class="cell">{{ group.blockDesc || group.blockName || '—' }}</div></div>
                </div>

                <!-- Опциональная первая строка блока с объединением правых контейнеров (в демо отключаем) -->
                <div v-if="group.topEvent && !isDemoMode" class="table-row row g-2 align-items-stretch">
                    <div class="col-2 col-lg-2"><div class="cell text-center">{{ group.topEvent.code ?? group.topEvent.id ?? '—' }}</div></div>
                    <div class="col-10 col-lg-10">
                        <div class="cell align-top clamp-8" :title="group.topEvent.results || group.topEvent.name || group.blockName">
                            {{ group.topEvent.results || group.topEvent.name || group.blockName || '—' }}
                        </div>
                    </div>
                </div>

                <!-- Обычные строки мероприятий этого блока -->
                <div
                    v-for="ev in group.events"
                    :key="ev.id"
                    class="table-row row g-2 align-items-stretch"
                    @click="$emit('rowClick', ev)"
                >
                    <div class="col-2 col-lg-2">
                        <div class="cell text-center">{{ ev.code ?? ev.id ?? '-' }}</div>
                    </div>
                    <div class="col-3 col-lg-3">
                        <div class="cell" :title="ev.name || ev.kpiName"><div class="clamp-8">{{ ev.name || ev.kpiName || '-' }}</div></div>
                    </div>
                    <div class="col-4 col-lg-4">
                        <div class="cell clamp-8" :title="ev.results || ev.block">{{ ev.results || ev.block || '-' }}</div>
                    </div>
                    <div class="col-1 col-lg-1">
                        <div class="cell text-center">{{ durationRange(ev) }}</div>
                    </div>
                    <div class="col-2 col-lg-2">
                        <div class="cell text-center">
                            <div class="d-flex flex-column align-items-center w-100">
                                <span v-for="(p, i) in (ev.leaders || [])" :key="i">{{ p }}</span>
                                <span v-if="!ev.leaders || !ev.leaders.length">—</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="!groupedFilteredItems.length" class="empty-hint">
                Нет мероприятий по выбранным фильтрам
            </div>
        </div>
    </div>
    
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    items: { type: Array, default: () => [] },
    yearsRange: { type: Array, default: () => [2023, 2032] },
    projects: { type: Array, default: () => [] },
    categories: { type: Array, default: () => ['Категория'] },
    forceDemo: { type: Boolean, default: false },
})

const projects = computed(() => props.projects)

const [startYear, endYear] = props.yearsRange
const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
const headerYears = years

const filters = ref({ projectId: null, block: null, year: null })

// Демо-данные, если пропсы пусты (визуализация как на макете)
const demoItems = [
    {
        id: 'MP3-header',
        code: 'МП3',
        block: 'МП3',
        isBlockHeader: true,
        results:
            'Создание условий для воспитания у обучающихся активной гражданской позиции и ответственности, основанных на традиционных культурных, духовных и нравственных ценностях общества',
    },
    {
        id: 'MP3.1',
        code: 'МП3.1',
        block: 'МП3',
        name:
            'Развитие воспитательной деятельности в рамках реализации образовательных программ',
        results:
            'В рамках каждой образовательной программы разработана программа воспитания и календарный план воспитательной работы',
        values: { 2023: true },
        leaders: ['ФИО', 'ФИО'],
    },
    {
        id: 'MP3.2',
        code: 'МП3.2',
        block: 'МП3',
        name:
            'Формирование студенческих сообществ, деятельность которых направлена на развитие социокультурной и спортивной инфраструктуры',
        results:
            'Создана система соучастного проектирования Университета через систему внутренних грантов на студенческие проекты и коммуникационные пространства вуза. Созданы коммуникационные лаборатории и цифровой сервис обратной связи',
        values: { 2025: true, 2026: true, 2027: true, 2028: true, 2029: true, 2030: true, 2031: true, 2032: true },
        leaders: ['ФИО', 'ФИО'],
    },
    {
        id: 'MP3.3',
        code: 'МП3.3',
        block: 'МП3',
        name:
            'Развитие гражданского соучастия через поддержку продуктивной общественно-полезной деятельности и политики «малых дел»',
        results:
            'Создана и реализуется программа, направленная на формирование у обучающихся навыков самоорганизации, умений брать на себя ответственность, участия в решении проблем собственного района и вклад в жизнь родного края. Создана система воспитания активной гражданственности и патриотизма',
        values: { 2023: true, 2024: true, 2025: true, 2026: true, 2027: true, 2028: true, 2029: true, 2030: true, 2031: true, 2032: true },
        leaders: ['ФИО', 'ФИО'],
    },
]

const isDemoMode = computed(() => props.forceDemo || !(props.items && props.items.length))
const baseItems = computed(() => (isDemoMode.value ? demoItems : props.items))

const blocks = computed(() => {
    const set = new Set((baseItems.value || []).map((ev) => ev.block).filter(Boolean))
    return Array.from(set)
})

// Группировка и подготовка данных для рендеринга по блокам
const filteredItems = computed(() => {
    return baseItems.value.filter((ev) => {
        const byProject = !filters.value.projectId || ev.projectId === filters.value.projectId
        const byBlock = !filters.value.block || ev.block === filters.value.block
        const byYear = !filters.value.year || ev.values?.[filters.value.year] !== undefined
        return byProject && byBlock && byYear
    })
})

const groupedFilteredItems = computed(() => {
    const getGroupKey = (ev) => {
        const byBlockCode = ev.blockCode || ev.blockShort
        if (byBlockCode) return String(byBlockCode)
        if (ev.block) return String(ev.block)
        if (typeof ev.code === 'string' && ev.code.includes('.')) return ev.code.split('.')[0]
        if (typeof ev.code !== 'undefined') return String(ev.code)
        return '—'
    }

    const groupsMap = new Map()
    for (const ev of filteredItems.value) {
        const key = getGroupKey(ev)
        if (!groupsMap.has(key)) {
            groupsMap.set(key, { key, items: [] })
        }
        groupsMap.get(key).items.push(ev)
    }

    const result = []
    for (const [key, group] of groupsMap.entries()) {
        let topEvent = null
        const events = []
        for (const ev of group.items) {
            const isHeader = !!ev.isBlockHeader || (typeof ev.code === 'string' && ev.code === key)
            if (!topEvent && isHeader) {
                topEvent = ev
            } else {
                events.push(ev)
            }
        }
        const blockName = topEvent?.block || group.items[0]?.block || null
        const blockDesc = topEvent?.results || topEvent?.name || null
        const blockCode = key
        result.push({ key, blockName, blockCode, blockDesc, topEvent, events })
    }
    return result
})

const durationRange = (ev) => {
    const keys = Object.keys(ev.values || {}).map((k) => Number(k)).filter((n) => !Number.isNaN(n))
    if (keys.length) {
        return `${Math.min(...keys)} — ${Math.max(...keys)}`
    }
    return `${headerYears[0]} — ${headerYears[headerYears.length - 1]}`
}

// Вспомогательное: диапазон лет по объекту
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


