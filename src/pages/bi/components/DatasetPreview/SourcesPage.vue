<template>
    <div class="sources-main">
        <div class="main-connections">
            <div style="font-weight: bold; padding-left: 15px; padding-top: 15px;">Подключения</div>
            <button type="button" class="btn btn-outline-light" @click="showTooltip = !showTooltip" ref="buttonRef">
                <Plus :size="20" :stroke-width="2" />Добавить
            </button>
            <div class="connections-list">

            </div>
        </div>
        <hr>
        <div class="main-tables">
            <div style="font-weight: bold; padding-left: 15px;">Таблицы</div>
            <div class="tables-list">
                <div>Добавьте подключение, чтобы отобразить список таблиц</div>
            </div>
        </div>
    </div>
    <div v-if="showTooltip" class="tooltip-panel" ref="tooltipRef">
        <ConnectionsTooltip />
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Plus } from 'lucide-vue-next';
import ConnectionsTooltip from '@/pages/bi/components/DatasetPreview/ConnectionsTooltip.vue'

const showTooltip = ref(false)
const tooltipRef = ref(null)
const buttonRef = ref(null)

function handleClickOutside(event) {
  const clickedOutsideTooltip = tooltipRef.value && !tooltipRef.value.contains(event.target)
  const clickedOutsideButton = buttonRef.value && !buttonRef.value.contains(event.target)

  if (clickedOutsideTooltip && clickedOutsideButton) {
    showTooltip.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped lang="scss">
.sources-main {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
}

.main-connections {
    min-height: 200px;
    display: flex;
    flex-direction: column;
}

.main-tables {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.btn {
    width: 120px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3px;
    border: 0;
}

.tables-list {
    flex: 1;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.tooltip-panel {
    position: fixed;
    top: 300px;
    left: 385px;
    width: 416px;
    height: 436px;
    background-color: #2b2b2b;
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.6);
    z-index: 100;
    padding: 1rem;
    color: white;
}
</style>