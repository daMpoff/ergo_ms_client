<script setup>
import ModalCenter from '@/components/ModalCenter.vue'

defineProps({
  icon: { type: Function, required: true, default: () => {} },
  title: { type: String, required: true, default: '' },
  description: { type: String, required: true, default: '' },
  modalId: { type: String, required: true, default: '' },
  modalBig: { type: Boolean, required: false, default: false },
})
</script>

<template>
  <div class="d-flex flex-column align-items-center justify-content-center">
    <component class="mb-4 text-secondary-emphasis" :is="icon" v-if="icon" :size="35" />
    <h5 class="mb-3">{{ title }}</h5>
    <p class="mb-4 text-center">{{ description }}</p>
  </div>
  <button class="btn btn-primary mx-auto" data-bs-toggle="modal" :data-bs-target="`#${modalId}`">
    Открыть
  </button>
  <ModalCenter :customClass="{ 'modal-xl': modalBig }" :title="title" :modalId="modalId">
    <slot></slot>
  </ModalCenter>
</template>

<style scoped lang="scss"></style>
