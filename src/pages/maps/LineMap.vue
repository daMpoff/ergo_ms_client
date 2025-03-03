<script setup>
import {
  YandexMap,
  YandexMapControlButton,
  YandexMapControls,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultMarker,
  YandexMapDefaultSchemeLayer,
  YandexMapFeature,
  YandexMapGeolocationControl,
  YandexMapListener,
  YandexMapZoomControl,
} from 'vue-yandex-maps'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { Maximize2, Minimize2 } from 'lucide-vue-next'

defineProps({
  width: { type: String, required: true, default: '100%' },
  height: { type: String, required: true, default: '400px' },
  theme: { type: String, required: true, default: 'light' },
})

const lineCoordinates = ref([
  [86.86385144616358, 28.116408418627383],
  [86.81839686158105, 28.207288455680004],
  [86.81808226511791, 28.22806172843069],
  [86.82031538666244, 28.233797292491484],
  [86.81472565766904, 28.256087324925446],
  [86.80790342291837, 28.269123341443187],
  [86.80645477029938, 28.27525587569196],
  [86.80802334159438, 28.284579144705692],
  [86.82236456486294, 28.30302488453657],
  [86.8404130550352, 28.31244898081271],
  [86.85774203315137, 28.316018431353587],
  [86.92003905590767, 28.307458931889137],
  [86.94147211211823, 28.327385436365866],
  [86.96047236560229, 28.379870569048947],
  [86.97633868599863, 28.40045387913822],
  [87.0230092257106, 28.417227886422154],
  [87.04041289769795, 28.412869410130657],
  [87.0563226922615, 28.40335937826793],
  [87.06789936697723, 28.401067131394555],
  [87.09546140544649, 28.404831704446202],
  [87.10278140482315, 28.406548833235735],
  [87.11846040699565, 28.404679235671836],
  [87.14572366998014, 28.393186941012182],
  [87.14746557763569, 28.38842302269884],
  [87.16574223424259, 28.377389828495165],
  [87.1776900441308, 28.35942815283268],
  [87.18471126802267, 28.354736898303855],
  [87.1938239203079, 28.353547532886758],
  [87.20726881712218, 28.349384647915294],
  [87.22295453007217, 28.349252490136283],
  [87.23375742296602, 28.344200427946454],
  [87.28088925568717, 28.333825025190656],
  [87.29585938546269, 28.32476224099636],
  [87.30990183324649, 28.32800081295931],
  [87.3192385671453, 28.328199089636495],
  [87.35075938078766, 28.31874748571409],
  [87.36449721762801, 28.310366119340454],
  [87.38660660350038, 28.290797705213187],
  [87.38757762382585, 28.286235626685304],
  [87.38571027704609, 28.279425199952268],
  [87.372340074103, 28.27763986965878],
  [87.35753996538894, 28.254855225339856],
])

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
    class="map"
    :width="width"
    :height="isFullscreen ? '100dvh' : height"
    :settings="{
      location: {
        center: [87.0764, 28.3],
        zoom: 10,
      },
      theme: theme,
      showScaleInCopyrights: true,
    }"
  >
    <YandexMapDefaultSchemeLayer />
    <yandex-map-default-features-layer />
    <YandexMapFeature
      :settings="{
        geometry: {
          type: 'LineString',
          coordinates: lineCoordinates,
        },
        style: {
          stroke: [{ color: '#006efc', width: 4 }],
        },
      }"
    />
    <YandexMapListener
      :settings="{ onClick: (_, e) => (lineCoordinates = [...lineCoordinates, e.coordinates]) }"
    />
    <YandexMapDefaultMarker
      v-if="lineCoordinates.length === 1"
      :settings="{
        title: 'Всего одна точка',
        subtitle: 'Кликайте ещё!',
        coordinates: lineCoordinates[0],
      }"
    />
    <YandexMapControls :settings="{ position: 'right' }">
      <YandexMapZoomControl />
      <YandexMapGeolocationControl />
    </YandexMapControls>
    <YandexMapControls :settings="{ position: 'top right', orientation: 'vertical' }">
      <YandexMapControlButton :settings="{ onClick: toggleFullscreen }">
        <component :is="iconFullScreen" :size="22"></component>
      </YandexMapControlButton>
    </YandexMapControls>
    <YandexMapControls :settings="{ position: 'left top', orientation: 'vertical' }">
      <YandexMapControlButton
        v-if="lineCoordinates.length"
        :settings="{
          background: 'var(--bs-primary)',
          color: '#fff',
          onClick: () => (lineCoordinates = []),
        }"
      >
        Стереть точки ({{ lineCoordinates.length }})
      </YandexMapControlButton>
    </YandexMapControls>
  </YandexMap>
</template>

<style scoped lang="scss"></style>
