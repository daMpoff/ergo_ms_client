<template>
    <div class="filters-section">
        <div class="row">
            <div class="col-md-6 col-lg-4">
                <label class="form-label">Краткое наименование проекта</label>
                <input
                    v-model="localFilters.shortName"
                    type="text"
                    class="form-control"
                    placeholder="Начните ввод..."
                />
            </div>
            <div class="col-md-3 col-lg-2">
                <label class="form-label">Роль в проекте</label>
                <select v-model="localFilters.role" class="form-select">
                    <option value="">Все</option>
                    <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                </select>
            </div>
            <div class="col-md-3 col-lg-2">
                <label class="form-label">Статус проекта</label>
                <select v-model="localFilters.status" class="form-select">
                    <option value="">Все</option>
                    <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: Object,
        required: true,
        // { shortName: string, role: string, status: string }
    },
    roles: {
        type: Array,
        required: true,
    },
    statuses: {
        type: Array,
        required: true,
    },
})

const emit = defineEmits(['update:modelValue'])

const localFilters = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    },
})
</script>

<style scoped lang="scss">
.filters-section {
    background-color: rgba(var(--bs-info-rgb, 13, 202, 240), .075);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
}
</style>


