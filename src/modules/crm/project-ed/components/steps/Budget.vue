<template>
    <div class="budget">
        <div class="step-header">
            <h2 class="step-title">Бюджет проекта</h2>
            <p class="step-description">
                Определите финансовые ресурсы и статьи расходов проекта
            </p>
        </div>

        <div class="form-content">
            <form class="budget-form">
                <!-- Общая сумма бюджета -->
                <div class="form-section">
                    <h3 class="section-title">Общий бюджет</h3>
                    
                    <div class="budget-summary">
                        <div class="form-group">
                            <label for="totalAmount" class="form-label required">
                                Общая сумма бюджета (руб.)
                            </label>
                            <div class="input-group">
                                <input
                                    id="totalAmount"
                                    v-model.number="localBudget.totalAmount"
                                    type="number"
                                    class="form-input"
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                <span class="input-suffix">₽</span>
                            </div>
                        </div>
                        
                        <div v-if="localBudget.totalAmount > 0" class="budget-info">
                            <DollarSign class="icon" :size="16" />
                            Общий бюджет: {{ formatCurrency(localBudget.totalAmount) }}
                        </div>
                    </div>
                </div>

                <!-- Статьи расходов -->
                <div class="form-section">
                    <div class="section-header">
                        <h3 class="section-title">Статьи расходов</h3>
                        <button
                            type="button"
                            class="btn btn-outline-primary btn-sm"
                            @click="addBudgetItem"
                        >
                            <Plus class="btn-icon" :size="16" />
                            Добавить статью
                        </button>
                    </div>

                    <div class="budget-items-list">
                        <div
                            v-for="(item, index) in localBudget.items"
                            :key="`item-${index}`"
                            class="budget-item-card"
                        >
                            <div class="item-header">
                                <h4>Статья {{ index + 1 }}</h4>
                                <button
                                    type="button"
                                    class="btn-remove"
                                    @click="removeBudgetItem(index)"
                                >
                                    <X class="icon" :size="16" />
                                </button>
                            </div>
                            
                            <div class="item-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label required">Название статьи</label>
                                        <input
                                            v-model="item.name"
                                            type="text"
                                            class="form-input"
                                            placeholder="Например: Аренда помещения"
                                        />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label required">Категория</label>
                                        <select
                                            v-model="item.category"
                                            class="form-select"
                                        >
                                            <option value="">Выберите категорию</option>
                                            <option value="personnel">Персонал</option>
                                            <option value="equipment">Оборудование</option>
                                            <option value="materials">Материалы</option>
                                            <option value="services">Услуги</option>
                                            <option value="travel">Командировки</option>
                                            <option value="other">Прочее</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label required">Сумма (руб.)</label>
                                        <div class="input-group">
                                            <input
                                                v-model.number="item.amount"
                                                type="number"
                                                class="form-input"
                                                placeholder="0"
                                                min="0"
                                                step="0.01"
                                            />
                                            <span class="input-suffix">₽</span>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Количество</label>
                                        <input
                                            v-model.number="item.quantity"
                                            type="number"
                                            class="form-input"
                                            placeholder="1"
                                            min="1"
                                        />
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Описание</label>
                                    <textarea
                                        v-model="item.description"
                                        class="form-textarea"
                                        rows="2"
                                        placeholder="Дополнительное описание статьи расходов"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="localBudget.items.length === 0" class="empty-state">
                        <DollarSign class="empty-icon" :size="48" />
                        <h4>Нет статей расходов</h4>
                        <p>Добавьте статьи для детализации бюджета проекта</p>
                        <button
                            type="button"
                            class="btn btn-primary"
                            @click="addBudgetItem"
                        >
                            <Plus class="btn-icon" :size="16" />
                            Добавить первую статью
                        </button>
                    </div>
                </div>

                <!-- Сводка по бюджету -->
                <div v-if="localBudget.items.length > 0" class="form-section">
                    <h3 class="section-title">Сводка по бюджету</h3>
                    
                    <div class="budget-summary-grid">
                        <div class="summary-card">
                            <div class="summary-header">
                                <h4>Общая сумма статей</h4>
                                <Calculator class="icon" :size="20" />
                            </div>
                            <div class="summary-value">
                                {{ formatCurrency(totalItemsAmount) }}
                            </div>
                        </div>
                        
                        <div class="summary-card">
                            <div class="summary-header">
                                <h4>Разница с общим бюджетом</h4>
                                <TrendingUp class="icon" :size="20" />
                            </div>
                            <div 
                                class="summary-value"
                                :class="budgetDifferenceClass"
                            >
                                {{ formatCurrency(budgetDifference) }}
                            </div>
                        </div>
                    </div>

                    <!-- График по категориям -->
                    <div class="categories-chart">
                        <h4>Распределение по категориям</h4>
                        <div class="chart-container">
                            <div
                                v-for="category in categoriesSummary"
                                :key="category.name"
                                class="category-bar"
                            >
                                <div class="category-info">
                                    <span class="category-name">{{ category.label }}</span>
                                    <span class="category-amount">{{ formatCurrency(category.amount) }}</span>
                                </div>
                                <div class="bar-container">
                                    <div 
                                        class="bar-fill"
                                        :style="{ width: `${category.percentage}%` }"
                                    ></div>
                                </div>
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
    DollarSign, 
    Plus, 
    X, 
    Calculator, 
    TrendingUp
} from 'lucide-vue-next'

