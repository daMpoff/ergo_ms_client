<!-- WorkArea.vue -->
<template>
  <div class="card shadow-sm mb-4">
    <div class="card-header bg-primary text-white d-flex align-items-center flex-wrap gap-2">
      <ListTree class="me-2" />
      <h5 class="mb-0 me-auto">Рабочая область</h5>

      <!-- Информация о текущей странице -->
      <div v-if="pageInfo" class="page-info text-white-50 me-auto small lh-sm">
        <span class="d-block fw-semibold">{{ pageInfo.name }}</span>
        <span class="d-block">{{ pageInfo.full_url }}</span>
      </div>

      <!-- Выбор шаблона из той же категории -->
      <select
        v-if="templatePages.length"
        v-model="selectedTemplateId"
        class="form-select form-select-sm w-auto"
      >
        <option :value="null" disabled>Загрузить шаблон…</option>
        <option v-for="p in templatePages" :key="p.id" :value="p.id">
          {{ p.name }}
        </option>
      </select>
      <button v-if="selectedTemplateId" class="btn btn-sm btn-outline-light" @click="applyTemplate">
        Загрузить
      </button>

      <!-- Переключатель отладочных данных -->
      <button class="btn btn-sm btn-outline-warning ms-2" @click="showDebug = !showDebug">
        {{ showDebug ? 'Скрыть отладку' : 'Отладка для опытных' }}
      </button>
    </div>

    <div class="card-body p-0 position-relative">
      <div v-if="loadError" class="alert alert-danger m-4">{{ loadError }}</div>

      <template v-else>
        <!-- Drag & Drop дерево -->
        <Draggable
          v-model="internalTree"
          :key="treeKey"
          :external-data-handler="externalDataHandler"
          :on-external-drag-over="() => true"
          :eachDroppable="eachDroppable"
          tree-line
          value-key="uid"
          class="drop-area overflow-auto p-3"
        >
          <template #default="{ node, stat }">
            <div>
              <OpenIcon
                v-if="stat.children.length"
                :open="stat.open"
                class="me-2 text-primary"
                @click="stat.open = !stat.open"
              />
              <div
                class="d-flex justify-content-between align-items-center p-2 mb-2 bg-white rounded shadow-sm"
              >
                <div>
                  <b>{{ node.template_name }}</b
                  ><br />
                  <small class="text-muted">{{ node.component_type }}</small>
                </div>
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-outline-secondary"
                    @click="$emit('open-settings', node)"
                    title="Настроить компонент"
                  >
                    ⚙️
                  </button>
                  <button
                    class="btn btn-outline-danger"
                    @click="removeNode(node.uid)"
                    title="Удалить компонент"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </template>
        </Draggable>

        <!-- Кнопка публикации -->
        <div class="d-flex justify-content-end mt-4 mb-2 px-3">
          <button
            class="btn btn-success text-white btn-lg px-5 py-2 fs-5"
            @click="saveToDb"
            :disabled="isSaving || !internalTree.length"
          >
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
            Опубликовать
          </button>
        </div>

        <!-- Отладочные данные -->
        <div v-if="showDebug" class="p-3 bg-light border-top">
          <div class="row">
            <div class="col-12 col-md-4">
              <h6>Исходное дерево</h6>
              <pre class="debug-box">{{ JSON.stringify(internalTree, null, 2) }}</pre>
            </div>
            <div class="col-12 col-md-4">
              <h6>Flat-дерево</h6>
              <pre class="debug-box">{{ JSON.stringify(flatTree, null, 2) }}</pre>
            </div>
            <div class="col-12 col-md-4">
              <h6>Восстановленное дерево</h6>
              <pre class="debug-box">{{ JSON.stringify(rebuiltTree, null, 2) }}</pre>
            </div>
          </div>
          <div class="mt-3">
            <h6>Различия</h6>
            <pre class="debug-box">{{ diffResult || 'Нет различий!' }}</pre>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { Draggable, OpenIcon } from '@he-tree/vue'
import { ListTree } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { shortcodesService } from '@/js/api/services/shortcodes'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'open-settings'])

const route = useRoute()
const router = useRouter()
const pageId = computed(() => {
  const val = route.query.page ?? route.params.page
  const num = Number(val)
  return isNaN(num) ? null : num
})

const treeKey = ref(0)
const showDebug = ref(false)
const isSaving = ref(false)
const loadError = ref('')

const pageInfo = ref(null)
const allPages = ref([])
const selectedTemplateId = ref(null)

function forceTreeRerender() {
  treeKey.value++
}

const internalTree = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function removeNode(uid) {
  if (internalTree.value.length === 1 && internalTree.value[0].uid === uid) {
    alert('Нельзя удалить последний компонент!')
    return
  }
  const deepRemove = (arr) =>
    arr
      .filter((node) => node.uid !== uid)
      .map((node) => ({ ...node, children: node.children ? deepRemove(node.children) : [] }))

  emit('update:modelValue', deepRemove(internalTree.value))
  forceTreeRerender()
}

const eachDroppable = (stat) => stat.data.allow_children === true

