<template>
    <div class="container">
        <HeaderBar />
        <Breadcrumbs :items="breadcrumbItems" class="mt-3" />
        <h2 class="mt-3">{{ projectTitleHeading }}</h2>

        <!-- Полоса с переключателями страниц -->
        <div class="project-navigation mt-2">
            <nav class="nav-tabs-container">
                <div class="nav-tabs">
                    <button 
                        v-for="tab in tabs" 
                        :key="tab.id" 
                        class="nav-tab"
                        :class="{ active: activeTab === tab.id }"
                        @click="activeTab = tab.id"
                    >
                        <component :is="tab.icon" :size="16" class="tab-icon" />
                        <span class="tab-text">{{ tab.name }}</span>
                        <span v-if="tab.count !== undefined" class="tab-badge">{{ tab.count }}</span>
                    </button>
                </div>
            </nav>
        </div>
        
        <!-- Контент активной вкладки -->
        <div class="tab-content mt-3">
            <ProjectOverview v-if="activeTab === 'overview'" :project-data="projectData" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import { Home, List, FileText, BookOpen, Users, CheckSquare, Activity } from 'lucide-vue-next'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import { slugify as translitSlugify } from 'transliteration'
import ProjectOverview from '@/modules/crm/project-ed/Project/ProjectTabs/ProjectOverview.vue'

const route = useRoute()

const projectTitleHeading = ref('Проект')
const projectTitleBreadcrumb = ref('Проект')
const projectData = ref(null)

const breadcrumbItems = computed(() => ([
    { label: 'Главная', to: '/crm/project-ed/main', icon: Home },
    { label: 'Мои проекты', to: '/crm/project-ed/my-projects', icon: List },
    { label: projectTitleBreadcrumb.value, icon: FileText }
]))

// Переключатели страниц
const activeTab = ref('overview')
const tabs = ref([
    { id: 'overview', name: 'Обзор', icon: BookOpen },
    { id: 'team', name: 'Команда', icon: Users },
    { id: 'tasks', name: 'Задачи', icon: CheckSquare, count: undefined },
    { id: 'activity', name: 'Активность', icon: Activity, count: undefined },
])

onMounted(async () => {
    const slug = route.params?.slug
    const projectId = route.params?.projectId
    if (!slug && !projectId) return
    
    try {
        let projectIdToLoad = null
        
        if (projectId) {
            // Если передан прямой ID проекта, используем его
            projectIdToLoad = projectId
        } else if (slug) {
            // Если передан slug, ищем в списке проектов
            const resp = await apiClient.get(endpoints.project_ed.projects.list)
            const list = Array.isArray(resp.data) ? resp.data : (resp.data?.results || [])
            const match = list.find((p) => {
                const name = p?.name || p?.short_name || ''
                return translitSlugify(name).toLowerCase() === slug
            })
            projectIdToLoad = match?.id
        }
        
        if (!projectIdToLoad) return
        
        // Получить детальную карточку по id (источник истины)
        let projectDataLoaded = null
        
        try {
            // Сначала пробуем получить через обычный endpoint (для своих проектов)
            const { data } = await apiClient.get(endpoints.project_ed.projects.detail(projectIdToLoad))
            projectDataLoaded = data
        } catch (error) {
            try {
                // Если не получилось, пробуем через публичный endpoint (для чужих проектов)
                const { data } = await apiClient.get(endpoints.project_ed.projects.publicView(projectIdToLoad))
                projectDataLoaded = data
            } catch (publicError) {
                console.error('Failed to load project:', publicError)
                throw publicError
            }
        }
        
        if (projectDataLoaded) {
            projectData.value = projectDataLoaded
            
            // Заголовок страницы: полное название без уточнения
            const headingBase = projectDataLoaded?.name || projectDataLoaded?.short_name || 'Проект'
            projectTitleHeading.value = headingBase
            
            // Хлебные крошки: как раньше, с возможным уточнением
            const crumbBase = projectDataLoaded?.short_name || projectDataLoaded?.name || 'Проект'
            const clarification = projectDataLoaded?.name_clarification ? ` ${projectDataLoaded.name_clarification}` : ''
            projectTitleBreadcrumb.value = `${crumbBase}${clarification}`
        }
    } catch (e) {
        console.error('Ошибка загрузки данных проекта:', e)
        // оставляем дефолтный заголовок при ошибке
    }
})
</script>

<style scoped lang="scss">
/* Навигация с вкладками под заголовком */
.project-navigation {
  margin-bottom: 0.5rem;

  .nav-tabs-container {
    border-bottom: 1.5px solid var(--color-border);
    border-radius: 6px 6px 0 0;

    .nav-tabs {
      display: flex;
      padding: 0 0.5rem;

      .nav-tab {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border: none;
        background: none;
        color: #586069;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
        position: relative;

        &:hover {
          color: #0366d6; /* как в breadcrumbs */
          background-color: rgba(0, 0, 0, 0.05);
        }

        &.active {
          color: #0366d6; /* голубой цвет как в breadcrumbs */
          border-bottom-color: #0366d6;
          background-color: transparent;
        }

        .tab-icon {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .tab-text {
          white-space: nowrap;
        }

        .tab-badge {
          background-color: #6a737d;
          color: white;
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          border-radius: 10px;
          min-width: 1.25rem;
          text-align: center;
          line-height: 1.25;
        }

        &.active .tab-badge {
          background-color: #0366d6;
        }
      }
    }
  }
}
</style>