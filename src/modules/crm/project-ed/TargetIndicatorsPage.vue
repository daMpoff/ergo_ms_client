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
                                        <th style="width: 60px;">№</th>
                                        <th>Наименование показателя</th>
                                        <th style="width: 150px;">Единица измерения</th>
                                        <th style="width: 120px;">Плановое значение</th>
                                        <th style="width: 120px;">Фактическое значение</th>
                                        <th style="width: 100px;">Отклонение, %</th>
                                        <th style="width: 120px;">Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(indicator, index) in indicators" :key="indicator.id">
                                        <td class="text-muted">{{ index + 1 }}</td>
                                        <td>
                                            <div class="fw-medium">{{ indicator.name }}</div>
                                            <small class="text-muted">{{ indicator.description }}</small>
                                        </td>
                                        <td>{{ indicator.unit }}</td>
                                        <td>{{ indicator.plannedValue }}</td>
                                        <td>
                                            <span :class="getDeviationClass(indicator.deviation)">
                                                {{ indicator.actualValue }}
                                            </span>
                                        </td>
                                        <td>
                                            <span :class="getDeviationClass(indicator.deviation)">
                                                {{ indicator.deviation }}%
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary" @click="editIndicator(indicator)">
                                                    <Edit :size="14" />
                                                </button>
                                                <button class="btn btn-outline-danger" @click="deleteIndicator(indicator.id)">
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
            </div>

            <!-- Вкладка "Категории показателей" -->
            <div v-if="activeTab === 'categories'">
                <CategoriesIndicators ref="categoriesComponent" />
            </div>
        </div>

        <!-- Модальное окно создания/редактирования показателя -->
        <div class="modal fade" :class="{ 'show d-block': showModal }" tabindex="-1" v-if="showModal">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            {{ editingIndicator ? 'Редактировать показатель' : 'Добавить показатель' }}
                        </h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="saveIndicator">
                            <div class="row">
                                <div class="col-12 mb-3">
                                    <label class="form-label">Наименование показателя *</label>
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        v-model="formData.name"
                                        required
                                        placeholder="Введите наименование показателя"
                                    >
                                </div>
                                <div class="col-12 mb-3">
                                    <label class="form-label">Описание</label>
                                    <textarea 
                                        class="form-control" 
                                        v-model="formData.description"
                                        rows="2"
                                        placeholder="Введите описание показателя"
                                    ></textarea>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Единица измерения *</label>
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        v-model="formData.unit"
                                        required
                                        placeholder="шт., %, руб. и т.д."
                                    >
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Плановое значение *</label>
                                    <input 
                                        type="number" 
                                        class="form-control" 
                                        v-model="formData.plannedValue"
                                        required
                                        step="0.01"
                                        placeholder="0"
                                    >
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Фактическое значение</label>
                                    <input 
                                        type="number" 
                                        class="form-control" 
                                        v-model="formData.actualValue"
                                        step="0.01"
                                        placeholder="0"
                                    >
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Отклонение, %</label>
                                    <input 
                                        type="number" 
                                        class="form-control" 
                                        v-model="formData.deviation"
                                        step="0.01"
                                        placeholder="0"
                                        readonly
                                    >
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Отмена</button>
                        <button type="button" class="btn btn-primary" @click="saveIndicator">
                            {{ editingIndicator ? 'Сохранить изменения' : 'Создать показатель' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade" :class="{ 'show': showModal }" v-if="showModal"></div>

    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Home, Target, Plus, Edit, Trash2, Wrench, Layers2 } from 'lucide-vue-next'
import Breadcrumbs from './components/Breadcrumbs.vue'
import CategoriesIndicators from './components/CategoriesIndicators.vue'

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } },
    { label: 'Целевые показатели', icon: Target }
])

const showModal = ref(false)
const editingIndicator = ref(null)
const activeTab = ref('indicators')
const categoriesComponent = ref(null)
const indicators = ref([
    {
        id: 1,
        name: 'Количество студентов',
        description: 'Общее количество обучающихся в университете',
        unit: 'чел.',
        plannedValue: 15000,
        actualValue: 14850,
        deviation: -1.0
    },
    {
        id: 2,
        name: 'Процент трудоустройства',
        description: 'Доля выпускников, трудоустроенных в течение года после выпуска',
        unit: '%',
        plannedValue: 85,
        actualValue: 87.5,
        deviation: 2.9
    },
    {
        id: 3,
        name: 'Объем НИОКР',
        description: 'Объем научно-исследовательских и опытно-конструкторских работ',
        unit: 'млн руб.',
        plannedValue: 500,
        actualValue: 520,
        deviation: 4.0
    }
])

const formData = ref({
    name: '',
    description: '',
    unit: '',
    plannedValue: 0,
    actualValue: 0,
    deviation: 0
})


// Вычисляемое свойство для определения класса отклонения
const getDeviationClass = (deviation) => {
    if (deviation > 0) return 'text-success'
    if (deviation < 0) return 'text-danger'
    return 'text-muted'
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
    formData.value = {
        name: '',
        description: '',
        unit: '',
        plannedValue: 0,
        actualValue: 0,
        deviation: 0
    }
    showModal.value = true
}

// Открытие модального окна для редактирования
const editIndicator = (indicator) => {
    editingIndicator.value = indicator
    formData.value = { ...indicator }
    showModal.value = true
}

// Закрытие модального окна
const closeModal = () => {
    showModal.value = false
    editingIndicator.value = null
}


// Сохранение показателя
const saveIndicator = () => {
    if (!formData.value.name || !formData.value.unit || formData.value.plannedValue === '') {
        return
    }

    if (editingIndicator.value) {
        // Редактирование существующего показателя
        const index = indicators.value.findIndex(i => i.id === editingIndicator.value.id)
        if (index !== -1) {
            indicators.value[index] = { ...formData.value }
        }
    } else {
        // Создание нового показателя
        const newIndicator = {
            ...formData.value,
            id: Date.now()
        }
        indicators.value.push(newIndicator)
    }

    closeModal()
}

// Удаление показателя
const deleteIndicator = (id) => {
    if (confirm('Вы уверены, что хотите удалить этот показатель?')) {
        indicators.value = indicators.value.filter(i => i.id !== id)
    }
}

// Автоматический расчет отклонения при изменении фактического значения
watch(() => formData.value.actualValue, (newValue) => {
    if (formData.value.plannedValue && newValue !== '') {
        const planned = parseFloat(formData.value.plannedValue)
        const actual = parseFloat(newValue)
        if (planned !== 0) {
            formData.value.deviation = ((actual - planned) / planned * 100).toFixed(1)
        }
    }
})
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

.btn-group-sm > .btn {
    padding: 0.25rem 0.5rem;
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
</style>
