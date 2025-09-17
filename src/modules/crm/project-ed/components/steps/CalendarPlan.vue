<template>
    <div class="calendar-plan">
        <div class="step-header">
            <h2 class="step-title">Календарный план-график</h2>
            <p class="step-description">
                Определите временные рамки проекта и ключевые этапы
            </p>
        </div>

        <div class="form-content">
            <form class="calendar-form">
                <!-- Этапы проекта -->
                <div class="form-section">
                    <div class="section-header">
                        <div class="actions">
                            <button type="button" class="btn btn-outline-primary btn-sm" @click="addStage">
                                <Plus class="btn-icon" :size="16" />
                                Добавить этап
                            </button>
                        </div>
                    </div>

                    <div class="stages-grid">
                        <div
                            v-for="(stage, index) in localPlan.stages"
                            :key="`stage-${index}`"
                            class="stage-card"
                        >
                            <div class="stage-card__header">
                                <div class="stage-index">Этап {{ index + 1 }}</div>
                                <button
                                    v-if="localPlan.stages.length > 1"
                                    type="button"
                                    class="btn-remove stage-remove"
                                    @click="removeStage(index)"
                                    aria-label="Удалить этап"
                                >
                                    <X class="icon" :size="16" />
                                </button>
                            </div>

                            <div class="stage-row-1">
                                <div class="field">
                                    <div class="field-caption">Наименование этапа</div>
                                    <input
                                        v-model="stage.name"
                                        type="text"
                                        class="form-input"
                                        placeholder="Введите текст"
                                    />
                                </div>
                            </div>

                            <div class="stage-row-2">
                                <div class="field field--with-icon" :class="{ 'is-readonly': index === 0 }">
                                    <div class="field-caption">Дата начала</div>
                                    <div class="date-input-wrapper">
                                        <input
                                            v-model="stage.start"
                                            @click="openNativePicker"
                                            type="date"
                                            class="form-input"
                                            :readonly="index === 0"
                                            :min="normalizedStartDate"
                                            :max="normalizedEndDate"
                                        />
                                        <div v-if="index === 0" class="info-icon" @mouseenter="showInfo('start', index, $event)" @mouseleave="hideInfo">
                                            <CircleQuestionMark :size="18" />
                                        </div>
                                    </div>
                                </div>

                                <div class="field field--with-icon" :class="{ 'is-readonly': index === localPlan.stages.length - 1 }">
                                    <div class="field-caption">Дата окончания</div>
                                    <div class="date-input-wrapper">
                                        <input
                                            v-model="stage.end"
                                            @click="openNativePicker"
                                            type="date"
                                            class="form-input"
                                            :readonly="index === localPlan.stages.length - 1"
                                            :min="normalizedStartDate"
                                            :max="normalizedEndDate"
                                        />
                                        <div v-if="index === localPlan.stages.length - 1" class="info-icon" @mouseenter="showInfo('end', index, $event)" @mouseleave="hideInfo">
                                            <CircleQuestionMark :size="18" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="stage-row-3">
                                <div class="field">
                                    <div class="field-caption">Планируемые результаты работы</div>
                                    <textarea
                                        v-model="stage.result"
                                        class="form-textarea"
                                        placeholder="Введите текст"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="localPlan.stages.length === 0" class="empty-state">
                        <Calendar class="empty-icon" :size="48" />
                        <h4>Нет этапов</h4>
                        <p>Добавьте этапы проекта</p>
                        <button type="button" class="btn btn-primary" @click="addStage">
                            <Plus class="btn-icon" :size="16" /> Добавить первый этап
                        </button>
                    </div>
                </div>
            </form>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { 
    Calendar, 
    Plus, 
    X,
    CircleHelp as CircleQuestionMark
} from 'lucide-vue-next'

