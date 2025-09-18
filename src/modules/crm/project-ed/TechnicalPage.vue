<template>
    <div class="page-container">
        <Breadcrumbs :items="breadcrumbItems" />
        <div class="page-content">
            <h3>Служебная страница</h3>
            <div class="card p-3">
                <div class="d-flex flex-column gap-2">
                    <div>Внутренние служебные функции и ссылки.</div>
                    <router-link :to="{ name: 'ProjectEdProgramDevelopment' }" class="btn btn-outline-primary align-self-start">
                        Перейти к программе развития БГТУ
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Home, Wrench } from 'lucide-vue-next'
import Breadcrumbs from './components/Breadcrumbs.vue'

const breadcrumbItems = ref([
    { label: 'Главная', icon: Home, to: { name: 'ProjectEdMain' } },
    { label: 'Служебная страница', icon: Wrench }
])
</script>

<style scoped lang="scss">
.page-container { display: flex; flex-direction: column; height: 100%; }
.page-content { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
</style>