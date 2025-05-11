<template>
  <div class="container mt-5">
    <h1 class="text-center mb-5">Система подбора вакансий</h1>
    <div class="row justify-content-center gy-4">
      <div class="col-12 col-md-5">
        <div class="card border-secondary shadow-sm pointer" @click="select('Components')">
          <div class="card-body d-flex justify-content-center align-items-center">
            <h2 class="card-title text-secondary mb-0">Студент/Выпускник</h2>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-5">
        <div class="card border-secondary shadow-sm pointer" @click="select('employer')">
          <div class="card-body d-flex justify-content-center align-items-center">
            <h2 class="card-title text-secondary mb-0">Работодатель</h2>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  methods: {
    select(role) {
      console.log('Выбран:', role)
      this.$router.push({ name: role })
    },
  },
}
</script>

<style scoped>
.pointer {
  cursor: pointer;
  transition:
    transform 0.1s ease-in-out,
    box-shadow 0.2s;
}
.pointer:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}
.card {
  min-height: 200px;
}
.card-title {
  font-size: 1.75rem;
}
</style>
