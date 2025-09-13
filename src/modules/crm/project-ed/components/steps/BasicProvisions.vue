<template>
    <div class="basic-provisions">
        <div class="step-header">
            <h2 class="step-title">1. Основные положения</h2>
            <div class="status-indicator">
                <span class="status-badge draft">Статус: Черновик</span>
            </div>
        </div>

        <div class="form-content">
            <form @submit.prevent="proceed" class="provisions-form">
                <!-- Наименование проекта -->
                <div class="form-section">
                    <div class="form-group">
                        <label for="projectName" class="form-label required">
                            Наименование проекта
                        </label>
                        <input
                            id="projectName"
                            v-model="localProvisions.projectName"
                            type="text"
                            class="form-input"
                            placeholder="Код мероприятия-год-инициалы РП(ФИО) наименование мероприятия"
                            required
                        />
                        <div v-if="errors.projectName" class="error-message">
                            {{ errors.projectName }}
                        </div>
                        <input
                            v-model="localProvisions.projectNameClarification"
                            type="text"
                            class="form-input clarification-input"
                            placeholder="(уточняющее название)"
                        />
                        <!-- Комментарий для экспертов -->
                        <div v-if="showComments" class="comment-section">
                            <textarea
                                v-model="localProvisions.comments.projectName"
                                class="comment-input"
                                placeholder="Комментарий эксперта..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="shortName" class="form-label required">
                            Краткое наименование проекта
                        </label>
                        <input
                            id="shortName"
                            v-model="localProvisions.shortName"
                            type="text"
                            class="form-input"
                            placeholder="Код мероприятия-год-инициалы РП"
                            required
                        />
                        <div v-if="errors.shortName" class="error-message">
                            {{ errors.shortName }}
                        </div>
                        <!-- Комментарий для экспертов -->
                        <div v-if="showComments" class="comment-section">
                            <textarea
                                v-model="localProvisions.comments.shortName"
                                class="comment-input"
                                placeholder="Комментарий эксперта..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <!-- Цель проекта -->
                <div class="form-section">
                    <div class="form-group">
                        <label for="projectGoal" class="form-label required">
                            Цель проекта
                        </label>
                        <textarea
                            id="projectGoal"
                            v-model="localProvisions.projectGoal"
                            class="form-textarea"
                            rows="4"
                            placeholder="Опишите основную цель проекта"
                            required
                        ></textarea>
                        <div v-if="errors.projectGoal" class="error-message">
                            {{ errors.projectGoal }}
                        </div>
                        <!-- Комментарий для экспертов -->
                        <div v-if="showComments" class="comment-section">
                            <textarea
                                v-model="localProvisions.comments.projectGoal"
                                class="comment-input"
                                placeholder="Комментарий эксперта..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <!-- Задачи проекта -->
                <div class="form-section">
                    <div class="form-group">
                        <label class="form-label required">Задачи проекта</label>
                        <div class="tasks-list">
                            <div 
                                v-for="(task, index) in localProvisions.projectTasks" 
                                :key="index" 
                                class="task-item"
                            >
                                <div class="task-number">{{ index + 1 }}</div>
                                <textarea
                                    v-model="localProvisions.projectTasks[index]"
                                    class="form-textarea task-input"
                                    rows="2"
                                    :placeholder="`Задача ${index + 1}`"
                                    required
                                ></textarea>
                                <button 
                                    v-if="localProvisions.projectTasks.length > 1"
                                    type="button" 
                                    class="remove-task-btn"
                                    @click="removeTask(index)"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <button 
                            type="button" 
                            class="add-task-btn"
                            @click="addTask"
                        >
                            + Добавить задачу
                        </button>
                        <div v-if="errors.projectTasks" class="error-message">
                            {{ errors.projectTasks }}
                        </div>
                        <!-- Комментарий для экспертов -->
                        <div v-if="showComments" class="comment-section">
                            <textarea
                                v-model="localProvisions.comments.projectTasks"
                                class="comment-input"
                                placeholder="Комментарий эксперта..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <!-- Даты проекта -->
                <div class="form-section">
                    <div class="dates-row">
                        <div class="form-group date-group">
                            <label class="form-label required">Дата начала проекта</label>
                            <div class="date-inputs">
                                <input
                                    v-model="localProvisions.startDate.day"
                                    type="number"
                                    class="form-input date-input"
                                    placeholder="ДД"
                                    min="1"
                                    max="31"
                                    required
                                />
                                <input
                                    v-model="localProvisions.startDate.month"
                                    type="number"
                                    class="form-input date-input"
                                    placeholder="ММ"
                                    min="1"
                                    max="12"
                                    required
                                />
                                <input
                                    v-model="localProvisions.startDate.year"
                                    type="number"
                                    class="form-input date-input"
                                    placeholder="ГГГГ"
                                    min="2024"
                                    required
                                />
                            </div>
                            <div v-if="errors.startDate" class="error-message">
                                {{ errors.startDate }}
                            </div>
                        </div>

                        <div class="form-group date-group">
                            <label class="form-label required">Дата окончания проекта</label>
                            <div class="date-inputs">
                                <input
                                    v-model="localProvisions.endDate.day"
                                    type="number"
                                    class="form-input date-input"
                                    placeholder="ДД"
                                    min="1"
                                    max="31"
                                    required
                                />
                                <input
                                    v-model="localProvisions.endDate.month"
                                    type="number"
                                    class="form-input date-input"
                                    placeholder="ММ"
                                    min="1"
                                    max="12"
                                    required
                                />
                                <input
                                    v-model="localProvisions.endDate.year"
                                    type="number"
                                    class="form-input date-input"
                                    placeholder="ГГГГ"
                                    min="2024"
                                    required
                                />
                            </div>
                            <div v-if="errors.endDate" class="error-message">
                                {{ errors.endDate }}
                            </div>
                        </div>
                    </div>
                    <!-- Комментарий для экспертов -->
                    <div v-if="showComments" class="comment-section">
                        <textarea
                            v-model="localProvisions.comments.projectDates"
                            class="comment-input"
                            placeholder="Комментарий эксперта..."
                            rows="2"
                        ></textarea>
                    </div>
                </div>

                <!-- Участники проекта -->
                <div class="form-section">
                    <div class="participants-grid">
                        <div class="form-group">
                            <label for="curator" class="form-label required">
                                Куратор проекта
                            </label>
                            <div class="select-wrapper">
                                <select
                                    id="curator"
                                    v-model="localProvisions.curator"
                                    class="form-select"
                                    required
                                >
                                    <option value="">Выберите куратора</option>
                                    <option v-for="person in availablePersons" :key="person.id" :value="person.id">
                                        {{ person.name }}, {{ person.position }}
                                    </option>
                                </select>
                                <div class="select-arrow">▼</div>
                            </div>
                            <div v-if="errors.curator" class="error-message">
                                {{ errors.curator }}
                            </div>
                            <!-- Комментарий для экспертов -->
                            <div v-if="showComments" class="comment-section">
                                <textarea
                                    v-model="localProvisions.comments.curator"
                                    class="comment-input"
                                    placeholder="Комментарий эксперта..."
                                    rows="2"
                                ></textarea>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="customer" class="form-label required">
                                Заказчик проекта
                            </label>
                            <div class="select-wrapper">
                                <select
                                    id="customer"
                                    v-model="localProvisions.customer"
                                    class="form-select"
                                    required
                                >
                                    <option value="">Выберите заказчика</option>
                                    <option v-for="person in availablePersons" :key="person.id" :value="person.id">
                                        {{ person.name }}, {{ person.position }}
                                    </option>
                                </select>
                                <div class="select-arrow">▼</div>
                            </div>
                            <div v-if="errors.customer" class="error-message">
                                {{ errors.customer }}
                            </div>
                            <!-- Комментарий для экспертов -->
                            <div v-if="showComments" class="comment-section">
                                <textarea
                                    v-model="localProvisions.comments.customer"
                                    class="comment-input"
                                    placeholder="Комментарий эксперта..."
                                    rows="2"
                                ></textarea>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="manager" class="form-label required">
                                Руководитель проекта
                            </label>
                            <div class="select-wrapper">
                                <select
                                    id="manager"
                                    v-model="localProvisions.manager"
                                    class="form-select"
                                    required
                                >
                                    <option value="">Выберите руководителя</option>
                                    <option v-for="person in availablePersons" :key="person.id" :value="person.id">
                                        {{ person.name }}, {{ person.position }}
                                    </option>
                                </select>
                                <div class="select-arrow">▼</div>
                            </div>
                            <div v-if="errors.manager" class="error-message">
                                {{ errors.manager }}
                            </div>
                            <!-- Комментарий для экспертов -->
                            <div v-if="showComments" class="comment-section">
                                <textarea
                                    v-model="localProvisions.comments.manager"
                                    class="comment-input"
                                    placeholder="Комментарий эксперта..."
                                    rows="2"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Исполнители проекта -->
                <div class="form-section">
                    <div class="form-group">
                        <label class="form-label required">Исполнители проекта</label>
                        <div class="executors-list">
                            <div 
                                v-for="(executor, index) in localProvisions.executors" 
                                :key="index" 
                                class="executor-item"
                            >
                                <div class="executor-number">{{ index + 1 }}</div>
                                <div class="select-wrapper">
                                    <select
                                        v-model="localProvisions.executors[index]"
                                        class="form-select executor-select"
                                        required
                                    >
                                        <option value="">Фамилия И.О., должность</option>
                                        <option v-for="person in availablePersons" :key="person.id" :value="person.id">
                                            {{ person.name }}, {{ person.position }}
                                        </option>
                                    </select>
                                    <div class="select-arrow">▼</div>
                                </div>
                                <button 
                                    v-if="localProvisions.executors.length > 1"
                                    type="button" 
                                    class="remove-executor-btn"
                                    @click="removeExecutor(index)"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <button 
                            type="button" 
                            class="add-executor-btn"
                            @click="addExecutor"
                        >
                            + Добавить исполнителя
                        </button>
                        <div v-if="errors.executors" class="error-message">
                            {{ errors.executors }}
                        </div>
                        <!-- Комментарий для экспертов -->
                        <div v-if="showComments" class="comment-section">
                            <textarea
                                v-model="localProvisions.comments.executors"
                                class="comment-input"
                                placeholder="Комментарий эксперта..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <!-- Планируемые результаты -->
                <div class="form-section">
                    <div class="form-group">
                        <label class="form-label required">Планируемые результаты проекта</label>
                        <div class="results-list">
                            <div 
                                v-for="(result, index) in localProvisions.plannedResults" 
                                :key="index" 
                                class="result-item"
                            >
                                <div class="result-number">{{ index + 1 }}</div>
                                <textarea
                                    v-model="localProvisions.plannedResults[index]"
                                    class="form-textarea result-input"
                                    rows="2"
                                    :placeholder="`Результат ${index + 1}`"
                                    required
                                ></textarea>
                                <button 
                                    v-if="localProvisions.plannedResults.length > 1"
                                    type="button" 
                                    class="remove-result-btn"
                                    @click="removeResult(index)"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <button 
                            type="button" 
                            class="add-result-btn"
                            @click="addResult"
                        >
                            + Добавить результат
                        </button>
                        <div v-if="errors.plannedResults" class="error-message">
                            {{ errors.plannedResults }}
                        </div>
                        <!-- Комментарий для экспертов -->
                        <div v-if="showComments" class="comment-section">
                            <textarea
                                v-model="localProvisions.comments.plannedResults"
                                class="comment-input"
                                placeholder="Комментарий эксперта..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <!-- Бюджет проекта -->
                <div class="form-section">
                    <div class="form-group">
                        <label for="budget" class="form-label">
                            Бюджет проекта
                        </label>
                        <div class="budget-input-wrapper">
                            <input
                                id="budget"
                                v-model="localProvisions.budget"
                                type="number"
                                class="form-input budget-input"
                                placeholder="0"
                                readonly
                            />
                            <span class="currency-label">руб.</span>
                        </div>
                        <div class="budget-note">
                            ← Заполняется автоматически из раздела 4
                        </div>
                        <!-- Комментарий для экспертов -->
                        <div v-if="showComments" class="comment-section">
                            <textarea
                                v-model="localProvisions.comments.budget"
                                class="comment-input"
                                placeholder="Комментарий эксперта..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    provisions: {
        type: Object,
        required: true
    },
    userRole: {
        type: String,
        default: 'user'
    }
})

