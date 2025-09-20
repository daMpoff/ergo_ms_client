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

            <div v-else class="card p-4 text-center">
                <div class="d-flex flex-column align-items-center justify-content-center my-2">
                    <Inbox :size="48" class="mb-2" />
                    <h5 class="mb-1">Пока нет блоков мероприятий</h5>
                    <p class="text-muted mb-3">Создайте первый блок МП, чтобы начать работу.</p>
                    <button class="btn btn-primary" @click="openCreateModal">Создать блок</button>
                </div>
            </div>

            <div v-for="block in blocks" :key="block.id" class="card p-3 mb-3">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <div>
                        <h5 class="mb-0">{{ block.title }}</h5>
                    </div>
                    <div class="d-flex gap-2">
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
                                <td>{{ event.years || '—' }}</td>
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

    <!-- Модальное окно создания блока -->
    <div v-if="isCreateModalOpen" class="modal d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Создание блока мероприятий</h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="closeCreateModal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Код блока <span class="text-danger">*</span></label>
                        <input v-model="newBlockCode" type="text" class="form-control" placeholder="МП1" required />
                        <div class="form-text">Введите код блока мероприятий (например: МП1, МП2, и т.д.)</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Название блока <span class="text-danger">*</span></label>
                        <textarea v-model="newBlockTitle" class="form-control" rows="3" placeholder="Воспитательная деятельность (например)" style="resize: vertical;" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" @click="closeCreateModal">Отмена</button>
                    <button type="button" class="btn btn-primary" @click="createBlockFromModal">Создать</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="isCreateModalOpen" class="modal-backdrop fade show"></div>

    <!-- Модальное окно редактирования блока -->
    <div v-if="isEditModalOpen" class="modal d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Редактирование блока мероприятий</h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="closeEditModal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Код блока <span class="text-danger">*</span></label>
                        <input v-model="newBlockCode" type="text" class="form-control" placeholder="МП1" required />
                        <div class="form-text">Введите код блока мероприятий (например: МП1, МП2, и т.д.)</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Название блока <span class="text-danger">*</span></label>
                        <textarea v-model="newBlockTitle" class="form-control" rows="3" placeholder="Воспитательная деятельность (например)" style="resize: vertical;" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" @click="closeEditModal">Отмена</button>
                    <button type="button" class="btn btn-primary" @click="updateBlockFromModal">Сохранить</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="isEditModalOpen" class="modal-backdrop fade show"></div>

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
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { Home, Target, Wrench, Inbox, Plus, Pencil, Trash2 } from 'lucide-vue-next'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } },
    { label: 'Программа развития БГТУ', icon: Target }
])

let nextBlockId = 1
let nextEventId = 1

const newBlockTitle = ref('')
const newBlockCode = ref('')

const blocks = ref([])
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const editingBlockIndex = ref(-1)

// Состояние модального окна создания мероприятия
const isCreateEventModalOpen = ref(false)
const creatingForBlockId = ref(null)
const editingEventIndex = ref(-1)
const isEditEventMode = ref(false)
const newEventName = ref('')
const newEventResults = ref('')
const selectedStartYear = ref(new Date().getFullYear())
const selectedEndYear = ref(new Date().getFullYear())
const yearsOptions = computed(() => {
    const start = new Date().getFullYear()
    const end = start + 10
    const list = []
    for (let y = start; y <= end; y++) list.push(y)
    return list
})

const toast = useToast()


function addBlock() {
    if (!newBlockTitle.value.trim() || !newBlockCode.value.trim()) return
    
    const titleWithPrefix = `${newBlockCode.value.trim()}. ${newBlockTitle.value.trim()}`
    
    blocks.value.push({
        id: nextBlockId++,
        title: titleWithPrefix,
        events: []
    })
    newBlockTitle.value = ''
    newBlockCode.value = ''
}

function editBlock(index) {
    const block = blocks.value[index]
    // Извлекаем код и название из заголовка блока
    const match = block.title.match(/^(.+?)\.\s*(.+)$/)
    if (match) {
        newBlockCode.value = match[1]
        newBlockTitle.value = match[2]
    } else {
        newBlockCode.value = ''
        newBlockTitle.value = block.title
    }
    
    editingBlockIndex.value = index
    isEditModalOpen.value = true
}

