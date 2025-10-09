<template>
    <transition name="fade-scale">
        <div v-show="visible" class="notification-container" role="dialog" aria-modal="true">
        <div class="notification-header">
            <h3 class="notification-title">Уведомления</h3>
            <div class="notification-actions">
                <button 
                    class="action-button mark-all-read" 
                    @click="markAllAsRead"
                    :disabled="unreadCount === 0"
                >
                    Отметить все как прочитанные
                </button>
                <button class="action-button clear-all" @click="clearAll">
                    Очистить все
                </button>
            </div>
        </div>
        
        <div class="notification-list" ref="notificationList">
            <div v-if="notifications.length === 0" class="empty-state">
                <Bell :size="48" class="empty-icon" />
                <p class="empty-text">Нет новых уведомлений</p>
            </div>
            
            <div 
                v-for="notification in notifications" 
                :key="notification.id"
                class="notification-item"
                :class="{ 'unread': !notification.read }"
                @click="markAsRead(notification.id)"
            >
                <div class="notification-icon" :data-type="notification.type">
                    <component :is="getNotificationIcon(notification.type)" :size="20" />
                </div>
                
                <div class="notification-content">
                    <div class="notification-header-content">
                        <h4 class="notification-subject">{{ notification.title }}</h4>
                        <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                    </div>
                    <p class="notification-message">{{ notification.message }}</p>
                    <div v-if="notification.actions" class="notification-actions-item">
                        <button 
                            v-for="action in notification.actions"
                            :key="action.label"
                            class="action-link"
                            @click.stop="handleAction(notification.id, action)"
                        >
                            {{ action.label }}
                        </button>
                    </div>
                </div>
                
                <div class="notification-status">
                    <div v-if="!notification.read" class="unread-indicator"></div>
                </div>
            </div>
        </div>
        
        <div v-if="notifications.length > 0" class="notification-footer">
            <button class="view-all-button" @click="viewAllNotifications">
                Посмотреть все уведомления
            </button>
        </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Bell, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close', 'action'])

const notifications = ref([
    {
        id: 1,
        type: 'info',
        title: 'Новый проект создан',
        message: 'Проект "Анализ рынка" успешно создан и готов к работе',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 минут назад
        actions: [
            { label: 'Перейти к проекту', action: 'navigate' }
        ]
    },
    {
        id: 2,
        type: 'warning',
        title: 'Срок выполнения приближается',
        message: 'До завершения проекта "Исследование пользователей" осталось 2 дня',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 часа назад
        actions: [
            { label: 'Посмотреть проект', action: 'view' },
            { label: 'Продлить срок', action: 'extend' }
        ]
    },
    {
        id: 3,
        type: 'success',
        title: 'Задача выполнена',
        message: 'Задача "Сбор данных" в проекте "Анализ конкурентов" завершена',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 часа назад
        actions: [
            { label: 'Посмотреть результаты', action: 'results' }
        ]
    },
    {
        id: 4,
        type: 'error',
        title: 'Ошибка при обработке',
        message: 'Не удалось обработать файл data.csv. Проверьте формат файла',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 часов назад
        actions: [
            { label: 'Повторить обработку', action: 'retry' },
            { label: 'Посмотреть логи', action: 'logs' }
        ]
    }
])

const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
})

const getNotificationIcon = (type) => {
    const icons = {
        info: Info,
        warning: AlertTriangle,
        success: CheckCircle,
        error: AlertCircle
    }
    return icons[type] || Bell
}

const formatTime = (date) => {
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) {
        return `${minutes} мин назад`
    } else if (hours < 24) {
        return `${hours} ч назад`
    } else {
        return `${days} дн назад`
    }
}

const markAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification && !notification.read) {
        notification.read = true
    }
}

const markAllAsRead = () => {
    notifications.value.forEach(notification => {
        notification.read = true
    })
}

const clearAll = () => {
    notifications.value = []
}

const handleAction = (notificationId, action) => {
    emit('action', { notificationId, action })
}

