<template>
    <div class="formula-body">
        <div class="settings-body d-flex flex-grow-1 overflow-hidden">
      <!-- Левое дерево полей -->
      <div class="settings-sidebar flex-shrink-0 me-3 d-flex flex-column">
        <input v-model="search" class="form-control form-control-sm bg-dark text-white mb-2" placeholder="Поле"/>
        <ul class="list-group list-group-flush overflow-auto flex-grow-1">
          <li v-for="fld in filteredFields" :key="fld.name" class="list-group-item bg-transparent text-white list-item-hover" @click="insertField(fld.name)">
            {{ fld.name }}
          </li>
        </ul>
      </div>

      <!-- Центр: редактор формулы -->
      <div class="settings-editor flex-grow-1">

      </div>
        </div>
    </div>
</template>

<script setup>

</script>

<style scoped lang="css">
    .formula-body{
        display: flex;
        justify-content: center;
        width: 100%;
        height: 100%;
    }
</style>