const props = defineProps({
    plan: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:plan'])

// Нормализация дат к формату YYYY-MM-DD (поддержка старых структур)
const toISODate = (value) => {
    if (!value) return ''
    if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
        const parsed = new Date(value)
        if (!isNaN(parsed)) {
            const y = parsed.getFullYear()
            const m = String(parsed.getMonth() + 1).padStart(2, '0')
            const d = String(parsed.getDate()).padStart(2, '0')
            return `${y}-${m}-${d}`
        }
        return ''
    }
    if (value instanceof Date && !isNaN(value)) {
        const y = value.getFullYear()
        const m = String(value.getMonth() + 1).padStart(2, '0')
        const d = String(value.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }
    if (typeof value === 'object' && value.day && value.month && value.year) {
        const y = value.year
        const m = String(value.month).padStart(2, '0')
        const d = String(value.day).padStart(2, '0')
        return `${y}-${m}-${d}`
    }
    return ''
}

// Локальные данные
const localPlan = ref({
    startDate: toISODate(props.plan.startDate) || '',
    endDate: toISODate(props.plan.endDate) || '',
    stages: props.plan.stages ? [...props.plan.stages] : [
        { name: '', start: '', end: '', result: '' },
        { name: '', start: '', end: '', result: '' },
        { name: '', start: '', end: '', result: '' }
    ]
})

// Вычисляемые свойства
const projectDuration = computed(() => {
    if (!localPlan.value.startDate || !localPlan.value.endDate) return null
    const start = new Date(localPlan.value.startDate)
    const end = new Date(localPlan.value.endDate)
    const diffTime = Math.abs(end - start)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const normalizedStartDate = computed(() => toISODate(localPlan.value.startDate))
const normalizedEndDate = computed(() => toISODate(localPlan.value.endDate))

// Даты по умолчанию (как в BasicProvisions)
const getDefaultStartDate = () => {
    const today = new Date()
    const nextMonth = today.getMonth() + 1
    const nextYear = nextMonth > 11 ? today.getFullYear() + 1 : today.getFullYear()
    const actualNextMonth = nextMonth > 11 ? 0 : nextMonth
    const firstDay = new Date(nextYear, actualNextMonth, 1)
    return toISODate(firstDay)
}

const getDefaultEndDate = () => {
    const today = new Date()
    const endOfYear = new Date(today.getFullYear(), 11, 31)
    return toISODate(endOfYear)
}


const isFormValid = computed(() => {
    return localPlan.value.startDate !== '' &&
        localPlan.value.endDate !== '' &&
        new Date(localPlan.value.startDate) < new Date(localPlan.value.endDate)
})

// Методы
const addStage = () => {
    localPlan.value.stages.push({ name: '', start: '', end: '', result: '' })
}

const removeStage = (index) => {
    localPlan.value.stages.splice(index, 1)
}

// Обработчики больше не нужны — используем v-model у инпутов дат

// Открыть нативный пикер даты по клику/фокусу
const openNativePicker = (e) => {
    const el = e?.target
    // Блокируем не пользовательские вызовы и readonly инпуты
    if (!e?.isTrusted || !el || el.readOnly) return
    if (typeof el.showPicker === 'function') {
        try {
            el.showPicker()
        } catch (_) {
            // в браузерах без поддержки или без активации пользователя — просто игнорируем
        }
    }
}

// Поповер как в BasicProvisions
const datePopover = ref(null)
let popoverTarget = null

const ensureDatePopover = () => {
    if (!datePopover.value) {
        const popover = document.createElement('div')
        popover.className = 'custom-popover'
        popover.innerHTML = `
            <div class="custom-popover-arrow"></div>
            <div class="custom-popover-content"></div>
        `
        document.body.appendChild(popover)
        datePopover.value = popover

        const handleResize = () => repositionPopover()
        window.addEventListener('resize', handleResize)
        window.addEventListener('scroll', handleResize)
        popover._resizeHandler = handleResize
    }
}

const repositionPopover = () => {
    if (!datePopover.value || !popoverTarget) return
    const rect = popoverTarget.getBoundingClientRect()
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft
    const scrollY = window.pageYOffset || document.documentElement.scrollTop
    const pop = datePopover.value
    pop.style.display = 'block'
    // позиционируем над центром иконки
    const left = rect.left + scrollX + rect.width / 2 - pop.offsetWidth / 2
    const top = rect.top + scrollY - pop.offsetHeight - 8
    pop.style.left = Math.max(10, left) + 'px'
    pop.style.top = Math.max(10, top) + 'px'
}

const showInfo = (type, index, evt) => {
    ensureDatePopover()
    const target = evt?.currentTarget
    if (!datePopover.value || !target) return
    popoverTarget = target
    const content = datePopover.value.querySelector('.custom-popover-content')
    if (content) {
        content.textContent = type === 'start' ? 'Дата берётся из даты начала проекта' : 'Дата берётся из даты окончания проекта'
    }
    repositionPopover()
}

const hideInfo = () => {
    if (datePopover.value) {
        datePopover.value.style.display = 'none'
    }
    popoverTarget = null
}

onUnmounted(() => {
    if (datePopover.value) {
        if (datePopover.value._resizeHandler) {
            window.removeEventListener('resize', datePopover.value._resizeHandler)
            window.removeEventListener('scroll', datePopover.value._resizeHandler)
        }
        datePopover.value.remove()
        datePopover.value = null
    }
})

const formatDate = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}


// Синхронизация дат: начало первого этапа и окончание последнего
watch(() => [normalizedStartDate.value, normalizedEndDate.value, localPlan.value.stages.length], () => {
    if (localPlan.value.stages.length > 0) {
        // проставляем значения прямо в модели этапов, в ISO-формате
        localPlan.value.stages[0].start = normalizedStartDate.value || ''
        localPlan.value.stages[localPlan.value.stages.length - 1].end = normalizedEndDate.value || ''
    }
}, { immediate: true })

// При изменении входных данных плана снаружи (выбор мероприятия), подтягиваем даты в первый/последний этап
watch(() => props.plan, (newPlan) => {
    if (!newPlan) return
    if (newPlan.startDate !== undefined) localPlan.value.startDate = toISODate(newPlan.startDate)
    if (newPlan.endDate !== undefined) localPlan.value.endDate = toISODate(newPlan.endDate)
}, { deep: true, immediate: true })

// Следим за изменениями и обновляем родительский компонент
watch(localPlan, (newValue) => {
    emit('update:plan', newValue)
}, { deep: true })

// Инициализация дат по умолчанию при пустых значениях (поведение как в BasicProvisions)
onMounted(() => {
    nextTick(() => {
        if (!localPlan.value.startDate) localPlan.value.startDate = getDefaultStartDate()
        if (!localPlan.value.endDate) localPlan.value.endDate = getDefaultEndDate()
        // Притянуть сразу в этапы
        if (localPlan.value.stages.length > 0) {
            localPlan.value.stages[0].start = normalizedStartDate.value
            localPlan.value.stages[localPlan.value.stages.length - 1].end = normalizedEndDate.value
        }
    })
})
</script>

<style scoped lang="scss">
.calendar-plan {
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
    flex: 1;
}

.calendar-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #dee2e6;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #0d6efd;
}

.date-range {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-label {
    font-weight: 500;
    color: #212529;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;

    &.required::after {
        content: ' *';
        color: #dc3545;
    }
}

.form-input,
.form-textarea {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
        outline: none;
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
}
.form-input[type='date'] {

    &::-webkit-calendar-picker-indicator {
        position: absolute;
        right: 12px;
    }

    &::-moz-calendar-picker-indicator {
        position: absolute;
        right: 12px;
    }
}


.form-textarea {
    resize: vertical;
    min-height: 80px;
}

// Сетка этапов
.stages-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.stage-card {
    background: #f1f3f5;
    border: 1px solid #dee2e6;
    border-radius: 10px;
    padding: 1rem;
}

.stage-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
}

.stage-index {
    font-weight: 600;
    color: #495057;
}

.stage-row-1,
.stage-row-3 {
    display: block;
}

.stage-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

@media (max-width: 768px) {
    .stage-row-2 {
        grid-template-columns: 1fr;
    }
}

.stage-card .stage-remove {
    height: 32px;
    width: 32px;
    margin: 0;
}

.stage-row {
    display: grid;
    grid-template-columns: 48px 1.2fr 0.9fr 0.9fr 1.4fr 40px;
    gap: 0.75rem;
    align-items: start;
}

.stage-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: #f1f3f5;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    font-weight: 600;
    color: #495057;
}

.field {
    display: flex;
    flex-direction: column;
}

.field-caption {
    margin-bottom: 0.35rem;
    font-size: 0.75rem;
    color: #6c757d;
}

.field--with-icon .date-input-wrapper {
    position: relative;
    width: 100%;
}

.field--with-icon .info-icon {
    position: absolute;
    right: 16px; // оставляем место под нативную иконку календаря
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-secondary-text);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto; // позволяем hover
    cursor: help;
    z-index: 2;
}

