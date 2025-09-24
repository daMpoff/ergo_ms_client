<template>
  <div 
    class="default-avatar"
    :class="[
      `default-avatar--${size}`,
      { 'default-avatar--clickable': clickable }
    ]"
    :title="title"
    ref="rootEl"
  >
    <User :size="iconSize" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { User } from 'lucide-vue-next'

const props = defineProps({
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  clickable: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Пользователь'
  }
})

// Адаптивный размер иконки: доля от диаметра круга
const rootEl = ref(null)
const observedIconSize = ref(null)

const computeIconSizeFromBox = (box) => {
  if (!box) return null
  const diameter = Math.min(box.width, box.height)
  // Коэффициент подбираем визуально (45% диаметра — крупнее)
  return Math.round(diameter * 0.45)
}

let resizeObserver = null
onMounted(() => {
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const box = entry.contentRect
        observedIconSize.value = computeIconSizeFromBox(box)
      }
    })
    if (rootEl.value) {
      resizeObserver.observe(rootEl.value)
    }
  }
})

onBeforeUnmount(() => {
  if (resizeObserver && rootEl.value) {
    resizeObserver.unobserve(rootEl.value)
  }
  resizeObserver = null
})

// Фолбэк на предустановленные размеры, если ResizeObserver недоступен
const fallbackSizes = { small: 24, medium: 32, large: 96 }
const iconSize = computed(() => observedIconSize.value || fallbackSizes[props.size])
</script>

<style scoped lang="scss">
.default-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
  border: 2px solid rgba($color: #1976d2, $alpha: 0.2);
  transition: all 0.2s ease;
  user-select: none;
  width: 100%;
  height: 100%;
  
  // Ширина/высота могут быть переопределены снаружи (например, 100%)
  // Эти модификаторы оставляем только для толщины рамки по умолчанию
  &--small { border-width: 1px; }
  &--medium { border-width: 2px; }
  &--large { border-width: 3px; }
  
  &--clickable {
    cursor: pointer;
    
    &:hover {
      transform: scale(1.05);
      border-color: rgba($color: #1976d2, $alpha: 0.4);
      box-shadow: 0 4px 16px rgba($color: #1976d2, $alpha: 0.15);
      background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
    }
  }
}
</style> 