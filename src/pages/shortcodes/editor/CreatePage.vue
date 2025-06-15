<template>
  <div class="template-editor d-flex align-items-center justify-content-center">
    <div class="card shadow p-5 w-100" style="max-width: 1100px">
      <div class="row g-4">
        <div class="col-lg-7 border-end">
          <h3 class="mb-4 fw-semibold">Создание страницы</h3>
          <div class="mb-4">
            <label class="form-label fs-5">Название страницы</label>
            <input
              v-model="meta.title"
              type="text"
              class="form-control form-control-lg"
              placeholder="Введите название"
            />
          </div>
          <div class="mb-4">
            <label class="form-label fs-5">URL страницы (slug)</label>
            <input
              v-model="meta.slug"
              type="text"
              class="form-control form-control-lg"
              @input="onSlugInput"
            />
          </div>
          <div class="mb-4">
            <label class="form-label fs-5">URL страницы полностью:</label>
            <div class="fw-bold text-primary fs-4 user-select-all">{{ fullUrl }}</div>
          </div>
          <div class="mb-4">
            <label class="form-label fs-5">Категория:</label>
            <div
              v-if="selectedCategory"
              class="alert alert-info py-3 px-4 mt-2 d-flex align-items-center mb-2 fs-6"
            >
              <span>
                <span class="text-secondary">Путь:</span>
                <b class="ms-2">{{ categoryPathString }}</b>
              </span>
              <button class="btn btn-link text-danger ms-auto fs-4 p-0 lh-1" @click="resetCategory">
                &times;
              </button>
            </div>
            <div v-else class="form-text text-muted fs-6 mt-1 mb-0">Выберите категорию справа</div>
          </div>
          <!-- Теги -->
          <div class="mb-4">
            <label class="form-label fs-5">Теги страницы:</label>
            <div v-if="tagsOfCurrentCategory.length" class="d-flex flex-wrap gap-2">
              <span
                v-for="tag in tagsOfCurrentCategory"
                :key="tag.id"
                class="badge tag-badge px-3 py-2 fs-6"
                :class="
                  selectedTagIds.includes(tag.id)
                    ? 'bg-primary text-white'
                    : 'bg-light text-primary border border-primary'
                "
                style="cursor: pointer; user-select: none"
                @click="toggleTag(tag.id)"
              >
                {{ tag.name }}
              </span>
            </div>
            <div v-else class="form-text text-muted">Для этой категории нет тегов</div>
            <div class="form-text mt-1">
              Выбрано: <span v-if="selectedTagNames.length">{{ selectedTagNames.join(', ') }}</span>
              <span v-else>нет</span>
            </div>
          </div>
          <button
            class="btn btn-success text-white btn-lg mt-2 px-5 py-2 fs-5"
            @click="savePage"
            :disabled="!meta.title || !meta.slug || !selectedCategory"
          >
            Создать страницу
          </button>
        </div>
        <div class="col-lg-5">
          <div class="card category-card shadow-sm border-0 h-100">
            <div class="card-body pb-2">
              <h5 class="card-title mb-3 fw-semibold">Категория страницы</h5>
              <input
                v-model="categorySearch"
                class="form-control form-control-lg mb-3 fs-5"
                type="text"
                placeholder="Поиск категории..."
              />
              <div class="category-scroll border rounded bg-light py-2 px-2">
                <CategoryTree
                  :categories="filteredCategories"
                  :selectedPath="selectedPath"
                  @select="handleSelect"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { slugify as translitSlugify } from 'transliteration'
import { shortcodesService } from '@/js/api/services/shortcodes'
import CategoryTree from './CategoryTree.vue'
import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

// Состояния страницы
const meta = ref({
  title: '',
  slug: '',
})
const slugEdited = ref(false)

// --- Категории ---
const categories = ref([])
const categorySearch = ref('')
const selectedCategory = ref(null)
const selectedPath = ref([])
const router = useRouter()

function makeSlug(text) {
  return translitSlugify(text, { lowercase: true, separator: '-' })
}
watch(
  () => meta.value.title,
  (newTitle) => {
    if (!slugEdited.value) meta.value.slug = makeSlug(newTitle)
  }
)
function onSlugInput() {
  slugEdited.value = meta.value.slug.length > 0
}
watch(
  () => meta.value.slug,
  (newSlug) => {
    if (!newSlug) {
      slugEdited.value = false
      meta.value.slug = makeSlug(meta.value.title)
    }
  }
)

