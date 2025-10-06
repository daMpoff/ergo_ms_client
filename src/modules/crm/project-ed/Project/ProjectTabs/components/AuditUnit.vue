<template>
  <li class="py-2 border-bottom">
    <div class="d-flex align-items-center">
      <div class="d-flex align-items-center justify-content-center me-3" style="width: 36px; height: 36px;">
        <component :is="ActionIconComp" :size="20" :class="actionIconClass" />
      </div>
      <div class="me-3" style="width: 36px; height: 36px;">
        <img v-if="avatarSrc" :src="avatarSrc" alt="avatar" class="rounded-circle object-fit-cover" style="width: 36px; height: 36px;" @error="onAvatarError" />
        <DefaultAvatar v-else size="small" />
      </div>
      <div class="flex-grow-1">
        <div>
          <span class="fw-semibold me-1">{{ authorName }}</span>
          <span class="me-1">{{ actionVerb }}</span>
          <template v-if="hasField">
            <span>раздел </span><span class="fw-semibold">{{ sectionName }}</span>
          </template>
          <template v-else-if="modelTypeLower">
            <span>{{ modelTypeLower }}</span>
          </template>
        </div>
        <div class="small text-muted" :title="fullDateTooltip">{{ relativeTime }}</div>
      </div>
    </div>
  </li>
  </template>

<script setup>
import DefaultAvatar from '@/components/DefaultAvatar.vue'
import { getIcon } from '@/config/icons-mapping'
import { ref, onMounted, watch, computed } from 'vue'
import { getUserAvatar, getCachedUserAvatar } from '@/js/userAvatar'
import { apiClient } from '@/js/api/manager'
import { getRelativeTime, getFormattedDateWithRelative } from '@/modules/crm/project-ed/components/steps/js/timeUtils.js'

const props = defineProps({
  timestamp: {
    type: String,
    required: true
  },
  actionDisplay: {
    type: String,
    required: true
  },
  modelTypeDisplay: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    default: null
  },
  userId: {
    type: [String, Number],
    default: null
  },
  avatarUrl: {
    type: String,
    default: null
  },
  fieldName: {
    type: String,
    default: null
  },
  oldValue: {
    type: String,
    default: null
  },
  newValue: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  iconName: {
    type: String,
    default: 'Square'
  }
})

const ActionIconComp = computed(() => {
  const actionIconName = getActionIconName(props.actionDisplay)
  return getIcon(actionIconName) || getIcon('Activity')
})

const avatarSrc = ref(normalizeUrl(props.avatarUrl) || normalizeUrl(getCachedUserAvatar(props.userId)) || null)

async function ensureAvatarLoaded() {
  if (props.avatarUrl) {
    avatarSrc.value = normalizeUrl(props.avatarUrl)
    return
  }
  if (!avatarSrc.value && props.userId) {
    const url = await getUserAvatar(props.userId)
    avatarSrc.value = normalizeUrl(url)
  }
}

onMounted(() => {
  ensureAvatarLoaded()
})

watch(() => [props.userId, props.avatarUrl], () => {
  avatarSrc.value = normalizeUrl(props.avatarUrl) || normalizeUrl(getCachedUserAvatar(props.userId)) || null
  ensureAvatarLoaded()
})

function normalizeUrl(url) {
  if (!url) return null
  if (typeof url !== 'string') return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  // Удаляем ведущий слэш, чтобы корректно склеить с baseUrl
  const clean = url.startsWith('/') ? url.slice(1) : url
  // Медиа обычно отдаются с корня, без префикса api
  return `${apiClient.baseUrl}${clean}`
}

function onAvatarError() {
  avatarSrc.value = null
}

const relativeTime = computed(() => getRelativeTime(props.timestamp))
const fullDateTooltip = computed(() => getFormattedDateWithRelative(props.timestamp))

const authorName = computed(() => (props.userName && props.userName.trim()) ? props.userName.trim() : 'Система')
const actionVerb = computed(() => toActionVerb(props.actionDisplay))
const hasField = computed(() => !!(props.fieldName && props.fieldName.trim()))
const sectionName = computed(() => hasField.value ? translateSectionName(props.fieldName) : '')
const modelTypeLower = computed(() => props.modelTypeDisplay ? props.modelTypeDisplay.toLocaleLowerCase('ru-RU') : '')

const actionIconClass = computed(() => {
  const actionType = getActionType(props.actionDisplay)
  const colorMap = {
    'create': 'text-success',
    'update': 'text-primary', 
    'delete': 'text-danger',
    'add': 'text-success',
    'assign': 'text-warning',
    'change': 'text-info',
    'default': 'text-secondary'
  }
  return colorMap[actionType] || colorMap['default']
})

function translateSectionName(value) {
  if (!value) return ''
  const key = String(value).trim().toLowerCase()
  const map = {
    'additional_info': 'Дополнительная информация',
  }
  return map[key] || value
}

function toActionVerb(actionDisplay) {
  const src = String(actionDisplay || '').toLowerCase()
  const map = new Map([
    ['обновление', 'обновил'],
    ['изменение', 'изменил'],
    ['создание', 'создал'],
    ['удаление', 'удалил'],
    ['добавление', 'добавил'],
    ['назначение', 'назначил'],
    ['update', 'обновил'],
    ['change', 'изменил'],
    ['create', 'создал'],
    ['delete', 'удалил'],
    ['add', 'добавил'],
    ['assign', 'назначил'],
  ])
  for (const [key, val] of map.entries()) {
    if (src.includes(key)) return val
  }
  return src || 'выполнил действие'
}

function getActionType(actionDisplay) {
  const src = String(actionDisplay || '').toLowerCase()
  if (src.includes('создание') || src.includes('create') || src.includes('добавление') || src.includes('add')) {
    return 'create'
  }
  if (src.includes('обновление') || src.includes('update') || src.includes('изменение') || src.includes('change')) {
    return 'update'
  }
  if (src.includes('удаление') || src.includes('delete')) {
    return 'delete'
  }
  if (src.includes('назначение') || src.includes('assign')) {
    return 'assign'
  }
  return 'default'
}

function getActionIconName(actionDisplay) {
  const actionType = getActionType(actionDisplay)
  const iconMap = {
    'create': 'Plus',
    'update': 'Edit',
    'delete': 'Trash2', 
    'add': 'Plus',
    'assign': 'UserPlus',
    'change': 'Edit',
    'default': 'Activity'
  }
  return iconMap[actionType] || iconMap['default']
}
</script>
