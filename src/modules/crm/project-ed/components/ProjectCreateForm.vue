<template>
    <div class="project-create-form">
        <!-- Прогресс-бар -->
        <div class="progress-container">
            <div class="progress-bar">
                <div 
                    class="progress-fill" 
                    :style="{ width: `${(currentStep / steps.length) * 100}%` }"
                ></div>
            </div>
            <div class="progress-text">
                Шаг {{ currentStep }} из {{ steps.length }}: {{ steps[currentStep - 1].title }}
            </div>
        </div>

        <!-- Навигация по вкладкам -->
        <div class="tabs-navigation">
            <button
                v-for="(step, index) in steps"
                :key="step.key"
                class="tab-button"
                :class="{
                    'active': currentStep === index + 1,
                    'completed': currentStep > index + 1,
                    'disabled': currentStep < index + 1
                }"
                @click="goToStep(index + 1)"
                :disabled="currentStep < index + 1"
            >
                <component :is="step.icon" class="tab-icon" :size="20" />
                <span class="tab-label">{{ step.title }}</span>
            </button>
        </div>

        <!-- Контент формы -->
        <div class="form-content">
            <div class="form-container">
                <!-- Выбор мероприятия -->
                <EventSelection
                    v-if="currentStep === 1"
                    v-model:event="formData.event"
                />

                <!-- Основные положения -->
                <BasicProvisions
                    v-if="currentStep === 2"
                    v-model:provisions="formData.basicProvisions"
                    :user-role="userRole"
                    :selected-event="formData.event"
                    :user-info="userInfo"
                    @next="nextStep"
                    @prev="prevStep"
                />

                <!-- Целевые показатели -->
                <TargetIndicators
                    v-if="currentStep === 3"
                    v-model:indicators="formData.targetIndicators"
                    @next="nextStep"
                    @prev="prevStep"
                />

                <!-- Календарный план-график -->
                <CalendarPlan
                    v-if="currentStep === 4"
                    v-model:plan="formData.calendarPlan"
                    @next="nextStep"
                    @prev="prevStep"
                />

                <!-- Бюджет -->
                <Budget
                    v-if="currentStep === 5"
                    v-model:budget="formData.budget"
                    :plan="formData.calendarPlan"
                    @validation-change="(validation) => stepValidation.budget = validation"
                    @next="nextStep"
                    @prev="prevStep"
                />

                <!-- Дополнительная информация -->
                <AdditionalInfo
                    v-if="currentStep === 6"
                    v-model:info="formData.additionalInfo"
                    @next="nextStep"
                    @prev="prevStep"
                />
            </div>
        </div>

        <!-- Навигационные кнопки -->
        <div class="form-actions">
            <button
                v-if="currentStep > 1"
                type="button"
                class="btn btn-secondary"
                @click="prevStep"
            >
                <ArrowLeft class="btn-icon" :size="16" />
                Назад
            </button>
            
            <div class="actions-spacer"></div>
            
            <button
                v-if="currentStep < steps.length"
                type="button"
                class="btn btn-primary"
                @click="nextStep"
                :disabled="!canProceed"
            >
                Далее
                <ArrowRight class="btn-icon" :size="16" />
            </button>
            
            <button
                v-if="currentStep === steps.length"
                type="button"
                class="btn btn-success"
                @click="submitForm"
                :disabled="!canSubmit"
            >
                <Check class="btn-icon" :size="16" />
                Создать проект
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { generateInitials } from '@/modules/crm/project-ed/components/steps/js/initialsGenerator.js'
import { useUserStore } from '@/modules/cms/js/userStore.js'
import { 
    Calendar, 
    FileText, 
    Target, 
    Calendar as CalendarIcon, 
    DollarSign, 
    Info,
    ArrowLeft,
    ArrowRight,
    Check
} from 'lucide-vue-next'

// Получаем данные пользователя из store
const userStore = useUserStore()

// Роль пользователя
const userRole = ref('expert') // Может быть: 'user', 'expert', 'admin', 'supervisor'

// Информация о пользователе из store
const userInfo = computed(() => {
    const fullName = userStore.fullName
    return {
        name: fullName,
        initials: generateInitials(fullName)
    }
})

// Импорт компонентов этапов
import EventSelection from './steps/EventSelection.vue'
import BasicProvisions from './steps/BasicProvisions.vue'
import TargetIndicators from './steps/TargetIndicators.vue'
import CalendarPlan from './steps/CalendarPlan.vue'
import Budget from './steps/Budget.vue'
import AdditionalInfo from './steps/AdditionalInfo.vue'

// Определение этапов
const steps = [
    { key: 'event', title: 'Выбор мероприятия', icon: Calendar },
    { key: 'provisions', title: 'Основные положения', icon: FileText },
    { key: 'indicators', title: 'Целевые показатели', icon: Target },
    { key: 'calendar', title: 'Календарный план-график', icon: CalendarIcon },
    { key: 'budget', title: 'Бюджет', icon: DollarSign },
    { key: 'additional', title: 'Дополнительная информация', icon: Info }
]

// Текущий шаг
const currentStep = ref(1)

// Состояние валидации для каждого шага
const stepValidation = reactive({
    budget: { isValid: false, errors: [] }
})

