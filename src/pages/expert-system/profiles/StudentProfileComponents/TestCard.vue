
<template>
  <div class="card test-card shadow-sm h-100 position-relative">
    <!-- Кнопка закрытия -->
    <button 
      class="btn btn-sm btn-close position-absolute top-0 end-0 m-2"
      style="z-index: 1;"
      @click.stop="$emit('close')"
    ></button>

    <div class="card-body d-flex flex-column">
      <!-- Заголовок и статус -->
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <h5 class="card-title mb-0 text-primary flex-grow-1">
          {{ skillName }}
        </h5>
        <span v-if="confirmed" class="badge bg-success flex-shrink-0" style="min-width: fit-content;">
          <i class="bi bi-check-circle-fill"></i> Подтвержден
        </span>
        <span v-else class="badge bg-danger flex-shrink-0" style="min-width: fit-content;">
          <i class="bi bi-x-circle-fill"></i> Не подтвержден
        </span>
      </div>

      <!-- Остальной код остается без изменений -->
      <div class="progress mb-4" style="height: 20px;">
        <div 
          class="progress-bar bg-info progress-bar-striped" 
          role="progressbar" 
          :style="{ width: progress + '%' }"
          :aria-valuenow="progress" 
          aria-valuemin="0" 
          aria-valuemax="100"
        >
          {{ progress }}%
        </div>
      </div>

      <div class="card-text mb-0">
          {{ description }}
      </div>
      
      <button 
        @click="startTest"
        class="btn btn-primary mt-auto align-self-stretch"
      >
        <i class="bi bi-play-circle me-2"></i>Начать тест
      </button>
    </div>
  </div>
</template>


  <script setup>
  import { ref, onMounted } from 'vue';
  const props = defineProps({
    name: { type: String, required: true },
    confirmed: { type: Boolean, required: true },
    correctPercentage: { type: Number, required: true },
    description: {type:String, required:true}
  });
  
  const skillName = ref('');
  const confirmed = ref(false);
  const progress = ref(0);
  const statusText = ref('');
  const statuscolor = ref('');
  const description = ref('')
  onMounted(() => {
    skillName.value = props.name;
    confirmed.value = props.confirmed;
    progress.value = props.correctPercentage;
    description.value = props.description
    if (confirmed.value) {
      statusText.value = 'Подтвержден';
      statuscolor.value = 'badge border border-success text-success';
    } else {
      statusText.value = 'Не подтвержден';
      statuscolor.value = 'badge border border-danger text-danger';
    }
  });
  </script>



  <style scoped>
  div {font-size: 18px;}
  </style>