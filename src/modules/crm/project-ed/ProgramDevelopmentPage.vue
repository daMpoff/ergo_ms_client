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

            <div v-for="block in sortedBlocks" :key="block.id" class="card p-3 mb-3" :class="{ 'archived-block': isBlockArchived(block) }">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span v-if="isBlockArchived(block)" class="archive-tag">АРХИВ</span>
                            <h5 class="mb-0">{{ getBlockDisplayTitle(block) }}</h5>
                        </div>
                        <small class="text-muted">Срок реализации: {{ block.years || '—' }}</small>
                    </div>
                    <div class="d-flex gap-2" v-if="!isBlockArchived(block)">
                        <button class="btn btn-outline-primary btn-sm" style="display: flex; align-items: center;" @click="addEventById(block.id)">
                            <Plus :size="14" class="me-1" />
                            Добавить мероприятие
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" @click="editBlockById(block.id)">Редактировать</button>
                        <button class="btn btn-outline-danger btn-sm" @click="removeBlockById(block.id)">Удалить</button>
                    </div>
                    <div v-else class="text-muted">
                        <small>Срок реализации истек</small>
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
                                <td>
                                    <input v-model="event.code" type="text" class="form-control form-control-sm" placeholder="МП3.1" :disabled="true" readonly />
                                </td>
                                <td>
                                    <input v-model="event.name" type="text" class="form-control form-control-sm" placeholder="Название мероприятия" :disabled="isBlockArchived(block)" />
                                </td>
                                <td>
                                    <input v-model="event.results" type="text" class="form-control form-control-sm" placeholder="Ожидаемые результаты" :disabled="isBlockArchived(block)" />
                                </td>
                                <td>
                                    <input v-model="event.years" type="text" class="form-control form-control-sm" placeholder="2025–2026" :disabled="isBlockArchived(block)" />
                                </td>
                                <td class="text-end">
                                    <button v-if="!isBlockArchived(block)" class="btn btn-outline-danger btn-sm" @click="removeEventById(block.id, eIndex)">Удалить</button>
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
                        <label class="form-label">Название блока</label>
                        <input v-model="newBlockTitle" type="text" class="form-control" placeholder="Воспитательная деятельность (например)" />
                    </div>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label">Начальный год</label>
                            <select v-model="newBlockStartYear" class="form-select">
                                <option value="" disabled>Выберите год</option>
                                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Конечный год</label>
                            <select v-model="newBlockEndYear" class="form-select" :disabled="!newBlockStartYear">
                                <option value="" disabled>Выберите год</option>
                                <option v-for="year in endYearOptions" :key="year" :value="year">{{ year }}</option>
                            </select>
                        </div>
                    </div>
                    <div v-if="yearValidationError" class="alert alert-warning mt-2 mb-0">
                        {{ yearValidationError }}
                    </div>
                    <div class="mt-3">
                        <label class="form-label">Основные результаты</label>
                        <textarea v-model="newBlockResults" class="form-control" rows="4" placeholder="Ключевые итоги по блоку" style="resize: vertical;"></textarea>
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
                        <label class="form-label">Название блока</label>
                        <input v-model="newBlockTitle" type="text" class="form-control" placeholder="Воспитательная деятельность (например)" />
                    </div>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label">Начальный год</label>
                            <select v-model="newBlockStartYear" class="form-select">
                                <option value="" disabled>Выберите год</option>
                                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Конечный год</label>
                            <select v-model="newBlockEndYear" class="form-select" :disabled="!newBlockStartYear">
                                <option value="" disabled>Выберите год</option>
                                <option v-for="year in endYearOptions" :key="year" :value="year">{{ year }}</option>
                            </select>
                        </div>
                    </div>
                    <div v-if="yearValidationError" class="alert alert-warning mt-2 mb-0">
                        {{ yearValidationError }}
                    </div>
                    <div class="mt-3">
                        <label class="form-label">Основные результаты</label>
                        <textarea v-model="newBlockResults" class="form-control" rows="4" placeholder="Ключевые итоги по блоку" style="resize: vertical;"></textarea>
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Home, Target, Wrench, Inbox, Plus } from 'lucide-vue-next'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } },
    { label: 'Программа развития БГТУ', icon: Target }
])

