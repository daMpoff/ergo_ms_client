<script setup>
import { ref, watch } from 'vue'
import { 
  fetchCompetencies,
  createCompetence
} from '@/js/api/services/expsysService'
import IndicatorDetailsModal from './IndicatorDetailsModal.vue'
import IndicatorsManager from './IndicatorsManager.vue'
import DropDown from '@/components/DropDown.vue'
import { EllipsisVertical, Edit, Trash, Info, SquarePlus, ArrowLeftToLine } from 'lucide-vue-next'
import { onMounted } from 'vue'
import CompetenceStats from '@/pages/expsys/CompetenceStats.vue'

const props = defineProps({
  subjectId: {
    type: Number,
    required: false
  },
  subjectName: {
    type: String,
    default: 'Не указано'
  },
})

const emit = defineEmits(['back'])

// Состояния для управления отображением
const showIndicatorsManager = ref(false)
const selectedCompetenceForIndicators = ref(null)
const showCompetenceList = ref(true)

// Реактивные состояния
const competencies = ref([])
const loading = ref(false)
const error = ref(null)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const competenceToDelete = ref(null)
const selectedCompetence = ref(null)
const saving = ref(false)
const deleting = ref(false)
const subjectsCounts = ref({})
const isCompetence = ref(false)

// Открытие менеджера индикаторов для конкретной компетенции
function openIndicatorsManager(competence) {
  selectedCompetenceForIndicators.value = competence;
  showIndicatorsManager.value = true;
  showCompetenceList.value = false;
  isCompetence.value = true; // Указываем, что это переход из CompetenceManager
}

// Закрытие менеджера индикаторов
function closeIndicatorsManager() {
  showIndicatorsManager.value = false
  showCompetenceList.value = true
  selectedCompetenceForIndicators.value = null
}


async function saveCompetence() {
  saving.value = true
  error.value = null

  try {
    const createdCompetence = await createCompetence({
      name: editingCompetence.value.name,
      description: editingCompetence.value.description,
    })

    competencies.value.unshift(createdCompetence)
    showAddModal.value = false
  } catch (err) {
    error.value = err.message || 'Не удалось сохранить компетенцию'
    console.error('Ошибка сохранения компетенции:', err)
  } finally {
    saving.value = false
  }
}

const editingCompetence = ref({
  id: null,
  name: '',
  description: '',
})

function getEmptyCompetence() {
  return {
    id: null,
    name: '',
    description: '',
  }
}

async function loadCompetencies() {
  loading.value = true
  error.value = null

  try {
      competencies.value = await fetchCompetencies()
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить компетенции'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCompetencies()
})


function addCompetence() {
  editingCompetence.value = getEmptyCompetence()
  showAddModal.value = true
}

function editCompetence(competence) {
  editingCompetence.value = { ...competence }
  showAddModal.value = true
}

function openDetails(competence) {
  selectedCompetence.value = competence
}

function closeDetails() {
  selectedCompetence.value = null
}

const showStatsModal = ref(false)

async function openStats() {
  try {
    showStatsModal.value = true
  } catch (err) {
    error.value = 'Не удалось загрузить статистику'
    console.error('Ошибка загрузки статистики:', err)
  } finally {
    loading.value = false
  }
}

function confirmDelete(competence) {
  competenceToDelete.value = competence
  showDeleteModal.value = true
}

async function deleteCompetence() {
  if (!competenceToDelete.value) return

  deleting.value = true
  try {
    competencies.value = competencies.value.filter(
      c => c.id !== competenceToDelete.value.id
    )
    showDeleteModal.value = false
  } catch (err) {
    error.value = 'Ошибка при удалении компетенции'
  } finally {
    deleting.value = false
  }
}

function closeModal() {
  showAddModal.value = false
}

function closeStatsModal() {
  showStatsModal.value = false
}

watch(() => props.subjectId, (newVal) => {
  if (newVal) {
    loadCompetencies()
  }
}, { immediate: true })
</script>

