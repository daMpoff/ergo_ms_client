<template>
    <div class="page-container">
        <Breadcrumbs :items="breadcrumbItems" />
        <div class="page-content">
            <div class="d-flex align-items-center justify-content-between">
                <h3 class="mb-0">Программа развития БГТУ</h3>
            </div>

            <div class="d-flex align-items-center mb-3" v-if="blocks.length > 0">
                <h5 class="mb-0 me-3">Блоки мероприятий</h5>
                <div 
                    class="button-create" 
                    role="button" 
                    aria-label="Добавить блок"
                    @click="openCreateModal"
                >
                    <Plus :size="18" />
                    <span>Добавить блок</span>
                </div>
            </div>

            <div v-else-if="isLoading" class="card p-4 text-center">
                <div class="d-flex flex-column align-items-center justify-content-center my-2">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                    <h5 class="mb-1">Загрузка данных...</h5>
                </div>
            </div>
            <div v-else class="card p-4 text-center">
                <div class="d-flex flex-column align-items-center justify-content-center my-2">
                    <Inbox :size="48" class="mb-2" />
                    <h5 class="mb-1">Пока нет блоков мероприятий</h5>
                    <p class="text-muted mb-3">Создайте первый блок МП, чтобы начать работу.</p>
                    <button class="btn btn-primary" @click="openCreateModal">Создать блок</button>
                </div>
            </div>

            <div v-for="block in blocks" :key="block.id" class="card p-3 mb-3">
                <div class="d-flex justify-content-between mb-2">
                    <div class="flex-grow-1">
                        <h5 class="mb-0">{{ block.code ? `${block.code}. ${block.title}` : block.title }}</h5>
                        <div v-if="block.category_name" class="text-muted small mt-1">
                            <div class="mb-0">
                                <span 
                                    class="badge bg-primary category-badge" 
                                    :title="block.category_name"
                                >
                                    {{ block.category_name }}
                                </span>
                            </div>
                            <div v-if="block.subcategory_name" class="mt-1">
                                <span 
                                    class="badge bg-secondary subcategory-badge" 
                                    :title="block.subcategory_name"
                                >
                                    {{ block.subcategory_name }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex gap-2 align-items-start">
                        <button class="btn btn-outline-primary btn-sm" style="display: flex; align-items: center;" @click="openCreateEventModal(block.id)">
                            <Plus :size="14" class="me-1" />
                            Добавить мероприятие
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" @click="editBlockById(block.id)">Редактировать</button>
                        <button class="btn btn-outline-danger btn-sm" @click="removeBlockById(block.id)">Удалить</button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table align-middle">
                        <thead>
                            <tr>
                                <th style="width: 140px;">Код блока</th>
                                <th>Наименование мероприятия</th>
                                <th>Основные результаты</th>
                                <th style="width: 160px;">Срок реализации (годы)</th>
                                <th style="width: 120px;"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="!block.events || block.events.length === 0">
                                <td colspan="5" class="text-center text-muted py-4">
                                    Здесь еще пока нет мероприятий
                                </td>
                            </tr>
                            <tr v-for="(event, eIndex) in block.events" :key="event.id">
                                <td>{{ event.code || '—' }}</td>
                                <td>{{ event.name || '—' }}</td>
                                <td>{{ event.results || '—' }}</td>
                                <td>{{ event.years_display || '—' }}</td>
                                <td class="text-end p-2">
                                    <div class="d-flex gap-2 justify-content-end align-items-center h-100">
                                        <button class="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center" @click="openEditEventModal(block.id, eIndex)" aria-label="Редактировать" title="Редактировать">
                                            <Pencil :size="16" />
                                        </button>
                                        <button class="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center" @click="removeEventById(block.id, eIndex)" aria-label="Удалить" title="Удалить">
                                            <Trash2 :size="16" />
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

    <!-- Модальное окно создания/редактирования блока -->
    <BlockModal
        :is-open="isCreateModalOpen || isEditModalOpen"
        :is-edit-mode="isEditModalOpen"
        :block-data="editingBlockData"
        @close="closeModals"
        @save="handleBlockSave"
    />

    <!-- Модальное окно создания мероприятия -->
    <div v-if="isCreateEventModalOpen" class="modal d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEditEventMode ? 'Редактирование мероприятия' : 'Создание мероприятия' }}</h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="closeCreateEventModal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Код мероприятия</label>
                        <input v-model="generatedEventCode" type="text" class="form-control" readonly />
                        <div class="form-text">Код генерируется автоматически на основе кода блока</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Наименование мероприятия</label>
                        <input v-model="newEventName" type="text" class="form-control" placeholder="Название мероприятия" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Основные результаты</label>
                        <textarea v-model="newEventResults" class="form-control" rows="3" placeholder="Ожидаемые результаты" style="resize: vertical;"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Срок реализации (годы)</label>
                        <div class="row g-2">
                            <div class="col-6">
                                <select v-model="selectedStartYear" class="form-select">
                                    <option v-for="year in yearsOptions" :key="`start-` + year" :value="year">{{ year }}</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <select v-model="selectedEndYear" class="form-select">
                                    <option v-for="year in yearsOptions" :key="`end-` + year" :value="year">{{ year }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-text">Выберите годы начала и окончания. Конечный год не раньше начального.</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" @click="closeCreateEventModal">Отмена</button>
                    <button type="button" class="btn btn-primary" @click="createEventFromModal">{{ isEditEventMode ? 'Сохранить' : 'Создать' }}</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="isCreateEventModalOpen" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { Home, Target, Wrench, Inbox, Plus, Pencil, Trash2 } from 'lucide-vue-next'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import BlockModal from '@/modules/crm/project-ed/components/BlockModal.vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } },
    { label: 'Программа развития БГТУ', icon: Target }
])

