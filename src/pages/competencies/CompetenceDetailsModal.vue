<template>
  <div v-if="currentCompetence" class="modal-overlay" @click.self="closeModal">
    <div class="competence-detail-window">
      <button @click="closeModal" class="close-button">×</button>
      <div class="window-container">
        <div class="competence-grid">
          <!-- Название предмета -->
          <div class="grid-row">
            <div class="grid-cell icon-cell"></div>
            <div class="grid-cell input-cell">
              <h3>Детали компетенции</h3>
            </div>
          </div>

          <!-- Предмет -->
          <div class="grid-row">
            <div class="grid-cell icon-cell">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon">
                <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              </svg>
            </div>
            <div class="grid-cell input-cell">
              <label class="input-label">Предмет</label>
              <div class="readonly-field">{{ subjectName }}</div>
            </div>
          </div>

          <!-- Название компетенции -->
          <div class="grid-row">
            <div class="grid-cell icon-cell">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon">
                <path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-2 10H7v-2h10v2z"/>
              </svg>
            </div>
            <div class="grid-cell input-cell">
              <label class="input-label">Название компетенции</label>
              <input type="text" v-model="currentCompetence.name" placeholder="Введите название" class="task-input">
            </div>
          </div>

          <!-- Описание -->
          <div class="grid-row">
            <div class="grid-cell icon-cell">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon">
                <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-4-5l4 4h-3v2h-2v-4H7l4-4v4z"/>
              </svg>
            </div>
            <div class="grid-cell input-cell">
              <label class="input-label">Описание</label>
              <textarea v-model="currentCompetence.description" rows="3" class="description-input" placeholder="Описание компетенции"></textarea>
            </div>
          </div>

          <!-- Знания -->
          <div class="grid-row">
            <div class="grid-cell icon-cell">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0-4h2v2h-2z"/>
              </svg>
            </div>
            <div class="grid-cell input-cell">
              <label class="input-label">Знания</label>
              <textarea v-model="currentCompetence.knowledge" rows="3" class="description-input" placeholder="Что должен знать студент"></textarea>
            </div>
          </div>

          <!-- Умения -->
          <div class="grid-row">
            <div class="grid-cell icon-cell">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0-4h2v2h-2z"/>
              </svg>
            </div>
            <div class="grid-cell input-cell">
              <label class="input-label">Умения</label>
              <textarea v-model="currentCompetence.ability" rows="3" class="description-input" placeholder="Что должен уметь студент"></textarea>
            </div>
          </div>

          <!-- Навыки -->
          <div class="grid-row">
            <div class="grid-cell icon-cell">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="icon">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0-4h2v2h-2z"/>
              </svg>
            </div>
            <div class="grid-cell input-cell">
              <label class="input-label">Навыки</label>
              <textarea v-model="currentCompetence.mastered" rows="3" class="description-input" placeholder="Какие навыки освоены"></textarea>
            </div>
          </div>

          <!-- Кнопка сохранения -->
          <div class="grid-row button-row">
            <div class="grid-cell icon-cell"></div>
            <div class="grid-cell button-cell">
              <button class="action-button save-button" @click="saveCompetence">Сохранить</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CompetenceDetailsModal',
  props: {
    competence: {
      type: Object,
      required: true
    },
    subjectName: {
      type: String,
      default: 'Не указано'
    }
  },
  data() {
    return {
      currentCompetence: { ...this.competence }
    };
  },
  watch: {
    competence(newVal) {
      this.currentCompetence = { ...newVal };
    }
  },
  methods: {
    saveCompetence() {
      this.$emit('update', this.currentCompetence);
      this.$emit('close');
    },
    closeModal() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.competence-detail-window {
  position: relative;
  width: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}

.window-container {
  padding: 20px;
}

.competence-grid {
  display: grid;
  grid-template-columns: 55px 1fr;
  grid-template-rows: auto auto auto auto auto auto 40px;
  min-height: 100%;
}

.grid-row {
  display: contents;
}

.grid-cell {
  padding: 6px;
}

.icon-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.input-cell {
  display: flex;
  align-items: center;
}

.input-label {
  font-weight: bold;
  margin-bottom: 4px;
  display: block;
  font-size: 14px;
  color: #555;
}

.task-input,
.description-input {
  width: 100%;
  padding: 6px;
  border: none;
  border-bottom: 1px solid #ccc;
  font-size: 16px;
  font-family: inherit;
}

.readonly-field {
  font-weight: 500;
  color: #333;
}

.button-row {
  display: contents;
}

.button-cell {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
}

.action-button {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: inherit;
}

.save-button {
  background-color: #2e7d32;
  color: white;
}

.save-button:hover {
  background-color: #1b5e20;
}
</style>