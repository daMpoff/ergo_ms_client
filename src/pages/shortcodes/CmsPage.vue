<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import { shortcodesService } from '@/js/api/services/shortcodes'
import PublicCanvas from './PublicCanvas.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref(null)
const details = ref(null)
const notFound = ref(false)
const page = ref(null)
const components = ref([]) // header + page + footer

/* ---------- helper: полный путь ----------- */
const fullPath = ref(pathFromRoute(route))
function pathFromRoute(r) {
  const parts = Array.isArray(r.params.parts) ? r.params.parts : [r.params.parts]
  return parts.filter(Boolean).join('/') || 'home'
}

const goHome = () => router.push('/')
const goShortcodes = () => router.push('/shortcodes')

async function loadPage() {
  loading.value = true
  error.value = null
  notFound.value = false
  components.value = []

  try {
    /* 1. Layout (header/footer + menu_pages) */
    const lResp = await shortcodesService.getSiteLayout()
    const layout = Array.isArray(lResp.data) ? lResp.data[0] : lResp.data

    /* 2. Сама страница */
    const pResp = await shortcodesService.getPageByFullPath(fullPath.value)
    if (!pResp.data?.id) throw new Error('Page not found')
    page.value = pResp.data

    /* 3. helper: template → виртуальный instance
          если это header — прокинем menu_pages в extra_data */
    const wrapTpl = async (tplId, withMenu = false) => {
      if (!tplId) return []
      const { data: tpl } = await shortcodesService.getTemplate(tplId)
      return [
        {
          uid: `tpl-${tpl.id}`,
          template: tpl.id,
          template_name: tpl.name,
          component_type: tpl.component_type,
          class_list: tpl.class_list,
          extra_data: withMenu
            ? { ...tpl.extra_data, menu_pages: layout?.menu_pages || [] }
            : tpl.extra_data,
          allow_children: tpl.allow_children,
          icon_name: tpl.icon_name,
          children: [],
        },
      ]
    }

    /* 4. параллельно собираем блоки */
    const [header, body, footer] = await Promise.all([
      wrapTpl(layout?.header_template, true),
      shortcodesService
        .getInstancesTree({ page: page.value.id })
        .then((r) => (Array.isArray(r.data) ? r.data : [])),
      wrapTpl(layout?.footer_template),
    ])

    components.value = [...header, ...body, ...footer]
    loading.value = false
  } catch (e) {
    console.error(e)
    loading.value = false
    error.value = e.message || 'Ошибка загрузки страницы'
    details.value = e
    notFound.value = /not found/i.test(e.message) || e.response?.status === 404
  }
}

watch(
  () => route.params.parts,
  () => {
    fullPath.value = pathFromRoute(route)
    loadPage()
  },
  { immediate: true }
)
</script>

<template>
  <div class="my-2">
    <h2 class="mb-4">CMS-страница: {{ page?.name || fullPath }}</h2>

    <div v-if="loading">Загрузка…</div>

    <template v-else-if="notFound">
      <div class="alert alert-warning">
        {{ error }}
        <div class="mt-3">
          <button class="btn btn-outline-primary me-2" @click="goHome">На главную</button>
          <button class="btn btn-primary" @click="goShortcodes">Управление страницами</button>
        </div>
      </div>
    </template>

    <template v-else-if="error">
      <div class="alert alert-danger">
        {{ error }}
        <pre class="bg-light p-2 mt-3 rounded">{{ JSON.stringify(details, null, 2) }}</pre>
      </div>
    </template>

    <template v-else>
      <PublicCanvas :components="components" />
    </template>
  </div>
</template>