<script setup>
import { reactive, watch } from 'vue'
import { useKanbanStore } from '@/stores/kanbanStore.js'

const kanbanStore = useKanbanStore()
const taskInfo = kanbanStore.getTaskById(kanbanStore.editableTask)

// Слежка за изменениями
watch(
  () => kanbanStore.editableTask,
  (newValue) => {
    const taskInfo = kanbanStore.getTaskById(newValue)
    formData.id = taskInfo.id
    formData.title = taskInfo.title
    formData.tag = taskInfo.tag
    formData.image = taskInfo.image
  },
)

// Изменение картинки
const onFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Данные формы
const formData = reactive({
  id: taskInfo?.id,
  title: taskInfo?.title,
  tag: taskInfo?.tag,
  image: taskInfo?.image,
})

// Ошибки валидации
const errors = reactive({ title: null, tag: null })

const validate = () => {
  let isValid = true

  // Проверка имени
  if (!formData.title) {
    errors.title = 'Название обязательно.'
    isValid = false
  } else {
    errors.title = null
  }

  // Проверка категории
  if (!formData.tag) {
    errors.category = 'Выберите категорию.'
    isValid = false
  } else {
    errors.category = null
  }

  return isValid
}

// Отправка формы
const handleSubmit = () => {
  if (!validate()) return

  kanbanStore.updateTask({
    id: formData.id,
    title: formData.title,
    tag: formData.tag,
    image: formData.image,
  })

  kanbanStore.cleanSelectedTask()
}
</script>

<template>
  <div class="offcanvas offcanvas-end" tabindex="-1" id="kanbanCanvas">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">Редактирование задачи</h5>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="offcanvas"
        aria-label="Закрыть"
      ></button>
    </div>
    <div class="offcanvas-body">
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="mb-3">
          <label for="name" class="form-label">Название</label>
          <input
            v-model="formData.title"
            type="text"
            id="name"
            placeholder="Название события"
            class="form-control"
            :class="{ 'is-invalid': errors.title }"
            required
          />
          <div v-if="errors.title" class="invalid-feedback">{{ errors.title }}</div>
        </div>

        <div class="mb-3">
          <label for="category" class="form-label">Категория</label>
          <select
            id="category"
            class="form-select"
            v-model="formData.tag"
            :class="{ 'is-invalid': errors.category }"
          >
            <option value="Без тега" disabled>Выберите категорию</option>
            <option value="UI/UX">UI/UX</option>
            <option value="API">API</option>
            <option value="Dev">Dev</option>
          </select>
          <div v-if="errors.category" class="invalid-feedback">
            {{ errors.category }}
          </div>
        </div>

        <div class="mb-3">
          <label for="formFile" class="form-label">Изображение</label>
          <input @change="onFileChange" class="form-control" type="file" id="formFile" />
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary" data-bs-dismiss="offcanvas">
            Сохранить
          </button>
          <button
            type="reset"
            class="btn btn-secondary"
            data-bs-dismiss="offcanvas"
            @click="kanbanStore.deleteTask(kanbanStore.editableTask)"
          >
            Удалить
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
