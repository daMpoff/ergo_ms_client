<script >
import {fetchSubjectCompetencies} from '@/js/api/services/expsysService';
import CompetenceDetailsModal from './CompetenceDetailsModal.vue';

export default {
  name: 'CompetenciesManager',
  components: {
    CompetenceDetailsModal
  },
    props: {
    subjectId: {
      type: Number,
      required: true
    },
    subjectName: {
      type: String,
      default: 'Не указано'
    }
  },
  data() {
    return {
      competencies: [],
      loading: false,
      error: null,
      showAddModal: false,
      showDeleteModal: false,
      editingCompetence: this.getEmptyCompetence(),
      competenceToDelete: null,
      selectedCompetence: null, // Для модального окна деталей
      saving: false,
      deleting: false
    };
  },
  watch: {
    subjectId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadCompetencies();
        }
      }
    }
  },
  methods: {
    getEmptyCompetence() {
      return {
        id: null,
        name: '',
        description: '',
        knowledge: '',
        ability: '',
        mastered: '',
        sat_coef: 1.0,
        subject_id: this.subjectId
      };
    },
    async loadCompetencies() {
      this.loading = true;
      this.error = null;
      try {
        const data = await fetchSubjectCompetencies(this.subjectId);
        this.competencies = Array.isArray(data) ? data : [];
      } catch (error) {
        this.error = error.message || 'Не удалось загрузить компетенции';
      } finally {
        this.loading = false;
      }
    },
    addCompetence() {
      this.editingCompetence = this.getEmptyCompetence();
      this.showAddModal = true;
    },
    editCompetence(competence) {
      this.editingCompetence = { ...competence };
      this.showAddModal = true;
    },
    openDetails(competence) {
      this.selectedCompetence = competence;
    },
    closeDetails() {
      this.selectedCompetence = null;
    },
    async saveCompetence(updatedCompetence) {
      const index = this.competencies.findIndex(c => c.id === updatedCompetence.id);
      if (index !== -1) {
        this.competencies.splice(index, 1, updatedCompetence);
      }
    }
  }
};
</script>

<template>
  <div class="competence-management">
    <div class="row mb-4">
      <div class="col">
        <h2>Компетенции предмета</h2>
        <button class="btn btn-primary me-2" @click="addCompetence">Добавить компетенцию</button>
        <button class="btn btn-secondary" @click="$emit('back')">Назад к предметам</button>
      </div>
    </div>

    <div v-if="loading" class="text-center"><div class="spinner-border"></div></div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else class="row">
      <div v-for="competence in competencies" :key="competence.id" class="col-md-4 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ competence.name }}</h5>
            <p class="card-text">{{ competence.description }}</p>
            <p>Коэффициент: {{ competence.sat_coef }}</p>
          </div>
          <div class="btn-group mt-3">
            <button class="btn btn-sm btn-outline-primary" @click="editCompetence(competence)">Редактировать</button>
            <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(competence)">Удалить</button>
            <button class="btn btn-sm btn-outline-info" @click="openDetails(competence)">Подробнее</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <div class="modal fade" :class="{ show: showAddModal }" tabindex="-1" style="display: block;" v-if="showAddModal">
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
                <input type="text" v-model="editingCompetence.name" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Описание</label>
                <textarea v-model="editingCompetence.description" rows="3" class="form-control" required></textarea>
              </div>
              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              <div class="d-flex justify-content-end">
                <button class="btn btn-secondary me-2" @click="closeModal">Отмена</button>
                <button class="btn btn-primary" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm"></span>
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAddModal"></div>

    <!-- Модальное окно удаления -->
    <div class="modal fade" :class="{ show: showDeleteModal }" tabindex="-1" style="display: block;" v-if="showDeleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Подтверждение удаления</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Вы уверены, что хотите удалить компетенцию "{{ competenceToDelete?.name }}"?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showDeleteModal = false">Отмена</button>
            <button class="btn btn-danger" @click="deleteCompetence" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm"></span>
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeleteModal"></div>

    <!-- Модальное окно подробностей -->
    <CompetenceDetailsModal
      v-if="selectedCompetence"
      :competence="selectedCompetence"
      :subject-name="subjectName" 
      @close="closeDetails"
      @update="saveCompetence"
    />
  </div>
</template>