const blocks = ref([])
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const editingBlockData = ref({})
const isLoading = ref(false)

// Состояние модального окна создания мероприятия
const isCreateEventModalOpen = ref(false)
const creatingForBlockId = ref(null)
const editingEventIndex = ref(-1)
const isEditEventMode = ref(false)
const newEventName = ref('')
const newEventResults = ref('')
const selectedStartYear = ref(new Date().getFullYear())
const selectedEndYear = ref(new Date().getFullYear())
const generatedEventCode = ref('')
const yearsOptions = computed(() => {
    const start = new Date().getFullYear()
    const end = start + 10
    const list = []
    for (let y = start; y <= end; y++) list.push(y)
    return list
})

const toast = useToast()

// Загрузка данных при монтировании компонента
onMounted(async () => {
    await loadBlocks()
})

// Загрузка блоков мероприятий с сервера
async function loadBlocks() {
    isLoading.value = true
    try {
        // Попробуем загрузить блоки мероприятий
        const url = endpoints.project_ed.event_blocks.list
        const response = await apiClient.get(url)
        blocks.value = response.data || []
    } catch (error) {
        // Временно показываем пустой массив, чтобы страница загрузилась
        blocks.value = []
        
        if (error.response?.status === 404) {
            toast.error('API эндпоинт не найден. Эндпоинт: ' + url)
        } else if (error.response?.status === 500) {
            toast.error('Ошибка сервера. Проверьте логи API.')
        } else if (error.response?.status === 403) {
            toast.error('Нет доступа к API. Проверьте авторизацию.')
        } else {
            toast.error(`Ошибка загрузки данных: ${error.response?.data?.detail || error.message}`)
        }
    } finally {
        isLoading.value = false
    }
}

// Создание блока мероприятий
async function addBlock(blockData) {
    try {
        // Подготавливаем данные для API
        const apiData = {
            code: blockData.code || '',
            title: blockData.title,
            description: blockData.description || '',
            category: blockData.categoryId || null,
            subcategory: blockData.subcategoryId || null
        }
        
        const response = await apiClient.post(endpoints.project_ed.event_blocks.create, apiData)
        blocks.value.push(response.data)
        toast.success('Блок мероприятий создан')
    } catch (error) {
        toast.error('Ошибка создания блока')
    }
}