const emit = defineEmits(['update:provisions'])

// Определяем, показывать ли комментарии (для экспертов и администраторов)
const showComments = computed(() => {
    return false // Временно скрыты
    // return ['expert', 'admin', 'supervisor'].includes(props.userRole)
})

// Инициализация данных с учетом новой структуры
const localProvisions = ref({
    // Основные поля
    projectName: props.provisions.projectName || '',
    projectNameClarification: props.provisions.projectNameClarification || '',
    shortName: props.provisions.shortName || '',
    projectGoal: props.provisions.projectGoal || '',
    projectTasks: props.provisions.projectTasks || ['', ''],
    startDate: {
        day: props.provisions.startDate?.day || '',
        month: props.provisions.startDate?.month || '',
        year: props.provisions.startDate?.year || ''
    },
    endDate: {
        day: props.provisions.endDate?.day || '',
        month: props.provisions.endDate?.month || '',
        year: props.provisions.endDate?.year || ''
    },
    curator: props.provisions.curator || '',
    customer: props.provisions.customer || '',
    manager: props.provisions.manager || '',
    executors: props.provisions.executors || [''],
    plannedResults: props.provisions.plannedResults || ['', ''],
    budget: props.provisions.budget || 0,
    
    // Комментарии экспертов
    comments: {
        projectName: props.provisions.comments?.projectName || '',
        shortName: props.provisions.comments?.shortName || '',
        projectGoal: props.provisions.comments?.projectGoal || '',
        projectTasks: props.provisions.comments?.projectTasks || '',
        projectDates: props.provisions.comments?.projectDates || '',
        curator: props.provisions.comments?.curator || '',
        customer: props.provisions.comments?.customer || '',
        manager: props.provisions.comments?.manager || '',
        executors: props.provisions.comments?.executors || '',
        plannedResults: props.provisions.comments?.plannedResults || '',
        budget: props.provisions.comments?.budget || ''
    }
})

