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
                <div class="info-row">
                    <dt>Исполнители</dt>
                    <dd>
                        <div v-if="performers && performers.length" class="contributors">
                            <div class="contributors__list">
                                <div
                                    v-for="(person, idx) in performers"
                                    :key="person.id || idx"
                                    class="contributors__item"
                                    :ref="el => setPerformerRef(el, idx)"
                                >
                                    <img
                                        v-if="person.avatar_url"
                                        :src="person.avatar_url"
                                        :alt="person.full_name || 'Исполнитель'"
                                        class="contributors__avatar"
                                    />
                                    <DefaultAvatar
                                        v-else
                                        size="small"
                                        :title="person.full_name || '—'"
                                        class="contributors__avatar"
                                    />
                                </div>
                            </div>
                        </div>
                        <span v-else class="text-muted">—</span>
                    </dd>
                </div>
            </dl>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import DefaultAvatar from '@/components/DefaultAvatar.vue'
import { initializePopover, cleanupPopover } from '@/modules/crm/project-ed/components/steps/js/popoverUtils.js'

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
  },
  performers: {
    type: Array,
    default: () => []
  }
})

const performerRefs = ref([])
const popovers = ref([])

function setPerformerRef(el, index) {
  performerRefs.value[index] = el
}

function initPerformerPopovers() {
  // Очистим прежние
  popovers.value.forEach(p => cleanupPopover(p))
  popovers.value = []

  performerRefs.value.forEach((el, index) => {
    if (!el) return
    const person = props.performers?.[index]
    const name = person?.full_name || ''
    const pop = initializePopover(el, name, {
      className: 'custom-popover',
      position: 'auto',
      offset: 8,
      showArrow: true,
      maxWidth: 240
    })
    if (pop) popovers.value.push(pop)
  })
}

onMounted(async () => {
  await nextTick()
  initPerformerPopovers()
})

watch(() => props.performers, async () => {
  await nextTick()
  initPerformerPopovers()
}, { deep: true })

onBeforeUnmount(() => {
  popovers.value.forEach(p => cleanupPopover(p))
  popovers.value = []
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

.contributors__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.contributors__item {
  width: 36px;
  height: 36px;
}

.contributors__avatar {
  border-radius: 50%;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>