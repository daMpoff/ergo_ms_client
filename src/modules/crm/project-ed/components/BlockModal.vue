<template>
    <div v-if="isOpen" class="modal d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEditMode ? 'Редактирование блока мероприятий' : 'Создание блока мероприятий' }}</h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="closeModal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Код блока <span class="text-danger">*</span></label>
                        <input v-model="formData.code" type="text" class="form-control" placeholder="МП1" required />
                        <div class="form-text">Введите код блока мероприятий (например: МП1, МП2, и т.д.)</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Название блока <span class="text-danger">*</span></label>
                        <textarea v-model="formData.title" class="form-control" rows="3" placeholder="Воспитательная деятельность (например)" style="resize: vertical;" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Категория целевых показателей <span class="text-danger">*</span></label>
                        <select v-model="formData.categoryId" class="form-select" required>
                            <option value="" disabled>Выберите категорию</option>
                            <option v-for="category in categories" :key="category.id" :value="category.id">
                                {{ category.name }}
                            </option>
                        </select>
                        <div v-if="categories.length === 0" class="form-text">
                            <span class="text-muted">Категории целевых показателей не найдены. </span>
                            <router-link to="/crm/project-ed/target-indicators" class="text-primary text-decoration-underline">
                                Создать категорию
                            </router-link>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Подкатегория целевых показателей</label>
                        <select v-model="formData.subcategoryId" class="form-select" :disabled="!formData.categoryId">
                            <option value="">Не указана</option>
                            <option v-for="subcategory in availableSubcategories" :key="subcategory.id" :value="subcategory.id">
                                {{ subcategory.name }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" @click="closeModal">Отмена</button>
                    <button type="button" class="btn btn-primary" @click="saveBlock">
                        {{ isEditMode ? 'Сохранить' : 'Создать' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="isOpen" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    isEditMode: {
        type: Boolean,
        default: false
    },
    blockData: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['close', 'save'])

const toast = useToast()

const formData = ref({
    code: '',
    title: '',
    categoryId: '',
    subcategoryId: ''
})

const categories = ref([])

// Загрузка категорий
const loadCategories = async () => {
    try {
        const response = await apiClient.get(endpoints.project_ed.categories.list)
        if (response.success) {
            categories.value = response.data
        } else {
            throw new Error(response.message || 'Ошибка загрузки категорий')
        }
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error)
        toast.error('Ошибка при загрузке категорий: ' + error.message)
        categories.value = []
    }
}

// Доступные подкатегории
const availableSubcategories = computed(() => {
    if (!formData.value.categoryId) return []
    const category = categories.value.find(cat => cat.id === formData.value.categoryId)
    const subcategories = category?.subcategories || []
    console.log('Available subcategories computed:', subcategories)
    return subcategories
})

// Функция для восстановления подкатегории
const restoreSubcategory = () => {
    if (props.isEditMode && props.blockData && formData.value.categoryId) {
        const savedSubcategoryId = props.blockData.subcategoryId || props.blockData.subcategory || ''
        console.log('Trying to restore subcategory:', savedSubcategoryId)
        console.log('Available subcategories:', availableSubcategories.value)
        
        if (savedSubcategoryId && availableSubcategories.value.some(sub => sub.id === savedSubcategoryId)) {
            console.log('Found matching subcategory, setting it')
            formData.value.subcategoryId = savedSubcategoryId
            return true
        }
    }
    return false
}

// Следим за изменением доступных подкатегорий и восстанавливаем выбор при редактировании
watch(() => availableSubcategories.value, (newSubcategories) => {
    if (newSubcategories.length > 0) {
        nextTick(() => {
            restoreSubcategory()
        })
    }
})

// Следим за изменением категории и сбрасываем подкатегорию
watch(() => formData.value.categoryId, (newCategoryId, oldCategoryId) => {
    // Сбрасываем подкатегорию только если категория действительно изменилась
    // и мы не в режиме инициализации при редактировании
    if (newCategoryId !== oldCategoryId && oldCategoryId !== undefined) {
        formData.value.subcategoryId = ''
    }
})

// Инициализация формы при открытии модального окна
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        if (props.isEditMode && props.blockData) {
            // Режим редактирования
            const categoryId = props.blockData.categoryId || props.blockData.category || ''
            const subcategoryId = props.blockData.subcategoryId || props.blockData.subcategory || ''
            
            console.log('Edit mode - blockData:', props.blockData)
            console.log('Edit mode - categoryId:', categoryId)
            console.log('Edit mode - subcategoryId:', subcategoryId)
            
            formData.value = {
                code: props.blockData.code || '',
                title: props.blockData.title || '',
                categoryId: categoryId,
                subcategoryId: subcategoryId
            }
            
            console.log('Edit mode - formData after init:', formData.value)
        } else {
            // Режим создания
            formData.value = {
                code: '',
                title: '',
                categoryId: '',
                subcategoryId: ''
            }
        }
    }
})

// Следим за загрузкой категорий и восстанавливаем подкатегорию при редактировании
watch(() => categories.value.length, (newLength) => {
    if (newLength > 0 && props.isEditMode && props.blockData && formData.value.categoryId) {
        console.log('Categories loaded, trying to restore subcategory')
        nextTick(() => {
            if (!restoreSubcategory()) {
                // Если не удалось восстановить сразу, пробуем через небольшую задержку
                setTimeout(() => {
                    restoreSubcategory()
                }, 100)
            }
        })
    }
})

// Сохранение блока
const saveBlock = () => {
    if (!formData.value.title.trim() || !formData.value.code.trim() || !formData.value.categoryId) {
        toast.warning('Заполните все обязательные поля')
        return
    }

    // Находим выбранную категорию и подкатегорию
    const selectedCategory = categories.value.find(cat => cat.id === formData.value.categoryId)
    const selectedSubcategory = formData.value.subcategoryId 
        ? availableSubcategories.value.find(sub => sub.id === formData.value.subcategoryId)
        : null

    const blockData = {
        code: formData.value.code.trim(),
        title: formData.value.title.trim(),
        description: '',
        categoryId: formData.value.categoryId,
        categoryName: selectedCategory?.name || '',
        subcategoryId: formData.value.subcategoryId || null,
        subcategoryName: selectedSubcategory?.name || null,
        ...(props.isEditMode && props.blockData ? { id: props.blockData.id } : {})
    }

    emit('save', blockData)
}

// Закрытие модального окна
const closeModal = () => {
    emit('close')
}

// Загружаем категории при инициализации компонента
onMounted(() => {
    loadCategories()
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

.form-text {
    font-size: 0.875rem;
    color: #6c757d;
    margin-top: 0.25rem;
}

.form-label {
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
}

.form-control,
.form-select {
    border-radius: 0.375rem;
    border: 1px solid #ced4da;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus,
.form-select:focus {
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
</style>