const externalDataHandler = (event) => {
  const tpl = JSON.parse(event.dataTransfer.getData('application/json'))
  return assignUidsRecursively({
    ...tpl,
    template: tpl.template ?? tpl.id,
    template_name: tpl.template_name ?? tpl.name,
  })
}

function assignUidsRecursively(node) {
  return {
    ...node,
    uid: uuidv4(),
    children: node.children ? node.children.map(assignUidsRecursively) : [],
  }
}

function flattenTree(tree, parent = null) {
  return tree.flatMap((node, idx) => {
    const { children, ...rest } = node
    const item = {
      ...rest,
      template: rest.template ?? rest.id,
      parent: parent ? parent.uid : null,
      position: idx,
    }
    return [item, ...(children ? flattenTree(children, node) : [])]
  })
}
const flatTree = computed(() => flattenTree(internalTree.value))

function rebuildTree(flat) {
  if (!Array.isArray(flat)) return []
  const map = Object.fromEntries(flat.map((i) => [i.uid, { ...i, children: [] }]))
  const roots = []
  flat.forEach((item) =>
    item.parent ? map[item.parent]?.children.push(map[item.uid]) : roots.push(map[item.uid])
  )
  return roots
}
const rebuiltTree = computed(() => rebuildTree(flatTree.value))

function simpleDiff(a, b, path = '') {
  let out = []
  if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      out = out.concat(simpleDiff(a[i], b[i], `${path}.${i}`))
    }
    return out
  }
  if (typeof a === 'object' && typeof b === 'object' && a && b) {
    for (const k of Object.keys(a)) {
      if (['parent', 'position', 'uid'].includes(k)) continue
      if (!(k in b)) out.push(`${path}.${k}: Нет во втором`)
      else out = out.concat(simpleDiff(a[k], b[k], `${path}.${k}`))
    }
    for (const k of Object.keys(b)) {
      if (['parent', 'position', 'uid'].includes(k)) continue
      if (!(k in a)) out.push(`${path}.${k}: Нет в первом`)
    }
    return out
  }
  if (a !== b) return [`${path}: "${a}" ≠ "${b}"`]
  return []
}
const diffResult = computed(() => simpleDiff(internalTree.value, rebuiltTree.value).join('\n'))

const templatePages = computed(() =>
  pageInfo.value
    ? allPages.value.filter(
        (p) => p.id !== pageInfo.value.id && p.category?.id === pageInfo.value.category?.id
      )
    : []
)

async function loadPageInfo() {
  try {
    const resp = await shortcodesService.getPages()
    allPages.value = Array.isArray(resp.data) ? resp.data : resp.data.results || []
    pageInfo.value = allPages.value.find((p) => p.id === pageId.value) || null
  } catch (e) {
    console.error('Не удалось получить список страниц:', e)
  }
}

async function loadFromDb() {
  if (!pageId.value) {
    loadError.value = 'Не передан pageId в URL'
    return
  }
  try {
    loadError.value = ''
    const resp = await shortcodesService.getInstancesTree({ page: pageId.value })
    emit('update:modelValue', Array.isArray(resp.data) ? resp.data : [])
    forceTreeRerender()
  } catch (e) {
    loadError.value = 'Ошибка загрузки: ' + (e?.message || e)
  }
}

async function saveToDb() {
  if (!pageId.value) {
    alert('Нет pageId — невозможно сохранить!')
    return
  }
  isSaving.value = true
  try {
    const data = flatTree.value.map((n) => ({ ...n, page: pageId.value }))
    await shortcodesService.bulkCreateInstances(data)
    await loadFromDb()
    if (pageInfo.value && pageInfo.value.full_url) {
      const url = pageInfo.value.full_url.startsWith('/')
        ? pageInfo.value.full_url
        : '/' + pageInfo.value.full_url
      router.push(url)
    }
  } catch (e) {
    alert('Ошибка сохранения: ' + (e?.message || e))
  } finally {
    isSaving.value = false
  }
}

async function applyTemplate() {
  if (!selectedTemplateId.value) return
  if (
    !confirm(
      'Заменить текущее дерево компонентами из выбранной страницы? ' +
        'Несохранённые изменения будут потеряны.'
    )
  )
    return
  try {
    const resp = await shortcodesService.getInstancesTree({
      page: selectedTemplateId.value,
    })
    const tplTree = Array.isArray(resp.data) ? resp.data : []
    // генерируем новые UID, чтобы не конфликтовали
    const newTree = tplTree.map(assignUidsRecursively)
    emit('update:modelValue', newTree)
    forceTreeRerender()
    selectedTemplateId.value = null
  } catch (e) {
    alert('Не удалось загрузить шаблон: ' + (e?.message || e))
  }
}

onMounted(async () => {
  await Promise.all([loadFromDb(), loadPageInfo()])
})
</script>

<style scoped>
.drop-area {
  min-height: 150px;
  border: 2px dashed var(--bs-primary);
  border-radius: 0.375rem;
  background-color: var(--bs-light);
  transition: background-color 0.2s ease;
}
.drop-area:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
}

.debug-box {
  max-height: 320px;
  overflow: auto;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.5rem;
  font-family: monospace;
  font-size: 0.825rem;
}
</style>
