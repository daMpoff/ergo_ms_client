<template>
    <div class="event-selection">
        <div class="step-header">
            <h2 class="step-title">Выбор мероприятия</h2>
            <p class="step-description">
                Выберите мероприятие, для которого создается проект
            </p>
        </div>

        <div class="form-content">
            <!-- Фильтры и поиск -->
            <div class="filters-section">
                <div class="filters-row">
                    <div class="filter-group">
                        <label class="filter-label">Наименование политики/ стратегического проекта</label>
                        <SelectBox
                            v-model="selectedPolicy"
                            :options="policies"
                            :valueKey="'id'"
                            :labelKey="'title'"
                            :castToNumber="true"
                            :includeAllOption="true"
                            allLabel="Выберите политику/проект"
                            @change="onPolicyChange"
                        />
                    </div>
                    
                    <div class="filter-group">
                        <label class="filter-label">Наименование блока мероприятий</label>
                        <SelectBox
                            v-model="selectedBlock"
                            :options="availableBlocks"
                            :valueKey="'id'"
                            :labelKey="'title'"
                            :castToNumber="true"
                            :includeAllOption="true"
                            allLabel="Выберите блок мероприятий"
                            :currentLabelFormatter="({ option, label }) => (option?.code ? option.code : label)"
                            @change="onBlockChange"
                        />
                    </div>
                    
                    <div class="filter-group">
                        <label class="filter-label">Срок реализации</label>
                        <SelectBox
                            v-model="selectedPeriod"
                            :options="availablePeriods"
                            :includeAllOption="true"
                            allLabel="Выберите срок"
                            @change="onPeriodChange"
                        />
                    </div>
                </div>
            </div>

            <!-- Переключатель секций -->
            <div v-if="filteredEventSections.length > 1" class="sections-tabs">
                <button
                    v-for="section in filteredEventSections"
                    :key="section.id"
                    class="section-tab"
                    :class="{ 'active': activeSectionId === section.id }"
                    @click="setActiveSection(section.id)"
                >
                    {{ section.shortTitle || `МП${section.id}` }}
                </button>
            </div>

            <div class="events-sections">
                <div
                    v-for="section in filteredEventSections"
                    :key="section.id"
                    class="event-section"
                    :class="{ 'active': activeSectionId === section.id }"
                >
                    <h2 class="section-title">{{ section.code ? (section.code + '. ') : '' }}{{ section.title }}</h2>
                    <div class="events-grid">
                        <div
                            v-for="event in section.events"
                            :key="event.id"
                            class="event-card"
                            :class="{ 'selected': selectedEvent?.id === event.id, 'highlighted': event.highlighted }"
                            @click="selectEvent(event)"
                        >
                            <div class="event-header">
                                <div class="event-code">{{ event.code }}</div>
                            </div>
                            <h3 class="event-title">{{ event.title }}</h3>
                            
                            <div class="event-details">
                                <div class="event-period">
                                    <Calendar class="icon" :size="16" />
                                    {{ event.period }}
                                </div>
                            </div>
                            
                            <div class="event-content">
                                <p class="event-key-results">{{ event.keyResults }}</p>
                                
                                <div class="event-footer">
                                    <div 
                                        class="event-leaders" 
                                        :ref="el => setLeaderButtonRef(event.id, el)"
                                        :data-event-id="event.id"
                                        @mouseenter="showLeadersTooltip(event, $event)"
                                        @mouseleave="hideLeadersTooltip"
                                    >
                                        <Users class="icon" :size="16" />
                                        {{ event.leaders.length }} {{ getLeadersText(event.leaders.length) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="filteredEventSections.length === 0 || filteredEventSections.every(section => section.events.length === 0)" class="no-events">
                <Calendar class="no-events-icon" :size="48" />
                <h3>Мероприятия не найдены</h3>
                <p>Попробуйте изменить поисковый запрос</p>
            </div>
        </div>

        <!-- Тултип для руководителей -->
        <SimpleTooltip
            :visible="tooltipVisible"
            :target-element="tooltipTarget"
            @mouseenter="handleTooltipMouseEnter"
            @mouseleave="handleTooltipMouseLeave"
        >
            <LeadersList 
                :leaders="hoveredEvent?.leaders || []" 
                @open-modal="openLeadersModal"
            />
        </SimpleTooltip>

        <!-- Модальное окно с полным списком руководителей -->
        <LeadersModal
            v-if="leadersModalVisible"
            :visible="true"
            :leaders="modalLeaders"
            @close="closeLeadersModal"
        />

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
    Calendar, 
    MapPin, 
    Users 
} from 'lucide-vue-next'
import SimpleTooltip from '../SimpleTooltip.vue'
import LeadersList from '../LeadersList.vue'
import LeadersModal from '../LeadersModal.vue'
import SelectBox from '@/components/SelectBox.vue'
import { apiClient } from '@/js/api/manager.js'

const props = defineProps({
    event: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['update:event'])

// Данные
const selectedEvent = ref(props.event)
const eventSections = ref([])

// Фильтры
const selectedPolicy = ref('')
const selectedBlock = ref('')
const selectedPeriod = ref('')
const activeSectionId = ref(null)

// Справочные данные
const policies = ref([])
const blocks = ref([])
const periods = ref([])

// Вычисляемые свойства для фильтров
const availableBlocks = computed(() => {
    // Если выбрана политика — берем её блоки, иначе все блоки
    if (selectedPolicy.value) {
        const policy = policies.value.find(p => p.id === selectedPolicy.value)
        return policy ? policy.blocks : []
    }
    return blocks.value
})

const availablePeriods = computed(() => {
    if (!selectedBlock.value) return []
    const block = blocks.value.find(b => b.id === selectedBlock.value)
    return block ? block.periods : []
})

// Фильтрация мероприятий
const filteredEventSections = computed(() => {
    let sections = eventSections.value
    
    // Фильтр по политике
    if (selectedPolicy.value) {
        sections = sections.filter(section => section.policyId === selectedPolicy.value)
    }
    
    // Фильтр по блоку мероприятий
    if (selectedBlock.value) {
        sections = sections.filter(section => section.blockId === selectedBlock.value)
    }
    
    // Фильтр по периоду
    if (selectedPeriod.value) {
        sections = sections.filter(section => 
            section.events.some(event => event.period === selectedPeriod.value)
        )
    }
    
    
    return sections
})

// Методы
const selectEvent = (event) => {
    selectedEvent.value = event
    emit('update:event', event)
}



// Методы для работы с фильтрами
const onPolicyChange = () => {
    selectedBlock.value = ''
    selectedPeriod.value = ''
    // Устанавливаем первую доступную секцию
    if (filteredEventSections.value.length > 0) {
        activeSectionId.value = filteredEventSections.value[0].id
    }
}

const onBlockChange = () => {
    selectedPeriod.value = ''
    // Устанавливаем первую доступную секцию
    if (filteredEventSections.value.length > 0) {
        activeSectionId.value = filteredEventSections.value[0].id
    }
}

const onPeriodChange = () => {
    // Устанавливаем первую доступную секцию
    if (filteredEventSections.value.length > 0) {
        activeSectionId.value = filteredEventSections.value[0].id
    }
}

const setActiveSection = (sectionId) => {
    activeSectionId.value = sectionId
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

const getStatusText = (status) => {
    const statusMap = {
        'planned': 'Запланировано',
        'active': 'Активно',
        'completed': 'Завершено',
        'cancelled': 'Отменено'
    }
    return statusMap[status] || status
}

// Тултип для руководителей
const tooltipVisible = ref(false)
const hoveredEvent = ref(null)
const tooltipTarget = ref(null)
const leaderButtonRefs = ref(new Map())
let hideTimeout = null

// Модальное окно для руководителей
const leadersModalVisible = ref(false)
const modalLeaders = ref([])

const getLeadersText = (count) => {
    if (count === 1) return 'руководитель'
    if (count >= 2 && count <= 4) return 'руководителя'
    return 'руководителей'
}

const setLeaderButtonRef = (eventId, el) => {
    if (el) {
        leaderButtonRefs.value.set(eventId, el)
    } else {
        leaderButtonRefs.value.delete(eventId)
    }
}

const showLeadersTooltip = (event, mouseEvent) => {
    // Отменяем предыдущий таймер скрытия
    if (hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
    }
    
    hoveredEvent.value = event
    
    // Используем currentTarget - это должен быть элемент event-leaders
    tooltipTarget.value = mouseEvent.currentTarget
    
    tooltipVisible.value = true
}

const hideLeadersTooltip = () => {
    // Устанавливаем задержку для плавного перехода
    hideTimeout = setTimeout(() => {
        tooltipVisible.value = false
        hoveredEvent.value = null
        tooltipTarget.value = null
    }, 150)
}

const handleTooltipMouseEnter = () => {
    // Отменяем скрытие тултипа при наведении на него
    if (hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
    }
}

const handleTooltipMouseLeave = () => {
    // Скрываем тултип при уходе с него
    hideTimeout = setTimeout(() => {
        tooltipVisible.value = false
        hoveredEvent.value = null
        tooltipTarget.value = null
    }, 100)
}

// Методы для управления модальным окном руководителей
const openLeadersModal = () => {
    // Сохраняем данные о руководителях перед открытием модального окна
    if (hoveredEvent.value?.leaders) {
        modalLeaders.value = [...hoveredEvent.value.leaders]
    }
    leadersModalVisible.value = true
}

const closeLeadersModal = () => {
    leadersModalVisible.value = false
    // Очищаем сохраненные данные о руководителях
    modalLeaders.value = []
}

// Загрузка данных
onMounted(async () => {
    try {
        // Загружаем блоки мероприятий вместе с вложенными мероприятиями
        const resp = await apiClient.get('/project_ed/event-blocks/')
        const list = Array.isArray(resp?.data) ? resp.data : (resp?.data?.results || [])

        // Строим справочник категорий (политик) из блоков
        const uniquePoliciesMap = new Map()
        const blocksForSelect = []
        const allPeriods = new Set()
        const sections = []

        for (const b of list) {
            // Политика/категория
            if (b.category) {
                if (!uniquePoliciesMap.has(b.category)) {
                    uniquePoliciesMap.set(b.category, { id: b.category, title: b.category_name || `Категория ${b.category}`, blocks: [] })
                }
            }

            // Периоды из мероприятий
            const periodsOfBlock = new Set()
            const events = Array.isArray(b.events) ? b.events : []
            const mappedEvents = events.map(e => {
                if (e.years_display) { periodsOfBlock.add(e.years_display); allPeriods.add(e.years_display) }
                return {
                    id: e.id,
                    code: e.code,
                    title: e.name,
                    keyResults: e.results,
                    period: e.years_display || `${e.start_year || ''}${e.end_year ? '-' + e.end_year : ''}`,
                    highlighted: false,
                    leaders: []
                }
            })

            // Секция = блок мероприятий
            sections.push({
                id: b.id,
                policyId: b.category || null,
                blockId: b.id,
                code: b.code || null,
                title: b.title,
                shortTitle: b.code || b.title,
                events: mappedEvents
            })

            // Элемент для селекта блоков
            blocksForSelect.push({ id: b.id, title: b.title, code: b.code || null, periods: Array.from(periodsOfBlock) })

            // Привяжем блок к политике
            const policyRec = uniquePoliciesMap.get(b.category)
            if (policyRec) policyRec.blocks.push({ id: b.id, title: b.title, code: b.code || null, periods: Array.from(periodsOfBlock) })
        }

        policies.value = Array.from(uniquePoliciesMap.values())
        blocks.value = blocksForSelect
        periods.value = Array.from(allPeriods)
        eventSections.value = sections

        if (eventSections.value.length > 0) {
            activeSectionId.value = eventSections.value[0].id
        }
    } catch (e) {
        // В случае ошибки пусть интерфейс остаётся пустым
        policies.value = []
        blocks.value = []
        periods.value = []
        eventSections.value = []
    }
})
</script>

<style scoped lang="scss">
.event-selection {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.step-header {
    text-align: center;
    margin-bottom: 1rem;
}

.step-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.5rem 0;
}

.step-description {
    color: #6c757d;
    margin: 0;
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.filters-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #dee2e6;
}

.filters-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
    gap: 1.5rem;
    margin-bottom: 1rem;
    align-items: end; // выравниваем группы по низу, чтобы инпуты были на одной линии
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0; // критично, чтобы контент мог сжиматься внутри грид-колонки
}

/* Гарантируем, что SelectBox занимает всю ширину колонки и текст не растягивает кнопку */
.filter-group :deep(.select-box) { width: 100%; max-width: 100%; }
.filter-group :deep(.select-trigger) { width: 100%; }
.filter-group :deep(.select-trigger .value-text) {
    display: block;
    flex: 1 1 auto;
    min-width: 0; /* критично для обрезки во flex-контейнере */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.filter-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #495057;
    line-height: 1.2;
    min-height: 2.25rem; // обеспечиваем одинаковую высоту области подписи
    display: flex;
    align-items: flex-end; // текст подписи прижат к низу области
}

.combobox-container {
    position: relative;
}

.combobox {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;
    appearance: none;
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }

    &:hover {
        border-color: #adb5bd;
    }
}

.combobox-icon {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    pointer-events: none;
}


.sections-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0 0.5rem;
    border-bottom: 1px solid #dee2e6;
}