const props = defineProps({
    budget: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:budget'])

// Локальные данные
const localBudget = ref({
    totalAmount: props.budget.totalAmount || 0,
    items: [...(props.budget.items || [])]
})

// Категории расходов
const categories = {
    personnel: 'Персонал',
    equipment: 'Оборудование',
    materials: 'Материалы',
    services: 'Услуги',
    travel: 'Командировки',
    other: 'Прочее'
}

// Вычисляемые свойства
const totalItemsAmount = computed(() => {
    return localBudget.value.items.reduce((sum, item) => {
        return sum + (item.amount || 0) * (item.quantity || 1)
    }, 0)
})

const budgetDifference = computed(() => {
    return localBudget.value.totalAmount - totalItemsAmount.value
})

const budgetDifferenceClass = computed(() => {
    if (budgetDifference.value > 0) return 'positive'
    if (budgetDifference.value < 0) return 'negative'
    return 'neutral'
})

const categoriesSummary = computed(() => {
    const summary = {}
    
    localBudget.value.items.forEach(item => {
        if (!summary[item.category]) {
            summary[item.category] = 0
        }
        summary[item.category] += (item.amount || 0) * (item.quantity || 1)
    })
    
    const maxAmount = Math.max(...Object.values(summary), 1)
    
    return Object.entries(summary).map(([key, amount]) => ({
        name: key,
        label: categories[key] || key,
        amount,
        percentage: (amount / maxAmount) * 100
    })).sort((a, b) => b.amount - a.amount)
})

const isFormValid = computed(() => {
    return localBudget.value.totalAmount > 0
})

// Методы
const addBudgetItem = () => {
    localBudget.value.items.push({
        name: '',
        category: '',
        amount: 0,
        quantity: 1,
        description: ''
    })
}

const removeBudgetItem = (index) => {
    localBudget.value.items.splice(index, 1)
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}


// Следим за изменениями и обновляем родительский компонент
watch(localBudget, (newValue) => {
    emit('update:budget', newValue)
}, { deep: true })
</script>

<style scoped lang="scss">
.budget {
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

.budget-form {
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

.budget-summary {
    max-width: 400px;
}

.form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;

    &:last-child {
        margin-bottom: 0;
    }
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

.input-group {
    position: relative;
    display: flex;
    align-items: center;
}

.form-input,
.form-select,
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

.input-suffix {
    position: absolute;
    right: 0.75rem;
    color: #6c757d;
    font-weight: 500;
    pointer-events: none;
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

.budget-info {
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

.budget-items-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.budget-item-card {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
}

.item-header {
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

.item-form {
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

.budget-summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.summary-card {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
}

.summary-header {
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

    .icon {
        color: #6c757d;
    }
}

.summary-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #212529;

    &.positive {
        color: #198754;
    }

    &.negative {
        color: #dc3545;
    }

    &.neutral {
        color: #6c757d;
    }
}

.categories-chart {
    h4 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: #212529;
    }
}

.chart-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.category-bar {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.category-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
}

.category-name {
    font-weight: 500;
    color: #212529;
}

.category-amount {
    color: #6c757d;
    font-weight: 600;
}

.bar-container {
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #0d6efd, #0b5ed7);
    transition: width 0.3s ease;
}


// Адаптивность
@media (max-width: 768px) {
    .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

}
</style>
