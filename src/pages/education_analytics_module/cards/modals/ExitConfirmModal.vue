<template>
  <div v-if="show" class="modal-overlay" @click.stop>
    <div class="modal-content exit-confirm-modal" @click.stop>
      <h3>Несохраненные изменения</h3>
      <p>У вас есть несохраненные изменения. Вы действительно хотите выйти без сохранения?</p>
      <div class="exit-confirm-actions">
        <button class="cancel-btn" @click="$emit('exit')">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Выйти
        </button>
        <button class="confirm-btn" @click="$emit('cancel')">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Продолжить
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  show: Boolean
});
defineEmits(['exit', 'cancel']);
</script>
<style scoped>
/* Стилизация модального окна */
</style>
