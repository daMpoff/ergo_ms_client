<template>
    <div class="row g-3 p-4">
        <!-- Палитра компонентов -->
        <div class="col-3">
            <ComponentPalette />
        </div>

        <!-- Редактор -->
        <div class="col-9">
            <EditorCanvas v-model="canvasComponents" @component-click="openSettings" />
        </div>

        <!-- Предпросмотр -->
        <div class="col-12">
            <PreviewCanvas :components="canvasComponents" />
        </div>

        <!-- Offcanvas настроек -->
        <div class="offcanvas offcanvas-end" tabindex="-1" id="componentSettings" :class="{ show: isOpen }"
            :style="{ visibility: isOpen ? 'visible' : 'hidden' }" @click.self="closeSettings">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title">
                    Настройки: {{ selectedComponent?.name || '—' }}
                </h5>
                <button type="button" class="btn-close" @click="closeSettings"></button>
            </div>

            <div class="offcanvas-body">
                <ComponentSettings v-if="selectedComponent" :component="selectedComponent" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { selectedComponent } from './shortcodeStore'

import ComponentPalette from './components/ComponentPalette.vue'
import EditorCanvas from './components/EditorCanvas.vue'
import ComponentSettings from './components/ComponentSettings.vue'
import PreviewCanvas from './components/PreviewCanvas.vue'

const canvasComponents = ref([])
const isOpen = ref(false)

function openSettings(component) {
    selectedComponent.value = component
    isOpen.value = true
}

function closeSettings() {
    isOpen.value = false
}
</script>
