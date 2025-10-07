<template>
    <div class="page-header">
        <div class="header-search">
            <form class="search-form" @submit.prevent>
                <input type="search" class="search-input" placeholder="Поиск" aria-label="Поиск" />
                <button type="submit" class="search-button" aria-label="Найти">
                    <Search :size="18" />
                </button>
            </form>
        </div>
        <div class="header-actions">
            <div class="header-buttons">
                <div 
                    v-if="!isCreatePage" 
                    class="button-create" 
                    role="button" 
                    aria-label="Создать проект"
                    @click="navigateToCreate"
                >
                    <Plus :size="18" />
                    <span>Создать проект</span>
                </div>
            </div>
            <div class="header-profile" ref="profileRef">
                <div class="profile-alerts" @click="incrementAlerts" role="button" aria-label="Уведомления">
                    <Bell :size="18" />
                    <span v-if="alertsCount > 0" class="badge-count">{{ alertsCount >= 99 ? '99+' : alertsCount }}</span>
                </div>
                <div class="profile-avatar" role="button" aria-haspopup="dialog" aria-expanded="showProfileMenu ? 'true' : 'false'" @click="toggleProfileMenu">
                    <img v-if="avatarUrl" :src="avatarUrl" alt="Аватар" class="avatar-img" />
                    <UserRound v-else :size="18" />
                </div>
                <div class="profile-menu-wrapper" v-show="showProfileMenu">
                    <ProfileMenu :visible="showProfileMenu" @navigate="onMenuNavigate" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserRound, Bell, Plus, Search } from 'lucide-vue-next'
import ProfileMenu from './ProfileMenu.vue'
import { useUserStore } from '@/core/cms/js/userStore.js'

const route = useRoute()
const router = useRouter()

const userStore = useUserStore()

const alertsCount = ref(0)
const showProfileMenu = ref(false)
const profileRef = ref(null)

const isCreatePage = computed(() => {
    return route.name === 'ProjectEdCreate'
})

const avatarUrl = computed(() => userStore.avatarUrl)

const incrementAlerts = () => {
    if (alertsCount.value < 99) {
        alertsCount.value += 1
    }
}

const navigateToCreate = () => {
    router.push({ name: 'ProjectEdCreate' })
}

const toggleProfileMenu = () => {
    showProfileMenu.value = !showProfileMenu.value
}

const closeOnOutside = (event) => {
    const root = profileRef.value
    if (!root) return
    if (!root.contains(event.target)) {
        showProfileMenu.value = false
    }
}

const closeOnEsc = (event) => {
    if (event.key === 'Escape') {
        showProfileMenu.value = false
    }
}

const onMenuNavigate = (action) => {
    // Навигацию подключим при интеграции реальных страниц
    if (action === 'logout') {
        // TODO: вызвать логаут когда будет готов
    } else if (action === 'profile') {
        // router.push({ name: 'Profile' })
    } else if (action === 'settings') {
        // router.push({ name: 'Settings' })
    }
    showProfileMenu.value = false
}

onMounted(() => {
    document.addEventListener('click', closeOnOutside)
    document.addEventListener('keydown', closeOnEsc)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', closeOnOutside)
    document.removeEventListener('keydown', closeOnEsc)
})
</script>

<style scoped lang="scss">
.page-header {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
}
.header-actions {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: .5rem;
}
.header-buttons {
    display: flex;
    align-items: center;
    gap: .5rem;
}
.button-create {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    padding: .375rem .75rem;
    border-radius: 2rem;
    background-color: var(--color-header-background);
    color: var(--bs-body-color, #212529);
    cursor: pointer;
    transition: background-color .15s ease, border-color .15s ease, color .15s ease, box-shadow .15s ease;
}
.button-create:hover {
    background-color: var(--color-hover-background, #f8f9fa);
    border-color: var(--bs-border-color, #ced4da);
}
.header-profile {
    position: relative;
    display: flex;
    align-items: center;
    gap: .5rem;
}
.header-search {
    justify-self: center;
    width: 100%;
    max-width: 450px;
}
.search-form { position: relative; width: 100%; }
.search-input {
    width: 100%;
    height: 38px;
    padding: .375rem 2.25rem .375rem .875rem;
    border: 1px solid var(--bs-border-color, #dee2e6);
    border-radius: 9999px;
    background-color: #fff;
    color: var(--bs-body-color, #212529);
    outline: none;
    transition: box-shadow .15s ease, border-color .15s ease;
}
.search-input::placeholder { color: #adb5bd; }
.search-input:focus {
    border-color: var(--bs-primary, #0d6efd);
    box-shadow: 0 0 0 .2rem rgba(13,110,253,.15);
}
.search-button {
    position: absolute;
    top: 50%;
    right: .375rem;
    transform: translateY(-50%);
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--bs-body-color, #212529);
    cursor: pointer;
    transition: background-color .15s ease, color .15s ease;
}
.search-button:hover { background-color: var(--color-hover-background, #f8f9fa); }
.profile-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    overflow: hidden;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.profile-alerts {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    transition: background-color .15s ease, border-color .15s ease, color .15s ease;
    position: relative;
}
.profile-alerts:hover { background-color: var(--color-hover-background); }
.badge-count {
    position: absolute;
    right: -2px;
    bottom: -2px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 9999px;
    background-color: var(--bs-danger, #dc3545);
    color: #fff;
    font-size: 10px;
    line-height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
}
.profile-menu-wrapper { position: absolute; top: 100%; right: 0; }
</style>



