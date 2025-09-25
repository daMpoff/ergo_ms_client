<template>
    <div class="page-container">
        <Breadcrumbs :items="breadcrumbItems" />
        <div class="page-content">
            <div class="d-flex align-items-center justify-content-between">
                <h3 class="mb-0">Целевые показатели</h3>
                <div class="d-flex gap-2">
                    <!-- Кнопка для добавления показателя (только на вкладке показателей) -->
                    <button 
                        v-if="activeTab === 'indicators'"
                        class="btn btn-primary d-flex align-items-center" 
                        @click="openCreateModal"
                    >
                        <Plus :size="18" class="me-1" />
                        Добавить показатель
                    </button>
                    <!-- Кнопка для добавления категории (только на вкладке категорий) -->
                    <button 
                        v-if="activeTab === 'categories'"
                        class="btn btn-primary d-flex align-items-center" 
                        @click="openCreateCategoryModal"
                    >
                        <Plus :size="18" class="me-1" />
                        Добавить категорию
                    </button>
                </div>
            </div>

            <!-- Переключатель страниц -->
            <div class="mb-4">
                <div class="btn-group" role="group" aria-label="Переключатели разделов показателей">
                    <button
                        type="button"
                        class="btn btn-sm d-inline-flex align-items-center"
                        :class="[
                            activeTab === 'indicators' ? 'btn-primary project-toggle' : 'btn-outline-primary project-toggle-outline',
                            { active: activeTab === 'indicators' }
                        ]"
                        @click="activeTab = 'indicators'"
                    >
                        <Target class="me-2" :size="16" />
                        <span class="d-inline-flex align-items-center">Показатели</span>
                    </button>
                    <button
                        type="button"
                        class="btn btn-sm d-inline-flex align-items-center"
                        :class="[
                            activeTab === 'categories' ? 'btn-primary project-toggle' : 'btn-outline-primary project-toggle-outline',
                            { active: activeTab === 'categories' }
                        ]"
                        @click="activeTab = 'categories'"
                    >
                        <Layers2 class="me-2" :size="16" />
                        <span class="d-inline-flex align-items-center">Категории показателей</span>
                    </button>
                </div>
            </div>

            <!-- Вкладка "Показатели" -->
            <div v-if="activeTab === 'indicators'">
                <div v-if="indicators.length === 0" class="card p-4 text-center">
                    <div class="d-flex flex-column align-items-center justify-content-center my-2">
                        <Target :size="48" class="mb-2 text-muted" />
                        <h5 class="mb-1">Пока нет целевых показателей</h5>
                        <p class="text-muted mb-3">Создайте первый целевой показатель для начала работы.</p>
                        <button class="btn btn-primary" @click="openCreateModal">Создать показатель</button>
                    </div>
                </div>

                <div v-else class="card">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th style="width: 50px;">№</th>
                                        <th style="width: 250px;">Наименование показателя</th>
                                        <th class="text-center" style="width: 100px;">Единица измерения</th>
                                        <th class="text-center" style="width: 120px;">Блок мероприятий</th>
                                        <th class="text-center" style="width: 200px;">Ответственный</th>
                                        <th style="width: 80px;">Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr 
                                        v-for="(indicator, index) in indicators" 
                                        :key="indicator.id"
                                        class="clickable-row"
                                        @click="editIndicator(indicator)"
                                    >
                                        <td class="text-muted">{{ index + 1 }}</td>
                                        <td>
                                            <div class="fw-medium">{{ indicator.name }}</div>
                                        </td>
                                        <td class="text-center">{{ indicator.unit }}</td>
                                        <td class="text-center">
                                            <div v-if="indicator.event_block_short_name" class="text-truncate" :title="indicator.event_block_short_name">
                                                {{ indicator.event_block_short_name }}
                                            </div>
                                            <div v-else class="text-muted">Не указан</div>
                                        </td>
                                        <td class="text-center">
                                            <div class="d-inline-flex align-items-center justify-content-center gap-2">
                                                <DefaultAvatar v-if="indicator.responsible_name" :size="'small'" :title="indicator.responsible_name" />
                                                <span v-if="indicator.responsible_name" class="text-truncate" :title="indicator.responsible_name">{{ indicator.responsible_name }}</span>
                                                <span v-else class="text-muted">Не указан</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary" @click.stop="editIndicator(indicator)">
                                                    <Edit :size="14" />
                                                </button>
                                                <button class="btn btn-outline-danger" @click.stop="deleteIndicator(indicator.id)">
                                                    <Trash2 :size="14" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Отдельная таблица для значений по годам -->
                <div v-if="indicators.length > 0" class="card mt-3">
                    <div class="card-header">
                        <h6 class="mb-0">Значения показателей по годам</h6>
                    </div>
                    <div class="card-body p-0">
                        <div class="years-table-container">
                            <table class="table table-hover mb-0 years-table">
                                <thead class="table-light sticky-header">
                                    <tr>
                                        <th style="width: 200px;">Показатель</th>
                                        <th v-for="year in years" :key="year" class="year-column">
                                            {{ year }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="indicator in indicators" :key="`values-${indicator.id}`">
                                        <td class="indicator-name-cell">
                                            <div class="fw-medium">{{ indicator.name }}</div>
                                            <small class="text-muted">{{ indicator.unit }}</small>
                                        </td>
                                        <td v-for="year in years" :key="`${indicator.id}-${year}`" class="year-value-cell">
                                            <div v-if="indicator.values_by_year && indicator.values_by_year[year] !== undefined && indicator.values_by_year[year] !== ''">
                                                {{ indicator.values_by_year[year] }}
                                            </div>
                                            <div v-else class="text-muted">-</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Вкладка "Категории показателей" -->
            <div v-if="activeTab === 'categories'">
                <CategoriesIndicators ref="categoriesComponent" />
            </div>
        </div>

        <!-- Модальное окно создания/редактирования показателя -->
        <div class="modal fade" :class="{ 'show d-block': showModal }" tabindex="-1" v-if="showModal">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            {{ editingIndicator ? 'Редактировать показатель' : 'Добавить показатель' }}
                        </h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body p-0">
                        <CreateIndicatorPage 
                            :editing-indicator="editingIndicator"
                            @saved="onIndicatorSaved"
                            @cancelled="closeModal"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade" :class="{ 'show': showModal }" v-if="showModal"></div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Home, Target, Plus, Edit, Trash2, Wrench, Layers2 } from 'lucide-vue-next'
import Breadcrumbs from './components/Breadcrumbs.vue'
import CategoriesIndicators from './components/CategoriesIndicators.vue'
import CreateIndicatorPage from './CreateIndicatorPage.vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import DefaultAvatar from '@/components/DefaultAvatar.vue'

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } },
    { label: 'Целевые показатели', icon: Target }
])

