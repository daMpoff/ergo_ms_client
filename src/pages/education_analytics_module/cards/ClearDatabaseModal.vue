<template>
  <div class="modal fade" id="confirmClearModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">
            <AlertTriangle class="me-2"/>
            Подтверждение очистки
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"/>
        </div>
        <div class="modal-body">
          <p class="text-muted mb-0 fs-5">Вы собираетесь полностью очистить базу данных. Это действие:</p>
          <ul>
            <li>Удалит абсолютно все данные</li>
            <li>Не может быть отменено</li>
            <li>Может занять некоторое время</li>
          </ul>
          <p class="fw-bold text-muted mb-0 fs-5">Вы уверены, что хотите продолжить?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <X class="me-2"/>Отмена
          </button>
          <button type="button" class="btn btn-danger" @click="confirm" data-bs-dismiss="modal">
            <Trash2 class="me-2"/>Да, очистить БД
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Modal } from 'bootstrap'
import { AlertTriangle, X, Trash2 } from 'lucide-vue-next'

const emit = defineEmits(['confirm'])

defineExpose({
  show: () => {
    const modal = new Modal(document.getElementById('confirmClearModal'))
    modal.show()
  }
})

const confirm = () => {
  emit('confirm')
}
</script>
