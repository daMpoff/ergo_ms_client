<template>
    <div class="row g-3 p-4">
        <!-- Палитра компонентов -->
        <div class="col-3">
            <ComponentPalette />
        </div>

        <!-- Редактор -->
        <div class="col-9">
            <EditorCanvas v-model="canvasComponents" @open-settings="openSettings" />
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
import { ref, watch } from 'vue'
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
    selectedComponent.value = null
    isOpen.value = false
}
watch(
  () => selectedComponent.value,
  (newComp) => {
    if (!newComp) return

    const idx = canvasComponents.value.findIndex(c => c.id === newComp.id)
    if (idx === -1) return
    const updated = {
      ...canvasComponents.value[idx],
      bootstrap_classes: newComp.bootstrap_classes,
      extra_data: { ...newComp.extra_data }
    }
    const newArr = [
      ...canvasComponents.value.slice(0, idx),
      updated,
      ...canvasComponents.value.slice(idx + 1)
    ]
    canvasComponents.value = newArr
  },
  { deep: true }
)
</script>