const viewAllNotifications = () => {
    emit('action', { action: 'viewAll' })
}

</script>
<script>
export default {
}
</script>

<style scoped lang="scss">
.notification-container {
    min-width: 360px;
    max-width: 420px;
    max-height: 520px;
    background: #fff;
    border: 1px solid var(--bs-border-color, #dee2e6);
    border-radius: .75rem;
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    padding: .5rem;
}

.notification-header {
    padding: .5rem .5rem .75rem;
    border-bottom: 1px solid var(--bs-border-color, #dee2e6);
    background: #fff;
    border-radius: .5rem .5rem 0 0;
}

.notification-title {
    margin: 0 0 .5rem 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--bs-body-color, #212529);
}

.notification-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.action-button {
    padding: 4px 8px;
    border: 1px solid var(--bs-border-color, #dee2e6);
    border-radius: .5rem;
    background: #fff;
    color: var(--bs-body-color, #212529);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    
    &:hover:not(:disabled) {
        background: var(--color-hover-background, #f8f9fa);
        border-color: var(--bs-primary, #0d6efd);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.notification-list {
    flex: 1;
    overflow-y: auto;
    max-height: 340px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: var(--bs-secondary, #6c757d);
}

.empty-icon {
    margin-bottom: 12px;
    opacity: 0.5;
}

.empty-text {
    margin: 0;
    font-size: 14px;
}

.notification-item {
    display: flex;
    align-items: flex-start;
    padding: 10px 12px;
    border-bottom: 1px solid var(--bs-border-color-translucent, rgba(222, 226, 230, 0.5));
    cursor: pointer;
    transition: background-color 0.15s ease;
    
    &:hover {
        background: var(--color-hover-background, #f8f9fa);
    }
    
    &.unread {
        background: rgba(13, 110, 253, 0.05);
        border-left: 3px solid var(--bs-primary, #0d6efd);
    }
    
    &:last-child {
        border-bottom: none;
    }
}

.notification-icon {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    border-radius: 50%;
    background: var(--color-hover-background, #f8f9fa);
}

.notification-content {
    flex: 1;
    min-width: 0;
}

.notification-header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
}

.notification-subject {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--bs-body-color, #212529);
    line-height: 1.3;
}

.notification-time {
    font-size: 12px;
    color: var(--bs-secondary, #6c757d);
    white-space: nowrap;
    margin-left: 8px;
}

.notification-message {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: var(--bs-body-color, #212529);
    line-height: 1.4;
}

.notification-actions-item {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.action-link {
    padding: 2px 6px;
    border: none;
    background: none;
    color: var(--bs-primary, #0d6efd);
    font-size: 12px;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.15s ease;
    
    &:hover {
        color: var(--bs-primary-dark, #0a58ca);
    }
}

.notification-status {
    flex-shrink: 0;
    width: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.unread-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--bs-primary, #0d6efd);
}

.notification-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--bs-border-color, #dee2e6);
    background: #fff;
    border-radius: 0 0 .5rem .5rem;
}

.view-all-button {
    width: 100%;
    padding: 8px 16px;
    border: 1px solid var(--bs-border-color, #dee2e6);
    border-radius: .5rem;
    background: #fff;
    color: var(--bs-body-color, #212529);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    
    &:hover {
        background: var(--color-hover-background, #f8f9fa);
        border-color: var(--bs-primary, #0d6efd);
    }
}

// Стили для разных типов уведомлений
.notification-item.unread .notification-icon {
    &[data-type="info"] { background: rgba(13, 110, 253, 0.1); }
    &[data-type="warning"] { background: rgba(255, 193, 7, 0.1); }
    &[data-type="success"] { background: rgba(25, 135, 84, 0.1); }
    &[data-type="error"] { background: rgba(220, 53, 69, 0.1); }
}

// Анимация как в ProfileMenu.vue
.fade-scale-enter-active, .fade-scale-leave-active { transition: all .12s ease; }
.fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: translateY(-4px) scale(.98); }
</style>