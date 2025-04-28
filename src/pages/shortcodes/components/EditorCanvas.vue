<template>
    <div class="position-relative p-3 border shadow rounded mb-3">
        <h4 class="mb-3">Рабочая область</h4>
        <Draggable class="border rounded p-3" v-model:value="treeData" :external-data-handler="externalDataHandler"
            :on-external-drag-over="() => true" tree-line>
            <template #default="{ node, stat }">
                <div>
                    <OpenIcon v-if="stat.children.length" :open="stat.open" class="mtl-mr"
                        @click="stat.open = !stat.open" />
                    <div class="d-flex justify-content-between align-items-start p-2 border">
                        <div>
                            <b class="p-2">{{ node.name }}</b><br>
                            <small class="p-2 text-shadow">[{{ node.id }}]</small><br>
                            <small class="p-2 text-muted">{{ node.component_type }}</small>
                        </div>

                        <!-- Кнопка настроек -->
                        <button class="btn btn-sm btn-outline-secondary" @click="$emit('open-settings', node)"
                            title="Настроить компонент">
                            ⚙️
                        </button>
                    </div>
                </div>
            </template>
        </Draggable>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { OpenIcon, Draggable } from '@he-tree/vue'
import '@he-tree/vue/style/default.css'

import { v4 as uuidv4 } from 'uuid'

const props = defineProps({
    modelValue: {
        type: Array,
        required: true
    }
})
const treeData = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val)
})

const emit = defineEmits([
    'update:modelValue',
    'open-settings'
])

const externalDataHandler = event => {
    const raw = event.dataTransfer.getData('application/json')
    try {
        const template = JSON.parse(raw)
        const id = uuidv4();
        const newComponent = {
            ...template,
            id,
            bootstrap_classes: template.bootstrap_classes || '',
            extra_data: {}
        }
        emit('update:modelValue', [...props.modelValue, newComponent])
        return {
            ...newComponent,
            children: []
        }
    }
    catch (err) {
        console.error('Ошибка при добавлении компонента:', err)
    }
}
</script>