.date-info-popover {
    position: absolute;
    z-index: 1100;
    background: #212529;
    color: #fff;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 0.8rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 220px;
    pointer-events: none;
}

// Чтобы иконка не перекрывала текст
.field--with-icon .form-input {
    width: 100%;
}

.stage-remove {
    align-self: start;
    margin-top: 8px; // выравнивание относительно высоты инпута, а не всей строки
}

.form-input[readonly] {
    background: #e9ecef;
    cursor: not-allowed;
}

.duration-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #d1ecf1;
    color: #0c5460;
    border-radius: 6px;
    font-weight: 500;

    .icon {
        flex-shrink: 0;
    }
}

.milestones-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.milestone-card {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
}

.milestone-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #212529;
    }
}

.btn-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background: #c82333;
    }

    .icon {
        flex-shrink: 0;
    }
}

// Выровнять кнопку удаления по вертикали относительно инпута
.stage-row .stage-remove {
    height: 40px;
    width: 40px;
    display: inline-flex;
}

.milestone-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #6c757d;

    .empty-icon {
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    h4 {
        margin: 0 0 0.5rem 0;
        color: #495057;
    }

    p {
        margin: 0 0 1.5rem 0;
    }
}

.timeline {
    position: relative;
    padding: 2rem 0;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 2rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #dee2e6;
}

