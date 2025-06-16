<template>
  <div>
    <div class="mb-4">
      <label class="form-label fw-bold">Название</label>
      <input v-model="component.template_name" class="form-control" />
    </div>
    <div class="mb-4">
      <label class="form-label fw-bold">Текст</label>
      <input v-model="component.extra_data.text" class="form-control" />
    </div>

    <div v-if="component.component_type === 'Image'" class="card p-3 mb-4">
      <h6 class="fw-semibold mb-3">Изображение</h6>

      <img :src="previewSrc" class="img-fluid rounded border mb-3" style="max-height: 140px" />

      <div class="mb-3">
        <label class="form-label">URL</label>
        <input v-model="component.extra_data.src" class="form-control" />
      </div>
      <div class="mb-4">
        <label class="form-label">Alt‑текст</label>
        <input v-model="component.extra_data.alt" class="form-control" />
      </div>

      <div
        class="border rounded p-4 text-center bg-light"
        @drop.prevent="uploadFile"
        @dragover.prevent
      >
        <p class="mb-2">Перетащите файл сюда либо</p>
        <input
          v-model="altName"
          class="form-control mb-2"
          placeholder="Альтернативное название (необязательно)"
          maxlength="255"
        />
        <button class="btn btn-primary" @click="fileInput.click()">Выбрать файл</button>
        <input ref="fileInput" type="file" class="d-none" @change="uploadFile" />
      </div>

      <div v-if="uploading" class="alert alert-info py-2 mt-3">Загрузка…</div>
      <div v-if="error" class="alert alert-danger py-2 mt-3">{{ error }}</div>
    </div>

    <div class="accordion" id="visAcc">
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button bg-light" data-bs-toggle="collapse" data-bs-target="#vis">
            🎨 Визуальные настройки
          </button>
        </h2>
        <div id="vis" class="accordion-collapse collapse show">
          <div class="accordion-body">
            <!-- Размер текста -->
            <div class="mb-3">
              <label class="form-label">Размер текста</label>
              <div class="btn-group flex-wrap">
                <button
                  v-for="s in fontSizes"
                  :key="s"
                  class="btn btn-outline-primary m-1"
                  :class="{ active: hasClass(s) }"
                  @click="toggleClass(s, fontSizes)"
                >
                  {{ s }}
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Цвет фона</label>
              <div class="btn-group flex-wrap">
                <button
                  v-for="c in bgColors"
                  :key="c"
                  class="btn m-1"
                  :class="['btn-' + c, { active: hasClass('bg-' + c) }]"
                  @click="
                    toggleClass(
                      'bg-' + c,
                      bgColors.map((b) => 'bg-' + b)
                    )
                  "
                >
                  {{ c }}
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Цвет текста</label>
              <div class="btn-group flex-wrap">
                <button
                  v-for="c in textColors"
                  :key="c"
                  class="btn m-1"
                  :class="['btn-outline-' + c, { active: hasClass('text-' + c) }]"
                  @click="
                    toggleClass(
                      'text-' + c,
                      textColors.map((t) => 'text-' + t)
                    )
                  "
                >
                  {{ c }}
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Выравнивание</label>
              <select v-model="component.extra_data.align" class="form-select">
                <option value="">auto</option>
                <option value="text-start">Слева</option>
                <option value="text-center">Центр</option>
                <option value="text-end">Справа</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="accordion-item">
        <h2 class="accordion-header">
          <button
            class="accordion-button collapsed bg-light"
            data-bs-toggle="collapse"
            data-bs-target="#pad"
          >
            📏 Внутренние отступы (Padding)
          </button>
        </h2>
        <div id="pad" class="accordion-collapse collapse">
          <div class="accordion-body">
            <div v-for="p in paddingKeys" :key="p" class="mb-2">
              <label class="form-label">{{ spacingPrefixes[p] }}</label>
              <input
                type="range"
                min="0"
                max="5"
                v-model.number="spacingValues[p]"
                @input="applySpacing(p, spacingValues[p])"
                class="form-range"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="accordion-item">
        <h2 class="accordion-header">
          <button
            class="accordion-button collapsed bg-light"
            data-bs-toggle="collapse"
            data-bs-target="#mar"
          >
            📐 Внешние отступы (Margin)
          </button>
        </h2>
        <div id="mar" class="accordion-collapse collapse">
          <div class="accordion-body">
            <div v-for="p in marginKeys" :key="p" class="mb-2">
              <label class="form-label">{{ spacingPrefixes[p] }}</label>
              <input
                type="range"
                min="0"
                max="5"
                v-model.number="spacingValues[p]"
                @input="applySpacing(p, spacingValues[p])"
                class="form-range"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="accordion-item">
        <h2 class="accordion-header">
          <button
            class="accordion-button collapsed bg-light"
            data-bs-toggle="collapse"
            data-bs-target="#misc"
          >
            ⚙️ Прочее
          </button>
        </h2>
        <div id="misc" class="accordion-collapse collapse">
          <div class="accordion-body">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                id="hide"
                :checked="hasClass('d-none')"
                @change="toggleVisibility"
              />
              <label class="form-check-label" for="hide">Скрыть (d-none)</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-secondary mt-4 small">
      <code>{{ component.class_list }}</code>
    </div>
    <button class="btn btn-outline-danger w-100 mt-2" @click="resetSettings">🔄 Сбросить</button>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, watch, computed } from 'vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

