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
                <!-- Основные даты -->
                <div class="form-section">
                    <h3 class="section-title">Временные рамки проекта</h3>
                    
                    <div class="date-range">
                        <div class="form-group">
                            <label for="startDate" class="form-label required">
                                Дата начала проекта
                            </label>
                            <input
                                id="startDate"
                                v-model="localPlan.startDate"
                                type="date"
                                class="form-input"
                                required
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="endDate" class="form-label required">
                                Дата окончания проекта
                            </label>
                            <input
                                id="endDate"
                                v-model="localPlan.endDate"
                                type="date"
                                class="form-input"
                                :min="localPlan.startDate"
                                required
                            />
                        </div>
                    </div>

                    <div v-if="projectDuration" class="duration-info">
                        <Calendar class="icon" :size="16" />
                        Продолжительность проекта: {{ projectDuration }} дней
                    </div>
                </div>

                <!-- Вехи проекта -->
                <div class="form-section">
                    <div class="section-header">
                        <h3 class="section-title">Ключевые вехи проекта</h3>
                        <button
                            type="button"
                            class="btn btn-outline-primary btn-sm"
                            @click="addMilestone"
                        >
                            <Plus class="btn-icon" :size="16" />
                            Добавить веху
                        </button>
                    </div>

                    <div class="milestones-list">
                        <div
                            v-for="(milestone, index) in localPlan.milestones"
                            :key="`milestone-${index}`"
                            class="milestone-card"
                        >
                            <div class="milestone-header">
                                <h4>Веха {{ index + 1 }}</h4>
                                <button
                                    type="button"
                                    class="btn-remove"
                                    @click="removeMilestone(index)"
                                >
                                    <X class="icon" :size="16" />
                                </button>
                            </div>
                            
                            <div class="milestone-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label required">Название вехи</label>
                                        <input
                                            v-model="milestone.name"
                                            type="text"
                                            class="form-input"
                                            placeholder="Например: Завершение планирования"
                                        />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label required">Планируемая дата</label>
                                        <input
                                            v-model="milestone.date"
                                            type="date"
                                            class="form-input"
                                            :min="localPlan.startDate"
                                            :max="localPlan.endDate"
                                        />
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Описание</label>
                                    <textarea
                                        v-model="milestone.description"
                                        class="form-textarea"
                                        rows="2"
                                        placeholder="Описание вехи и ожидаемых результатов"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="localPlan.milestones.length === 0" class="empty-state">
                        <Calendar class="empty-icon" :size="48" />
                        <h4>Нет вех проекта</h4>
                        <p>Добавьте ключевые этапы для отслеживания прогресса</p>
                        <button
                            type="button"
                            class="btn btn-primary"
                            @click="addMilestone"
                        >
                            <Plus class="btn-icon" :size="16" />
                            Добавить первую веху
                        </button>
                    </div>
                </div>

                <!-- Календарная визуализация -->
                <div v-if="localPlan.milestones.length > 0" class="form-section">
                    <h3 class="section-title">Временная шкала проекта</h3>
                    <div class="timeline">
                        <div class="timeline-item start">
                            <div class="timeline-marker start"></div>
                            <div class="timeline-content">
                                <h5>Начало проекта</h5>
                                <p>{{ formatDate(localPlan.startDate) }}</p>
                            </div>
                        </div>
                        
                        <div
                            v-for="(milestone, index) in sortedMilestones"
                            :key="`timeline-${index}`"
                            class="timeline-item milestone"
                        >
                            <div class="timeline-marker milestone"></div>
                            <div class="timeline-content">
                                <h5>{{ milestone.name }}</h5>
                                <p>{{ formatDate(milestone.date) }}</p>
                                <p v-if="milestone.description" class="description">
                                    {{ milestone.description }}
                                </p>
                            </div>
                        </div>
                        
                        <div class="timeline-item end">
                            <div class="timeline-marker end"></div>
                            <div class="timeline-content">
                                <h5>Окончание проекта</h5>
                                <p>{{ formatDate(localPlan.endDate) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
    Calendar, 
    Plus, 
    X
} from 'lucide-vue-next'

const props = defineProps({
    plan: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:plan'])

// Локальные данные
const localPlan = ref({
    startDate: props.plan.startDate || '',
    endDate: props.plan.endDate || '',
    milestones: [...(props.plan.milestones || [])]
})

// Вычисляемые свойства
const projectDuration = computed(() => {
    if (!localPlan.value.startDate || !localPlan.value.endDate) {
        return null
    }
    
    const start = new Date(localPlan.value.startDate)
    const end = new Date(localPlan.value.endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
})

const sortedMilestones = computed(() => {
    return [...localPlan.value.milestones].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    )
})

const isFormValid = computed(() => {
    return localPlan.value.startDate !== '' && 
           localPlan.value.endDate !== '' &&
           new Date(localPlan.value.startDate) < new Date(localPlan.value.endDate)
})

// Методы
const addMilestone = () => {
    localPlan.value.milestones.push({
        name: '',
        date: '',
        description: ''
    })
}

const removeMilestone = (index) => {
    localPlan.value.milestones.splice(index, 1)
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}


// Следим за изменениями и обновляем родительский компонент
watch(localPlan, (newValue) => {
    emit('update:plan', newValue)
}, { deep: true })
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

.form-textarea {
    resize: vertical;
    min-height: 80px;
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
