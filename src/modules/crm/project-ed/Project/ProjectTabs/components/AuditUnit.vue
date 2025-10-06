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
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { getUserAvatar, getCachedUserAvatar } from '@/js/userAvatar'
import { apiClient } from '@/js/api/manager'
import { getRelativeTime, getFormattedDateWithRelative } from '@/modules/crm/project-ed/components/steps/js/timeUtils.js'
import { getAuditActionType, getAuditActionIconName, AUDIT_ACTION_COLOR_MAP, getAuditActionVerb } from '@/modules/crm/project-ed/js/auditIcons.js'

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
  const actionIconName = getAuditActionIconName(props.actionDisplay)
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

// Реактивная переменная для принудительного обновления времени
const timeUpdateTrigger = ref(0)

const relativeTime = computed(() => {
  // Зависимость от timeUpdateTrigger для обновления каждую минуту
  timeUpdateTrigger.value
  return getRelativeTime(props.timestamp)
})

const fullDateTooltip = computed(() => {
  // Зависимость от timeUpdateTrigger для обновления каждую минуту
  timeUpdateTrigger.value
  return getFormattedDateWithRelative(props.timestamp)
})

// Интервал для обновления времени каждую минуту
let timeUpdateInterval = null

onMounted(() => {
  ensureAvatarLoaded()
  // Обновляем время каждую минуту (60000 мс)
  timeUpdateInterval = setInterval(() => {
    timeUpdateTrigger.value++
  }, 60000)
})

onUnmounted(() => {
  // Очищаем интервал при размонтировании компонента
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
    timeUpdateInterval = null
  }
})

const authorName = computed(() => (props.userName && props.userName.trim()) ? props.userName.trim() : 'Система')
const actionVerb = computed(() => getAuditActionVerb(props.actionDisplay))
const hasField = computed(() => !!(props.fieldName && props.fieldName.trim()))
const sectionName = computed(() => hasField.value ? translateSectionName(props.fieldName) : '')
const modelTypeLower = computed(() => props.modelTypeDisplay ? props.modelTypeDisplay.toLocaleLowerCase('ru-RU') : '')

const actionIconClass = computed(() => 'text-secondary')

function translateSectionName(value) {
  if (!value) return ''
  const key = String(value).trim().toLowerCase()
  const map = {
    'additional_info': 'Дополнительная информация',
  }
  return map[key] || value
}

// Определение глагола действия перенесено в общий модуль

// Локальные функции выбора типа действия/иконки перенесены в общий модуль
</script>
