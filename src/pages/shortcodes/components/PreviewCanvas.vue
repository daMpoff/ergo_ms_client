<template>
    <div class="position-relative p-3 border shadow rounded mb-3">
        <h4 class="mb-3">Предпросмотр</h4>
        <div class="bg-white min-vh-100">
            <p v-if="components.length === 0" class="text-muted">
                Здесь будет предпросмотр ваших компонентов
            </p>
            <PreviewRenderer v-for="comp in components" :key="comp.id" :component="comp"/>
        </div>
    </div>
</template>

<script setup>
import PreviewRenderer from './PreviewRenderer.vue';

const props = defineProps({
    components: {
        type: Array,
        required: true
    }
})
</script>