// Редактирование блока мероприятий
function editBlock(index) {
    const block = blocks.value[index]
    editingBlockData.value = { 
        ...block, 
        index,
        categoryId: block.category || null,
        subcategoryId: block.subcategory || null
    }
    isEditModalOpen.value = true
}

// Удаление блока мероприятий
async function removeBlock(index) {
    const block = blocks.value[index]
    if (!block.id) {
        blocks.value.splice(index, 1)
        return
    }

    try {
        await apiClient.delete(endpoints.project_ed.event_blocks.delete(block.id))
        blocks.value.splice(index, 1)
        toast.success('Блок мероприятий удален')
    } catch (error) {
        toast.error('Ошибка удаления блока')
    }
}

// Удаление мероприятия
async function removeEvent(blockIndex, eventIndex) {
    const block = blocks.value[blockIndex]
    const event = block.events[eventIndex]
    
    if (!event.id) {
        block.events.splice(eventIndex, 1)
        return
    }

    try {
        await apiClient.delete(endpoints.project_ed.events.delete(event.id))
        
        // Удаляем мероприятие из локального состояния
        block.events.splice(eventIndex, 1)
        
        // Перезагружаем данные для синхронизации с сервером
        await loadBlocks()
        
        toast.success('Мероприятие удалено')
    } catch (error) {
        toast.error('Ошибка удаления мероприятия')
    }
}

// Обертки для работы по id с учетом сортировки
function findBlockIndexById(blockId) {
    return blocks.value.findIndex(b => b.id === blockId)
}

function removeEventById(blockId, eventIndex) {
    const index = findBlockIndexById(blockId)
    if (index === -1) return
    removeEvent(index, eventIndex)
}

function editBlockById(blockId) {
    const index = findBlockIndexById(blockId)
    if (index === -1) return
    editBlock(index)
}

async function removeBlockById(blockId) {
    const index = findBlockIndexById(blockId)
    if (index === -1) return
    await removeBlock(index)
}

function openCreateModal() {
    isCreateModalOpen.value = true
}

function closeModals() {
    isCreateModalOpen.value = false
    isEditModalOpen.value = false
    editingBlockData.value = {}
}

async function handleBlockSave(blockData) {
    if (isEditModalOpen.value) {
        // Режим редактирования
        const blockIndex = editingBlockData.value.index
        const block = blocks.value[blockIndex]
        
        if (blockIndex >= 0 && blockIndex < blocks.value.length && block.id) {
            try {
                // Подготавливаем данные для API
                const apiData = {
                    code: blockData.code || '',
                    title: blockData.title,
                    description: blockData.description || '',
                    category: blockData.categoryId || null,
                    subcategory: blockData.subcategoryId || null
                }
                
                const response = await apiClient.patch(endpoints.project_ed.event_blocks.patch(block.id), apiData)
                blocks.value[blockIndex] = response.data
                
                // Перезагружаем данные для получения обновленных кодов мероприятий
                await loadBlocks()
                
                toast.success('Блок мероприятий обновлен')
            } catch (error) {
                toast.error('Ошибка обновления блока')
                return
            }
        }
    } else {
        // Режим создания
        await addBlock(blockData)
    }
    closeModals()
}

// Генерация кода мероприятия на основе кода блока
function generateEventCode(blockId) {
    const blockIndex = findBlockIndexById(blockId)
    if (blockIndex === -1) return ''
    
    const block = blocks.value[blockIndex]
    // Используем поле code блока напрямую
    const blockCode = block.code
    if (!blockCode) return ''
    
    const existingEvents = block.events || []
    
    // Находим максимальный номер мероприятия в блоке
    let maxNumber = 0
    existingEvents.forEach(event => {
        if (event.code) {
            const eventCodeMatch = event.code.match(new RegExp(`^${blockCode}\\.(\\d+)$`))
            if (eventCodeMatch) {
                const number = parseInt(eventCodeMatch[1], 10)
                if (number > maxNumber) {
                    maxNumber = number
                }
            }
        }
    })
    
    // Возвращаем следующий номер
    return `${blockCode}.${maxNumber + 1}`
}

