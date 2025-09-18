<template>
    <div class="page-container">
        <Breadcrumbs :items="breadcrumbItems" />
        <div class="page-content">
            <div class="d-flex align-items-center justify-content-between">
                <h3 class="mb-0">Программа развития БГТУ</h3>
            </div>

            <div class="card p-3" v-if="blocks.length > 0">
                <h5 class="mb-3">Блоки мероприятий</h5>
                <div class="row g-3 align-items-end">
                    <div class="col-md-4">
                        <label class="form-label">Название блока</label>
                        <input v-model="newBlockTitle" type="text" class="form-control" placeholder="Напр.: МП3.1 — Воспитательная деятельность" />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Годы реализации</label>
                        <input v-model="newBlockYears" type="text" class="form-control" placeholder="2025–2027" />
                    </div>
                    <div class="col-md-2 d-grid">
                        <button class="btn btn-primary" @click="addBlock">
                            Создать блок
                        </button>
                    </div>
                </div>
                <div class="row g-3 mt-2">
                    <div class="col-12">
                        <label class="form-label">Основные результаты</label>
                        <textarea v-model="newBlockResults" class="form-control" rows="3" placeholder="Ключевые итоги по блоку" style="resize: vertical;"></textarea>
                    </div>
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

            <div v-for="(block, bIndex) in blocks" :key="block.id" class="card p-3 mb-3">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <div>
                        <h5 class="mb-1">{{ block.title }}</h5>
                        <small class="text-muted">Годы: {{ block.years || '—' }}</small>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-secondary btn-sm" @click="editBlock(bIndex)">Редактировать</button>
                        <button class="btn btn-outline-danger btn-sm" @click="removeBlock(bIndex)">Удалить</button>
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
                            <tr v-for="(event, eIndex) in block.events" :key="event.id">
                                <td>
                                    <input v-model="event.code" type="text" class="form-control form-control-sm" placeholder="МП3.1-1" />
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
                                    <button class="btn btn-outline-danger btn-sm" @click="removeEvent(bIndex, eIndex)">Удалить</button>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="5">
                                    <button class="btn btn-outline-primary btn-sm" @click="addEvent(bIndex)">Добавить мероприятие</button>
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
                            <label class="form-label">Годы реализации</label>
                            <input v-model="newBlockYears" type="text" class="form-control" placeholder="2025–2027" />
                        </div>
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
</template>

<script setup>
import { ref } from 'vue'
import { Home, Target, Wrench, Inbox } from 'lucide-vue-next'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench, to: { name: 'ProjectEdTechnical' } },
    { label: 'Программа развития БГТУ', icon: Target }
])

let nextBlockId = 1
let nextEventId = 1

const newBlockTitle = ref('')
const newBlockYears = ref('')
const newBlockResults = ref('')

const blocks = ref([])
const isCreateModalOpen = ref(false)

function addBlock() {
    if (!newBlockTitle.value.trim()) return
    blocks.value.push({
        id: nextBlockId++,
        title: newBlockTitle.value.trim(),
        years: newBlockYears.value.trim(),
        results: newBlockResults.value.trim(),
        events: []
    })
    newBlockTitle.value = ''
    newBlockYears.value = ''
    newBlockResults.value = ''
}

function editBlock(index) {
    const block = blocks.value[index]
    newBlockTitle.value = block.title
    newBlockYears.value = block.years
    newBlockResults.value = block.results
    blocks.value.splice(index, 1)
}

function removeBlock(index) {
    blocks.value.splice(index, 1)
}

function addEvent(blockIndex) {
    blocks.value[blockIndex].events.push({
        id: nextEventId++,
        code: '',
        name: '',
        results: '',
        years: ''
    })
}

function removeEvent(blockIndex, eventIndex) {
    blocks.value[blockIndex].events.splice(eventIndex, 1)
}

function openCreateModal() {
    isCreateModalOpen.value = true
}

function closeCreateModal() {
    isCreateModalOpen.value = false
}

function createBlockFromModal() {
    if (!newBlockTitle.value.trim()) return
    addBlock()
    isCreateModalOpen.value = false
}
</script>

<style scoped lang="scss">
.page-container { display: flex; flex-direction: column; height: 100%; }
.page-content { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
</style>


