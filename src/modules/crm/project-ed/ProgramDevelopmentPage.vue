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
                        <button class="btn btn-outline-primary btn-sm" style="display: flex; align-items: center;" @click="addEventById(block.id)">
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
                                <td>
                                    <input v-model="event.code" type="text" class="form-control form-control-sm" :disabled="true" readonly />
                                </td>
                                <td>
                                    <input v-model="event.name" type="text" class="form-control form-control-sm" placeholder="Название мероприятия" />
                                </td>
                                <td>
                                    <input v-model="event.results" type="text" class="form-control form-control-sm" placeholder="Ожидаемые результаты" />
                                </td>
                                <td>
                                    <input v-model="event.years" type="text" class="form-control form-control-sm" placeholder="2025–2026" />
                                </td>
                                <td class="text-end">
                                    <button class="btn btn-outline-danger btn-sm" @click="removeEventById(block.id, eIndex)">Удалить</button>
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
                        <textarea v-model="newBlockTitle" class="form-control" rows="3" placeholder="Воспитательная деятельность (например)" style="resize: vertical;"></textarea>
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
                        <textarea v-model="newBlockTitle" class="form-control" rows="3" placeholder="Воспитательная деятельность (например)" style="resize: vertical;"></textarea>
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

const blocks = ref([])
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const editingBlockIndex = ref(-1)


function addBlock() {
    if (!newBlockTitle.value.trim()) return
    
    // Генерируем номер блока (количество существующих блоков + 1)
    const blockNumber = blocks.value.length + 1
    const titleWithPrefix = `МП${blockNumber}. ${newBlockTitle.value.trim()}`
    
    blocks.value.push({
        id: nextBlockId++,
        title: titleWithPrefix,
        events: []
    })
    newBlockTitle.value = ''
}

function editBlock(index) {
    const block = blocks.value[index]
    // Убираем префикс "МП№. " при редактировании для удобства пользователя
    const titleWithoutPrefix = block.title.replace(/^МП\d+\.\s*/, '')
    newBlockTitle.value = titleWithoutPrefix
    
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
}

function closeEditModal() {
    isEditModalOpen.value = false
    editingBlockIndex.value = -1
    newBlockTitle.value = ''
}

function createBlockFromModal() {
    if (!newBlockTitle.value.trim()) return
    addBlock()
    isCreateModalOpen.value = false
}

function updateBlockFromModal() {
    if (!newBlockTitle.value.trim()) return
    
    const blockIndex = editingBlockIndex.value
    if (blockIndex >= 0 && blockIndex < blocks.value.length) {
        const block = blocks.value[blockIndex]
        // Сохраняем номер блока из существующего заголовка
        const blockNumber = block.title.match(/^МП(\d+)\./)?.[1] || (blocks.value.length + 1)
        const titleWithPrefix = `МП${blockNumber}. ${newBlockTitle.value.trim()}`
        
        blocks.value[blockIndex] = {
            ...block,
            title: titleWithPrefix
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

</style>