// Данные формы
const formData = reactive({
    event: null,
    basicProvisions: {
        // Основные поля паспорта проекта
        projectName: '',
        projectNameClarification: '',
        shortName: '',
        projectGoal: '',
        projectTasks: ['', ''],
        startDate: '',
        endDate: '',
        curator: null,
        customer: '',
        manager: '',
        executors: [],
        plannedResults: ['', ''],
        budget: 0,
        
        // Комментарии экспертов
        comments: {
            projectName: '',
            shortName: '',
            projectGoal: '',
            projectTasks: '',
            projectDates: '',
            curator: '',
            customer: '',
            manager: '',
            executors: '',
            plannedResults: '',
            budget: ''
        }
    },
    targetIndicators: [],
    calendarPlan: {
        startDate: '',
        endDate: '',
        stages: [],
        milestones: []
    },
    budget: {
        totalAmount: 0,
        items: []
    },
    additionalInfo: {
        risks: '',
        resources: '',
        notes: ''
    }
})

// Валидация
const canProceed = computed(() => {
    switch (currentStep.value) {
        case 1:
            return formData.event !== null
        case 2:
            // Валидация основных положений
            return formData.basicProvisions.projectName.trim() !== '' &&
                   formData.basicProvisions.shortName.trim() !== '' &&
                   formData.basicProvisions.projectGoal.trim() !== '' &&
                   formData.basicProvisions.projectTasks.some(task => task.trim() !== '') &&
                   formData.basicProvisions.startDate !== '' &&
                   formData.basicProvisions.endDate !== '' &&
                   formData.basicProvisions.curator !== null &&
                   formData.basicProvisions.customer !== '' &&
                   formData.basicProvisions.manager !== '' &&
                   formData.basicProvisions.executors && formData.basicProvisions.executors.length > 0 &&
                   formData.basicProvisions.plannedResults.some(result => result.trim() !== '')
        case 3:
            return formData.targetIndicators.length > 0
        case 4:
            return formData.calendarPlan.startDate !== '' && 
                   formData.calendarPlan.endDate !== ''
        case 5:
            return stepValidation.budget.isValid
        case 6:
            return true // Дополнительная информация необязательна
        default:
            return false
    }
})

const canSubmit = computed(() => {
    return canProceed.value && currentStep.value === steps.length
})

// Навигация
const goToStep = (step) => {
    if (step <= currentStep.value) {
        currentStep.value = step
    }
}

const nextStep = () => {
    if (currentStep.value < steps.length && canProceed.value) {
        currentStep.value++
    }
}

const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--
    }
}

// Синхронизация бюджета между разделами
watch(() => formData.budget.totals?.withInsurance, (newAmount) => {
    formData.basicProvisions.budget = newAmount || 0
}, { immediate: true })

// Отправка формы
const emit = defineEmits(['project-created'])

const submitForm = () => {
    if (canSubmit.value) {
        console.log('Отправка данных проекта:', formData)
        // Здесь будет логика отправки данных на сервер
        // Пока что просто эмитим событие с данными
        emit('project-created', formData)
        alert('Проект успешно создан!')
    }
}
</script>

<style scoped lang="scss">
.project-create-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

// Прогресс-бар
.progress-container {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #dee2e6;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #0d6efd, #0b5ed7);
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 0.875rem;
    color: #6c757d;
    text-align: center;
}

// Навигация по вкладкам
.tabs-navigation {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #dee2e6;
}

.tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    min-width: fit-content;

    &:hover:not(.disabled) {
        background: #f8f9fa;
        border-color: #0d6efd;
    }

    &.active {
        background: #0d6efd;
        color: white;
        border-color: #0d6efd;
    }

    &.completed {
        background: #d1e7dd;
        color: #0f5132;
        border-color: #badbcc;
    }

    &.disabled {
        background: #f8f9fa;
        color: #6c757d;
        cursor: not-allowed;
        opacity: 0.6;
    }
}

.tab-icon {
    flex-shrink: 0;
}

.tab-label {
    font-size: 0.875rem;
    font-weight: 500;
}

// Контент формы
.form-content {
    background: white;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    overflow: hidden;
}

.form-container {
    padding: 2rem;
    min-height: 400px;
}

// Кнопки действий
.form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    background: #f8f9fa;
    border-top: 1px solid #dee2e6;
}

.actions-spacer {
    flex: 1;
}

.btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

.btn-primary {
    background: #0d6efd;
    color: white;

    &:hover:not(:disabled) {
        background: #0b5ed7;
    }
}

.btn-secondary {
    background: #6c757d;
    color: white;

    &:hover:not(:disabled) {
        background: #5c636a;
    }
}

.btn-success {
    background: #198754;
    color: white;

    &:hover:not(:disabled) {
        background: #157347;
    }
}

.btn-icon {
    flex-shrink: 0;
}

// Адаптивность
@media (max-width: 768px) {
    .tabs-navigation {
        flex-direction: column;
        gap: 0.25rem;
    }

    .tab-button {
        justify-content: center;
    }

    .form-actions {
        flex-direction: column;
        gap: 1rem;
    }

    .actions-spacer {
        display: none;
    }
}
</style>
