<template>
  <div class="card mb-4">
    <div
      class="card-header bg-primary text-white d-flex justify-content-between align-items-center"
    >
      <h4 class="mb-0">Личный кабинет студента</h4>
      <button class="btn btn-light btn-sm" @click="toggleEdit">
        {{ editMode ? 'Отменить' : 'Редактировать' }}
      </button>
    </div>

    <div class="card-body">
      <!-- Ошибка API -->
      <div v-if="apiError" class="alert alert-danger">{{ apiError }}</div>

      <!-- Табы -->
      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item" v-for="tab in tabs" :key="tab.name">
          <button
            class="nav-link"
            :class="{ active: activeTab === tab.name }"
            @click="activeTab = tab.name"
            type="button"
            role="tab"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>

      <div class="tab-content">
        <!-- Основное -->
        <div
          class="tab-pane fade"
          :class="{ 'show active': activeTab === 'main' }"
          role="tabpanel"
        >
          <dl class="row">
            <dt class="col-sm-3">Имя</dt>
            <dd class="col-sm-9">
              <span v-if="!editMode">{{ studentData.first_name }}</span>
              <input
                v-else
                v-model="form.first_name"
                class="form-control form-control-sm"
              />
            </dd>

            <dt class="col-sm-3">Фамилия</dt>
            <dd class="col-sm-9">
              <span v-if="!editMode">{{ studentData.last_name }}</span>
              <input
                v-else
                v-model="form.last_name"
                class="form-control form-control-sm"
              />
            </dd>

            <dt class="col-sm-3">Группа</dt>
            <dd class="col-sm-9">
              <!-- Для простоты здесь оставляем только текстовое имя группы -->
              <span v-if="!editMode">{{ studentData.group_name || 'Не указана' }}</span>
              <input
                v-else
                v-model="form.group_name"
                class="form-control form-control-sm"
                placeholder="Укажите группу"
              />
            </dd>
          </dl>
        </div>

        <!-- Опыт -->
        <div
          class="tab-pane fade"
          :class="{ 'show active': activeTab === 'experience' }"
          role="tabpanel"
        >
          <div v-if="!editMode">
            <strong>Опыт в IT:</strong>
            {{ studentData.has_experience ? 'Есть' : 'Нет' }}
          </div>
          <div v-else class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              id="hasExperience"
              v-model="form.has_experience"
            />
            <label class="form-check-label" for="hasExperience">
              Есть опыт в IT
            </label>
          </div>
        </div>

        <!-- Контакты -->
        <div
          class="tab-pane fade"
          :class="{ 'show active': activeTab === 'contacts' }"
          role="tabpanel"
        >
          <dl class="row">
            <dt class="col-sm-3">Email</dt>
            <dd class="col-sm-9">
              <span v-if="!editMode">{{ studentData.email || 'Не указано' }}</span>
              <input
                v-else
                v-model="form.email"
                type="email"
                class="form-control form-control-sm"
                placeholder="Введите email"
              />
            </dd>
            <dt class="col-sm-3">Телефон</dt>
            <dd class="col-sm-9">
              <span v-if="!editMode">{{ studentData.phone || 'Не указано' }}</span>
              <input
                v-else
                v-model="form.phone"
                class="form-control form-control-sm"
                placeholder="Введите телефон"
              />
            </dd>
          </dl>
        </div>
      </div>

      <!--Спискок тестов умений-->
      <div
          class="tab-pane fade"
          :class="{ 'show active': activeTab === 'skilltests' }"
          role="tabpanel"
        >
        <div class="container mt-5">
    <div class="row">
      <div class="col-md-3 mb-4" v-for="(item, index) in items" :key="index">
        <TestCard
          :testname="item.test"
          :confirmed="item.status"
          :correctPercentage="item.result"
          :description="item.description"
          :isredact="editMode"
          :resultid="item.id"

          @DeleteTest = "AddDeleteSkillList"
        />
      </div>
      <div class="col-md-3 mb-4" v-if = "editMode">
        <div class="card shadow-sm h-100">
          <div class="card-body d-flex justify-content-center align-items-center" data-bs-toggle="modal"
          data-bs-target="#EditSkills">
              <Plus class="text-primary" style="width: 40%; height: 40%;" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <ModalCenter title="Добавление новых умений" modalId="EditSkills" >
              <AddSkillModal @AddSkillTest="setskilladdlist" />
            </ModalCenter>
      </div>



      <!-- Кнопки сохранения -->
      <div v-if="editMode" class="mt-3 text-end">
        <button
          class="btn btn-success me-2"
          @click="saveProfile"
          :disabled="saving"
        >
          {{ saving ? 'Сохраняем...' : 'Сохранить' }}
        </button>
        <button class="btn btn-secondary" @click="cancelEdit" :disabled="saving">
          Отменить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import ModalCenter from '@/components/ModalCenter.vue'
import AddSkillModal from './StudentProfileComponents/AddSkillModal.vue'
import TestCard from './StudentProfileComponents/TestCard.vue'
import { Plus } from 'lucide-vue-next'
import { onMounted } from 'vue'
const items = ref([])
let addskilllist
let deleteskillliest
onMounted(async ()=>{
  let f = await apiClient.get(endpoints.expert_system.getUserSkillTest)
  items.value = f.data 
  console.log(items.value)
  addskilllist =[]
  deleteskillliest =[]
})

// Принимаем пропс student (должен содержать id, first_name, last_name, group_name, has_experience и остальные поля)
const props = defineProps({
  student: { type: Object, required: true }
})

// Локальная копия для отображения и редактирования
const studentData = reactive({ ...props.student })
const form = reactive({ ...props.student })

// Состояния UI
const editMode = ref(false)
const activeTab = ref('main')
const saving = ref(false)
const apiError = ref(null)

// Настройка табов
const tabs = [
  { name: 'main', label: 'Основное' },
  { name: 'experience', label: 'Опыт' },
  { name: 'contacts', label: 'Контакты' },
  {name: 'skilltests', label: 'Навыки'}
]

function toggleEdit() {
  editMode.value = !editMode.value
  if (editMode.value) {
    // при входе в режим редактирования сбрасываем форму к текущим данным
    Object.assign(form, studentData)
    apiError.value = null
  }
}
function setskilladdlist(skills){
  addskilllist.value.append(skills)
}
function AddDeleteSkillList(id){
  deleteskillliest.push(id)
}
async function saveProfile() {
  apiError.value = null
  saving.value = true

  try {
    // Собираем тело запроса — убираем те поля, которых нет на бэке
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      has_experience: form.has_experience,
      email: form.email,
      phone: form.phone,
      ...(form.study_group ? { study_group: form.study_group } : {})
      // можно добавить email/phone, если их поддерживает ваш сериализатор
    }

    const url = `${endpoints.expert_system.students}${studentData.id}/`
    const resp = await apiClient.patch(url, payload)

    if (!resp.success) {
      throw new Error(
        typeof resp.errors === 'string'
          ? resp.errors
          : JSON.stringify(resp.errors)
      )
    }

    // Обновляем локальные данные ответом сервера
    Object.assign(studentData, resp.data)
    // Переключаемся обратно в режим просмотра
    editMode.value = false

  } catch (err) {
    apiError.value = err.message || 'Ошибка при сохранении профиля'
  } finally {
    saving.value = false
  }
}

function cancelEdit() {
  // Отменяем изменения
  Object.assign(form, studentData)
  apiError.value = null
  editMode.value = false
}
</script>

<style scoped>
.nav-tabs .nav-link {
  cursor: pointer;
}
.card-header h4 {
  font-size: 1.25rem;
}
</style>
