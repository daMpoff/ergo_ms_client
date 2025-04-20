<template>
    <div class="d-flex justify-content-between align-items-start p-2 border">
        <div>
            <b class="mb-1">{{ component.name }}</b>
            <p class="mb-2 text-shadow">[{{ component.id }}]</p>
            <small class="text-muted">{{ component.component_type }}</small>
        </div>

        <!-- Кнопка настроек -->
        <button class="btn btn-sm btn-outline-secondary" @click="$emit('open-settings', component)"
            title="Настроить компонент">
            ⚙️
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
    component: Object
})
</script>