let nextBlockId = 1
let nextEventId = 1

const newBlockTitle = ref('')
const newBlockStartYear = ref('')
const newBlockEndYear = ref('')
const newBlockResults = ref('')
const yearValidationError = ref('')

const blocks = ref([])
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const editingBlockIndex = ref(-1)

// Генерируем список доступных годов (от 2024 года до +10 лет от текущего года)
const currentYear = new Date().getFullYear()
const availableYears = ref(Array.from({ length: currentYear - 2024 + 11 }, (_, i) => 2024 + i))

// Функция для проверки, является ли блок архивным
function isBlockArchived(block) {
    if (!block.years) return false
    
    // Парсим годы из строки (например, "2025–2026" или "2025")
    const yearsMatch = block.years.match(/(\d{4})(?:–(\d{4}))?/)
    if (!yearsMatch) return false
    
    const endYear = parseInt(yearsMatch[2] || yearsMatch[1])
    return endYear < currentYear
}

// Функция для получения отображаемого названия блока с пометкой архива
function getBlockDisplayTitle(block) {
    return block.title
}

// Вычисляем доступные конечные годы на основе выбранного начального года
const endYearOptions = computed(() => {
    if (!newBlockStartYear.value) return []
    const startYear = parseInt(newBlockStartYear.value)
    return availableYears.value.filter(year => year >= startYear)
})

// Отсортированный список блоков: активные сверху, архивные внизу
const sortedBlocks = computed(() => {
    const active = blocks.value.filter(block => !isBlockArchived(block))
    const archived = blocks.value.filter(block => isBlockArchived(block))
    return [...active, ...archived]
})

// Валидация годов
watch([newBlockStartYear, newBlockEndYear], () => {
    yearValidationError.value = ''
    
    if (newBlockStartYear.value && newBlockEndYear.value) {
        const startYear = parseInt(newBlockStartYear.value)
        const endYear = parseInt(newBlockEndYear.value)
        
        if (endYear < startYear) {
            yearValidationError.value = 'Конечный год не может быть меньше начального года'
        } else if (endYear - startYear > 10) {
            yearValidationError.value = 'Период реализации не должен превышать 10 лет'
        }
    }
})

