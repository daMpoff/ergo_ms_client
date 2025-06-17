<script setup>
import { Calendar1 } from 'lucide-vue-next'
import { Calendar } from 'v-calendar'
import { shallowRef } from 'vue'

import CardModalBody from '@/pages/modals/CardModalBody.vue'

const calendar = shallowRef(null)

function moveToday() {
  calendar.value.move(new Date())
}
</script>

<template>
  <CardModalBody
    :icon="Calendar1"
    title="Календарь"
    description="Планируйте события, следите за дедлайнами и управляйте расписанием"
    modalId="calendarModal"
  >
    <Calendar ref="calendar" expanded>
      <template #footer>
        <div class="px-4 pb-3">
          <button class="btn btn-primary w-100" @click="moveToday()">Сегодня</button>
        </div>
      </template>
    </Calendar>
  </CardModalBody>
</template>

<style scoped lang="scss"></style>