const showModal = ref(false)
const editingIndicator = ref(null)
const activeTab = ref('indicators')
const categoriesComponent = ref(null)

// Годы с 2023 по 2032
const years = ref([2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032])

const indicators = ref([])
async function loadIndicators() {
    try {
        const resp = await apiClient.get(endpoints.project_ed.target_indicators.list)
        indicators.value = Array.isArray(resp?.data) ? resp.data : (resp?.results || [])
    } catch (e) {
        indicators.value = []
    }
}

onMounted(async () => {
    await loadIndicators()
})




// Вычисляемое свойство для определения класса отклонения
const getDeviationClass = (deviation) => {
    if (deviation > 0) return 'text-success'
    if (deviation < 0) return 'text-danger'
    return 'text-muted'
}

// Функция для отображения ответственного
const getResponsibleDisplayText = (responsible) => {
    if (!responsible) return 'Не указан'
    
    // Если это объект с полями name и position
    if (typeof responsible === 'object' && responsible.name) {
        return `${responsible.name}, ${responsible.position}`
    }
    
    // Если это ID, нужно найти соответствующего пользователя
    if (typeof responsible === 'number') {
        // Список пользователей (должен совпадать с CreateIndicatorPage.vue)
        const users = [
            { id: 1, name: 'Сканцев Виталий Михайлович', position: 'Первый проректор', initials: 'Сканцев В.М.' },
            { id: 2, name: 'Шкаберин Виталий Александрович', position: 'Первый проректор по учебной работе и цифровизации', initials: 'Шкаберин В.А.' },
            { id: 3, name: 'Киричек Андрей Викторович', position: 'Проректор по перспективному развитию', initials: 'Киричек А.В.' },
            { id: 4, name: 'Симкин Альберт Зямович', position: 'Проректор по молодежной политике и воспитательной работе', initials: 'Симкин А.З.' },
            { id: 5, name: 'Глебов Глеб Владимирович', position: 'Проректор по АХР', initials: 'Глебов Г.В.' },
            { id: 6, name: 'Геращенкова Татьяна Михайловна', position: 'Проректор по качеству и аккредитации', initials: 'Геращенкова Т.М.' }
        ]
        
        const user = users.find(u => u.id === responsible)
        return user ? `${user.initials}, ${user.position}` : 'Не указан'
    }
    
    // Если это уже строка, возвращаем как есть
    return responsible
}