const errors = ref({})

// Моковые данные для выпадающих списков
const availablePersons = ref([
    { id: 1, name: 'Иванов И.И.', position: 'Директор' },
    { id: 2, name: 'Петров П.П.', position: 'Заместитель директора' },
    { id: 3, name: 'Сидоров С.С.', position: 'Руководитель отдела' },
    { id: 4, name: 'Козлов К.К.', position: 'Ведущий специалист' },
    { id: 5, name: 'Морозов М.М.', position: 'Специалист' }
])

// Валидация формы
const isFormValid = computed(() => {
    return localProvisions.value.projectName?.trim() !== '' &&
           localProvisions.value.shortName?.trim() !== '' &&
           localProvisions.value.projectGoal?.trim() !== '' &&
           localProvisions.value.projectTasks.some(task => task?.trim() !== '') &&
           localProvisions.value.startDate.day !== '' &&
           localProvisions.value.startDate.month !== '' &&
           localProvisions.value.startDate.year !== '' &&
           localProvisions.value.endDate.day !== '' &&
           localProvisions.value.endDate.month !== '' &&
           localProvisions.value.endDate.year !== '' &&
           localProvisions.value.curator !== '' &&
           localProvisions.value.customer !== '' &&
           localProvisions.value.manager !== '' &&
           localProvisions.value.executors.some(executor => executor !== '') &&
           localProvisions.value.plannedResults.some(result => result?.trim() !== '')
})

