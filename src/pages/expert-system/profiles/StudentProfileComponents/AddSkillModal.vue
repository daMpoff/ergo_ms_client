<template >
    <form @submit.prevent="submitForm" novalidate>
        <div class="form-floating mb-3" v-auto-animate>
        <div class="d-flex justify-content-center align-items-center">
            <div class="card" style="width: 500px">
                <div class="scroll-container">
                <div v-for="skill in skills" :key="skill.id" :value="skill.name" id="skillslist">
                    <div class="form-check">
                    <input class="form-check-input" type="checkbox" :value="skill.name" id="flexCheckDefault" />
                    <label class="form-check-label" for="flexCheckDefault"> {{ skill.name }} </label>
                    </div>
                </div>
                </div>
                <br/>
                <button type="submit" class="btn btn-primary">Добавить навыки</button>
            </div>
        </div>
    </div>
    </form>
</template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const skills = ref([]);
  const submitForm = async () => {
    await addUserSkill()
    }

  const addUserSkill = async () => {
    const skillslist = document.querySelectorAll('#skillslist');
    const skillsArray = [];
    skillslist.forEach(skill => {
      skill = skill.children[0].children[0];
      if (skill.checked) {
        skillsArray.push(skill.value);
      }
    });
    const response = await Expsys.addUserSkill(skillsArray);
    console.log(response);
  };
  </script>
  
  <style lang="scss" scoped>
  .scroll-container {
    height: 600px;
    overflow-y: scroll;
    border: 1px solid #ddd;
    padding: 10px;
  }
  .scroll-container::-webkit-scrollbar {
    width: 12px;
  }
  .scroll-container::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .scroll-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 6px;
  }
  .scroll-container::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
  </style>