.timeline-item {
    position: relative;
    margin-bottom: 2rem;
    padding-left: 4rem;

    &:last-child {
        margin-bottom: 0;
    }
}

.timeline-marker {
    position: absolute;
    left: 1.5rem;
    top: 0.5rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 0 2px #dee2e6;

    &.start {
        background: #198754;
        box-shadow: 0 0 0 2px #198754;
    }

    &.milestone {
        background: #0d6efd;
        box-shadow: 0 0 0 2px #0d6efd;
    }

    &.end {
        background: #dc3545;
        box-shadow: 0 0 0 2px #dc3545;
    }
}

.timeline-content {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    h5 {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: #212529;
    }

    p {
        margin: 0 0 0.5rem 0;
        color: #6c757d;
        font-size: 0.875rem;

        &:last-child {
            margin-bottom: 0;
        }

        &.description {
            font-style: italic;
            color: #495057;
        }
    }
}


// Адаптивность
@media (max-width: 768px) {
    .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

    .stage-row {
        grid-template-columns: 32px 1fr;
    }

    .stage-remove {
        grid-column: 2 / 3;
        justify-self: start;
    }

    .timeline {
        padding-left: 1rem;
    }

    .timeline::before {
        left: 1rem;
    }

    .timeline-item {
        padding-left: 3rem;
    }

    .timeline-marker {
        left: 0.5rem;
    }

}
</style>