// Методы управления списками
const addTask = () => {
    localProvisions.value.projectTasks.push('')
}

const removeTask = (index) => {
    if (localProvisions.value.projectTasks.length > 1) {
        localProvisions.value.projectTasks.splice(index, 1)
    }
}

const addExecutor = () => {
    localProvisions.value.executors.push('')
}

const removeExecutor = (index) => {
    if (localProvisions.value.executors.length > 1) {
        localProvisions.value.executors.splice(index, 1)
    }
}

const addResult = () => {
    localProvisions.value.plannedResults.push('')
}

const removeResult = (index) => {
    if (localProvisions.value.plannedResults.length > 1) {
        localProvisions.value.plannedResults.splice(index, 1)
    }
}

// Валидация формы
const validateForm = () => {
    errors.value = {}
    
    if (!localProvisions.value.projectName?.trim()) {
        errors.value.projectName = 'Наименование проекта обязательно для заполнения'
    }
    
    if (!localProvisions.value.shortName?.trim()) {
        errors.value.shortName = 'Краткое наименование проекта обязательно для заполнения'
    }
    
    if (!localProvisions.value.projectGoal?.trim()) {
        errors.value.projectGoal = 'Цель проекта обязательна для заполнения'
    }
    
    if (!localProvisions.value.projectTasks.some(task => task?.trim() !== '')) {
        errors.value.projectTasks = 'Необходимо заполнить хотя бы одну задачу проекта'
    }
    
    // Валидация дат
    const startDate = localProvisions.value.startDate
    const endDate = localProvisions.value.endDate
    
    if (!startDate.day || !startDate.month || !startDate.year) {
        errors.value.startDate = 'Дата начала проекта должна быть заполнена полностью'
    }
    
    if (!endDate.day || !endDate.month || !endDate.year) {
        errors.value.endDate = 'Дата окончания проекта должна быть заполнена полностью'
    }
    
    // Проверка корректности дат
    if (startDate.day && startDate.month && startDate.year && 
        endDate.day && endDate.month && endDate.year) {
        const start = new Date(startDate.year, startDate.month - 1, startDate.day)
        const end = new Date(endDate.year, endDate.month - 1, endDate.day)
        
        if (start >= end) {
            errors.value.startDate = 'Дата начала должна быть раньше даты окончания'
            errors.value.endDate = 'Дата окончания должна быть позже даты начала'
        }
    }
    
    if (!localProvisions.value.curator) {
        errors.value.curator = 'Необходимо выбрать куратора проекта'
    }
    
    if (!localProvisions.value.customer) {
        errors.value.customer = 'Необходимо выбрать заказчика проекта'
    }
    
    if (!localProvisions.value.manager) {
        errors.value.manager = 'Необходимо выбрать руководителя проекта'
    }
    
    if (!localProvisions.value.executors.some(executor => executor !== '')) {
        errors.value.executors = 'Необходимо выбрать хотя бы одного исполнителя'
    }
    
    if (!localProvisions.value.plannedResults.some(result => result?.trim() !== '')) {
        errors.value.plannedResults = 'Необходимо заполнить хотя бы один планируемый результат'
    }
    
    return Object.keys(errors.value).length === 0
}

