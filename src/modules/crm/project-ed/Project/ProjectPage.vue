<template>
    <div class="container">
        <HeaderBar />
        <Breadcrumbs :items="breadcrumbItems" class="mt-3" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import { Home, List, FileText } from 'lucide-vue-next'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import { slugify as translitSlugify } from 'transliteration'

const route = useRoute()

const projectTitle = ref('Проект')

const breadcrumbItems = computed(() => ([
    { label: 'Главная', to: '/crm/project-ed/main', icon: Home },
    { label: 'Мои проекты', to: '/crm/project-ed/my-projects', icon: List },
    { label: projectTitle.value, icon: FileText }
]))

onMounted(async () => {
    const slug = route.params?.slug
    if (!slug) return
    try {
        // 1) получить список моих проектов
        const resp = await apiClient.get(endpoints.project_ed.projects.list)
        const list = Array.isArray(resp.data) ? resp.data : (resp.data?.results || [])
        // 2) найти проект по сгенерированному слагу из названия
        const match = list.find((p) => {
            const name = p?.name || p?.short_name || ''
            return translitSlugify(name).toLowerCase() === slug
        })
        if (!match?.id) return
        // 3) получить детальную карточку по id (источник истины)
        const { data } = await apiClient.get(endpoints.project_ed.projects.detail(match.id))
        const baseTitle = data?.short_name || data?.name || 'Проект'
        const clarification = data?.name_clarification ? ` ${data.name_clarification}` : ''
        projectTitle.value = `${baseTitle}${clarification}`
    } catch (e) {
        // оставляем дефолтный заголовок при ошибке
    }
})
</script>

<style scoped lang="scss">
/* доп. стили не требуются */
</style>