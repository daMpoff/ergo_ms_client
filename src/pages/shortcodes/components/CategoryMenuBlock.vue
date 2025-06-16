<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { shortcodesService } from '@/js/api/services/shortcodes'

/* props из редактора */
const { component } = defineProps({ component: Object })

const route = useRoute()
const router = useRouter()
const pages = ref([])
const cats = ref([])

async function load() {
  const [pgResp, catResp] = await Promise.all([
    shortcodesService.getPages(),
    shortcodesService.getCategories(),
  ])
  pages.value = pgResp.data || []
  cats.value = catResp.data || []
}

/* вычисляем текущую категорию страницы */
const currentPage = computed(() =>
  pages.value.find(
    (p) => p.full_url.replace(/^\/|\/$/g, '') === route.fullPath.replace(/^\/|\/$/g, '')
  )
)
const currentCat = computed(() => currentPage.value?.category?.id)

/* подкатегории (children) текущей категории */
const subCats = computed(() => cats.value.filter((c) => c.parent === currentCat.value))

/* подстраиваем ссылку: берём первую страницу в подкатегории, либо просто /slug_категории/ */
function linkForCat(cat) {
  const p = pages.value.find((p) => p.category?.id === cat.id)
  return p ? p.full_url : `/${cat.slug}/`
}

/* итоговый список пунктов */
const items = computed(() =>
  subCats.value.map((cat) => ({
    title: cat.name,
    href: linkForCat(cat),
  }))
)

/* режим from extra_data: 'h' | 'v' */
const mode = component.extra_data?.mode === 'v' ? 'v' : 'h'

const go = (href) => router.push(href)
onMounted(load)
</script>

<template>
  <nav v-if="items.length">
    <ul
      :class="[
        mode === 'h' ? 'nav nav-pills justify-content-center flex-wrap gap-2' : 'list-group',
      ]"
    >
      <li
        v-for="it in items"
        :key="it.href"
        :class="mode === 'h' ? 'nav-item' : 'list-group-item p-0 border-0'"
      >
        <a
          class="nav-link"
          :class="mode === 'v' && 'py-2 px-3'"
          href="#"
          @click.prevent="go(it.href)"
        >
          {{ it.title }}
        </a>
      </li>
    </ul>
  </nav>
</template>
