<template>
    <div class="file-item" @mouseleave="showMenu = false">
      <img src="@/assets/bi/icons/folder_windows_style.svg" class="file-icon" />
      <span class="file-name" :title="file.name">{{ file.name }}</span>
  
      <div class="relative">
        <button class="file-menu" @click="toggleMenu">
          <MoreHorizontal class="menu-icon" />
        </button>
        <div v-if="showMenu" class="menu-dropdown">
          <div class="menu-item" @click="$emit('replace', file)">Заменить</div>
          <div class="menu-item" @click="$emit('rename', file)">Переименовать</div>
          <div class="menu-item danger" @click="$emit('delete', file)">Удалить</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { MoreHorizontal } from 'lucide-vue-next'
  
  defineProps({ file: Object })
  
  const showMenu = ref(false)
  const toggleMenu = () => {
    showMenu.value = !showMenu.value
  }
  </script>
  
  <style scoped>
  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 6px;
    min-height: 40px;
    transition: background 0.2s ease;
    cursor: pointer;
    position: relative;
  }
  
  .file-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .file-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }
  
  .file-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .file-menu {
  background: transparent;
  border: none;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s ease;
  margin-left: 4px;
  cursor: pointer;
}

  .file-menu:hover {
  background-color: rgba(255, 255, 255, 0.07); /* светлый фон при наведении */
}
  
  .menu-icon {
    width: 18px;
    height: 18px;
    color: #b5bac1;
  }
  
  .relative {
    position: relative;
  }
  
  .menu-dropdown {
  position: absolute;
  top: 28px;
  right: 0;
  background-color: #2e2f35;
  border: 1px solid #4e5058;
  border-radius: 6px;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  min-width: 120px; /* уменьшено с 150 */
  padding: 2px 0; /* компактнее */
}

.menu-item {
  padding: 6px 10px; /* уменьшено с 8px 16px */
  font-size: 0.85rem; /* чуть меньше */
  color: #e4e4e7;
  cursor: pointer;
  transition: background 0.15s ease;
  line-height: 1.2;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.menu-item.danger {
  color: #f87171;
}
  </style>