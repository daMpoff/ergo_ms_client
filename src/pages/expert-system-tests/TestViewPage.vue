<template>
    <div class="card mb-4 shadow-sm p-4 bg-light">
          <h4>{{ test.title }}</h4>
          <p><strong>Умение:</strong> {{ test.skill }}</p>
          <p><strong>Описание:</strong> {{ test.description }}</p>
  
          <hr />
  
          <div v-for="(question, index) in test.questions" :key="index" class="mb-4">
            <h6>Вопрос {{ index + 1 }}:</h6>
            <p>{{ question.text }}</p>
  
            <div class="list-group">
              <label
                v-for="(answer, aIndex) in question.answers"
                :key="aIndex"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{{ answer.text }}</span>
                <span v-if="answer.isCorrect" class="badge bg-success">Правильный</span>
              </label>
            </div>
          </div>
        </div>
</template>

<script setup>
import { endpoints } from '@/js/api/endpoints';
import { apiClient } from '@/js/api/manager';
import { onMounted, ref } from 'vue';

const props = defineProps({ id: { type: [String, Number], required: true }})
const test = ref(
    {
    title: '',
    skill: '',
    description: '',
    questions: []
  }
)
onMounted(async ()=>{
    let t = await apiClient.get(endpoints.expert_system.getTest,{id:props.id})
    test.value = t.data
})
</script>