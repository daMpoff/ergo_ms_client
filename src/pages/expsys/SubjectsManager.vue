<!-- SubjectManager.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { fetchTeacherSubjects, createSubject } from '@/js/api/services/expsysService';
import CompetenciesManager from '@/pages/expsys/IndicatorsManager.vue';
import DropDown from '@/components/DropDown.vue';
import { EllipsisVertical, MessagesSquare, Trash, SquarePlus, UsersRound, LibraryBig, NotebookPen, CircleDot } from 'lucide-vue-next';

// Reactive state
const subjects = ref([]);
const loading = ref(false);
const error = ref(null);
const showAddModal = ref(false);
const showDeleteModal = ref(false);
const editingSubject = ref(getEmptySubject());
const subjectToDelete = ref(null);
const saving = ref(false);
const deleting = ref(false);
const showCompetencies = ref(false);
const selectedSubjectId = ref(null);
const selectedSubjectName = ref(null);

// Methods
const loadSubjects = async () => {
  loading.value = true;
  error.value = null;
  try {
    const fetchedSubjects = await fetchTeacherSubjects();
    if (Array.isArray(fetchedSubjects)) {
      subjects.value = fetchedSubjects;
    } else {
      throw new Error('Получены некорректные данные');
    }
  } catch (err) {
    console.error('Ошибка при загрузке предметов:', err);
    error.value = err.message || 'Не удалось загрузить предметы';
  } finally {
    loading.value = false;
  }
};

function getEmptySubject() {
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
}

const addSubject = () => {
  editingSubject.value = getEmptySubject();
  showAddModal.value = true;
};

const editSubject = (subject) => {
  editingSubject.value = { ...subject };
  showAddModal.value = true;
};

const saveSubject = async () => {
  if (!editingSubject.value.name?.trim()) {
    error.value = 'Введите название предмета';
    return;
  }
  saving.value = true;
  error.value = null;
  try {
    const createdSubject = await createSubject({
      name: editingSubject.value.name.trim(),
      description: editingSubject.value.description?.trim() || ''
    });
    subjects.value.unshift(createdSubject);
    closeModal();
  } catch (err) {
    console.error('Ошибка сохранения предмета:', {
      error: err.message,
      component: editingSubject.value
    });
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (subject) => {
  subjectToDelete.value = subject;
  showDeleteModal.value = true;
};

const deleteSubject = async () => {
  deleting.value = true;
  try {
    subjects.value = subjects.value.filter(s => s.id !== subjectToDelete.value.id);
    showDeleteModal.value = false;
  } catch (err) {
    console.error('Ошибка при удалении предмета:', err);
    error.value = err.message || 'Не удалось удалить предмет';
  } finally {
    deleting.value = false;
  }
};

const closeModal = () => {
  showAddModal.value = false;
  editingSubject.value = getEmptySubject();
};

const openCompetencies = (subject) => {
  selectedSubjectId.value = subject.id;
  selectedSubjectName.value = subject.name;
  showCompetencies.value = true;
  isIndicator.value = true; // Указываем, что это переход из SubjectManager
};

// Добавляем новый ref для isIndicator
const isIndicator = ref(false);

const backToSubjects = () => {
  showCompetencies.value = false;
  selectedSubjectId.value = null;
  selectedSubjectName.value = null;
};

// Lifecycle hook
onMounted(() => {
  loadSubjects();
});
</script>

<template>
  <div class="subject-management">
<CompetenciesManager 
  v-if="showCompetencies"
  :subject-id="selectedSubjectId"
  :subject-name="selectedSubjectName"
  :is-indicator="isIndicator"
  @back="backToSubjects"
/>
    
    <div v-if="!showCompetencies">
      <div class="row mb-4">
        <div class="col">
      <h2>Управление предметами</h2>
        <button class="btn fw-bold text-center d-flex align-items-center gap-2" @click="addSubject">
          <SquarePlus class="icon" />
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
            <div class="card-body position-relative"> <!-- Добавлен position-relative -->
              <!-- Выпадающее меню в правом верхнем углу -->
              <div class="position-absolute top-0 end-0 mt-2 me-2">
                <DropDown dropdownMenuClass="dropdown-menu-end">
                  <template #main>
                    <EllipsisVertical :size="20" />
                  </template>
                  <template #list>
                    <li class="dropdown-item" @click="editSubject(subject)">
                      <Trash :size="20" class="me-2" /> Редактировать
                    </li>
                    <li class="dropdown-item text-danger" @click="confirmDelete(subject)">
                      <MessagesSquare :size="20" class="me-2" /> Удалить
                    </li>
                  </template>
                </DropDown>
              </div>

                <div class="card-body-1 p-4">
  <!-- Заголовок с иконкой -->
   <div class="d-flex align-items-center mb-3">
    <div class="border-start border-3 border-primary me-3" style="height: 40px;"></div>
    <h5 class="card-title mb-0 fw-bold text-dark">{{ subject.name }}</h5>
  </div>
  
  <!-- Описание -->
  <p class="card-text text-muted mb-4">{{ subject.caption }}</p>
  
  <!-- Статистика -->
  <div class="subject-stats d-flex justify-content-between mb-4 px-2">
    <div class="stat-item text-center">
      <div class="stat-icon bg-light rounded-circle p-2 mb-1 mx-auto">
        <UsersRound class="icon" />
      </div>
      <span class="small text-muted"> {{ subject.stats.students }} <br>студентов</span>
    </div>
    <div class="stat-item text-center">
      <div class="stat-icon bg-light rounded-circle p-2 mb-1 mx-auto">
           <LibraryBig class="icon" />
      </div>
      <span class="small text-muted">{{ subject.stats.lessons }}<br>уроков</span>
    </div>
    <div class="stat-item text-center">
      <div class="stat-icon bg-light rounded-circle p-2 mb-1 mx-auto">
         <NotebookPen class="icon" />
      </div>
      <span class="small text-muted">{{ subject.stats.tasks }}<br>заданий</span>
    </div>
  </div>
  
  <!-- Кнопка -->
  <div class="text-center mt-2">
    <button class="btn btn-primary px-4 rounded-pill fw-medium" @click="openCompetencies(subject)">
      <i class="bi bi-bar-chart me-2"></i>Индикаторы
    </button>
  </div>
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
  </div>

</template>

<style>
.btn fw-bold text-center d-flex align-items-center gap-2{
   &:not(.btn-primary):hover {
    background-color: var(--bs-primary-bg-subtle);
    color: var(--bs-primary);
  }
}

.icon-container {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.subject-stats {
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 0;
}

.card-body {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

</style>
