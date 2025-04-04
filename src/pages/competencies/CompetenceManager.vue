<template>
    <div class="competence-management">
      <div class="row mb-4">
        <div class="col">
          <h2>Управление компетенциями</h2>
          <button class="btn btn-primary" @click="showAddModal = true">
            Добавить компетенцию
          </button>
        </div>
      </div>
  
      <div class="row">
        <div class="col-md-4 mb-3" v-for="competence in competences" :key="competence.id">
          <div class="card competence-card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ competence.name }}</h5>
              <p class="card-text">{{ competence.description }}</p>
              <div class="mb-2">
                <span class="badge" :class="levelBadgeClass(competence.level)">
                  {{ competence.level }}
                </span>
              </div>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-primary" @click="editCompetence(competence)">
                  Редактировать
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(competence)">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Модальное окно добавления/редактирования -->
      <div class="modal fade" :class="{show: showAddModal}" tabindex="-1" style="display: block;" v-if="showAddModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editingCompetence.id ? 'Редактировать' : 'Добавить' }} компетенцию</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveCompetence">
                <div class="mb-3">
                  <label class="form-label">Название</label>
                  <input type="text" class="form-control" v-model="editingCompetence.name" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Описание</label>
                  <textarea class="form-control" v-model="editingCompetence.description" rows="3"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Уровень</label>
                  <select class="form-select" v-model="editingCompetence.level" required>
                    <option value="начальный">Начальный</option>
                    <option value="средний">Средний</option>
                    <option value="продвинутый">Продвинутый</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Критерии освоения</label>
                  <div v-for="(criterion, index) in editingCompetence.criteria" :key="index" class="mb-2">
                    <div class="input-group">
                      <input type="text" class="form-control" v-model="criterion.text" required>
                      <button class="btn btn-outline-danger" type="button" @click="removeCriterion(index)">
                        ×
                      </button>
                    </div>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="addCriterion">
                    Добавить критерий
                  </button>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-secondary me-2" @click="closeModal">Отмена</button>
                  <button type="submit" class="btn btn-primary">Сохранить</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" v-if="showAddModal"></div>
  
      <!-- Модальное окно подтверждения удаления -->
      <div class="modal fade" :class="{show: showDeleteModal}" tabindex="-1" style="display: block;" v-if="showDeleteModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Подтверждение удаления</h5>
              <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
            </div>
            <div class="modal-body">
              <p>Вы уверены, что хотите удалить компетенцию "{{ competenceToDelete.name }}"?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Отмена</button>
              <button type="button" class="btn btn-danger" @click="deleteCompetence">Удалить</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" v-if="showDeleteModal"></div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CompetenceManager',
    data() {
      return {
        competences: [
          {
            id: 1,
            name: 'Программирование на Python',
            description: 'Основы программирования на языке Python',
            level: 'начальный',
            criteria: [
              { text: 'Знание базового синтаксиса' },
              { text: 'Умение работать с циклами и условиями' }
            ]
          },
          {
            id: 2,
            name: 'Работа с базами данных',
            description: 'Проектирование и работа с реляционными БД',
            level: 'средний',
            criteria: [
              { text: 'Умение проектировать схемы БД' },
              { text: 'Написание SQL-запросов' }
            ]
          }
        ],
        showAddModal: false,
        showDeleteModal: false,
        editingCompetence: this.getEmptyCompetence(),
        competenceToDelete: null
      }
    },
    methods: {
      getEmptyCompetence() {
        return {
          id: null,
          name: '',
          description: '',
          level: 'начальный',
          criteria: []
        }
      },
      levelBadgeClass(level) {
        return {
          'bg-primary': level === 'начальный',
          'bg-warning text-dark': level === 'средний',
          'bg-success': level === 'продвинутый'
        }
      },
      addCompetence() {
        this.editingCompetence = this.getEmptyCompetence()
        this.showAddModal = true
      },
      editCompetence(competence) {
        this.editingCompetence = JSON.parse(JSON.stringify(competence))
        this.showAddModal = true
      },
      saveCompetence() {
        if (this.editingCompetence.id) {
          // Обновление существующей компетенции
          const index = this.competences.findIndex(c => c.id === this.editingCompetence.id)
          this.competences.splice(index, 1, this.editingCompetence)
        } else {
          // Добавление новой компетенции
          this.editingCompetence.id = this.competences.length > 0 
            ? Math.max(...this.competences.map(c => c.id)) + 1 
            : 1
          this.competences.push(this.editingCompetence)
        }
        this.closeModal()
      },
      confirmDelete(competence) {
        this.competenceToDelete = competence
        this.showDeleteModal = true
      },
      deleteCompetence() {
        this.competences = this.competences.filter(c => c.id !== this.competenceToDelete.id)
        this.showDeleteModal = false
      },
      closeModal() {
        this.showAddModal = false
        this.editingCompetence = this.getEmptyCompetence()
      },
      addCriterion() {
        this.editingCompetence.criteria.push({ text: '' })
      },
      removeCriterion(index) {
        this.editingCompetence.criteria.splice(index, 1)
      }
    }
  }
  </script>