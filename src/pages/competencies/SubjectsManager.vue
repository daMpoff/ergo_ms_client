<script>
import { fetchTeacherSubjects, createSubject } from '@/js/api/services/expsysService';

export default {
  name: 'SubjectManager',
  data() {
    return {
      subjects: [],
      loading: false,
      error: null,
      showAddModal: false,
      showDeleteModal: false,
      editingSubject: this.getEmptySubject(),
      subjectToDelete: null,
      saving: false,
      deleting: false
    };
  },
  created() {
    this.loadSubjects();
  },
  methods: {
    async loadSubjects() {
      this.loading = true;
      this.error = null;
      try {
        const subjects = await fetchTeacherSubjects();
        if (Array.isArray(subjects)) {
          this.subjects = subjects;
        } else {
          throw new Error('Получены некорректные данные');
        }
      } catch (error) {
        console.error('Ошибка при загрузке предметов:', error);
        this.error = error.message || 'Не удалось загрузить предметы';
      } finally {
        this.loading = false;
      }
    },
    getEmptySubject() {
      return {
        id: null,
        name: '',
        description: '',
        icon: 'book',
        iconBackground: 'bg-blue',
        stats: {
          students: 0,
          lessons: 0,
          tasks: 0
        }
      };
    },
    addSubject() {
      this.editingSubject = this.getEmptySubject();
      this.showAddModal = true;
    },
    editSubject(subject) {
      this.editingSubject = { ...subject };
      this.showAddModal = true;
    },
async saveSubject() {
    // Валидация
    if (!this.editingSubject.name?.trim()) {
        this.error = 'Введите название предмета';
        return;
    }
    
    this.saving = true;
    this.error = null;
    
    try {
        const response = await createSubject({
            name: this.editingSubject.name.trim(),
            description: this.editingSubject.description?.trim() || ''
        });
        
        // Добавляем новый предмет в список
        this.subjects.unshift(response);
        this.closeModal();
        
    } catch (error) {
        console.error('Ошибка сохранения предмета:', {
            error: error.message,
            component: this.editingSubject
        });
        
        this.error = error.message;
        
    } finally {
        this.saving = false;
    }
},
    confirmDelete(subject) {
      this.subjectToDelete = subject;
      this.showDeleteModal = true;
    },
    async deleteSubject() {
      this.deleting = true;
      try {
        // Имитация удаления
        this.subjects = this.subjects.filter(s => s.id !== this.subjectToDelete.id);
        this.showDeleteModal = false;
      } catch (error) {
        console.error('Ошибка при удалении предмета:', error);
        this.error = error.message || 'Не удалось удалить предмет';
      } finally {
        this.deleting = false;
      }
    },
    closeModal() {
      this.showAddModal = false;
      this.editingSubject = this.getEmptySubject();
    }
  }
};
</script>

<template>
  <div class="subject-management">
    <div class="row mb-4">
      <div class="col">
        <h2>Управление предметами</h2>
        <button class="btn btn-primary" @click="addSubject">
          Добавить предмет
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else class="row">
      <div class="col-md-4 mb-3" v-for="subject in subjects" :key="subject.id">
        <div class="card subject-card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <div class="icon-container" :class="subject.iconBackground">
                <i class="bi" :class="`bi-${subject.icon}`"></i>
              </div>
              <h5 class="card-title mb-0 ms-3">{{ subject.name }}</h5>
            </div>
            <p class="card-text">{{ subject.caption }}</p>
            <div class="subject-stats">
              <div class="stat-item">
                <i class="bi bi-people"></i>
                <span>{{ subject.stats.students }} студентов</span>
              </div>
              <div class="stat-item">
                <i class="bi bi-journal-text"></i>
                <span>{{ subject.stats.lessons }} уроков</span>
              </div>
              <div class="stat-item">
                <i class="bi bi-list-task"></i>
                <span>{{ subject.stats.tasks }} заданий</span>
              </div>
            </div>
            <div class="btn-group mt-3">
              <button class="btn btn-sm btn-outline-primary" @click="editSubject(subject)">
                Редактировать
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(subject)">
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
            <h5 class="modal-title">{{ editingSubject.id ? 'Редактировать' : 'Добавить' }} предмет</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSubject">
              <div class="mb-3">
                <label class="form-label">Название</label>
                <input type="text" class="form-control" v-model="editingSubject.name" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Описание</label>
                <textarea class="form-control" v-model="editingSubject.description" rows="3" required></textarea>
              </div>
              <div v-if="error" class="alert alert-danger mb-3">
                {{ error }}
              </div>
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeModal">Отмена</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm" role="status"></span>
                  Сохранить
                </button>
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
            <p>Вы уверены, что хотите удалить предмет "{{ subjectToDelete?.name }}"?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Отмена</button>
            <button type="button" class="btn btn-danger" @click="deleteSubject" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm" role="status"></span>
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeleteModal"></div>
  </div>
</template>

<style scoped>
.subject-management {
  padding: 20px;
}

.subject-card {
  transition: transform 0.2s;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.subject-card:hover {
  transform: translateY(-5px);
}

.icon-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.bg-blue {
  background-color: #0d6efd;
}

.subject-stats {
  display: flex;
  gap: 15px;
  margin-top: 15px;
  font-size: 0.9rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.modal-backdrop {
  opacity: 0.5;
}
</style>