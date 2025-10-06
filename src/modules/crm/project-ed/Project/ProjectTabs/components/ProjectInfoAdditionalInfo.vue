<template>
  <BaseInfoCard title="Дополнительная информация" :project-data="projectData">
    <div class="section-content">
      <template v-if="hasStructuredInfo">
        <div class="info-list">
          <div v-if="risks" class="info-item">
            <AlertTriangle class="item-icon" />
            <div class="item-body">
              <div class="item-title">Риски</div>
              <p class="item-text">{{ risks }}</p>
            </div>
          </div>
          <div v-if="resources" class="info-item">
            <Package class="item-icon" />
            <div class="item-body">
              <div class="item-title">Ресурсы</div>
              <p class="item-text">{{ resources }}</p>
            </div>
          </div>
          <div v-if="notes" class="info-item">
            <StickyNote class="item-icon" />
            <div class="item-body">
              <div class="item-title">Заметки</div>
              <p class="item-text">{{ notes }}</p>
            </div>
          </div>
        </div>
      </template>
      <p v-else-if="additionalInfo" class="additional-info-text">{{ additionalInfo }}</p>
      <p v-else class="text-muted">Дополнительная информация не указана</p>
    </div>
  </BaseInfoCard>
  
</template>

<script setup>
import { computed } from 'vue'
import { AlertTriangle, Package, StickyNote } from 'lucide-vue-next'
import BaseInfoCard from '@/modules/crm/project-ed/Project/ProjectTabs/components/BaseInfoCard.vue'

const props = defineProps({
  projectData: {
    type: Object,
    default: null
  }
})

const risks = computed(() => props.projectData?.risks || '')
const resources = computed(() => props.projectData?.resources || '')
const notes = computed(() => props.projectData?.notes || '')

const hasStructuredInfo = computed(() => !!(risks.value || resources.value || notes.value))

const additionalInfo = computed(() => {
  if (!props.projectData) return ''
  return props.projectData.additional_info || props.projectData.additionalInfo || ''
})
</script>

<style scoped lang="scss">
.section-content {
  margin-left: 0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.item-icon {
  width: 18px;
  height: 18px;
  color: var(--color-primary-text);
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.item-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-title {
  font-weight: 600;
  color: var(--color-primary-text);
}

.item-text {
  margin: 0;
  color: var(--color-primary-text);
  line-height: 1.6;
  white-space: pre-wrap;
}

.additional-info-text {
  line-height: 1.6;
  color: var(--color-primary-text);
  margin-bottom: 0;
  white-space: pre-wrap;
}

.text-muted {
  color: var(--color-secondary-text);
  font-style: italic;
  margin-bottom: 0;
}
</style>