<template>
  <div class="competence-management">
    <!-- Компонент индикаторов (заменяет список компетенций) -->
    <IndicatorsManager 
      v-if="showIndicatorsManager && selectedCompetenceForIndicators"
      :competence="selectedCompetenceForIndicators"
      :competence-id="selectedCompetenceForIndicators.id"
      @close="closeIndicatorsManager"
    />
    <!-- Список компетенций (отображается только когда showCompetenceList = true) -->
    <div v-if="showCompetenceList">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Компитенции</h2>
      </div>
      <div class="d-flex gap-2">
        <button class="btn fw-bold d-flex align-items-center gap-2" @click="addCompetence">
          <SquarePlus class="icon" />
          Добавить компитенцию
        </button>
        <button class="btn fw-bold d-flex align-items-center gap-2" @click="$emit('back')">
          <ArrowLeftToLine class="icon" />
          Назад
        </button>
      </div>

      <div v-if="loading" class="text-center">
        <div class="spinner-border"></div>
      </div>
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      <div v-else class="row">
        <div 
          v-for="competence in competencies" 
          :key="competence.id" 
          class="col-md-4 mb-3"
        >
          <div class="card h-100 position-relative">
            <div class="position-absolute top-0 end-0 mt-2 me-2">
              <DropDown dropdownMenuClass="dropdown-menu-end">
                <template #main>
                  <button class="btn btn-sm btn-link text-secondary">
                    <EllipsisVertical :size="20" />
                  </button>
                </template>
                <template #list>
                  <li class="dropdown-item" @click="editCompetence(competence)">
                    <Edit :size="16" class="me-2" />
                    Редактировать
                  </li>
                  <li class="dropdown-item" @click="openDetails(competence)">
                    <Info :size="16" class="me-2" />
                    Подробнее
                  </li>
                  <li class="dropdown-divider"></li>
                  <li 
                    class="dropdown-item text-danger" 
                    @click="confirmDelete(competence)"
                  >
                    <Trash :size="16" class="me-2" />
                    Удалить
                  </li>
                </template>
              </DropDown>
            </div>
            <div class="card-body">
              <h5 class="card-title">{{ competence.name }}</h5>
              <p class="card-text text-muted">{{ competence.description }}</p>
              <div class="mt-3">
                <span class="badge bg-light text-dark">
                  Коэффициент освоенности: {{ 100 / subjectsCounts[competence.id] || 0 }} %
                </span>
              </div>
              <div class="text-center mt-3">
                <button class="btn btn-primary me-2" @click="openStats(competence)">
                  Статистика освоения
                </button>
                <button class="btn btn-primary" @click="openIndicatorsManager(competence)">
                  Индикаторы
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно статистики -->
    <div v-if="showStatsModal" class="stats-modal">
      <div class="stats-modal-backdrop" @click="closeStatsModal"></div>
      <div class="stats-modal-content">
        <div class="stats-modal-header">
          <h3></h3>
          <button class="btn-close" @click="closeStatsModal" aria-label="Закрыть"></button>
        </div>
        <div v-if="statsLoading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
        </div>
        <CompetenceStats 
          v-else
          :selected-competence="currentCompetence"
          :students-data="currentStats"
        />
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <div 
      class="modal fade" 
      :class="{ show: showAddModal }" 
      tabindex="-1" 
      style="display: block;" 
      v-if="showAddModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingCompetence.id ? 'Редактировать' : 'Добавить' }} компетенцию
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCompetence">
              <div class="mb-3">
                <label class="form-label">Название</label>
                <input 
                  type="text" 
                  v-model="editingCompetence.name" 
                  class="form-control" 
                  required 
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Описание</label>
                <textarea 
                  v-model="editingCompetence.description" 
                  rows="3" 
                  class="form-control" 
                  required
                ></textarea>
              </div>
              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              <div class="d-flex justify-content-end">
                <button class="btn btn-secondary me-2" @click="closeModal">
                  Отмена
                </button>
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
    <div 
      class="modal fade" 
      :class="{ show: showDeleteModal }" 
      tabindex="-1" 
      style="display: block;" 
      v-if="showDeleteModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Подтверждение удаления</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showDeleteModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <p>Вы уверены, что хотите удалить компетенцию "{{ competenceToDelete?.name }}"?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showDeleteModal = false">
              Отмена
            </button>
            <button 
              class="btn btn-danger" 
              @click="deleteCompetence" 
              :disabled="deleting"
            >
              <span v-if="deleting" class="spinner-border spinner-border-sm"></span>
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeleteModal"></div>

    <!-- Модальное окно подробностей -->
    <IndicatorDetailsModal
      v-if="selectedCompetence"
      :competence="selectedCompetence"
      :subject-name="subjectName"
      @close="closeDetails"
      @update="saveCompetence"
    />
  </div>
</template>

<style scoped>
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-2px);
}
.dropdown-toggle::after {
  display: none;
}
.stats-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.stats-modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  z-index: 2;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.stats-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.stats-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.btn-close {
  font-size: 1.5rem;
  padding: 0.5rem;
}
</style>