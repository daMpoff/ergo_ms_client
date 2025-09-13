<template>
    <div class="leaders-list">
        
        <div class="leaders-items">
            <div 
                v-for="leader in displayedLeaders" 
                :key="leader.id"
                class="leader-item"
            >
                <div class="leader-avatar-container">
                    <img 
                        v-if="leader.avatar && leader.avatar !== '/src/assets/avatars/placeholder.svg'"
                        :src="leader.avatar" 
                        :alt="getLeaderInitials(leader.name)" 
                        class="leader-avatar"
                        @error="handleAvatarError"
                    />
                    <div 
                        v-else
                        class="leader-avatar leader-avatar-placeholder"
                    >
                        {{ getLeaderInitials(leader.name) }}
                    </div>
                </div>
                
                <div class="leader-info">
                    <span class="leader-name">{{ formatLeaderName(leader.name) }}</span>
                    <span v-if="leader.position" class="leader-position">{{ leader.position }}</span>
                </div>
            </div>
            
            <!-- Стек аватарок для дополнительных руководителей -->
            <div v-if="hasMoreLeaders" class="avatar-stack" @click="openModal">
                <div class="avatar-stack-container">
                    <div 
                        v-for="(leader, index) in remainingLeaders.slice(0, 4)" 
                        :key="leader.id"
                        class="stacked-avatar"
                        :style="{ zIndex: 4 - index }"
                    >
                        <img 
                            v-if="leader.avatar && leader.avatar !== '/src/assets/avatars/placeholder.svg'"
                            :src="leader.avatar" 
                            :alt="getLeaderInitials(leader.name)" 
                            class="stacked-avatar-img"
                            @error="handleAvatarError"
                        />
                        <div 
                            v-else
                            class="stacked-avatar-img stacked-avatar-placeholder"
                        >
                            {{ getLeaderInitials(leader.name) }}
                        </div>
                    </div>
                    
                    <!-- Счетчик дополнительных руководителей -->
                    <div 
                        v-if="remainingLeadersCount > 4"
                        class="stacked-avatar stacked-avatar-counter"
                        :style="{ zIndex: 0 }"
                    >
                        <span class="counter-text">+{{ remainingLeadersCount - 4 }}</span>
                    </div>
                </div>
                
                <div class="leader-info">
                    <span class="leader-name">еще {{ remainingLeadersCount }} {{ getRemainingLeadersText() }}</span>
                </div>
            </div>
        </div>
        
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Users } from 'lucide-vue-next'

const props = defineProps({
    leaders: {
        type: Array,
        default: () => []
    },
    maxDisplayed: {
        type: Number,
        default: 2 // Максимальное количество отображаемых руководителей
    }
})

const avatarErrors = ref(new Set())

// Ограничиваем количество отображаемых руководителей
const displayedLeaders = computed(() => {
    return props.leaders.slice(0, props.maxDisplayed)
})

const hasMoreLeaders = computed(() => {
    return props.leaders.length > props.maxDisplayed
})

const remainingLeadersCount = computed(() => {
    return props.leaders.length - props.maxDisplayed
})

const remainingLeaders = computed(() => {
    return props.leaders.slice(props.maxDisplayed)
})

const getLeadersText = () => {
    const count = props.leaders.length
    if (count === 1) return 'руководитель'
    if (count >= 2 && count <= 4) return 'руководителя'
    return 'руководителей'
}

const getRemainingLeadersText = () => {
    const count = remainingLeadersCount.value
    if (count === 1) return 'руководитель'
    if (count >= 2 && count <= 4) return 'руководителя'
    return 'руководителей'
}

const formatLeaderName = (name) => {
    if (!name) return 'Не указано'
    
    // Разбиваем имя на части
    const nameParts = name.trim().split(' ').filter(part => part.length > 0)
    
    if (nameParts.length === 0) return 'Не указано'
    
    // Если имя состоит из одного слова, возвращаем как есть
    if (nameParts.length === 1) return nameParts[0]
    
    // Если имя состоит из двух слов, возвращаем как есть
    if (nameParts.length === 2) return nameParts.join(' ')
    
    // Если имя состоит из трех или более слов, форматируем как Фамилия И.О.
    const surname = nameParts[0]
    const initials = nameParts.slice(1).map(part => part.charAt(0) + '.').join('')
    
    return `${surname} ${initials}`
}

const getLeaderInitials = (name) => {
    if (!name) return '?'
    
    const nameParts = name.trim().split(' ').filter(part => part.length > 0)
    
    if (nameParts.length === 0) return '?'
    
    // Берем первые буквы от каждого слова
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('')
    
    // Ограничиваем количество инициалов (максимум 3)
    return initials.substring(0, 3)
}

const handleAvatarError = (event) => {
    const avatarSrc = event.target.src
    avatarErrors.value.add(avatarSrc)
    event.target.style.display = 'none'
}

const emit = defineEmits(['open-modal'])

const openModal = (event) => {
    // Предотвращаем всплытие события
    event.stopPropagation()
    event.preventDefault()
    
    // Эмитим событие для открытия модального окна
    emit('open-modal')
}
</script>

<style scoped lang="scss">
.leaders-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 200px;
}


.leaders-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    
    // Стилизация скроллбара
    &::-webkit-scrollbar {
        width: 4px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f3f4;
        border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #c1c8cd;
        border-radius: 2px;
        
        &:hover {
            background: #a8b2ba;
        }
    }
}

.leader-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 6px;
    transition: background-color 0.2s ease;
    
    &:hover {
        background-color: #f8f9fa;
    }
}

.leader-avatar-container {
    flex-shrink: 0;
}

.leader-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e9ecef;
    background: #f8f9fa;
}

.leader-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6c757d;
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    border: 2px solid #dee2e6;
}

.leader-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
    flex: 1;
}

.leader-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #212529;
    line-height: 1.2;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
}

.leader-position {
    font-size: 0.75rem;
    color: #6c757d;
    line-height: 1.2;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.avatar-stack {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 6px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    margin-top: 0.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background-color: #e9ecef;
        border-color: #dee2e6;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
        transform: translateY(0);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
}

.avatar-stack-container {
    display: flex;
    align-items: center;
    position: relative;
    flex-shrink: 0;
}

.stacked-avatar {
    position: relative;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-left: -6px;
    
    &:first-child {
        margin-left: 0;
    }
}

.stacked-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.stacked-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.5rem;
    font-weight: 600;
    color: #6c757d;
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
}

.stacked-avatar-counter {
    background: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .counter-text {
        color: white;
        font-size: 0.5rem;
        font-weight: 600;
    }
}

// Адаптивность
@media (max-width: 480px) {
    .leaders-list {
        min-width: 160px;
    }
    
    .leader-item {
        gap: 0.5rem;
        padding: 0.375rem;
    }
    
    .leader-avatar,
    .leader-avatar-placeholder {
        width: 28px;
        height: 28px;
        font-size: 0.625rem;
    }
    
    .stacked-avatar {
        width: 20px;
        height: 20px;
        margin-left: -4px;
        
        &:first-child {
            margin-left: 0;
        }
    }
    
    .stacked-avatar-placeholder {
        font-size: 0.5rem;
    }
    
    .counter-text {
        font-size: 0.5rem;
    }
    
    .leader-name {
        font-size: 0.8125rem;
    }
    
    .leader-position {
        font-size: 0.6875rem;
    }
}
</style>
