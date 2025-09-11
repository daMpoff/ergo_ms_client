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
                <div class="col-6 col-lg-3">
                    <label class="form-label mb-1">Срок реализации</label>
                    <select class="form-select" v-model="filters.year">
                        <option :value="null">Все</option>
                        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                    </select>
                </div>
                <div class="col-6 col-lg-4">
                    <label class="form-label mb-1">Категория</label>
                    <select class="form-select" v-model="filters.category">
                        <option :value="null">Все</option>
                        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Шапка таблицы по стилю ProjectTable -->
        <div class="table-card">
            <div class="table-header row g-2 align-items-center">
                <div class="col-4 col-lg-4"><div class="th">Наименование целевого показателя</div></div>
                <div class="col-2 col-lg-2"><div class="th text-center">Единица измерения</div></div>
                <div class="col-2 col-lg-2"><div class="th text-center">Блок мероприятий</div></div>
                <div class="col-2 col-lg-2"><div class="th text-center">Срок реализации</div></div>
                <div class="col-2 col-lg-2"><div class="th text-center">Категория</div></div>
            </div>

            <div
                v-for="ev in filteredItems"
                :key="ev.id"
                class="table-row row g-2 align-items-stretch"
            >
                <div class="col-4 col-lg-4">
                    <div class="cell text-truncate" :title="ev.kpiName">{{ ev.kpiName }}</div>
                </div>
                <div class="col-2 col-lg-2">
                    <div class="cell text-center">{{ ev.unit }}</div>
                </div>
                <div class="col-2 col-lg-2">
                    <div class="cell text-center">{{ ev.block }}</div>
                </div>
                <div class="col-2 col-lg-2">
                    <div class="cell text-center">{{ durationRange(ev) }}</div>
                </div>
                <div class="col-2 col-lg-2">
                    <div class="cell text-center">{{ ev.category }}</div>
                </div>
            </div>

            <div v-if="!filteredItems.length" class="empty-hint">
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
})

const projects = computed(() => props.projects)
const categories = computed(() => props.categories)

const [startYear, endYear] = props.yearsRange
const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
const headerYears = years

const filters = ref({ projectId: null, year: null, category: null })

const durationRange = (ev) => {
    const keys = Object.keys(ev.values || {}).map((k) => Number(k)).filter((n) => !Number.isNaN(n))
    if (keys.length) {
        return `${Math.min(...keys)} — ${Math.max(...keys)}`
    }
    return `${headerYears[0]} — ${headerYears[headerYears.length - 1]}`
}

const filteredItems = computed(() => {
    return props.items.filter((ev) => {
        const byProject = !filters.value.projectId || ev.projectId === filters.value.projectId
        const byCategory = !filters.value.category || ev.category === filters.value.category
        const byYear = !filters.value.year || ev.values?.[filters.value.year] !== undefined
        return byProject && byCategory && byYear
    })
})
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
.cell {
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    padding: .5rem .75rem;
    border-radius: .5rem;
    background-color: var(--bs-secondary-bg, #f8f9fa);
    border: 1px solid var(--bs-border-color, #dee2e6);
}
.cell.text-center { justify-content: center; text-align: center; }
.empty-hint { padding: 1rem; text-align: center; color: var(--color-secondary-text); }
.filters.card { background-color: var(--color-primary-background); border-color: var(--bs-border-color, #dee2e6); }
.years-th span { font-weight: 600; }
</style>