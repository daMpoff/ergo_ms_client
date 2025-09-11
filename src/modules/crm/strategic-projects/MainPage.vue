<template>
    <div class="page-container">
        <div class="page-content">
            <div class="content-projects">
                <h3>
                    <router-link :to="{ name: 'MyProjects' }" class="h3-link">Мои проекты</router-link>
                </h3>
                <MyProjectsList />
            </div>
            <div class="content-programm">
                <div class="programm-header" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="header-h3">
                        <h3>Программа развития БГТУ</h3>
                    </div>
                    <div class="header-buttons">
                        <button
                            type="button"
                            class="button-action"
                            :class="{ active: selectedProgramTab === 'events' }"
                            :aria-pressed="selectedProgramTab === 'events'"
                            aria-label="Перечень мероприятий"
                            @click="selectedProgramTab = 'events'"
                        >
                            Перечень мероприятий
                        </button>
                        <button type="button" class="button-action" :class="{ active: selectedProgramTab === 'kpis' }"
                            :aria-pressed="selectedProgramTab === 'kpis'" aria-label="Перечень целевых показателей"
                            @click="selectedProgramTab = 'kpis'">Перечень целевых показателей</button>
                    </div>
                    <div class="programm-content">
                        <ProgrammList :selected-tab="selectedProgramTab" />
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import MyProjectsList from './components/MyProjectsList.vue'
import ProgrammList from './components/ProgrammList.vue'

// Программа развития: выбранная вкладка
const selectedProgramTab = ref('events')
</script>

<style scoped lang="scss">
.page-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.page-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}
.h3-link {
    text-decoration: none;
    color: inherit;
    display: inline;
}
.h3-link h3:hover {
    text-decoration: none;
    cursor: pointer;
}
.header-buttons {
    display: flex;
    align-items: center;
    gap: .5rem;
}
.button-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    padding: .375rem .75rem;
    border-radius: .5rem;
    background-color: var(--color-header-background);
    color: var(--bs-body-color, #212529);
    border: 1px solid transparent;
    cursor: pointer;
    transition: background-color .15s ease, border-color .15s ease, color .15s ease, box-shadow .15s ease;
}
.button-action:hover {
    background-color: var(--color-hover-background, #f8f9fa);
    border-color: var(--bs-border-color, #ced4da);
}
.button-action.active {
    background-color: var(--bs-body-color, #212529);
    color: #fff;
}
</style>