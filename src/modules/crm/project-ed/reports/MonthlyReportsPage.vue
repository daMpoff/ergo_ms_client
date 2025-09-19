<template>
    <div class="monthly-reports-page">
        <div class="months-container">
            <div class="months-list">
                <div
                    v-for="month in months"
                    :key="month.id"
                    class="month-item d-flex align-items-center"
                    :class="{ active: selectedMonth?.id === month.id }"
                    role="button"
                    tabindex="0"
                    @click="selectMonth(month)"
                    @keyup.enter="selectMonth(month)"
                >
                    <Calendar :size="20" class="me-2" />
                    <span class="month-name">{{ month.name }}</span>
                </div>
            </div>
            <div class="month-content">
                <div v-if="selectedMonth" class="selected-month-info">
                    <h5 class="mb-3">{{ selectedMonth.name }}</h5>
                    <div class="text-muted">
                        Здесь будет отображаться отчёт за {{ selectedMonth.name.toLowerCase() }}
                    </div>
                </div>
                <div v-else class="no-selection">
                    <h5 class="mb-3 text-muted">Выберите месяц</h5>
                    <div class="text-muted">
                        Выберите месяц из списка слева для просмотра отчёта
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Calendar } from 'lucide-vue-next'

const months = ref([
    { id: 1, name: 'Январь' },
    { id: 2, name: 'Февраль' },
    { id: 3, name: 'Март' },
    { id: 4, name: 'Апрель' },
    { id: 5, name: 'Май' },
    { id: 6, name: 'Июнь' },
    { id: 7, name: 'Июль' },
    { id: 8, name: 'Август' },
    { id: 9, name: 'Сентябрь' },
    { id: 10, name: 'Октябрь' },
    { id: 11, name: 'Ноябрь' },
    { id: 12, name: 'Декабрь' }
])

const selectedMonth = ref(null)

function selectMonth(month) {
    selectedMonth.value = month
    console.log('Выбран месяц:', month.name)
    // Здесь будет логика для открытия отчёта за выбранный месяц
}
</script>

<style scoped lang="scss">
.monthly-reports-page {
    padding: 1rem 0.5rem 0;
}

.months-container {
    display: flex;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.months-list {
    flex: 0 0 250px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.5rem;
    background-color: #fff;
    padding: 1rem;
}

.month-item {
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    margin-bottom: 0.25rem;

    &:hover {
        background-color: #f8f9fa;
    }

    &.active {
        background-color: #e7f1ff;
        color: #0d6efd;
        font-weight: 600;
    }

    &:focus {
        outline: none;
        background-color: #e7f1ff;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
    }

    &:last-child {
        margin-bottom: 0;
    }
}

.month-name {
    font-size: 0.9rem;
}

.month-content {
    flex: 1;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.5rem;
    background-color: #fff;
    padding: 2rem;
    min-height: 400px;
}

.selected-month-info {
    h5 {
        color: #0d6efd;
    }
}

.no-selection {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    text-align: center;
}

// Адаптивность для мобильных устройств
@media (max-width: 768px) {
    .months-container {
        flex-direction: column;
        gap: 1rem;
    }
    
    .months-list {
        flex: none;
    }
    
    .month-content {
        min-height: 300px;
        padding: 1.5rem;
    }
}

@media (max-width: 480px) {
    .monthly-reports-page {
        padding: 0.5rem;
    }
    
    .months-container {
        gap: 0.75rem;
    }
    
    .months-list {
        padding: 0.75rem;
    }
    
    .month-item {
        padding: 0.5rem 0.75rem;
    }
    
    .month-content {
        padding: 1rem;
        min-height: 250px;
    }
}
</style>