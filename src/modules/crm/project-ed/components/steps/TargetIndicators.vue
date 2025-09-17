<template>
    <div class="target-indicators">
        <div class="step-header">
            <h2 class="step-title">2. Целевые показатели</h2>
        </div>

        <div class="form-content">
            <div class="indicators-list">
                <div
                    v-for="(indicator, index) in localIndicators"
                    :key="`indicator-${index}`"
                    class="indicator-row"
                >
                    <div class="indicator-number">{{ index + 1 }}</div>
                    
                    <div class="indicator-fields">
                        <div class="form-group">
                            <label class="form-label">наименование показателя</label>
                            <div class="select-wrapper">
                                <select
                                    v-model="indicator.name"
                                    class="form-select"
                                >
                                    <option v-if="!indicator.name" value="" disabled>Выберите показатель</option>
                                    <option 
                                        v-for="option in indicatorOptions" 
                                        :key="option.value"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </option>
                                </select>
                                <ChevronDown class="select-icon" :size="16" />
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">единица измерения</label>
                            <div class="select-wrapper">
                                <select
                                    v-model="indicator.unit"
                                    class="form-select"
                                >
                                    <option v-if="!indicator.unit" value="" disabled>Выберите единицу</option>
                                    <option 
                                        v-for="unit in unitOptions" 
                                        :key="unit.value"
                                        :value="unit.value"
                                    >
                                        {{ unit.label }}
                                    </option>
                                </select>
                                <ChevronDown class="select-icon" :size="16" />
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">базовое (текущее) значение</label>
                            <input
                                v-model.number="indicator.baseValue"
                                type="number"
                                class="form-input"
                                placeholder="0"
                                step="0.01"
                            />
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">планируемое значение</label>
                            <input
                                v-model.number="indicator.targetValue"
                                type="number"
                                class="form-input"
                                placeholder="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        class="btn-remove"
                        @click="removeIndicator(index)"
                        v-if="localIndicators.length > 1"
                    >
                        <X class="icon" :size="16" />
                    </button>
                </div>
            </div>
            
            <button
                type="button"
                class="btn-add"
                @click="addIndicator"
            >
                <Plus class="btn-icon" :size="16" />
                Добавить показатель
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
    Plus, 
    X,
    ChevronDown
} from 'lucide-vue-next'

const props = defineProps({
    indicators: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:indicators'])

// Локальные данные
const localIndicators = ref((props.indicators && props.indicators.length) ? JSON.parse(JSON.stringify(props.indicators)) : [])

// Опции для выпадающих списков
const indicatorOptions = ref([
    { value: 'participants', label: 'Количество участников' },
    { value: 'satisfaction', label: 'Уровень удовлетворенности' },
    { value: 'completion_rate', label: 'Процент выполнения' },
    { value: 'revenue', label: 'Доходы' },
    { value: 'costs', label: 'Расходы' },
    { value: 'efficiency', label: 'Эффективность' },
    { value: 'quality', label: 'Качество' },
    { value: 'time', label: 'Время выполнения' }
])

const unitOptions = ref([
    { value: 'ед', label: 'ед.' },
    { value: '%', label: '%' },
    { value: 'руб', label: 'руб.' },
    { value: 'чел', label: 'чел.' },
    { value: 'м²', label: 'м²' },
    { value: 'балл', label: 'балл' },
    { value: 'синх/нед', label: 'кол-во синхронизаций в неделю' }
])

// Связка показателей и допустимых единиц измерения
const indicatorToUnits = {
    participants: ['чел'],
    satisfaction: ['балл', '%'],
    completion_rate: ['%'],
    revenue: ['руб'],
    costs: ['руб'],
    efficiency: ['%'],
    quality: ['балл', '%'],
    time: ['синх/нед', 'ед']
}

// Методы
const addIndicator = () => {
    const next = [
        ...localIndicators.value,
        {
            name: '',
            unit: '',
            baseValue: 0,
            targetValue: 0
        }
    ]
    localIndicators.value = next
}

const removeIndicator = (index) => {
    localIndicators.value = localIndicators.value.filter((_, i) => i !== index)
}

// Инициализация - добавляем один показатель по умолчанию если список пустой
if (localIndicators.value.length === 0) {
    addIndicator()
}

// Следим за изменениями локального списка и обновляем родителя
watch(localIndicators, (newValue) => {
    // Автокоррекция единиц при смене показателя
    newValue.forEach((ind) => {
        const allowed = indicatorToUnits[ind.name]
        if (allowed && !allowed.includes(ind.unit)) {
            ind.unit = allowed[0]
        }
        // Если показатель не выбран, не навязываем единицу
        if (!ind.name && ind.unit && !unitOptions.value.find(u => u.value === ind.unit)) {
            ind.unit = ''
        }
    })
    emit('update:indicators', newValue)
}, { deep: true })

// Следим за внешними изменениями пропса и синхронизируем локальное состояние
watch(() => props.indicators, (newVal) => {
    // Избегаем лишних перерисовок, если массивы эквивалентны по длине и ссылке
    if (newVal !== localIndicators.value) {
        localIndicators.value = (newVal && newVal.length) ? JSON.parse(JSON.stringify(newVal)) : []
        if (localIndicators.value.length === 0) {
            // Гарантируем хотя бы одну строку для UX
            addIndicator()
        }
    }
}, { deep: true })
</script>

<style scoped lang="scss">
.target-indicators {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.step-header {
    text-align: center;
    margin-bottom: 1rem;
}

.step-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
}

.form-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.indicators-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.indicator-row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
}

.indicator-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #0d6efd;
    color: white;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
    line-height: 1;
    text-align: center;
}

.indicator-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    flex: 1;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-label {
    font-size: 0.75rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
    text-transform: lowercase;
}

.select-wrapper {
    position: relative;
}

.form-select {
    width: 100%;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border: 1px solid #b3d9ff;
    border-radius: 6px;
    background: #e6f3ff;
    font-size: 0.875rem;
    color: #212529;
    appearance: none;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #0d6efd;
        background: #f0f8ff;
    }

    &:hover {
        background: #f0f8ff;
    }
}

.select-icon {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    pointer-events: none;
}

.form-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #b3d9ff;
    border-radius: 6px;
    background: #e6f3ff;
    font-size: 0.875rem;
    color: #212529;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #0d6efd;
        background: #f0f8ff;
    }

    &:hover {
        background: #f0f8ff;
    }

    &::placeholder {
        color: #6c757d;
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
    flex-shrink: 0;

    &:hover {
        background: #c82333;
    }

    .icon {
        flex-shrink: 0;
    }
}

.btn-add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #0d6efd;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    align-self: flex-start;

    &:hover {
        background: #0b5ed7;
    }

    .btn-icon {
        flex-shrink: 0;
    }
}

// Адаптивность

@media (max-width: 768px) {
    .indicator-row {
        flex-direction: column;
        gap: 0.75rem;
    }

    .indicator-number {
        align-self: flex-start;
    }

    .btn-remove {
        align-self: flex-end;
    }
}
</style>