// Следим за изменениями и обновляем родительский компонент
watch(localProvisions, (newValue) => {
    emit('update:provisions', newValue)
}, { deep: true })
</script>

<style scoped lang="scss">
.basic-provisions {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.step-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    border: 1px solid #dee2e6;
}

.step-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
}

.status-indicator {
    display: flex;
    align-items: center;
}

.status-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    
    &.draft {
        background: #6c757d;
        color: white;
    }
    
    &.approved {
        background: #198754;
        color: white;
    }
    
    &.rejected {
        background: #dc3545;
        color: white;
    }
    
    &.pending {
        background: #ffc107;
        color: #212529;
    }
}

.form-content {
    flex: 1;
}

.provisions-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-section {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    border: 1px solid #dee2e6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 2rem;

    &:last-child {
        margin-bottom: 0;
    }
}

.form-label {
    display: block;
    font-weight: 600;
    color: #212529;
    margin-bottom: 0.75rem;
    font-size: 0.95rem;

    &.required::after {
        content: ' *';
        color: #dc3545;
    }
}

.form-input,
.form-textarea,
.form-select {
    width: 100%;
    padding: 0.875rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #f8f9fa;

    &:focus {
        outline: none;
        border-color: #0d6efd;
        background: white;
        box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
    }

    &::placeholder {
        color: #6c757d;
    }
}

