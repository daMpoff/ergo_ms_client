<template>
    <div class="info-card">
        <div class="info-card__header">
            <h6 class="mb-0">Информация о проекте</h6>
        </div>
        <div class="info-card__body">
            <dl class="info-list">
                <div class="info-row">
                    <dt>Статус</dt>
                    <dd style="display: flex; align-items: center;">
                        <span v-if="statusLabel" class="badge" :class="`bg-${statusVariant}`">{{ statusLabel }}</span>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
                <div class="info-row">
                    <dt>Руководитель</dt>
                    <dd>
                        <div v-if="projectRoles.manager" class="role-person">
                            <img 
                                v-if="projectRoles.manager.avatar_url" 
                                :src="projectRoles.manager.avatar_url" 
                                :alt="projectRoles.manager.full_name"
                                class="role-person__avatar"
                            />
                            <DefaultAvatar 
                                v-else 
                                size="small" 
                                :title="projectRoles.manager.full_name"
                                class="role-person__avatar"
                            />
                            <span class="role-person__name">{{ projectRoles.manager.full_name }}</span>
                        </div>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
                <div class="info-row">
                    <dt>Заказчик</dt>
                    <dd>
                        <div v-if="projectRoles.client" class="role-person">
                            <img 
                                v-if="projectRoles.client.avatar_url" 
                                :src="projectRoles.client.avatar_url" 
                                :alt="projectRoles.client.full_name"
                                class="role-person__avatar"
                            />
                            <DefaultAvatar 
                                v-else 
                                size="small" 
                                :title="projectRoles.client.full_name"
                                class="role-person__avatar"
                            />
                            <span class="role-person__name">{{ projectRoles.client.full_name }}</span>
                        </div>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
                <div class="info-row">
                    <dt>Куратор</dt>
                    <dd>
                        <div v-if="projectRoles.curator" class="role-person">
                            <img 
                                v-if="projectRoles.curator.avatar_url" 
                                :src="projectRoles.curator.avatar_url" 
                                :alt="projectRoles.curator.full_name"
                                class="role-person__avatar"
                            />
                            <DefaultAvatar 
                                v-else 
                                size="small" 
                                :title="projectRoles.curator.full_name"
                                class="role-person__avatar"
                            />
                            <span class="role-person__name">{{ projectRoles.curator.full_name }}</span>
                        </div>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
                
                <div class="info-row">
                    <dt>Старт проекта</dt>
                    <dd>
                        <span v-if="startDate">{{ formatDate(startDate) }}</span>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
                <div class="info-row">
                    <dt>Конец проекта</dt>
                    <dd>
                        <span v-if="endDate">{{ formatDate(endDate) }}</span>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
            </dl>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue'
import DefaultAvatar from '@/components/DefaultAvatar.vue'

const props = defineProps({
  projectRoles: {
    type: Object,
    default: () => ({
      manager: null,
      client: null,
      curator: null
    })
  },
  statusLabel: {
    type: String,
    default: ''
  },
  statusVariant: {
    type: String,
    default: 'secondary'
  },
  startDate: {
    type: [String, Number, Date],
    default: ''
  },
  endDate: {
    type: [String, Number, Date],
    default: ''
  }
})

function formatDate(value) {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ]
    const dd = String(d.getDate()).padStart(2, '0')
    const monthName = months[d.getMonth()]
    const yyyy = d.getFullYear()
    return `${dd} ${monthName} ${yyyy}`
  } catch (_) {
    return String(value)
  }
}
</script>

<style scoped lang="scss">
.info-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.info-card__header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: #f8f9fa;
}

.info-card__body {
  padding: 0.75rem 1rem;
}

.info-list {
  margin: 0;
}

.info-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px dashed var(--color-border);
}

.info-row:last-child {
  border-bottom: none;
}

dt {
  margin: 0;
  color: #6c757d;
  font-weight: 500;
}

dd {
  margin: 0;
}

.role-person {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-person__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.role-person__name {
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
}
</style>