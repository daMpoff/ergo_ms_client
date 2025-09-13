<template>
    <div class="project-passport-demo">
        <div class="demo-header">
            <h1>Демонстрация паспорта проекта</h1>
            <div class="demo-controls">
                <label class="role-selector">
                    Роль пользователя:
                    <select v-model="selectedRole" class="role-select">
                        <option value="user">Обычный пользователь</option>
                        <option value="expert">Эксперт</option>
                        <option value="admin">Администратор</option>
                        <option value="supervisor">Супервизор</option>
                    </select>
                </label>
            </div>
        </div>
        
        <div class="demo-content">
            <BasicProvisions 
                :provisions="demoProvisions"
                :user-role="selectedRole"
                @update:provisions="updateProvisions"
            />
        </div>
        
        <div class="demo-info">
            <h3>Информация о демонстрации:</h3>
            <ul>
                <li><strong>Обычный пользователь:</strong> Видит только поля для заполнения</li>
                <li><strong>Эксперт/Администратор/Супервизор:</strong> Видит поля для заполнения + комментарии для экспертной оценки</li>
                <li>Комментарии отображаются в желтых блоках под каждым полем</li>
                <li>Бюджет синхронизируется с разделом 4</li>
                <li>Все поля соответствуют структуре паспорта проекта</li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import BasicProvisions from './steps/BasicProvisions.vue'

const selectedRole = ref('expert')

const demoProvisions = reactive({
    projectName: 'Проект-2024-ИИ Разработка системы управления проектами',
    projectNameClarification: 'Создание современной платформы для управления корпоративными проектами',
    shortName: 'Проект-2024-ИИ',
    projectGoal: 'Создание единой системы управления проектами для повышения эффективности работы организации',
    projectTasks: [
        'Анализ текущих бизнес-процессов',
        'Разработка технического задания',
        'Создание прототипа системы',
        'Тестирование и внедрение'
    ],
    startDate: {
        day: '15',
        month: '01',
        year: '2024'
    },
    endDate: {
        day: '31',
        month: '12',
        year: '2024'
    },
    curator: '1',
    customer: '2',
    manager: '3',
    executors: ['4', '5'],
    plannedResults: [
        'Функционирующая система управления проектами',
        'Обученный персонал',
        'Документация по эксплуатации'
    ],
    budget: 2500000,
    comments: {
        projectName: 'Название проекта соответствует требованиям',
        projectGoal: 'Цель четко сформулирована и достижима',
        projectTasks: 'Задачи логически выстроены и выполнимы',
        projectDates: 'Сроки реалистичны для данного объема работ',
        curator: 'Куратор имеет необходимый опыт',
        executors: 'Команда исполнителей подобрана корректно',
        plannedResults: 'Результаты измеримы и достижимы',
        budget: 'Бюджет обоснован и соответствует объему работ'
    }
})

const updateProvisions = (newProvisions) => {
    Object.assign(demoProvisions, newProvisions)
}
</script>

<style scoped lang="scss">
.project-passport-demo {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 2rem;
}

.demo-header {
    text-align: center;
    margin-bottom: 2rem;
    
    h1 {
        color: #2c3e50;
        margin-bottom: 1rem;
        font-size: 2.5rem;
    }
}

.demo-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.role-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #2c3e50;
}

.role-select {
    padding: 0.5rem 1rem;
    border: 2px solid #3498db;
    border-radius: 8px;
    background: white;
    font-size: 1rem;
    cursor: pointer;
    
    &:focus {
        outline: none;
        border-color: #2980b9;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }
}

.demo-content {
    margin-bottom: 3rem;
}

.demo-info {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    margin: 0 auto;
    
    h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }
    
    ul {
        list-style: none;
        padding: 0;
        
        li {
            margin-bottom: 0.75rem;
            padding: 0.75rem;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #3498db;
            
            strong {
                color: #2c3e50;
            }
        }
    }
}
</style>
