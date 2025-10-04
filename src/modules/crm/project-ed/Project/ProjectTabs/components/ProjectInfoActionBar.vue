<template>
    <div v-if="isProjectManager" class="action-bar">
        <button 
            @click="submitForReview" 
            :disabled="isSubmitting || !canSubmit"
            class="btn btn-primary btn-sm w-100"
        >
            <Send v-if="!isSubmitting" class="me-2" size="16" />
            <div v-else class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Загрузка...</span>
            </div>
            {{ isSubmitting ? 'Отправка...' : 'Отправить на рассмотрение' }}
        </button>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Send } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import { useUserStore } from '@/modules/cms/js/userStore.js'
import { apiClient } from '@/js/api/manager.js'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['project-submitted'])

const toast = useToast()
const userStore = useUserStore()

const isSubmitting = ref(false)

// Проверяем, является ли текущий пользователь руководителем проекта
const isProjectManager = computed(() => {
  if (!props.projectData || !userStore.user) return false
  
  const currentUserId = userStore.user.id
  const managerId = props.projectData.manager_id || props.projectData.manager?.id || props.projectData.manager_data?.id
  
  return String(currentUserId) === String(managerId)
})

// Проверяем, можно ли отправить проект на рассмотрение
const canSubmit = computed(() => {
  if (!props.projectData) return false
  
  const status = props.projectData.status
  // Можно отправить только если проект в статусе "Черновик"
  return status === 'draft'
})

const submitForReview = async () => {
  if (!canSubmit.value || isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    
    // Отправляем запрос на изменение статуса проекта
    const response = await apiClient.patch(
      `/project_ed/projects/projects/${props.projectData.id}/`,
      { status: 'pending' }
    )
    
    if (response.data) {
      toast.success('Проект успешно отправлен на рассмотрение')
      emit('project-submitted', response.data)
    }
    
  } catch (error) {
    console.error('Ошибка отправки проекта на рассмотрение:', error)
    toast.error('Ошибка отправки проекта на рассмотрение')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.action-bar {
  margin-bottom: 1rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>