// Открытие модального окна для создания категории
const openCreateCategoryModal = () => {
    if (categoriesComponent.value) {
        categoriesComponent.value.openCreateCategoryModal()
    }
}

// Открытие модального окна для создания
const openCreateModal = () => {
    editingIndicator.value = null
    showModal.value = true
}

// Открытие модального окна для редактирования
const editIndicator = (indicator) => {
    editingIndicator.value = indicator
    showModal.value = true
}

// Закрытие модального окна
const closeModal = () => {
    showModal.value = false
    editingIndicator.value = null
}

// Обработка сохранения показателя
const onIndicatorSaved = (indicator) => {
    // После сохранения перезагружаем список с сервера (API возвращает нормализованные поля)
    loadIndicators()
    closeModal()
}

// Удаление показателя
const deleteIndicator = (id) => {
    if (confirm('Вы уверены, что хотите удалить этот показатель?')) {
        indicators.value = indicators.value.filter(i => i.id !== id)
    }
}

</script>

<style scoped lang="scss">
.page-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.page-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.modal {
    background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
    display: block !important;
}

.modal-backdrop.show {
    opacity: 0.5;
}


.table th {
    border-top: none;
    font-weight: 600;
    color: #495057;
}

/* Вертикальное выравнивание по центру для ячеек таблиц */
.table th,
.table td {
    vertical-align: middle;
}

.btn-group-sm > .btn {
    padding: 0.25rem 0.5rem;
}

/* Кликабельные строки в таблице показателей */
.clickable-row {
    cursor: pointer;
}
.clickable-row:hover {
    background-color: var(--color-hover-background, #f8f9fa);
}

.text-success {
    color: #198754 !important;
}

.text-danger {
    color: #dc3545 !important;
}

.text-muted {
    color: #6c757d !important;
}

/* Синий цвет переключателей независимо от темы */
.project-toggle {
    --bs-btn-bg: #0d6efd;
    --bs-btn-border-color: #0d6efd;
    --bs-btn-hover-bg: #0b5ed7;
    --bs-btn-hover-border-color: #0a58ca;
    --bs-btn-active-bg: #0a58ca;
    --bs-btn-active-border-color: #0a53be;
}

/* Контурная синяя для неактивной кнопки с белым фоном */
.project-toggle-outline {
    --bs-btn-color: #0d6efd;
    --bs-btn-border-color: #0d6efd;
    --bs-btn-bg: #ffffff;
    --bs-btn-hover-color: #0b5ed7;
    --bs-btn-hover-bg: #e7f1ff;
    --bs-btn-hover-border-color: #0b5ed7;
    --bs-btn-active-color: #0a58ca;
    --bs-btn-active-bg: #d6e8ff;
    --bs-btn-active-border-color: #0a58ca;
}

/* Стили для таблицы с годами */
.years-table-container {
    overflow-x: auto;
    max-width: 100%;
    border-radius: 0.375rem;
}

.years-table {
    min-width: 800px; /* Минимальная ширина для корректного отображения */
    width: 100%;
    table-layout: fixed;
}

.sticky-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f8f9fa;
}

.year-column {
    min-width: 90px;
    text-align: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: #495057;
    padding: 0.75rem 0.5rem;
    border-left: 1px solid #dee2e6;
}

.year-value-cell {
    text-align: center;
    padding: 0.5rem;
    border-left: 1px solid #dee2e6;
    min-width: 90px;
    font-size: 0.875rem;
    vertical-align: middle;
}

.indicator-name-cell {
    position: sticky;
    left: 0;
    background: white;
    z-index: 5;
    border-right: 2px solid #dee2e6;
    min-width: 220px;
    max-width: 220px;
}

/* Стили для прокрутки */
.years-table-container::-webkit-scrollbar {
    height: 8px;
}

.years-table-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.years-table-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.years-table-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>
