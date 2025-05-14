<template>
  <div v-if="show" class="modal-overlay" @click="onClose">
    <div class="modal-content details-modal" @click.stop>
      <div class="modal-header">
        <div class="header-title-block">
          <h3>Детали записи</h3>
          <div v-if="isEditDisabled" class="edit-disabled-message-compact">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="margin-right:7px;"><rect x="3" y="11" width="18" height="8" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Редактирование записей в этой таблице отключено
          </div>
        </div>
        <button class="close-button" @click="onClose" title="Закрыть">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="details-content">
        <div v-for="col in columns" :key="col" class="detail-row">
          <div class="detail-label">{{ col }}:</div>
          <div class="detail-value">
            <template v-if="isEditing && !isRelationTable && editableFields.includes(col)">
              <template v-if="fieldTypes[col] === 'boolean'">
                <input
                  type="checkbox"
                  v-model="localEditBuffer[col]"
                  class="edit-input"
                />
              </template>
              <template v-else-if="fieldTypes[col] === 'array'">
                <select
                  v-model="localEditBuffer[col]"
                  multiple
                  class="edit-input"
                >
                  <!-- Здесь нужно добавить options в зависимости от типа поля -->
                </select>
              </template>
              <template v-else>
                <input
                  v-model="localEditBuffer[col]"
                  :type="fieldTypes[col] === 'integer' || fieldTypes[col] === 'decimal' ? 'number' : 'text'"
                  :step="fieldTypes[col] === 'decimal' ? '0.01' : '1'"
                  class="edit-input"
                  :placeholder="col"
                />
              </template>
            </template>
            <template v-else>
              {{ selectedRow[col] }}
            </template>
          </div>
        </div>
        <div v-if="isEditing && !isRelationTable && !isEditDisabled" class="modal-actions-row">
          <button class="save-button" @click="$emit('save', localEditBuffer)">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Сохранить
          </button>
          <button class="cancel-button" @click="$emit('cancelEdit')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue';
const emit = defineEmits(['edit', 'save', 'cancelEdit', 'close']);
const props = defineProps({
  show: Boolean,
  isEditing: Boolean,
  isRelationTable: Boolean,
  isEditDisabled: Boolean,
  columns: Array,
  editableFields: Array,
  fieldTypes: Object,
  editBuffer: Object,
  selectedRow: Object
});
const localEditBuffer = ref({ ...props.editBuffer });
watch(() => props.editBuffer, (val) => { localEditBuffer.value = { ...val }; });
watch(localEditBuffer, (val) => { emit('update:editBuffer', val); });
const onClose = () => emit('close');
</script>
<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--modal-overlay-bg, rgba(0, 0, 0, 0.35));
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content.details-modal {
  background: var(--color-secondary-background, #fff);
  color: var(--color-primary-text, #222);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  min-width: 340px;
  max-width: 700px;
  width: 90%;
  padding: 32px 24px 24px 24px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}
.modal-header {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--color-border, #eee);
  position: relative;
}
.header-title-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}
.modal-header h3 {
  margin: 0;
  font-size: 22px;
  color: var(--color-accent, #5078ff);
  font-weight: 700;
  flex: 1;
}
.close-button {
  position: absolute;
  top: 0;
  right: 0;
  margin: 10px 10px 0 0;
  width: 36px;
  height: 36px;
  padding: 6px;
  border: none;
  background: transparent;
  color: var(--color-secondary-text, #888);
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.25s;
}
.close-button:hover {
  background: var(--color-danger-bg, #ffeaea);
  color: var(--color-danger, #d32f2f);
  box-shadow: 0 2px 8px rgba(211,47,47,0.08);
  transform: rotate(90deg);
}
.details-content {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 16px;
  margin-right: -16px;
}
.detail-row {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border, #eee);
}
.detail-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
.detail-label {
  flex: 0 0 220px;
  font-weight: 600;
  color: var(--color-secondary-text, #888);
  padding-right: 24px;
  font-size: 15px;
}
.detail-value {
  flex: 1;
  color: var(--color-primary-text, #222);
  word-break: break-word;
  font-size: 15px;
  line-height: 1.5;
}
.edit-input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid var(--color-accent, #5078ff);
  border-radius: 6px;
  font-size: 15px;
  background: var(--color-primary-background, #fff);
  color: var(--color-primary-text, #222);
  transition: all 0.2s ease;
  box-sizing: border-box;
  outline: none;
  min-height: 40px;
  height: auto;
}
.edit-input:focus {
  border-color: var(--color-accent, #5078ff);
  box-shadow: 0 0 0 3px rgba(80,120,255,0.1);
}
.edit-input:hover {
  border-color: var(--color-accent-hover, #3456b6);
}
.edit-disabled-message-compact {
  margin-top: 6px;
}
.modal-actions-row {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}
.save-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  background: var(--color-accent, #5078ff);
  color: #fff;
  border: none;
  transition: background 0.18s, box-shadow 0.18s, color 0.18s;
  box-shadow: 0 2px 8px rgba(80,120,255,0.08);
  cursor: pointer;
}
.save-button:hover {
  background: var(--color-accent-hover, #3456b6);
  color: #fff;
}
.cancel-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  background: var(--color-danger, #d32f2f);
  color: #fff;
  border: none;
  transition: background 0.18s, box-shadow 0.18s, color 0.18s;
  box-shadow: 0 2px 8px rgba(211,47,47,0.08);
  cursor: pointer;
}
.cancel-button:hover {
  background: var(--color-danger-hover, #b71c1c);
  color: #fff;
}
</style>