function filterTree(categories, search) {
  return categories
    .map((cat) => {
      let found = cat.name.toLowerCase().includes(search)
      let filteredChildren = cat.children ? filterTree(cat.children, search) : []
      if (filteredChildren.length) found = true
      if (found)
        return {
          ...cat,
          children: filteredChildren,
        }
      return null
    })
    .filter(Boolean)
}
const filteredCategories = computed(() => {
  if (!categorySearch.value.trim()) return categories.value
  return filterTree(categories.value, categorySearch.value.trim().toLowerCase())
})

function handleSelect({ category, path }) {
  selectedCategory.value = category
  selectedPath.value = path.concat([{ name: category.name, slug: category.slug, id: category.id }])
}
function resetCategory() {
  selectedCategory.value = null
  selectedPath.value = []
  selectedTagIds.value = []
}
const categoryPathString = computed(() => selectedPath.value.map((p) => p.name).join(' → '))
const categoryPathSlugs = computed(() => selectedPath.value.map((p) => p.slug))

const fullUrl = computed(() => {
  if (!meta.value.slug) return '/'
  if (!categoryPathSlugs.value.length) return '/' + meta.value.slug
  return '/' + [...categoryPathSlugs.value, meta.value.slug].join('/')
})

// Теги
const allTags = ref([])
const selectedTagIds = ref([])

const tagsOfCurrentCategory = computed(() => {
  if (!selectedCategory.value) return []
  return allTags.value.filter((tag) => tag.category === selectedCategory.value.id)
})
const selectedTagNames = computed(() =>
  allTags.value.filter((tag) => selectedTagIds.value.includes(tag.id)).map((tag) => tag.name)
)
function toggleTag(id) {
  const idx = selectedTagIds.value.indexOf(id)
  if (idx === -1) selectedTagIds.value.push(id)
  else selectedTagIds.value.splice(idx, 1)
}
// если сменили категорию — очищаем выбранные теги
watch(selectedCategory, () => {
  selectedTagIds.value = []
})

// Загрузка тегов
async function fetchCategories() {
  const resp = await apiClient.get(endpoints.categories.list)
  categories.value = Array.isArray(resp.data)
    ? buildTree(resp.data)
    : buildTree(resp.data.results || [])
}
function buildTree(list) {
  const map = {}
  const roots = []
  list.forEach((item) => {
    map[item.id] = { ...item, children: [] }
  })
  list.forEach((item) => {
    if (item.parent === null || item.parent === undefined) {
      roots.push(map[item.id])
    } else if (map[item.parent]) {
      map[item.parent].children.push(map[item.id])
    }
  })
  return roots
}
async function fetchTags() {
  const resp = await apiClient.get(endpoints.tags.list)
  allTags.value = Array.isArray(resp.data) ? resp.data : resp.data.results || []
}

// --- Сохранение страницы ---
async function savePage() {
  const resp = await shortcodesService.createPage({
    name: meta.value.title,
    slug: meta.value.slug,
    category_id: selectedCategory.value.id,
    tags_ids: selectedTagIds.value,
  })
  const pageId = resp.data.id
  router.push({ path: '/shortcodes/shortcode-editor', query: { page: pageId } })
}

onMounted(() => {
  fetchCategories()
  fetchTags()
})
</script>

<style scoped>
.card {
  border-radius: 1.4rem;
  border: none;
}
.category-card {
  min-height: 400px;
  background: #f8faff;
}
.category-scroll {
  min-height: 140px;
  max-height: 380px;
  overflow-y: auto;
  border: 2px solid #e4e7ee !important;
  background: #f4f7fa;
}
.form-label {
  font-weight: 600;
  color: #2a384c;
}
.tag-badge {
  cursor: pointer;
  font-size: 1.1rem;
  border-radius: 2rem;
  transition: background 0.15s, color 0.15s, border 0.15s;
  user-select: none;
}
.tag-badge.bg-primary {
  box-shadow: 0 2px 12px #2688eb22;
}
.tag-badge.bg-light {
  border: 1.5px solid #2688eb !important;
}
.btn-outline-primary {
  transition: background 0.15s, color 0.15s, border 0.15s;
}
.btn-outline-primary:hover,
.btn-outline-primary:focus {
  background: #d0e6fa !important;
  color: #0d306b !important;
  border-color: #94baf3 !important;
}
.btn-primary.text-white {
  background: #2688eb !important;
  color: #fff !important;
  border-color: #2688eb !important;
}
.alert-info {
  font-size: 1.12rem;
  background: #eaf4fc;
  border-color: #bbe1fa;
}
.fs-4,
.fs-5,
.fs-6 {
  font-size: 1.5rem !important;
}
@media (max-width: 991px) {
  .card {
    padding: 2rem 0.7rem !important;
  }
  .category-card {
    margin-top: 2rem;
  }
  .border-end {
    border-right: none !important;
    border-bottom: 2px solid #f0f0f0 !important;
    margin-bottom: 2rem;
  }
}
</style>
