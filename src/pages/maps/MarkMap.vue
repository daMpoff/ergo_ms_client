<script setup>
import {
  YandexMap,
  YandexMapControlButton,
  YandexMapControls,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultMarker,
  YandexMapDefaultSchemeLayer,
  YandexMapGeolocationControl,
  YandexMapZoomControl,
} from 'vue-yandex-maps'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { Maximize2, Minimize2 } from 'lucide-vue-next'

defineProps({
  width: { type: String, required: true, default: '100%' },
  height: { type: String, required: true, default: '400px' },
  theme: { type: String, required: true, default: 'light' },
})

const defaultMarker = shallowRef(null)
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
        center: [37.617644, 55.755819],
        zoom: 10,
      },
      theme: theme,
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
    <YandexMapDefaultFeaturesLayer />
    <YandexMapDefaultMarker
      v-model="defaultMarker"
      :settings="{
        coordinates: [37.617644, 55.755819],
        title: 'Москва',
        subtitle: `Столица России, основана <br> в 1147 году, с населением <br> более 12 миллионов человек.`,
      }"
    />
  </YandexMap>
</template>

<style scoped lang="scss"></style>
