<template>
  <div class="placeholder-card">
    <div class="placeholder-card__header d-flex align-items-center justify-content-between">
      <h6 class="mb-0">Ход работ</h6>
    </div>
    <div class="placeholder-card__body">
      <div v-if="isLoading" class="text-muted">Загрузка журнала…</div>
      <template v-else>
        <div v-if="!auditLogs.length" class="text-muted">Нет записей аудита.</div>
        <ul v-else class="list-unstyled mb-0">
          <AuditUnit
            v-for="item in auditLogs"
            :key="item.id"
            :timestamp="item.timestamp"
            :action-display="item.action_display"
            :model-type-display="item.model_type_display"
            :user-name="item.user_name"
            :user-id="
              item.user_id ||
              (typeof item.user === 'number' ? item.user : null) ||
              item.user?.id ||
              item.user_id_id ||
              null
            "
            :avatar-url="
              item.user_avatar_url ||
              item.user_avatar ||
              item.avatar_url ||
              item.user?.avatar_url ||
              null
            "
            :field-name="item.field_name"
            :old-value="item.old_value"
            :new-value="item.new_value"
            :description="item.description"
          />
        </ul>
      </template>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'
import AuditUnit from './AuditUnit.vue'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

const toast = useToast()
const isLoading = ref(false)
const auditLogs = ref([])

async function loadAudit() {
  const id = props.projectData?.id
  if (!id) {
    auditLogs.value = []
    return
  }
  isLoading.value = true
  try {
    const endpoint = endpoints.project_ed.projects.auditLogs(id)
    const resp = await apiClient.get(endpoint)
    // Поддержка как пагинированного ответа, так и обычного списка
    const data = Array.isArray(resp?.data) ? resp.data : (resp?.data?.results || [])
    auditLogs.value = data
    if (process.env.NODE_ENV !== 'production' && Array.isArray(data) && data.length > 0) {
      // Быстрая проверка структуры для маппинга аватаров
      // eslint-disable-next-line no-console
      console.debug('Audit sample item:', data[0])
    }
  } catch (e) {
    toast.error('Не удалось загрузить журнал аудита проекта')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadAudit)
watch(() => props.projectData?.id, () => loadAudit())

// Перезагрузка по глобальному событию, инициируемому после сохранения
function handleAuditReload(event) {
  const incomingId = event?.detail?.projectId
  const currentId = props.projectData?.id
  if (!incomingId || !currentId || incomingId === currentId) {
    loadAudit()
  }
}

onMounted(() => {
  window.addEventListener('project-audit:reload', handleAuditReload)
})

onBeforeUnmount(() => {
  window.removeEventListener('project-audit:reload', handleAuditReload)
})
</script>

<style scoped lang="scss">
.placeholder-card {
  background: var(--color-primary-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.placeholder-card__header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-secondary-background);
}

.placeholder-card__body {
  padding: 0.75rem 1rem;
}
</style>


