<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import RecursiveRenderer from '../editor/RecursiveRenderer.vue'
import PageCardBlock from '../components/PageCardBlock.vue'
import { shortcodesService } from '@/js/api/services/shortcodes'

const props = defineProps({ component: Object })
const node = computed(() => props.component ?? { extra_data: {}, children: [] })
const childrenList = computed(() =>
    Array.isArray(node.value.children) ? node.value.children : []
)

const cols = computed(() => node.value.extra_data?.cols ?? 3)
const limit = computed(() => node.value.extra_data?.limit ?? 6)
const categoryId = computed(() => node.value.extra_data?.category_id ?? null)

const autoCards = ref([])

async function fetchLatest() {
    if (!categoryId.value) {
        autoCards.value = []
        return
    }
    const { success, data } = await shortcodesService.getLatestPages(
        categoryId.value,
        limit.value
    )
    autoCards.value = success ? data : []
}

onMounted(fetchLatest)
watch([categoryId, limit], fetchLatest)
</script>

<template>
    <section class="container my-4">
        <div :class="`row row-cols-1 row-cols-md-${cols} g-4`">
            <!-- вручную вложенные блоки -->
            <div v-for="child in childrenList" :key="child.uid || child.id" class="col">
                <RecursiveRenderer :component="child" />
            </div>

            <!-- автоматически загруженные страницы -->
            <div v-for="p in autoCards" :key="`auto-${p.id}`" class="col">
                <PageCardBlock :component="{
                    component_type: 'PageCard',
                    uid: `auto-${p.id}`,
                    extra_data: {
                        title: p.name,
                        path: p.full_url,
                        image: p.preview_image,
                        tags: p.tags,
                    },
                }" />
            </div>
        </div>
    </section>
</template>

<style scoped>
.card-img-top {
    max-height: 180px;
    object-fit: cover;
}
</style>