const props = defineProps({ component: Object })
const { component } = toRefs(props)

function normalizeUrl(raw = '') {
  if (!raw) return ''
  const backendHost = apiClient.baseUrl.replace(/^https?:\/\//, '').replace(/\/+\$/, '')
  if (raw.startsWith('http')) return raw.replace(/localhost:\d+/, backendHost)
  return `${apiClient.baseUrl.replace(/\/+\$/, '')}${raw.startsWith('/') ? raw : '/' + raw}`
}

const uploading = ref(false)
const error = ref(null)
const altName = ref('')
const fileInput = ref(null)

const uploadFile = async (e) => {
  const file = e.target.files?.[0] || e.dataTransfer?.files?.[0]
  if (!file) return
  const fd = new FormData()
  fd.append('file', file)
  if (altName.value) fd.append('alt_name', altName.value)
  uploading.value = true
  error.value = null
  try {
    const { data } = await apiClient.post(endpoints.file, fd, false)
    component.value.extra_data.src = normalizeUrl(data.url || data.file)
    component.value.extra_data.alt = data.alt_name || altName.value
    altName.value = ''
  } catch (err) {
    console.error(err)
    error.value = 'Ошибка загрузки'
  } finally {
    uploading.value = false
  }
}

const previewSrc = computed(
  () =>
    normalizeUrl(component.value.extra_data.src) ||
    'https://via.placeholder.com/240x140?text=preview'
)

const fontSizes = ['fs-1', 'fs-2', 'fs-3', 'fs-4', 'fs-5']
const bgColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']
const textColors = ['dark', 'light', 'primary', 'secondary', 'success', 'danger', 'warning', 'info']

function hasClass(c) {
  return component.value.class_list?.includes(c)
}
function toggleClass(cls, group) {
  const list = (component.value.class_list || []).filter((c) => !group.includes(c))
  list.push(cls)
  component.value.class_list = list
}

const spacingPrefixes = {
  px: 'Горизонтальные внутренние отступы (px)',
  py: 'Вертикальные внутренние отступы (py)',
  pt: 'Верхний внутренний отступ (pt)',
  pb: 'Нижний внутренний отступ (pb)',
  ps: 'Левый внутренний отступ (ps)',
  pe: 'Правый внутренний отступ (pe)',
  mx: 'Горизонтальные внешние отступы (mx)',
  mb: 'Нижний внешний отступ (mb)',
  mt: 'Верхний внешний отступ (mt)',
  me: 'Правый внешний отступ (me)',
  ms: 'Левый внешний отступ (ms)',
}
const paddingKeys = ['px', 'py', 'pt', 'pb', 'ps', 'pe']
const marginKeys = ['mx', 'mb', 'mt', 'me', 'ms']
const spacingValues = reactive({})

watch(
  () => component.value.class_list,
  (list) => {
    ;[...paddingKeys, ...marginKeys].forEach((p) => {
      spacingValues[p] = extractSpacing(p, list)
    })
  },
  { immediate: true }
)

function applySpacing(prefix, val) {
  toggleClass(
    `${prefix}-${val}`,
    Array.from({ length: 6 }, (_, i) => `${prefix}-${i}`)
  )
}
function extractSpacing(prefix, list) {
  if (!Array.isArray(list)) return 0
  const f = list.find((c) => c.startsWith(`${prefix}-`))
  return f ? +f.split('-')[1] : 0
}

function toggleVisibility(e) {
  const list = [...(component.value.class_list || [])]
  const i = list.indexOf('d-none')
  e.target.checked && i === -1
    ? list.push('d-none')
    : !e.target.checked && i !== -1 && list.splice(i, 1)
  component.value.class_list = list
}
function resetSettings() {
  component.value.class_list = [...paddingKeys, ...marginKeys].forEach((p) => {
    spacingValues[p] = 0
  })
}
</script>

<style scoped>
.accordion-button {
  font-weight: 600;
}
.border {
  border-style: dashed !important;
}
</style>
