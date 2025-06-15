<template>
  <div class="container py-4">
    <h2 class="mb-4 fw-semibold">Список страниц</h2>
    <!-- Фильтры -->
    <div class="row mb-4 align-items-start">
      <!-- Категории дерево + поиск -->
      <div class="col-md-4 mb-3 mb-md-0">
        <label class="form-label">Категория</label>
        <input
          v-model="categorySearch"
          class="form-control form-control-lg mb-2"
          type="text"
          placeholder="Поиск категории..."
        />
        <div
          class="category-tree border rounded bg-light py-2 px-2"
          style="max-height: 320px; overflow-y: auto"
        >
          <CategoryTree
            :categories="filteredCategories"
            :selectedPath="selectedPath"
            @select="handleSelect"
          />
        </div>
        <div v-if="selectedCategory" class="form-text text-muted mt-2">
          Выбрано: <b>{{ categoryPathString }}</b>
          <span class="ms-2">
            <button class="btn btn-link btn-sm text-danger p-0" @click="resetCategory">×</button>
          </span>
        </div>
      </div>
      <!-- Теги -->
      <div class="col-md-8">
        <label class="form-label">Теги (в категории)</label>
        <div>
          <button
            v-for="tag in tagsOfCurrentCategory"
            :key="tag.id"
            @click="toggleTag(tag.id)"
            class="badge tag-badge rounded-pill me-2 mb-2"
            :class="
              selectedTagIds.includes(tag.id)
                ? 'bg-primary text-white'
                : 'bg-light text-dark border border-primary'
            "
            style="font-size: 1.12rem; cursor: pointer"
          >
            {{ tag.name }}
          </button>
          <span v-if="selectedCategory && !tagsOfCurrentCategory.length" class="text-muted"
            >Нет тегов для этой категории</span
          >
        </div>
      </div>
    </div>

    <!-- Карточки страниц -->
    <div class="row g-4">
      <div class="col-12 col-md-6 col-lg-4" v-for="page in filteredPages" :key="page.id">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-1">
              <a
                :href="pageUrl(page)"
                class="text-decoration-none"
                target="_blank"
                style="color: inherit"
              >
                {{ page.name }}
              </a>
            </h5>
            <p class="card-subtitle mb-2 text-muted">/{{ page.slug }}</p>
            <div class="mb-2">
              <span class="badge bg-secondary me-1">
                {{ page.category?.name || 'Без категории' }}
              </span>
              <span v-for="tag in page.tags" :key="tag.id" class="badge bg-primary me-1">{{
                tag.name
              }}</span>
            </div>
            <a
              :href="`/shortcodes/shortcode-editor?page=${page.id}`"
              class="btn btn-outline-primary btn-sm mt-2"
            >
              Редактировать
            </a>
            <a
              :href="pageUrl(page)"
              class="btn btn-outline-secondary btn-sm mt-2 ms-2"
              target="_blank"
            >
              Открыть
            </a>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!filteredPages.length" class="alert alert-info mt-4">
      Нет страниц по выбранным фильтрам.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import CategoryTree from './editor/CategoryTree.vue'
import { shortcodesService } from '@/js/api/services/shortcodes'

const pages = ref([])
const categories = ref([])
const allTags = ref([])

const categorySearch = ref('')
const selectedCategory = ref(null)
const selectedPath = ref([])
const selectedTagIds = ref([])

// Категории дерево
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
function pageUrl(page) {
  // Если category — объект с полем parent (и parent — объект или null)
  let slugs = []
  let cat = page.category
  while (cat) {
    slugs.unshift(cat.slug)
    cat = cat.parent // cat.parent должен быть объектом!
  }
  slugs.push(page.slug)
  return '/' + slugs.filter(Boolean).join('/')
}

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

// Теги по текущей категории
const tagsOfCurrentCategory = computed(() => {
  if (!selectedCategory.value) return []
  return allTags.value.filter((tag) => tag.category === selectedCategory.value.id)
})
function toggleTag(tagId) {
  const idx = selectedTagIds.value.indexOf(tagId)
  if (idx === -1) selectedTagIds.value.push(tagId)
  else selectedTagIds.value.splice(idx, 1)
}
// Если сменили категорию — очищаем выбранные теги
watch(selectedCategory, () => {
  selectedTagIds.value = []
})

// --- Фильтрация страниц ---
const filteredPages = computed(() => {
  let result = pages.value
  if (selectedCategory.value) {
    result = result.filter((page) => page.category?.id === selectedCategory.value.id)
  }
  if (selectedTagIds.value.length) {
    result = result.filter(
      (page) =>
        page.tags && selectedTagIds.value.every((tid) => page.tags.some((tag) => tag.id === tid))
    )
  }
  return result
})

async function fetchData() {
  const pageResp = await shortcodesService.getPages()
  pages.value = Array.isArray(pageResp.data) ? pageResp.data : pageResp.data.results || []

  const catResp = await shortcodesService.getCategories()
  categories.value = buildTree(
    Array.isArray(catResp.data) ? catResp.data : catResp.data.results || []
  )

  const tagResp = await shortcodesService.getTags()
  allTags.value = Array.isArray(tagResp.data) ? tagResp.data : tagResp.data.results || []
}
onMounted(fetchData)
</script>

<style scoped>
.badge {
  user-select: none;
  transition: background 0.15s, color 0.15s;
}
.tag-badge {
  font-size: 1.1rem;
  border-radius: 2rem;
  user-select: none;
  cursor: pointer;
}
.tag-badge.bg-primary {
  box-shadow: 0 1px 6px #2688eb22;
}
.card {
  border-radius: 1.3rem;
}
.category-tree {
  min-height: 120px;
  max-height: 320px;
  overflow-y: auto;
  border: 2px solid #e4e7ee !important;
  background: #f4f7fa;
}
</style>
