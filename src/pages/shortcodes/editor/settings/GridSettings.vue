<script setup>
import { toRefs, ref, computed, onMounted, watch } from 'vue'
import CategoryTree from '../CategoryTree.vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const props = defineProps({
    component: { type: Object, required: true }
})
const { component } = toRefs(props)

if (!component.value.extra_data) component.value.extra_data = {}

const cols = ref(component.value.extra_data.cols ?? 3)
const limit = ref(component.value.extra_data.limit ?? 6)
const categoryId = ref(component.value.extra_data.category_id ?? null)

const categories = ref([])
const categorySearch = ref('')
const selectedPath = ref([])

function buildTree(list) {
    const map = Object.fromEntries(list.map(i => [i.id, { ...i, children: [] }]))
    const roots = []
    list.forEach(i => (i.parent ? map[i.parent]?.children.push(map[i.id]) : roots.push(map[i.id])))
    return roots
}

async function fetchCategories() {
    const r = await apiClient.get(endpoints.categories.list)
    const data = Array.isArray(r.data) ? r.data : r.data.results || []
    categories.value = buildTree(data)
}

onMounted(fetchCategories)

function filterTree(nodes, q) {
    return nodes
        .map(n => {
            const hit = n.name.toLowerCase().includes(q)
            const kids = n.children ? filterTree(n.children, q) : []
            return (hit || kids.length) ? { ...n, children: kids } : null
        })
        .filter(Boolean)
}

const filteredCategories = computed(() =>
    categorySearch.value.trim() ? filterTree(categories.value, categorySearch.value.trim().toLowerCase()) : categories.value
)

function handleSelect({ category, path }) {
    categoryId.value = category.id
    selectedPath.value = path.concat([{ id: category.id, name: category.name }])
}

function resetCategory() {
    categoryId.value = null
    selectedPath.value = []
}

watch([cols, limit, categoryId], () => {
    component.value.extra_data = {
        ...component.value.extra_data,
        cols: cols.value,
        limit: limit.value,
        category_id: categoryId.value
    }
})
</script>

<template>
    <div class="settings-grid">
        <div class="mb-3">
            <label class="form-label fw-bold">Количество колонок</label>
            <input v-model.number="cols" type="number" min="1" class="form-control" />
        </div>

        <!-- Лимит -->
        <div class="mb-3">
            <label class="form-label fw-bold">Число карточек</label>
            <input v-model.number="limit" type="number" min="1" class="form-control" />
        </div>

        <!-- Категория -->
        <div class="mb-3">
            <label class="form-label fw-bold">Категория</label>

            <input v-model="categorySearch" class="form-control form-control-sm mb-2" type="text"
                placeholder="Поиск категории…" />

            <div class="border rounded bg-light p-2" style="max-height: 260px; overflow-y: auto">
                <CategoryTree :categories="filteredCategories" :selectedPath="selectedPath" @select="handleSelect" />
            </div>

            <div v-if="categoryId" class="form-text mt-1">
                Выбрано: <b>{{selectedPath.map(p => p.name).join(' → ')}}</b>
                <button class="btn btn-link btn-sm text-danger p-0 ms-2" @click="resetCategory">×</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-grid .form-label {
    font-weight: 600;
}
</style>
