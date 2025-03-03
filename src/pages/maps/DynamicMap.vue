<script setup>
import {
  YandexMap,
  YandexMapControlButton,
  YandexMapControls,
  YandexMapDefaultSchemeLayer,
  YandexMapGeolocationControl,
  YandexMapListener,
  YandexMapZoomControl,
} from 'vue-yandex-maps'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { Maximize2, Minimize2 } from 'lucide-vue-next'

defineProps({
  width: { type: String, required: true, default: '100%' },
  height: { type: String, required: true, default: '400px' },
  theme: { type: String, required: true, default: 'light' },
})

const hasAutoRotate = ref(true)
const mapAzimuth = ref(0)
const mapTilt = ref((40 * Math.PI) / 180)
const frame = ref(null)

const isFullscreen = ref(false)
const map = shallowRef(null)

const toggleFullscreen = () => {
  if (isFullscreen.value) {
    document.exitFullscreen()
  } else {
    map.value.container.requestFullscreen()
  }
}

const iconFullScreen = computed(() => {
  return isFullscreen.value ? Minimize2 : Maximize2
})

const startAutoRotationCamera = () => {
  if (!map.value) return

  if (hasAutoRotate.value) {
    mapAzimuth.value = map.value.azimuth + (10 * Math.PI) / 180 / 100
    frame.value = requestAnimationFrame(startAutoRotationCamera)
  } else if (frame.value) cancelAnimationFrame(frame.value)
}

watch(
  [hasAutoRotate, map],
  () => {
    if (typeof requestAnimationFrame === 'undefined') return
    requestAnimationFrame(startAutoRotationCamera)
  },
  {
    immediate: true,
  },
)

onBeforeUnmount(() => {
  if (frame.value) {
    hasAutoRotate.value = false
    cancelAnimationFrame(frame.value)
  }
})

const updateCamera = async (type, direction) => {
  hasAutoRotate.value = false
  await nextTick()
  if (frame.value) cancelAnimationFrame(frame.value)

  mapAzimuth.value = map.value.azimuth
  mapTilt.value = map.value.tilt

  switch (type) {
    case 'azimuth':
      mapAzimuth.value =
        map.value.azimuth + (30 * Math.PI) / (180 * (direction === 'minus' ? -1 : 1))
      break
    case 'tilt':
      mapTilt.value = map.value.tilt + (10 * Math.PI) / (180 * (direction === 'minus' ? -1 : 1))
      break
    default:
  }
}

onMounted(() => {
  const handleFullscreenChange = async () => {
    isFullscreen.value = !!document.fullscreenElement
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange)

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
  })
})
</script>

<template>
  <YandexMap
    v-model="map"
    :width="width"
    :height="isFullscreen ? '100dvh' : height"
    :settings="{
      location: {
        center: [37.62308, 55.752677],
        zoom: 18.5,
      },
      theme: theme,
      camera: { azimuth: mapAzimuth, tilt: mapTilt, duration: hasAutoRotate ? 0 : 250 },
      showScaleInCopyrights: true,
    }"
  >
    <YandexMapDefaultSchemeLayer />
    <YandexMapControls :settings="{ position: 'right' }">
      <YandexMapZoomControl />
      <YandexMapGeolocationControl />
    </YandexMapControls>
    <YandexMapControls :settings="{ position: 'top right', orientation: 'vertical' }">
      <YandexMapControlButton :settings="{ onClick: toggleFullscreen }">
        <component :is="iconFullScreen" :size="22"></component>
      </YandexMapControlButton>
    </YandexMapControls>
    <YandexMapListener :settings="{ onActionStart: () => (hasAutoRotate = false) }" />
    <YandexMapControls :settings="{ position: 'top' }">
      <YandexMapControlButton
        :settings="{
          color: '#fff',
          background: hasAutoRotate ? 'var(--bs-primary)' : 'var(--bs-blue)',
          onClick: () => (hasAutoRotate = !hasAutoRotate),
        }"
      >
        Авто-поворот
      </YandexMapControlButton>
      <YandexMapControlButton :settings="{ onClick: () => updateCamera('azimuth', 'minus') }">
        Поворот влево
      </YandexMapControlButton>
      <YandexMapControlButton :settings="{ onClick: () => updateCamera('azimuth', 'plus') }">
        Поворот вправо
      </YandexMapControlButton>
      <YandexMapControlButton :settings="{ onClick: () => updateCamera('tilt', 'minus') }">
        Наклон наверх
      </YandexMapControlButton>
      <YandexMapControlButton :settings="{ onClick: () => updateCamera('tilt', 'plus') }">
        Наклон вниз
      </YandexMapControlButton>
    </YandexMapControls>
  </YandexMap>
</template>

<style scoped lang="scss"></style>
