<template>
    <div class="target-indicators">
        <div class="step-header">
            <h2 class="step-title">Целевые показатели</h2>
            <p class="step-description">
                Определите количественные и качественные показатели для оценки эффективности проекта
            </p>
        </div>

        <div class="form-content">
            <div class="indicators-tabs">
                <button
                    class="tab-button"
                    :class="{ active: activeTab === 'quantitative' }"
                    @click="activeTab = 'quantitative'"
                >
                    <BarChart3 class="tab-icon" :size="18" />
                    Количественные показатели
                </button>
                <button
                    class="tab-button"
                    :class="{ active: activeTab === 'qualitative' }"
                    @click="activeTab = 'qualitative'"
                >
                    <TrendingUp class="tab-icon" :size="18" />
                    Качественные показатели
                </button>
            </div>

            <!-- Количественные показатели -->
            <div v-if="activeTab === 'quantitative'" class="tab-content">
                <div class="indicators-header">
                    <h3>Количественные показатели</h3>
                    <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        @click="addQuantitativeIndicator"
                    >
                        <Plus class="btn-icon" :size="16" />
                        Добавить показатель
                    </button>
                </div>

                <div class="indicators-list">
                    <div
                        v-for="(indicator, index) in localIndicators.quantitative"
                        :key="`quant-${index}`"
                        class="indicator-card"
                    >
                        <div class="indicator-header">
                            <h4>Показатель {{ index + 1 }}</h4>
                            <button
                                type="button"
                                class="btn-remove"
                                @click="removeQuantitativeIndicator(index)"
                            >
                                <X class="icon" :size="16" />
                            </button>
                        </div>
                        
                        <div class="indicator-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label required">Название показателя</label>
                                    <input
                                        v-model="indicator.name"
                                        type="text"
                                        class="form-input"
                                        placeholder="Например: Количество участников"
                                    />
                                </div>
                                <div class="form-group">
                                    <label class="form-label required">Единица измерения</label>
                                    <input
                                        v-model="indicator.unit"
                                        type="text"
                                        class="form-input"
                                        placeholder="Например: человек"
                                    />
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label required">Плановое значение</label>
                                    <input
                                        v-model.number="indicator.targetValue"
                                        type="number"
                                        class="form-input"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Фактическое значение</label>
                                    <input
                                        v-model.number="indicator.actualValue"
                                        type="number"
                                        class="form-input"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Описание</label>
                                <textarea
                                    v-model="indicator.description"
                                    class="form-textarea"
                                    rows="2"
                                    placeholder="Дополнительное описание показателя"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="localIndicators.quantitative.length === 0" class="empty-state">
                    <BarChart3 class="empty-icon" :size="48" />
                    <h4>Нет количественных показателей</h4>
                    <p>Добавьте показатели для отслеживания численных результатов проекта</p>
                    <button
                        type="button"
                        class="btn btn-primary"
                        @click="addQuantitativeIndicator"
                    >
                        <Plus class="btn-icon" :size="16" />
                        Добавить первый показатель
                    </button>
                </div>
            </div>

            <!-- Качественные показатели -->
            <div v-if="activeTab === 'qualitative'" class="tab-content">
                <div class="indicators-header">
                    <h3>Качественные показатели</h3>
                    <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        @click="addQualitativeIndicator"
                    >
                        <Plus class="btn-icon" :size="16" />
                        Добавить показатель
                    </button>
                </div>

                <div class="indicators-list">
                    <div
                        v-for="(indicator, index) in localIndicators.qualitative"
                        :key="`qual-${index}`"
                        class="indicator-card"
                    >
                        <div class="indicator-header">
                            <h4>Показатель {{ index + 1 }}</h4>
                            <button
                                type="button"
                                class="btn-remove"
                                @click="removeQualitativeIndicator(index)"
                            >
                                <X class="icon" :size="16" />
                            </button>
                        </div>
                        
                        <div class="indicator-form">
                            <div class="form-group">
                                <label class="form-label required">Название показателя</label>
                                <input
                                    v-model="indicator.name"
                                    type="text"
                                    class="form-input"
                                    placeholder="Например: Уровень удовлетворенности"
                                />
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label required">Критерии оценки</label>
                                <textarea
                                    v-model="indicator.criteria"
                                    class="form-textarea"
                                    rows="3"
                                    placeholder="Опишите критерии для оценки данного показателя"
                                ></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Методы измерения</label>
                                <textarea
                                    v-model="indicator.methods"
                                    class="form-textarea"
                                    rows="2"
                                    placeholder="Опишите методы измерения показателя"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="localIndicators.qualitative.length === 0" class="empty-state">
                    <TrendingUp class="empty-icon" :size="48" />
                    <h4>Нет качественных показателей</h4>
                    <p>Добавьте показатели для оценки качественных аспектов проекта</p>
                    <button
                        type="button"
                        class="btn btn-primary"
                        @click="addQualitativeIndicator"
                    >
                        <Plus class="btn-icon" :size="16" />
                        Добавить первый показатель
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
    BarChart3, 
    TrendingUp, 
    Plus, 
    X
} from 'lucide-vue-next'

const props = defineProps({
    indicators: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:indicators'])

// Локальные данные
const activeTab = ref('quantitative')
const localIndicators = ref({
    quantitative: [...(props.indicators.quantitative || [])],
    qualitative: [...(props.indicators.qualitative || [])]
})

// Валидация
const hasIndicators = computed(() => {
    return localIndicators.value.quantitative.length > 0 || 
           localIndicators.value.qualitative.length > 0
})

// Методы для количественных показателей
const addQuantitativeIndicator = () => {
    localIndicators.value.quantitative.push({
        name: '',
        unit: '',
        targetValue: 0,
        actualValue: 0,
        description: ''
    })
}

const removeQuantitativeIndicator = (index) => {
    localIndicators.value.quantitative.splice(index, 1)
}

// Методы для качественных показателей
const addQualitativeIndicator = () => {
    localIndicators.value.qualitative.push({
        name: '',
        criteria: '',
        methods: ''
    })
}

const removeQualitativeIndicator = (index) => {
    localIndicators.value.qualitative.splice(index, 1)
}


// Следим за изменениями и обновляем родительский компонент
watch(localIndicators, (newValue) => {
    emit('update:indicators', newValue)
}, { deep: true })
</script>

<style scoped lang="scss">
.target-indicators {
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

.indicators-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid #dee2e6;
}

.tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;

    &:hover {
        color: #0d6efd;
    }

    &.active {
        color: #0d6efd;
        border-bottom-color: #0d6efd;
    }
}

.tab-icon {
    flex-shrink: 0;
}

.tab-content {
    min-height: 400px;
}

.indicators-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #212529;
    }
}

.indicators-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.indicator-card {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
}

.indicator-header {
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

.indicator-form {
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

    &::placeholder {
        color: #6c757d;
    }
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
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


// Адаптивность
@media (max-width: 768px) {
    .indicators-tabs {
        flex-direction: column;
    }

    .tab-button {
        justify-content: center;
    }

    .indicators-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

}
</style>
