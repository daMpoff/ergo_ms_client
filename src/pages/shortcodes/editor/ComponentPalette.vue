<template>
    <div class="position-relative p-3 border shadow rounded mb-3">
        <h4 class="mb-3">Компоненты</h4>
        <div v-for="template in templates" :key="template.id" class="border p-3 rounded bg-white shadow-sm mb-2"
            draggable="true" @dragstart="onDragStart($event, template)">
            <strong>{{ template.name }}</strong><br />
            <small class="text-muted">{{ template.component_type }}</small>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, toRaw } from 'vue'
import { shortcodesService } from '@/js/api/services/shortcodes'

const templates = ref([])

const onDragStart = (event, template) => {
    event.dataTransfer.setData('application/json', JSON.stringify(template))
}

const loadTemplates = async () => {
    const res = await shortcodesService.getTemplates()
    if (res.success) {
        templates.value = res.data
        console.log(toRaw(templates.value))
    }
    else {
        console.error('Ошибка загрузки шаблонов:', res.errors)
    }
}

onMounted(loadTemplates)
</script>
