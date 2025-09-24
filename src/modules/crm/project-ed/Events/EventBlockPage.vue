<template>
    <div class="page-container">
        <HeaderBar />
        <Breadcrumbs :items="breadcrumbItems" class="mt-3" />
        <div class="page-content">
            <div class="d-flex align-items-start justify-content-between mb-2">
                <div>
                    <h3 class="mb-1">{{ blockTitle || 'Блок мероприятий' }}</h3>
                    <div v-if="blockData?.category_name || blockData?.subcategory_name" class="mt-1">
                        <span v-if="blockData?.category_name" class="badge bg-primary me-2">{{ blockData.category_name }}</span>
                        <span v-if="blockData?.subcategory_name" class="badge bg-secondary">{{ blockData.subcategory_name }}</span>
                    </div>
                </div>
            </div>

            <div v-if="isLoading" class="card p-4 text-center">
                <div class="d-flex flex-column align-items-center justify-content-center my-2">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                    <h5 class="mb-1">Загрузка данных...</h5>
                </div>
            </div>

            <div v-else class="card p-3">

                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th style="width: 140px;">Код</th>
                                <th>Наименование мероприятия</th>
                                <th style="width: 180px;">Срок реализации (годы)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="events.length === 0">
                                <td colspan="4" class="text-center text-muted py-4">Здесь еще пока нет мероприятий</td>
                            </tr>
                            <tr v-for="ev in events" :key="ev.id || ev.code" class="table-row-link" @click="openEvent(ev)">
                                <td>{{ ev.code || '—' }}</td>
                                <td>{{ ev.name || '—' }}</td>
                                <td>{{ ev.years_display || formatYears(ev.start_year, ev.end_year) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { Home, Wrench, Target } from 'lucide-vue-next'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const blockId = computed(() => route.params.id)
const isLoading = ref(false)
const blockData = ref(null)
const events = ref([])

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } },
    { label: 'Программа развития БГТУ', icon: Target, to: { name: 'ProjectEdProgramDevelopment' } },
    { label: 'Блок мероприятий' }
])

const blockTitle = computed(() => {
    const code = blockData.value?.code
    const title = blockData.value?.title
    if (!code && !title) return ''
    return code ? `${code}. ${title || ''}` : (title || '')
})

onMounted(async () => {
    await loadBlock()
})

async function loadBlock() {
    if (!blockId.value) return
    isLoading.value = true
    try {
        const [blockResp, eventsResp] = await Promise.all([
            apiClient.get(endpoints.project_ed.event_blocks.detail(blockId.value)),
            apiClient.get(endpoints.project_ed.event_blocks.events(blockId.value))
        ])
        blockData.value = blockResp.data || null
        events.value = Array.isArray(eventsResp.data) ? eventsResp.data : (eventsResp.data?.results || [])

        // Обновляем последний элемент хлебных крошек: "Блок мероприятий КОД"
        const last = breadcrumbItems.value[breadcrumbItems.value.length - 1]
        if (last) {
            const code = blockData.value?.code
            last.label = code ? `Блок мероприятий ${code}` : 'Блок мероприятий'
        }
    } catch (error) {
        const apiMsg = error?.response?.data?.detail
            || (typeof error?.response?.data === 'string' ? error.response.data : null)
            || (error?.response?.data && JSON.stringify(error.response.data))
            || error?.message
            || 'Неизвестная ошибка'
        toast.error(`Ошибка загрузки блока: ${apiMsg}`)
    } finally {
        isLoading.value = false
    }
}

function formatYears(start, end) {
    if (!start && !end) return '—'
    if (start && end) return `${start} — ${end}`
    return start || end || '—'
}

function openEvent(ev) {
    if (!ev || !ev.id) return
    router.push({ name: 'ProjectEdEvent', params: { id: ev.id } })
}
</script>

<style scoped lang="scss">
.page-container { display: flex; flex-direction: column; height: 100%; }
.page-content { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
.table-row-link { cursor: pointer; transition: background-color .15s ease; }
.table-row-link:hover { background-color: var(--color-hover-background, #f8f9fa); }
</style>