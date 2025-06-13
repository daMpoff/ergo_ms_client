<template>
  <ul class="list-group ms-3">
    <li v-for="cat in categories" :key="cat.id" class="list-group-item">
      <div class="d-flex align-items-center">
        <span class="me-2">{{ cat.name }}</span>
        <button class="btn btn-sm btn-outline-success ms-1" @click="$emit('add', cat.id)">Добавить подкатегорию</button>
        <button class="btn btn-sm btn-outline-primary ms-1" @click="$emit('edit', cat)">Редактировать</button>
        <button class="btn btn-sm btn-outline-danger ms-1" @click="$emit('delete', cat)">Удалить</button>
      </div>
      <!-- Показываем вложенные подкатегории -->
      <CategoryTree
        v-if="cat.children && cat.children.length"
        :categories="cat.children"
        @add="$emit('add', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </li>
  </ul>
</template>

<script setup>
defineProps({
  categories: { type: Array, required: true }
})
</script>