.clarification-input {
    margin-top: 0.5rem;
    background: #f1f3f4;
    border-style: dashed;
}

.form-textarea {
    resize: vertical;
    min-height: 120px;
    line-height: 1.5;
}

// Стили для дат
.dates-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.date-group {
    .date-inputs {
        display: flex;
        gap: 0.5rem;
    }
    
    .date-input {
        flex: 1;
        text-align: center;
        font-weight: 600;
    }
}

// Стили для участников
.participants-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;
}

.select-wrapper {
    position: relative;
    
    .select-arrow {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: #6c757d;
        font-size: 0.875rem;
    }
}

.form-select {
    appearance: none;
    cursor: pointer;
    padding-right: 3rem;
}

// Стили для списков (задачи, исполнители, результаты)
.tasks-list,
.executors-list,
.results-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
}

.task-item,
.executor-item,
.result-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.task-number,
.executor-number,
.result-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: #0d6efd;
    color: white;
    border-radius: 50%;
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
}

.task-input,
.result-input {
    flex: 1;
    margin: 0;
    min-height: 60px;
}

.executor-select {
    flex: 1;
    margin: 0;
}

.remove-task-btn,
.remove-executor-btn,
.remove-result-btn {
    width: 2rem;
    height: 2rem;
    border: none;
    background: #dc3545;
    color: white;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
        background: #c82333;
        transform: scale(1.1);
    }
}

.add-task-btn,
.add-executor-btn,
.add-result-btn {
    padding: 0.75rem 1.5rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: fit-content;

    &:hover {
        background: #218838;
        transform: translateY(-1px);
    }
}

// Стили для бюджета
.budget-input-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 300px;
}

.budget-input {
    text-align: right;
    font-weight: 600;
    font-size: 1.125rem;
    background: #e9ecef !important;
    cursor: not-allowed;
}

.currency-label {
    font-weight: 600;
    color: #6c757d;
    font-size: 1rem;
}

.budget-note {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #6c757d;
    font-style: italic;
}

// Стили для комментариев экспертов
.comment-section {
    margin-top: 1rem;
    padding: 1rem;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    border-left: 4px solid #ffc107;
}

.comment-input {
    background: white !important;
    border: 1px solid #ffeaa7 !important;
    font-size: 0.875rem;
    
    &:focus {
        border-color: #ffc107 !important;
        box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.2) !important;
    }
    
    &::placeholder {
        color: #856404;
        font-style: italic;
    }
}

.error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
}

// Адаптивность
@media (max-width: 1024px) {
    .participants-grid {
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
    }
    
    .dates-row {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
}

@media (max-width: 768px) {
    .basic-provisions {
        padding: 1rem;
    }
    
    .step-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
    
    .participants-grid {
        grid-template-columns: 1fr;
    }
    
    .task-item,
    .executor-item,
    .result-item {
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .task-number,
    .executor-number,
    .result-number {
        align-self: flex-start;
    }
    
    .budget-input-wrapper {
        flex-direction: column;
        align-items: flex-start;
        max-width: none;
    }
}

@media (max-width: 480px) {
    .form-section {
        padding: 1.5rem;
    }
    
    .date-inputs {
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .date-input {
        width: 100%;
    }
}
</style>