.section-tab {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #6c757d;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        color: #0d6efd;
        background: #f8f9ff;
    }

    &.active {
        color: #0d6efd;
        border-bottom-color: #0d6efd;
        background: #f8f9ff;
    }
}

.events-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.event-section {
    display: none;
    
    &.active {
        display: block;
    }
    
    .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #212529;
        margin: 0 0 1.5rem 0;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #0d6efd;
    }
}

.events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
}

.event-card {
    background: white;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;

    &:hover {
        border-color: #0d6efd;
        box-shadow: 0 4px 12px rgba(13, 110, 253, 0.15);
    }

    &.selected {
        border-color: #0d6efd;
        background: #f8f9ff;
        box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
    }

}

.event-header {
    margin-bottom: 0.75rem;
}

.event-code {
    background: #e9ecef;
    color: #495057;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-block;
}

.event-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 1rem 0;
    line-height: 1.4;
}

.event-status {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;

    &.planned {
        background: #cff4fc;
        color: #055160;
    }

    &.active {
        background: #d1e7dd;
        color: #0f5132;
    }

    &.completed {
        background: #d1ecf1;
        color: #0c5460;
    }

    &.cancelled {
        background: #f8d7da;
        color: #721c24;
    }
}

.event-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.event-period {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6c757d;
    font-size: 0.875rem;

    .icon {
        flex-shrink: 0;
    }
}

.event-content {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.event-key-results {
    color: #495057;
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0 0 1rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
}

.event-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    position: relative;
    margin-top: auto;
}

.event-leaders {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #6c757d;
    font-size: 0.75rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    &:hover {
        background: #f8f9fa;
        color: #0d6efd;
    }

    .icon {
        flex-shrink: 0;
    }
}


.no-events {
    text-align: center;
    padding: 3rem 1rem;
    color: #6c757d;

    .no-events-icon {
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    h3 {
        margin: 0 0 0.5rem 0;
        color: #495057;
    }

    p {
        margin: 0;
    }
}


// Адаптивность
@media (max-width: 1200px) {
    .filters-row {
        grid-template-columns: 1fr;
        gap: 1.25rem;
    }
}

@media (max-width: 768px) {
    .filters-row {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .sections-tabs {
        flex-wrap: wrap;
        gap: 0.25rem;
    }
    
    .section-tab {
        padding: 0.5rem 1rem;
        font-size: 0.8125rem;
    }
    
    .events-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .filters-section {
        padding: 1rem;
    }
    
    .sections-tabs {
        padding: 0;
    }
    
    .section-tab {
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
    }
}
</style>