function addBlock() {
    if (!newBlockTitle.value.trim()) return
    if (yearValidationError.value) return
    
    // Генерируем номер блока (количество существующих блоков + 1)
    const blockNumber = blocks.value.length + 1
    const titleWithPrefix = `МП${blockNumber}. ${newBlockTitle.value.trim()}`
    
    // Формируем строку с годами
    let yearsString = ''
    if (newBlockStartYear.value && newBlockEndYear.value) {
        const startYear = parseInt(newBlockStartYear.value)
        const endYear = parseInt(newBlockEndYear.value)
        yearsString = startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`
    }
    
    blocks.value.push({
        id: nextBlockId++,
        title: titleWithPrefix,
        years: yearsString,
        results: newBlockResults.value.trim(),
        events: []
    })
    newBlockTitle.value = ''
    newBlockStartYear.value = ''
    newBlockEndYear.value = ''
    newBlockResults.value = ''
    yearValidationError.value = ''
}

function editBlock(index) {
    const block = blocks.value[index]
    // Убираем префикс "МП№. " при редактировании для удобства пользователя
    const titleWithoutPrefix = block.title.replace(/^МП\d+\.\s*/, '')
    newBlockTitle.value = titleWithoutPrefix
    newBlockResults.value = block.results
    
    // Парсим годы из строки
    const yearsMatch = block.years.match(/(\d{4})(?:–(\d{4}))?/)
    if (yearsMatch) {
        newBlockStartYear.value = yearsMatch[1]
        newBlockEndYear.value = yearsMatch[2] || yearsMatch[1]
    } else {
        newBlockStartYear.value = ''
        newBlockEndYear.value = ''
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

function addEvent(blockIndex) {
    const block = blocks.value[blockIndex]
    // Извлекаем номер блока из заголовка (например, "МП3. Название" -> "3")
    const blockNumber = block.title.match(/^МП(\d+)\./)?.[1] || '1'
    // Генерируем порядковый номер мероприятия (количество существующих мероприятий + 1)
    const eventNumber = block.events.length + 1
    // Формируем код мероприятия
    const eventCode = `МП${blockNumber}.${eventNumber}`
    
    blocks.value[blockIndex].events.push({
        id: nextEventId++,
        code: eventCode,
        name: '',
        results: '',
        years: ''
    })
}

function removeEvent(blockIndex, eventIndex) {
    blocks.value[blockIndex].events.splice(eventIndex, 1)
    // Пересчитываем коды мероприятий после удаления
    updateEventCodes(blockIndex)
}

// Функция для обновления кодов мероприятий в блоке
function updateEventCodes(blockIndex) {
    const block = blocks.value[blockIndex]
    const blockNumber = block.title.match(/^МП(\d+)\./)?.[1] || '1'
    
    block.events.forEach((event, index) => {
        event.code = `МП${blockNumber}.${index + 1}`
    })
}

// Обертки для работы по id с учетом сортировки
function findBlockIndexById(blockId) {
    return blocks.value.findIndex(b => b.id === blockId)
}

function addEventById(blockId) {
    const index = findBlockIndexById(blockId)
    if (index === -1) return
    addEvent(index)
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
    newBlockStartYear.value = ''
    newBlockEndYear.value = ''
    newBlockResults.value = ''
    yearValidationError.value = ''
}

function closeEditModal() {
    isEditModalOpen.value = false
    editingBlockIndex.value = -1
    newBlockTitle.value = ''
    newBlockStartYear.value = ''
    newBlockEndYear.value = ''
    newBlockResults.value = ''
    yearValidationError.value = ''
}

function createBlockFromModal() {
    if (!newBlockTitle.value.trim()) return
    if (yearValidationError.value) return
    addBlock()
    isCreateModalOpen.value = false
}

function updateBlockFromModal() {
    if (!newBlockTitle.value.trim()) return
    if (yearValidationError.value) return
    
    const blockIndex = editingBlockIndex.value
    if (blockIndex >= 0 && blockIndex < blocks.value.length) {
        const block = blocks.value[blockIndex]
        // Сохраняем номер блока из существующего заголовка
        const blockNumber = block.title.match(/^МП(\d+)\./)?.[1] || (blocks.value.length + 1)
        const titleWithPrefix = `МП${blockNumber}. ${newBlockTitle.value.trim()}`
        
        // Формируем строку с годами
        let yearsString = ''
        if (newBlockStartYear.value && newBlockEndYear.value) {
            const startYear = parseInt(newBlockStartYear.value)
            const endYear = parseInt(newBlockEndYear.value)
            yearsString = startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`
        }
        
        blocks.value[blockIndex] = {
            ...block,
            title: titleWithPrefix,
            years: yearsString,
            results: newBlockResults.value.trim()
        }
        
        // Пересчитываем коды мероприятий в обновленном блоке
        updateEventCodes(blockIndex)
    }
    
    closeEditModal()
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

.archived-block {
    background-color: #f8f9fa;
    border-color: #dee2e6;
    opacity: 0.8;
}

.archived-block h5 {
    color: #6c757d;
}

.archived-block .form-control:disabled {
    background-color: #e9ecef;
    opacity: 0.6;
}

.archive-tag {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    background-color: #6c757d;
    border-radius: 0.375rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>