// Работа с модальным окном создания мероприятия
function openCreateEventModal(blockId) {
    creatingForBlockId.value = blockId
    isCreateEventModalOpen.value = true
    isEditEventMode.value = false
    editingEventIndex.value = -1
    newEventName.value = ''
    newEventResults.value = ''
    const nowYear = new Date().getFullYear()
    selectedStartYear.value = nowYear
    selectedEndYear.value = nowYear
    
    // Генерируем код мероприятия
    generatedEventCode.value = generateEventCode(blockId)
}

function closeCreateEventModal() {
    isCreateEventModalOpen.value = false
    creatingForBlockId.value = null
    isEditEventMode.value = false
    editingEventIndex.value = -1
    newEventName.value = ''
    newEventResults.value = ''
    generatedEventCode.value = ''
}

async function createEventFromModal() {
    const blockIndex = findBlockIndexById(creatingForBlockId.value)
    if (blockIndex === -1) {
        toast.error('Не найден блок для создания мероприятия')
        return
    }
    if (!newEventName.value.trim()) {
        toast.warning('Введите наименование мероприятия')
        return
    }
    if (selectedEndYear.value < selectedStartYear.value) {
        toast.warning('Конечный год не может быть раньше начального')
        return
    }

    const block = blocks.value[blockIndex]
    
    const eventData = {
        block: block.id,
        code: generatedEventCode.value,
        name: newEventName.value.trim(),
        results: newEventResults.value.trim(),
        start_year: selectedStartYear.value,
        end_year: selectedEndYear.value
    }

    try {
        if (isEditEventMode.value && editingEventIndex.value > -1) {
            // Режим редактирования
            const event = block.events[editingEventIndex.value]
            if (!event || !event.id) {
                toast.error('Не найдено мероприятие для редактирования')
                return
            }
            
            // При редактировании сохраняем существующий код или генерируем новый, если его нет
            if (!event.code) {
                eventData.code = generateEventCode(creatingForBlockId.value)
            } else {
                eventData.code = event.code
            }
            
            const response = await apiClient.patch(endpoints.project_ed.events.patch(event.id), eventData)
            block.events[editingEventIndex.value] = response.data
            toast.success('Мероприятие обновлено')
        } else {
            // Режим создания
            const response = await apiClient.post(endpoints.project_ed.events.create, eventData)
            block.events.push(response.data)
            toast.success('Мероприятие создано')
        }
        closeCreateEventModal()
    } catch (error) {
        toast.error('Ошибка сохранения мероприятия')
    }
}

function openEditEventModal(blockId, eventIndex) {
    const blockIndex = findBlockIndexById(blockId)
    if (blockIndex === -1) return
    const event = blocks.value[blockIndex].events[eventIndex]
    if (!event) return

    creatingForBlockId.value = blockId
    editingEventIndex.value = eventIndex
    isEditEventMode.value = true
    isCreateEventModalOpen.value = true

    newEventName.value = event.name || ''
    newEventResults.value = event.results || ''
    generatedEventCode.value = event.code || ''

    // Используем start_year и end_year из API
    const nowYear = new Date().getFullYear()
    if (event.start_year && event.end_year) {
        selectedStartYear.value = event.start_year
        selectedEndYear.value = event.end_year
    } else {
        selectedStartYear.value = nowYear
        selectedEndYear.value = nowYear
    }
}

</script>

<style scoped lang="scss">
.page-container { display: flex; flex-direction: column; height: 100%; }
.page-content { flex: 1; display: flex; flex-direction: column; gap: 1rem; }

.button-create {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    padding: .375rem .75rem;
    border-radius: 2rem;
    background-color: var(--color-header-background);
    color: var(--bs-body-color, #212529);
    cursor: pointer;
    transition: background-color .15s ease, border-color .15s ease, color .15s ease, box-shadow .15s ease;
}

.button-create:hover {
    background-color: var(--color-hover-background, #f8f9fa);
    border-color: var(--bs-border-color, #ced4da);
}

.category-badge {
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
}

.subcategory-badge {
    white-space: nowrap;
    display: inline-block;
}

</style>


