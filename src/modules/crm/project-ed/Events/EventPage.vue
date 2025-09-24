<template>
    <div class="page-container">
        <HeaderBar />
        <Breadcrumbs :items="breadcrumbItems" class="mt-3" />
        <div class="page-content">
            <div class="d-flex align-items-start justify-content-between mb-2">
                <div>
                    <h3 class="mb-1">{{ titleText }}</h3>
                    <div class="text-muted" v-if="eventData?.block_code">
                        Блок мероприятий: <router-link :to="{ name: 'ProjectEdEventBlock', params: { id: eventData.block } }">{{ eventData.block_code }}</router-link>
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
                <div class="row g-3">
                    <div class="col-12 col-md-6">
                        <div class="mb-2"><strong>Код</strong></div>
                        <div>{{ eventData?.code || '—' }}</div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="mb-2"><strong>Период</strong></div>
                        <div>{{ yearsDisplay }}</div>
                    </div>
                    <div class="col-12">
                        <div class="mb-2"><strong>Наименование</strong></div>
                        <div>{{ eventData?.name || '—' }}</div>
                    </div>
                    <div class="col-12">
                        <div class="mb-2"><strong>Основные результаты</strong></div>
                        <div class="text-prewrap">{{ eventData?.results || '—' }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { Home, Wrench, Target } from 'lucide-vue-next'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const route = useRoute()
const toast = useToast()

const eventId = computed(() => route.params.id)
const isLoading = ref(false)
const eventData = ref(null)

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } },
    { label: 'Программа развития БГТУ', icon: Target, to: { name: 'ProjectEdProgramDevelopment' } },
    { label: 'Мероприятие' }
])

const titleText = computed(() => {
    const code = eventData.value?.code
    const name = eventData.value?.name
    if (!code && !name) return 'Мероприятие'
    return code ? `${code}. ${name || ''}` : (name || 'Мероприятие')
})

const yearsDisplay = computed(() => {
    const s = eventData.value?.start_year
    const e = eventData.value?.end_year
    if (!s && !e) return '—'
    if (s && e) return `${s} — ${e}`
    return s || e || '—'
})

onMounted(async () => {
    await loadEvent()
})

async function loadEvent() {
    if (!eventId.value) return
    isLoading.value = true
    try {
        const resp = await apiClient.get(endpoints.project_ed.events.detail(eventId.value))
        eventData.value = resp.data || null

        const last = breadcrumbItems.value[breadcrumbItems.value.length - 1]
        if (last) last.label = `Мероприятие ${eventData.value?.code || ''}`.trim()

        // Добавляем ссылку на блок мероприятий в хлебные крошки (перед последним элементом)
        const blockId = eventData.value?.block
        let blockCode = eventData.value?.block_code
        // Если код блока отсутствует в ответе мероприятия, попробуем подтянуть из API блока
        if (blockId && !blockCode) {
            try {
                const blockResp = await apiClient.get(endpoints.project_ed.event_blocks.detail(blockId))
                blockCode = blockResp.data?.code || ''
                // сохраняем в объекте мероприятия для дальнейшего использования в шаблоне
                if (blockCode) {
                    eventData.value.block_code = blockCode
                }
            } catch (_) {}
        }
        if (blockId) {
            const blockCrumb = {
                label: `Блок мероприятий ${blockCode || ''}`.trim(),
                to: { name: 'ProjectEdEventBlock', params: { id: blockId } }
            }
            // Вставляем на позицию перед последним элементом, если еще не вставляли
            const insertIndex = Math.max(breadcrumbItems.value.length - 1, 0)
            const exists = breadcrumbItems.value.some(c => c.to?.name === 'ProjectEdEventBlock' && c.to?.params?.id === blockId)
            if (!exists) breadcrumbItems.value.splice(insertIndex, 0, blockCrumb)
        }
    } catch (error) {
        const apiMsg = error?.response?.data?.detail
            || (typeof error?.response?.data === 'string' ? error.response.data : null)
            || (error?.response?.data && JSON.stringify(error.response.data))
            || error?.message
            || 'Неизвестная ошибка'
        toast.error(`Ошибка загрузки мероприятия: ${apiMsg}`)
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped lang="scss">
.page-container { display: flex; flex-direction: column; height: 100%; }
.page-content { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
.text-prewrap { white-space: pre-wrap; }
</style>