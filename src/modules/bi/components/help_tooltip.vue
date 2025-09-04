<template>
    <span class="help-icon-wrapper" @mouseenter="onEnter" @mouseleave="onLeave">
        <HelpCircle class="lucide" :size="size" />
    </span>
    <div v-if="visible" class="tooltip-fixed" :class="tooltipClass" :style="tooltipStyle">
        <slot>
            <span v-if="text">{{ text }}</span>
        </slot>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { HelpCircle } from 'lucide-vue-next'

const props = defineProps({
    text: { type: String, default: '' },
    size: { type: Number, default: 18 },
    tooltipClass: { type: String, default: '' },
})

const visible = ref(false)
const tooltipStyle = ref({ top: '0px', left: '0px' })

function onEnter(event) {
    const rect = event.target.getBoundingClientRect()
    tooltipStyle.value = {
        top: `${rect.top + window.scrollY - 8}px`,
        left: `${rect.left + rect.width / 2 + window.scrollX}px`,
    }
    visible.value = true
}

function onLeave() {
    visible.value = false
}
</script>

<style scoped lang="scss">
.help-icon-wrapper{
    display: inline-flex;
    align-items: center;
}

.lucide{
    vertical-align: middle;
}

.tooltip-fixed{
    position: fixed;
    transform: translateX(-50%);
    background-color: var(--color-primary-background);
    color: var(--color-primary-text);
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 12px;
    z-index: 9999;
    max-width: 360px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}
</style>


