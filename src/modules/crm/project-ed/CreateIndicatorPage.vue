<template>
    <div class="modal-form-container">
        <div class="p-4">
            <form @submit.prevent="saveIndicator">
                <div class="row">
                            <!-- Категория (обязательно) -->
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Категория показателя <span class="text-danger">*</span></label>
                                <select 
                                    class="form-select" 
                                    v-model="formData.categoryId"
                                    @change="onCategoryChange"
                                    required
                                >
                                    <option value="">Выберите категорию</option>
                                    <option 
                                        v-for="category in categories" 
                                        :key="category.id" 
                                        :value="category.id"
                                    >
                                        {{ category.name }}
                                    </option>
                                </select>
                                <div v-if="errors.categoryId" class="error-message">
                                    {{ errors.categoryId }}
                                </div>
                            </div>

                            <!-- Подкатегория (необязательно) -->
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Подкатегория показателя</label>
                                <select 
                                    class="form-select" 
                                    v-model="formData.subcategoryId"
                                    @change="onSubcategoryChange"
                                    :disabled="!formData.categoryId"
                                >
                                    <option value="">Не указана</option>
                                    <option 
                                        v-for="subcategory in subcategories" 
                                        :key="subcategory.id" 
                                        :value="subcategory.id"
                                    >
                                        {{ subcategory.name }}
                                    </option>
                                </select>
                            </div>

                            <!-- Название показателя -->
                            <div class="col-12 mb-3">
                                <label class="form-label">Название показателя <span class="text-danger">*</span></label>
                                <textarea 
                                    class="form-control" 
                                    v-model="formData.name"
                                    required
                                    placeholder="Введите название показателя"
                                    rows="3"
                                    style="resize: vertical; min-height: 60px;"
                                ></textarea>
                                <div v-if="errors.name" class="error-message">
                                    {{ errors.name }}
                                </div>
                            </div>

                            <!-- Единица измерения -->
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Единица измерения <span class="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="formData.unit"
                                    required
                                    placeholder="шт., %, руб. и т.д."
                                >
                                <div v-if="errors.unit" class="error-message">
                                    {{ errors.unit }}
                                </div>
                            </div>

                            <!-- Блок мероприятий -->
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Блок мероприятий <span class="text-danger">*</span></label>
                                <select 
                                    class="form-select" 
                                    v-model="formData.eventBlockId"
                                    required
                                    :disabled="!formData.categoryId"
                                >
                                    <option value="">Выберите блок мероприятий</option>
                                    <option 
                                        v-for="block in eventBlocks" 
                                        :key="block.id" 
                                        :value="block.id"
                                    >
                                        {{ block.code }}
                                    </option>
                                </select>
                                <div v-if="errors.eventBlockId" class="error-message">
                                    {{ errors.eventBlockId }}
                                </div>
                            </div>

                            <!-- Ответственный -->
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Ответственный <span class="text-danger">*</span></label>
                                <div class="responsible-dropdown-wrapper" ref="responsibleDropdownRef">
                                    <div 
                                        class="responsible-select-trigger"
                                        @click="toggleResponsibleDropdown"
                                        :class="{ 'is-open': isResponsibleDropdownOpen }"
                                    >
                                        <div v-if="getSelectedResponsible()" class="responsible-selected">
                                            <DefaultAvatar
                                                :size="'small'"
                                                :title="getSelectedResponsible().name"
                                            />
                                            <div class="responsible-info">
                                                <div class="responsible-name responsible-name--selected">{{ getSelectedResponsible().name }}</div>
                                            </div>
                                        </div>
                                        <div v-else class="responsible-placeholder">
                                            Выберите ответственного
                                        </div>
                                        <div class="select-arrow" :class="{ 'rotated': isResponsibleDropdownOpen }">
                                            <ChevronDown :size="16" />
                                        </div>
                                    </div>
                                    
                                    <div v-if="isResponsibleDropdownOpen" class="responsible-dropdown-list">
                                        <div 
                                            v-for="person in users" 
                                            :key="person.id" 
                                            class="responsible-dropdown-item"
                                            :class="{ 'selected': person.id === formData.responsibleId }"
                                            @click="selectResponsible(person)"
                                        >
                                            <DefaultAvatar
                                                :size="'medium'"
                                                :title="person.name"
                                            />
                                            <div class="responsible-info">
                                                <div class="responsible-name">{{ person.name }}</div>
                                                <div class="responsible-position">{{ person.position }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="errors.responsible" class="error-message">
                                    {{ errors.responsible }}
                                </div>
                            </div>

                            <!-- Значения по годам -->
                            <div class="col-12 mb-3">
                                <label class="form-label">Значения показателя по годам <span class="text-danger">*</span></label>
                                <div class="row">
                                    <div 
                                        v-for="year in years" 
                                        :key="year" 
                                        class="col-md-2 col-sm-3 col-4 mb-2"
                                    >
                                        <label class="form-label small">{{ year }} год</label>
                                        <input 
                                            type="number" 
                                            class="form-control form-control-sm" 
                                            v-model="formData.values[year]"
                                            step="0.0001"
                                            :placeholder="year"
                                        >
                                    </div>
                                </div>
                                <div v-if="errors.values" class="error-message">
                                    {{ errors.values }}
                                </div>
                            </div>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" class="btn btn-secondary" @click="cancel">
                        Отмена
                    </button>
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        {{ props.editingIndicator ? 'Сохранить изменения' : 'Создать показатель' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue'
import { useToast } from 'vue-toastification'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import { ChevronDown } from 'lucide-vue-next'
import DefaultAvatar from '@/components/DefaultAvatar.vue'

const props = defineProps({
    editingIndicator: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['saved', 'cancelled'])

const toast = useToast()

const loading = ref(false)

// Состояние для выпадающего списка ответственного
const isResponsibleDropdownOpen = ref(false)
const responsibleDropdownRef = ref(null)

// Данные формы
const formData = ref({
    categoryId: '',
    subcategoryId: '',
    name: '',
    unit: '',
    eventBlockId: '',
    responsibleId: '',
    values: {}
})

// Списки данных
const categories = ref([])
const subcategories = ref([])
const eventBlocks = ref([])
const users = ref([])

// Ошибки валидации
const errors = ref({})

// Годы с 2023 по 2032
const years = ref([2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032])

// Инициализация значений по годам
const initializeValues = () => {
    years.value.forEach(year => {
        if (!formData.value.values[year]) {
            formData.value.values[year] = ''
        }
    })
}

// Загрузка категорий
const loadCategories = async () => {
    try {
        const response = await apiClient.get(endpoints.project_ed.categories.list)
        if (response.success) {
            categories.value = response.data
        } else {
            console.error('Ошибка загрузки категорий:', response.message)
            toast.error('Ошибка загрузки категорий')
        }
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error)
        toast.error('Ошибка загрузки категорий')
    }
}

// Загрузка подкатегорий
const loadSubcategories = async (categoryId) => {
    if (!categoryId) {
        subcategories.value = []
        return
    }
    
    try {
        const response = await apiClient.get(endpoints.project_ed.subcategories.list, { category_id: categoryId })
        if (response.success) {
            subcategories.value = response.data
        } else {
            console.error('Ошибка загрузки подкатегорий:', response.message)
            toast.error('Ошибка загрузки подкатегорий')
        }
    } catch (error) {
        console.error('Ошибка загрузки подкатегорий:', error)
        toast.error('Ошибка загрузки подкатегорий')
    }
}

// Загрузка блоков мероприятий
const loadEventBlocks = async (categoryId, subcategoryId = null) => {
    try {
        const params = {}
        
        if (categoryId) {
            params.category_id = categoryId
        }
        if (subcategoryId) {
            params.subcategory_id = subcategoryId
        }
        
        const response = await apiClient.get(endpoints.project_ed.event_blocks.list, params)
        if (response.success) {
            eventBlocks.value = response.data
            console.log('Загружены блоки мероприятий:', response.data)
        } else {
            console.error('Ошибка загрузки блоков мероприятий:', response.message)
            toast.error('Ошибка загрузки блоков мероприятий')
        }
    } catch (error) {
        console.error('Ошибка загрузки блоков мероприятий:', error)
        toast.error('Ошибка загрузки блоков мероприятий')
    }
}

// Загрузка пользователей с должностью "Проректор"
const loadUsers = async () => {
    try {
        const resp = await apiClient.get('project_ed/profiles/profiles/', { position: 'Проректор' })
        if (resp && resp.success) {
            users.value = (resp.data || []).map(u => ({
                id: u.id,
                name: [u.last_name, u.first_name].filter(Boolean).join(' ') || u.username,
                position: u.position_name || 'Должность не указана'
            }))
        } else if (resp && Array.isArray(resp)) { // на случай, если apiClient возвращает массив напрямую
            users.value = resp.map(u => ({
                id: u.id,
                name: [u.last_name, u.first_name].filter(Boolean).join(' ') || u.username,
                position: u.position_name || 'Должность не указана'
            }))
        } else {
            users.value = []
        }
    } catch (e) {
        console.error('Ошибка загрузки пользователей-проректоров', e)
        users.value = []
    }
}

// Обработчики изменений
const onCategoryChange = () => {
    formData.value.subcategoryId = ''
    formData.value.eventBlockId = ''
    loadSubcategories(formData.value.categoryId)
    loadEventBlocks(formData.value.categoryId)
}

const onSubcategoryChange = () => {
    formData.value.eventBlockId = ''
    loadEventBlocks(formData.value.categoryId, formData.value.subcategoryId)
}

// Функции для управления выпадающим списком ответственного
const toggleResponsibleDropdown = () => {
    isResponsibleDropdownOpen.value = !isResponsibleDropdownOpen.value
}

const selectResponsible = (person) => {
    formData.value.responsibleId = person.id
    isResponsibleDropdownOpen.value = false
}

const getSelectedResponsible = () => {
    return users.value.find(person => person.id === formData.value.responsibleId)
}

const closeResponsibleDropdown = () => {
    isResponsibleDropdownOpen.value = false
}

// Глобальный обработчик клика вне выпадающих списков
const handleClickOutside = (event) => {
    if (responsibleDropdownRef.value && !responsibleDropdownRef.value.contains(event.target)) {
        closeResponsibleDropdown()
    }
}

// Сохранение показателя
const saveIndicator = async () => {
    if (!validateForm()) {
        return
    }

    loading.value = true
    
    try {
        const data = {
            ...formData.value,
            project_id: 1, // Временное решение
            values_by_year: formData.value.values
        }

        const endpoint = props.editingIndicator 
            ? endpoints.project_ed.target_indicators.update(props.editingIndicator.id)
            : endpoints.project_ed.target_indicators.create
        
        const response = props.editingIndicator 
            ? await apiClient.put(endpoint, data)
            : await apiClient.post(endpoint, data)

        if (response.success) {
            // Восстанавливаем прокрутку после успешного сохранения
            document.body.style.overflow = 'auto'
            toast.success(props.editingIndicator ? 'Показатель обновлен' : 'Показатель создан')
            emit('saved', response.data)
        } else {
            toast.error(response.message || 'Ошибка сохранения')
        }
    } catch (error) {
        console.error('Ошибка сохранения:', error)
        toast.error('Ошибка сохранения показателя')
    } finally {
        loading.value = false
    }
}

// Валидация формы
const validateForm = () => {
    errors.value = {}
    
    if (!formData.value.categoryId) {
        errors.value.categoryId = 'Выберите категорию'
    }
    if (!formData.value.name) {
        errors.value.name = 'Введите название показателя'
    }
    if (!formData.value.unit) {
        errors.value.unit = 'Введите единицу измерения'
    }
    if (!formData.value.eventBlockId) {
        errors.value.eventBlockId = 'Выберите блок мероприятий'
    }
    if (!formData.value.responsibleId) {
        errors.value.responsible = 'Выберите ответственного'
    }
    
    // Проверяем, что хотя бы одно значение по годам заполнено
    const hasValues = Object.values(formData.value.values).some(value => value !== '')
    if (!hasValues) {
        errors.value.values = 'Заполните хотя бы одно значение по годам'
    }
    
    return Object.keys(errors.value).length === 0
}

// Отмена
const cancel = () => {
    // Восстанавливаем прокрутку перед закрытием
    document.body.style.overflow = 'auto'
    emit('cancelled')
}

// Загрузка данных для редактирования
const loadIndicatorForEdit = async (indicator) => {
    if (!indicator) return
    
    formData.value = {
        categoryId: indicator.category?.id || '',
        subcategoryId: indicator.subcategory?.id || '',
        name: indicator.name,
        unit: indicator.unit,
        eventBlockId: indicator.event_block?.id || '',
        responsibleId: indicator.responsible?.id || '',
        values: indicator.values_by_year || {}
    }
    
    // Загружаем связанные данные
    if (indicator.category) {
        await loadSubcategories(indicator.category.id)
        await loadEventBlocks(indicator.category.id, indicator.subcategory?.id)
    }
}

onMounted(async () => {
    // Запрещаем прокрутку основной страницы
    document.body.style.overflow = 'hidden'
    
    initializeValues()
    await loadCategories()
    await loadUsers()
    
    // Если это редактирование, загружаем данные показателя
    if (props.editingIndicator) {
        await loadIndicatorForEdit(props.editingIndicator)
    }
    
    // Обработчик клика вне выпадающего списка
    document.addEventListener('click', handleClickOutside)
})

// Восстанавливаем прокрутку при размонтировании компонента
onUnmounted(() => {
    document.body.style.overflow = 'auto'
    // Удаляем обработчик клика вне выпадающего списка
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.modal-form-container {
    max-height: 80vh;
    overflow-y: auto;
}

.form-label.small {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.spinner-border-sm {
    width: 1rem;
    height: 1rem;
}

// Стили для кастомного выпадающего списка ответственного
.responsible-dropdown-wrapper {
    position: relative;
    width: 100%;
}

.responsible-select-trigger {
    width: 100%;
    padding: 0.375rem 0.75rem; // Стандартный padding Bootstrap для form-control
    border: 1px solid #ced4da; // Стандартная граница Bootstrap
    border-radius: 0.375rem; // Стандартный border-radius Bootstrap
    font-size: 1rem;
    transition: all 0.15s ease-in-out; // Стандартная анимация Bootstrap
    background: var(--color-secondary-background);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 38px; // Стандартная высота Bootstrap form-control
    
    &:hover {
        border-color: #86b7fe;
    }
    
    &:focus {
        outline: 0;
        border-color: #86b7fe;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
    
    &.is-open {
        border-color: #86b7fe;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
}

.responsible-selected {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
}

.responsible-placeholder {
    color: #6c757d;
    flex: 1;
}

.responsible-info {
    flex: 1;
    min-width: 0;
}

.responsible-name {
    font-weight: 500;
    color: #212529;
    font-size: 0.875rem;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    &--selected {
        font-weight: 600;
    }
}


.responsible-dropdown-list {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: white;
    border: 2px solid #0d6efd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
}

.responsible-dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid #e9ecef;
    position: relative;
    
    &:last-child {
        border-bottom: none;
    }
    
    &:hover {
        background-color: #f8f9fa;
    }
    
    &:active {
        background-color: #e9ecef;
    }
    
    &.selected {
        background-color: #e7f3ff;
    }
    
    .responsible-name {
        font-size: 0.95rem;
        line-height: 1.2;
    }
    
    .responsible-position {
        font-size: 0.8rem;
        line-height: 1.2;
        margin-top: 0.125rem;
    }
}


.select-arrow {
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &.rotated {
        transform: rotate(180deg);
    }
}

.error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
}
</style>
