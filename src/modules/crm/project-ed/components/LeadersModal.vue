<template>
    <Teleport to="body">
        <Transition name="modal">
            <div 
                v-if="visible"
                class="modal-overlay"
                @click="closeModal"
            >
                <div 
                    class="modal-content"
                    @click.stop
                >
                    <!-- Заголовок модального окна -->
                    <div class="modal-header">
                        <div class="modal-title">
                            <Users class="modal-icon" :size="20" />
                            <span>Руководители ({{ leaders.length }})</span>
                        </div>
                        <button 
                            class="modal-close"
                            @click="closeModal"
                        >
                            <X :size="20" />
                        </button>
                    </div>

                    <!-- Сетка руководителей -->
                    <div class="leaders-grid">
                        <div 
                            v-for="leader in leaders" 
                            :key="leader.id"
                            class="leader-card"
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
                                <div class="leader-name">{{ formatLeaderName(leader.name) }}</div>
                                <div v-if="leader.position" class="leader-position">{{ leader.position }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Users, X } from 'lucide-vue-next'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    leaders: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['close'])

const avatarErrors = ref(new Set())

const closeModal = (event) => {
    // Если событие не передано, закрываем модалку
    if (!event) {
        emit('close')
        return
    }
    
    // Закрываем модалку при клике на overlay (фон) или на кнопку закрытия
    if (event.target === event.currentTarget || event.target.closest('.modal-close')) {
        emit('close')
    }
}

// Обработчик клавиши Escape
const handleKeydown = (event) => {
    if (event.key === 'Escape' && props.visible) {
        closeModal()
    }
}

// Блокировка скролла страницы
const blockScroll = () => {
    document.body.style.overflow = 'hidden'
}

const unblockScroll = () => {
    document.body.style.overflow = ''
}

onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    unblockScroll()
})

// Блокируем скролл при открытии модального окна
watch(() => props.visible, (newValue) => {
    if (newValue) {
        blockScroll()
    } else {
        unblockScroll()
    }
})

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
</script>

<style scoped lang="scss">
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 1rem;
}

.modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    border-bottom: 1px solid #e9ecef;
}

.modal-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #212529;
    
    .modal-icon {
        color: #6c757d;
    }
}

.modal-close {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    
    &:hover {
        background: #f8f9fa;
        color: #495057;
    }
}

.leaders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
    padding: 1.5rem;
    overflow-y: auto;
    max-height: 60vh;
    
    // Стилизация скроллбара
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f3f4;
        border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #c1c8cd;
        border-radius: 3px;
        
        &:hover {
            background: #a8b2ba;
        }
    }
}

.leader-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0.75rem;
    border-radius: 8px;
    transition: background-color 0.2s ease;
    
    &:hover {
        background: #f8f9fa;
    }
}

.leader-avatar-container {
    margin-bottom: 0.5rem;
}

.leader-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e9ecef;
    background: #f8f9fa;
}

.leader-avatar-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6c757d;
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    border: 2px solid #dee2e6;
}

.leader-info {
    width: 100%;
}

.leader-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #212529;
    margin-bottom: 0.25rem;
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

// Анимации
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
    transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
    transform: scale(0.9) translateY(-20px);
}

// Адаптивность
@media (max-width: 768px) {
    .modal-content {
        max-width: 90vw;
        margin: 1rem;
    }
    
    .leaders-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 0.75rem;
        padding: 1rem;
    }
    
    .leader-avatar,
    .leader-avatar-placeholder {
        width: 40px;
        height: 40px;
        font-size: 0.75rem;
    }
    
    .leader-name {
        font-size: 0.8125rem;
    }
    
    .leader-position {
        font-size: 0.6875rem;
    }
}

@media (max-width: 480px) {
    .leaders-grid {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 0.5rem;
    }
    
    .leader-avatar,
    .leader-avatar-placeholder {
        width: 36px;
        height: 36px;
        font-size: 0.625rem;
    }
    
    .leader-name {
        font-size: 0.75rem;
    }
    
    .leader-position {
        font-size: 0.625rem;
    }
}
</style>