function removeBlock(index) {
    blocks.value.splice(index, 1)
    // Пересчитываем коды мероприятий во всех блоках после удаления блока
    blocks.value.forEach((_, blockIndex) => {
        updateEventCodes(blockIndex)
    })
}

// Удалена функция addEvent — создание происходит через модальное окно

function removeEvent(blockIndex, eventIndex) {
    blocks.value[blockIndex].events.splice(eventIndex, 1)
    // Пересчитываем коды мероприятий после удаления
    updateEventCodes(blockIndex)
}

// Функция для обновления кодов мероприятий в блоке
function updateEventCodes(blockIndex) {
    const block = blocks.value[blockIndex]
    const blockCode = block.title.match(/^(.+?)\./)?.[1] || 'МП1'
    
    block.events.forEach((event, index) => {
        event.code = `${blockCode}.${index + 1}`
    })
}

// Обертки для работы по id с учетом сортировки
function findBlockIndexById(blockId) {
    return blocks.value.findIndex(b => b.id === blockId)
}

// Удалена функция addEventById — создание происходит через модальное окно

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

function removeBlockById(blockId) {
    const index = findBlockIndexById(blockId)
    if (index === -1) return
    removeBlock(index)
}

function openCreateModal() {
    isCreateModalOpen.value = true
}

function closeCreateModal() {
    isCreateModalOpen.value = false
    newBlockTitle.value = ''
    newBlockCode.value = ''
}

function closeEditModal() {
    isEditModalOpen.value = false
    editingBlockIndex.value = -1
    newBlockTitle.value = ''
    newBlockCode.value = ''
}

function createBlockFromModal() {
    if (!newBlockTitle.value.trim() || !newBlockCode.value.trim()) {
        toast.warning('Заполните все обязательные поля')
        return
    }
    addBlock()
    isCreateModalOpen.value = false
}

function updateBlockFromModal() {
    if (!newBlockTitle.value.trim() || !newBlockCode.value.trim()) {
        toast.warning('Заполните все обязательные поля')
        return
    }
    
    const blockIndex = editingBlockIndex.value
    if (blockIndex >= 0 && blockIndex < blocks.value.length) {
        const block = blocks.value[blockIndex]
        const titleWithPrefix = `${newBlockCode.value.trim()}. ${newBlockTitle.value.trim()}`
        
        blocks.value[blockIndex] = {
            ...block,
            title: titleWithPrefix
        }
        
        // Пересчитываем коды мероприятий в обновленном блоке
        updateEventCodes(blockIndex)
    }
    
    closeEditModal()
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
}

function closeCreateEventModal() {
    isCreateEventModalOpen.value = false
    creatingForBlockId.value = null
    isEditEventMode.value = false
    editingEventIndex.value = -1
    newEventName.value = ''
    newEventResults.value = ''
}

function createEventFromModal() {
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
    const yearsLabel = `${selectedStartYear.value}–${selectedEndYear.value}`

    if (isEditEventMode.value && editingEventIndex.value > -1) {
        const event = block.events[editingEventIndex.value]
        if (!event) {
            toast.error('Не найдено мероприятие для редактирования')
            return
        }
        event.name = newEventName.value.trim()
        event.results = newEventResults.value.trim()
        event.years = yearsLabel
        toast.success('Мероприятие обновлено')
    } else {
        const blockCode = block.title.match(/^(.+?)\./)?.[1] || 'МП1'
        const eventNumber = block.events.length + 1
        const eventCode = `${blockCode}.${eventNumber}`

        blocks.value[blockIndex].events.push({
            id: nextEventId++,
            code: eventCode,
            name: newEventName.value.trim(),
            results: newEventResults.value.trim(),
            years: yearsLabel
        })
        toast.success('Мероприятие создано')
    }
    closeCreateEventModal()
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

    const yearsMatch = (event.years || '').match(/^(\d{4})\D+(\d{4})$/)
    const nowYear = new Date().getFullYear()
    if (yearsMatch) {
        selectedStartYear.value = parseInt(yearsMatch[1])
        selectedEndYear.value = parseInt(yearsMatch[2])
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

</style>


