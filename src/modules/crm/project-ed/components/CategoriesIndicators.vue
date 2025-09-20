<template>
    <div>
        <div v-if="categories.length === 0" class="card p-4 text-center">
            <div class="d-flex flex-column align-items-center justify-content-center my-2">
                <Target :size="48" class="mb-2 text-muted" />
                <h5 class="mb-1">Пока нет категорий показателей</h5>
                <p class="text-muted mb-3">Создайте первую категорию для группировки показателей.</p>
                <button class="btn btn-primary" @click="openCreateCategoryModal">Создать категорию</button>
            </div>
        </div>

        <div v-else class="card">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 60px;">№</th>
                                <th>Название категории/подкатегории</th>
                                <th style="width: 100px;">Показатели</th>
                                <th style="width: 50px;"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(category, index) in categories" :key="category.id">
                                <!-- Основная строка категории -->
                                <tr class="category-main-row clickable-row" @click="editCategory(category)">
                                    <td class="text-muted">{{ index + 1 }}</td>
                                    <td>
                                        <div class="category-name">{{ category.name }}</div>
                                    </td>
                                    <td class="text-center">
                                        <div 
                                            class="indicators-count" 
                                            :data-category-id="category.id"
                                            :data-count="getCategoryIndicatorsCount(category)"
                                            data-is-category="true"
                                        >
                                            <BarChart3 :size="16" class="me-1" />
                                            <span class="fw-medium indicators-number">{{ getCategoryIndicatorsCount(category) }}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button class="btn btn-outline-danger btn-sm" @click.stop="deleteCategory(category.id)" title="Удалить категорию">
                                            <Trash2 :size="14" />
                                        </button>
                                    </td>
                                </tr>
                                
                                <!-- Строки подкатегорий -->
                                <tr v-for="(subcategory, subIndex) in category.subcategories" :key="`${category.id}-sub-${subIndex}`" class="subcategory-row">
                                    <td class="text-muted">
                                        <span class="subcategory-number">{{ index + 1 }}.{{ subIndex + 1 }}</span>
                                    </td>
                                    <td>
                                        <div class="subcategory-name">
                                            {{ subcategory }}
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <div 
                                            class="indicators-count subcategory-count" 
                                            :data-category-id="category.id"
                                            :data-subcategory="subcategory"
                                            :data-count="getSubcategoryIndicatorsCount(category, subcategory)"
                                            data-is-subcategory="true"
                                        >
                                            <BarChart3 :size="14" class="me-1" />
                                            <span class="fw-medium indicators-number">{{ getSubcategoryIndicatorsCount(category, subcategory) }}</span>
                                        </div>
                                    </td>
                                    <td></td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Модальное окно создания категории -->
        <div class="modal fade" :class="{ 'show d-block': showCategoryModal }" tabindex="-1" v-if="showCategoryModal">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ editingCategory ? 'Редактировать категорию' : 'Добавить категорию' }}</h5>
                        <button type="button" class="btn-close" @click="closeCategoryModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="saveCategory">
                            <div class="mb-3">
                                <label class="form-label">Название категории *</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="categoryFormData.name"
                                    required
                                    placeholder="Введите название категории"
                                >
                            </div>
                            <div class="mb-3">
                                <div class="form-check">
                                    <input 
                                        class="form-check-input" 
                                        type="checkbox" 
                                        v-model="categoryFormData.hasSubcategories"
                                        id="hasSubcategories"
                                    >
                                    <label class="form-check-label" for="hasSubcategories">
                                        Наличие подкатегорий
                                    </label>
                                </div>
                            </div>
                            <div v-if="categoryFormData.hasSubcategories" class="mb-3">
                                <label class="form-label">Подкатегории</label>
                                <div v-for="(subcategory, index) in categoryFormData.subcategories" :key="index" class="input-group mb-2">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        v-model="categoryFormData.subcategories[index]"
                                        :placeholder="`Подкатегория ${index + 1}`"
                                    >
                                    <button 
                                        type="button" 
                                        class="btn btn-outline-danger" 
                                        @click="removeSubcategory(index)"
                                        :disabled="categoryFormData.subcategories.length === 1"
                                    >
                                        <Trash2 :size="14" />
                                    </button>
                                </div>
                                <button 
                                    type="button" 
                                    class="btn btn-outline-primary btn-sm" 
                                    @click="addSubcategory"
                                >
                                    <Plus :size="14" class="me-1" />
                                    Добавить подкатегорию
                                </button>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeCategoryModal">Отмена</button>
                        <button type="button" class="btn btn-primary" @click="saveCategory">
                            {{ editingCategory ? 'Сохранить изменения' : 'Создать категорию' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade" :class="{ 'show': showCategoryModal }" v-if="showCategoryModal"></div>

        <!-- Модальное окно подтверждения удаления -->
        <div class="modal fade" :class="{ 'show d-block': showDeleteModal }" tabindex="-1" v-if="showDeleteModal">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <Trash2 :size="20" class="me-2 text-danger" />
                            Подтверждение удаления
                        </h5>
                        <button type="button" class="btn-close" @click="closeDeleteModal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="delete-warning">
                            <div class="warning-icon">
                                <AlertTriangle :size="48" class="text-warning" />
                            </div>
                            <div class="warning-content">
                                <h6 class="warning-title">Вы точно уверены, что хотите удалить эту категорию?</h6>
                                <p v-if="categoryToDelete && getCategoryIndicatorsCount(categoryToDelete) > 0" class="warning-text">
                                    Она используется <strong>{{ getCategoryIndicatorsCount(categoryToDelete) }}</strong> 
                                    {{ getCategoryIndicatorsCount(categoryToDelete) === 1 ? 'целевым показателем' : 'целевыми показателями'}}.
                                </p>
                                <p v-else class="warning-text">
                                    Категория не используется ни одним целевым показателем.
                                </p>
                                <div v-if="categoryToDelete && categoryToDelete.subcategories && categoryToDelete.subcategories.length > 0" class="subcategories-info">
                                    <p class="mb-1"><strong>Подкатегории:</strong></p>
                                    <ul class="subcategories-list">
                                        <li v-for="subcategory in categoryToDelete.subcategories" :key="subcategory" class="subcategory-item">
                                            {{ subcategory }}
                                            <span v-if="getSubcategoryIndicatorsCount(categoryToDelete, subcategory) > 0" class="usage-count">
                                                ({{ getSubcategoryIndicatorsCount(categoryToDelete, subcategory) }} 
                                                {{ getSubcategoryIndicatorsCount(categoryToDelete, subcategory) === 1 ? 'показатель' : 'показателей'}})
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Отмена</button>
                        <button type="button" class="btn btn-danger" @click="confirmDelete">
                            <Trash2 :size="16" class="me-1" />
                            Удалить категорию
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade" :class="{ 'show': showDeleteModal }" v-if="showDeleteModal"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Target, Plus, Edit, Trash2, BarChart3, AlertTriangle } from 'lucide-vue-next'

// События для родительского компонента
const emit = defineEmits(['open-create-category-modal'])

// Состояние компонента
const showCategoryModal = ref(false)
const editingCategory = ref(null)
const showDeleteModal = ref(false)
const categoryToDelete = ref(null)

// Ref для popover элементов
const popoverElements = ref([])
const categories = ref([])

const categoryFormData = ref({
    name: '',
    hasSubcategories: false,
    subcategories: ['']
})

// Открытие модального окна для создания категории
const openCreateCategoryModal = () => {
    editingCategory.value = null
    categoryFormData.value = {
        name: '',
        hasSubcategories: false,
        subcategories: ['']
    }
    showCategoryModal.value = true
}

// Открытие модального окна для редактирования категории
const editCategory = (category) => {
    editingCategory.value = category
    categoryFormData.value = {
        name: category.name,
        hasSubcategories: category.subcategories && category.subcategories.length > 0,
        subcategories: category.subcategories && category.subcategories.length > 0 
            ? [...category.subcategories] 
            : ['']
    }
    showCategoryModal.value = true
}

// Закрытие модального окна категории
const closeCategoryModal = () => {
    showCategoryModal.value = false
    editingCategory.value = null
}

// Добавление строки подкатегории
const addSubcategory = () => {
    categoryFormData.value.subcategories.push('')
}

// Удаление строки подкатегории
const removeSubcategory = (index) => {
    if (categoryFormData.value.subcategories.length > 1) {
        categoryFormData.value.subcategories.splice(index, 1)
    }
}

// Сохранение категории
const saveCategory = () => {
    if (!categoryFormData.value.name.trim()) {
        return
    }
    
    const categoryData = {
        name: categoryFormData.value.name.trim(),
        subcategories: categoryFormData.value.hasSubcategories 
            ? categoryFormData.value.subcategories.filter(sub => sub.trim() !== '')
            : [],
        indicatorsCount: 0,
        subcategoryIndicators: {}
    }
    
    if (editingCategory.value) {
        // Редактирование существующей категории
        const index = categories.value.findIndex(c => c.id === editingCategory.value.id)
        if (index !== -1) {
            categories.value[index] = { ...categories.value[index], ...categoryData }
        }
    } else {
        // Создание новой категории
        const newCategory = {
            ...categoryData,
            id: Date.now()
        }
        categories.value.push(newCategory)
    }
    
    closeCategoryModal()
}

// Удаление категории
const deleteCategory = (id) => {
    const category = categories.value.find(c => c.id === id)
    if (!category) return
    
    // Если категория не используется, удаляем сразу
    if (getCategoryIndicatorsCount(category) === 0) {
        categories.value = categories.value.filter(c => c.id !== id)
        return
    }
    
    // Если используется, показываем модальное окно подтверждения
    categoryToDelete.value = category
    showDeleteModal.value = true
}

// Подтверждение удаления
const confirmDelete = () => {
    if (categoryToDelete.value) {
        categories.value = categories.value.filter(c => c.id !== categoryToDelete.value.id)
        closeDeleteModal()
    }
}

// Закрытие модального окна удаления
const closeDeleteModal = () => {
    showDeleteModal.value = false
    categoryToDelete.value = null
}

// Получение количества показателей для категории
const getCategoryIndicatorsCount = (category) => {
    return category.indicatorsCount || 0
}

// Получение количества показателей для подкатегории
const getSubcategoryIndicatorsCount = (category, subcategory) => {
    return category.subcategoryIndicators?.[subcategory] || 0
}

// Функция для получения текста popover'а
const getPopoverText = (count, isSubcategory = false) => {
    if (count === 0) {
        return `Еще ни один целевой показатель не использует эту ${isSubcategory ? 'подкатегорию' : 'категорию'}`
    }
    
    const countText = count === 1 ? 'показатель' : 
                     count < 5 ? 'показателя' : 'показателей'
    
    return `${count} целевых ${countText} указаны в этой ${isSubcategory ? 'подкатегории' : 'категории'}`
}

// Функция для создания popover'а
const createPopover = (element, text) => {
    const popover = document.createElement('div')
    popover.className = 'custom-popover'
    popover.innerHTML = `
        <div class="custom-popover-arrow"></div>
        <div class="custom-popover-content">
            ${text}
        </div>`
    document.body.appendChild(popover)
    popoverElements.value.push(popover)
    
    // Показываем popover при наведении
    element.addEventListener('mouseenter', () => {
        const rect = element.getBoundingClientRect()
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft
        const scrollY = window.pageYOffset || document.documentElement.scrollTop
        
        popover.style.display = 'block'
        
        // Позиционируем popover относительно элемента
        const popoverLeft = rect.left + scrollX + (rect.width / 2) - (popover.offsetWidth / 2)
        const popoverTop = rect.top + scrollY - popover.offsetHeight - 8
        
        popover.style.left = Math.max(10, popoverLeft) + 'px'
        popover.style.top = Math.max(10, popoverTop) + 'px'
    })
    
    // Скрываем popover при уходе курсора
    element.addEventListener('mouseleave', () => {
        popover.style.display = 'none'
    })
    
    // Скрываем popover при уходе с самого popover
    popover.addEventListener('mouseleave', () => {
        popover.style.display = 'none'
    })
    
    // Обработка изменения размера окна
    const handleResize = () => {
        if (popover.style.display === 'block') {
            const rect = element.getBoundingClientRect()
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft
            const scrollY = window.pageYOffset || document.documentElement.scrollTop
            
            const popoverLeft = rect.left + scrollX + (rect.width / 2) - (popover.offsetWidth / 2)
            const popoverTop = rect.top + scrollY - popover.offsetHeight - 8
            
            popover.style.left = Math.max(10, popoverLeft) + 'px'
            popover.style.top = Math.max(10, popoverTop) + 'px'
        }
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize)
    
    // Сохраняем обработчики для очистки
    popover._resizeHandler = handleResize
    
    return popover
}

// Инициализация popover'ов
const initializePopovers = () => {
    nextTick(() => {
        // Popover для всех элементов с количеством показателей
        const indicatorElements = document.querySelectorAll('.indicators-count')
        
        indicatorElements.forEach(element => {
            const isCategory = element.getAttribute('data-is-category') === 'true'
            const isSubcategory = element.getAttribute('data-is-subcategory') === 'true'
            const count = parseInt(element.getAttribute('data-count')) || 0
            
            let text = ''
            if (isCategory) {
                text = getPopoverText(count, false)
            } else if (isSubcategory) {
                text = getPopoverText(count, true)
            }
            
            if (text) {
                createPopover(element, text)
            }
        })
    })
}

// Очистка popover'ов
const cleanupPopovers = () => {
    popoverElements.value.forEach(popover => {
        if (popover._resizeHandler) {
            window.removeEventListener('resize', popover._resizeHandler)
            window.removeEventListener('scroll', popover._resizeHandler)
        }
        popover.remove()
    })
    popoverElements.value = []
}

// Следим за изменениями категорий и переинициализируем popover'ы
watch(categories, () => {
    nextTick(() => {
        cleanupPopovers()
        initializePopovers()
    })
}, { deep: true })

// Lifecycle hooks
onMounted(() => {
    initializePopovers()
})

onUnmounted(() => {
    cleanupPopovers()
})

// Экспортируем функцию для открытия модального окна
defineExpose({
    openCreateCategoryModal
})
</script>

<style scoped lang="scss">
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
    vertical-align: middle;
}

.table td {
    vertical-align: middle;
}

.btn-group-sm > .btn {
    padding: 0.25rem 0.5rem;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.375rem;
}

.badge {
    font-size: 0.75em;
}

.subcategories-container {
    max-width: 300px;
    max-height: 120px;
    overflow-y: auto;
    overflow-x: hidden;
}

.subcategory-item {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 4px 8px;
    margin-bottom: 4px;
    font-size: 0.875rem;
    color: #495057;
    word-wrap: break-word;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: help;
    transition: background-color 0.2s ease;
}

.subcategory-item:hover {
    background-color: #e9ecef;
}

.subcategory-item:last-child {
    margin-bottom: 0;
}

.category-main-row {
    background-color: #f8f9fa;
    border-left: 3px solid #0d6efd;
}

.category-main-row:hover {
    background-color: #e9ecef;
}

.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.clickable-row:hover {
    background-color: #e3f2fd !important;
    border-left-color: #1976d2;
}

.subcategory-row {
    background-color: #ffffff;
    border-left: 3px solid #dee2e6;
}

.subcategory-row:hover {
    background-color: #f8f9fa;
}

.category-name {
    font-weight: 600;
    color: #212529;
    font-size: 0.95rem;
}

.subcategory-name {
    color: #6c757d;
    font-size: 0.9rem;
}

.subcategory-number {
    color: #6c757d;
    font-weight: 500;
    font-size: 0.9rem;
}

.indicators-count {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0d6efd;
    font-size: 0.9rem;
}

.subcategory-count {
    color: #6c757d;
    font-size: 0.85rem;
}

.indicators-count svg {
    color: inherit;
}

.indicators-number {
    cursor: help;
    transition: text-decoration 0.2s ease;
    
    &:hover {
        text-decoration: underline;
        text-decoration-style: dotted;
        text-underline-offset: 3px;
    }
}

// Стили для кастомного popover
:global(.custom-popover) {
    position: absolute;
    z-index: 9999;
    display: none;
    max-width: 300px;
    padding: 0;
    background: #212529;
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 0.875rem;
    line-height: 1.4;
}

:global(.custom-popover-arrow) {
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #212529;
}

:global(.custom-popover-content) {
    padding: 12px 16px;
    text-align: center;
}

// Стили для модального окна удаления
.delete-warning {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 0;
}

.warning-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: #fff3cd;
    border-radius: 50%;
    border: 2px solid #ffc107;
}

.warning-content {
    flex: 1;
    min-width: 0;
}

.warning-title {
    color: #212529;
    font-weight: 600;
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

.warning-text {
    color: #6c757d;
    margin-bottom: 1rem;
    line-height: 1.5;
}

.subcategories-info {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
}

.subcategories-list {
    margin: 0;
    padding-left: 1.5rem;
    list-style-type: disc;
}

.subcategory-item {
    margin-bottom: 0.5rem;
    color: #495057;
    line-height: 1.4;
    
    &:last-child {
        margin-bottom: 0;
    }
}

.usage-count {
    color: #dc3545;
    font-weight: 500;
    font-size: 0.9em;
}

.table tbody tr {
    height: auto;
    min-height: 48px;
}

.table tbody td {
    padding: 12px 8px;
    line-height: 1.4;
}

.category-main-row td {
    padding: 16px 8px;
}

.subcategory-row td {
    padding: 8px 8px;
}
</style>
