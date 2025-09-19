<template>
    <div class="reports-page">
        <div class="reports-page-header" :class="{ 'is-collapsed': !!activeTab }">
            <div class="d-flex justify-content-center align-items-center gap-3 flex-wrap">
                <div
                    class="report-card d-flex flex-column align-items-center justify-content-center text-center"
                    :class="{ active: activeTab === 'monthly' }"
                    role="button"
                    tabindex="0"
                     @click="toggleTab('monthly')"
                     @keyup.enter="toggleTab('monthly')"
                >
                    <FileSpreadsheet :size="32" class="mb-2" />
                    <div class="report-card-title">Ежемесячные отчёты</div>
                </div>

                <div
                    class="report-card d-flex flex-column align-items-center justify-content-center text-center"
                    :class="{ active: activeTab === 'stages' }"
                    role="button"
                    tabindex="0"
                     @click="toggleTab('stages')"
                     @keyup.enter="toggleTab('stages')"
                >
                    <Flag :size="32" class="mb-2" />
                    <div class="report-card-title">Отчёты по этапам</div>
                </div>

                <div
                    class="report-card d-flex flex-column align-items-center justify-content-center text-center"
                    :class="{ active: activeTab === 'final' }"
                    role="button"
                    tabindex="0"
                     @click="toggleTab('final')"
                     @keyup.enter="toggleTab('final')"
                >
                    <FileCheck :size="32" class="mb-2" />
                    <div class="report-card-title">Итоговый отчёт</div>
                </div>
            </div>
        </div>
        <div v-if="activeTab" class="page-header-divider"></div>
        <div v-if="activeTab" class="reports-page-content">
            <MonthlyReportsPage v-if="activeTab === 'monthly'" />
            <div v-else-if="activeTab === 'stages'">
                <h5 class="mb-3">Отчёты о выполнении этапов</h5>
                <div class="text-muted">Отслеживание статуса этапов проекта. (Здесь будет содержимое отчётов по этапам.)</div>
            </div>
            <div v-else-if="activeTab === 'final'">
                <h5 class="mb-3">Итоговый отчёт</h5>
                <div class="text-muted">Формирование общего итогового отчёта. (Здесь будет содержимое итогового отчёта.)</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { FileSpreadsheet, Flag, FileCheck } from 'lucide-vue-next'
import MonthlyReportsPage from './reports/MonthlyReportsPage.vue'

const activeTab = ref(null)

function toggleTab(tabKey) {
    activeTab.value = activeTab.value === tabKey ? null : tabKey
}

</script>

<style scoped lang="scss">
.reports-page-header {
    padding: 1rem 0 1.5rem;
}

.report-card {
    width: 140px;
    height: 140px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.5rem;
    background-color: #fff;
    transition: all 0.3s ease;
    cursor: pointer;
    user-select: none;

    &:hover {
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
    }

    &.active {
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
    }
}

/* Сжатый горизонтальный вид при выборе вкладки */
.reports-page-header.is-collapsed {
    padding: 0.5rem 0 1rem;
}

.reports-page-header.is-collapsed .report-card {
    height: 56px;
    width: auto;
    padding: 0 0.75rem;
    border-radius: 0.75rem;
    flex-direction: row !important;
    align-items: center;
    text-align: left;
    transform: none; /* убирать подъём при hover для стабильности высоты */
}

.reports-page-header.is-collapsed .report-card:hover {
    transform: none;
}

.reports-page-header.is-collapsed .report-card .mb-2 {
    margin-bottom: 0 !important;
    margin-right: 0.5rem;
}

.report-card-title {
    font-weight: 600;
    line-height: 1.2;
}

.page-header-divider {
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 1rem;
}

.reports-page-content {
    padding: 0 0.5rem 1rem;
}
</style>