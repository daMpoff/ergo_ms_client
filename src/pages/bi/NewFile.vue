<template>
    <div class="layout">
      <aside class="sidebar">
        <div class="name">
            <div class="name_container">
                <button @click="goToNewConnection" class="icon-button" title="Новое подключение"><ArrowLeft class="icon" /></button>
                <img src="/src/assets/bi/icons/folder_windows_style.svg" class="icon_name" />
                <div class="title">Файлы</div>
            </div>
        </div>
        <div class="file-upload-button">
          <div class="upload-button">
            <button class="btn btn-outline-danger">
                <Upload class="icon_upload" />
                Загрузить файл
            </button>
          </div>
        </div>
        <div class="file-list">
          
        </div>
      </aside>
  
      <header class="file_area_header">
        
      </header>
  
      <main class="file_area">
        
      </main>
    </div>
</template>
  
<script setup>
    import { useRouter } from 'vue-router'
    import { ArrowLeft, Upload } from 'lucide-vue-next'

    const router = useRouter()

    function goToNewConnection() {
        router.push('/bi/connections/new/')
    }
</script>
  
<style scoped>
* {
     margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    height: 100%;
    font-family: sans-serif;
    color: #fff;
}
  
.layout {
    display: grid;
    border-radius: 12px;
    border: 1px solid #4c4b51;
    grid-template-columns: 260px 1fr;
    grid-template-rows: 56px 1fr;
    grid-template-areas:
      "sidebar header"
      "sidebar chat";
    height: 100vh;
    background-color: transparent;
}

.sidebar {
    grid-area: sidebar;
    background-color: transparent;
    padding: 1rem;
    border-top-left-radius: 12px;
}

.file_area_header {
  position: relative;
  grid-area: header;
  background-color: #313338;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  border-bottom: none; /* убери стандартную границу */
  border-top-right-radius: 12px; /* добавь закругление */
}

.file_area_header::after {
  content: '';
  position: absolute;
  bottom: -5px; /* выстави нужный уровень */
  left: 0;
  right: 0;
  height: 1px;
  background-color: #4e5058;
}

.file_area {
    grid-area: chat;
    background-color: #313338;
    padding: 1rem;
    overflow-y: auto;
}

.icon-button {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s ease;
  border-radius: 6px;
  margin-right: 10px;
}

.icon-button:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.icon {
  width: 18px;
  height: 18px;
  color: #fff;
}

.icon_name{
    width: 32px;
    height: 32px;
    margin-right: 5px;
}

.icon_upload {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  vertical-align: middle;
}

.title{
    font-weight: bolder;
}

.name {
    font-size: 1.2rem;
    margin-inline: -1rem;
    padding-inline: 1rem;
    border-bottom: 1px solid #4e5058;
}

.name_container{
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 0.75rem;
}

.file-list {
    list-style: none;
    line-height: 1.8;
    font-size: 0.95rem;
    color: #b5bac1;
}

.file-upload-button{
    position: relative;
    margin-top: 20px;
    margin-bottom: 20px;
}

.file-upload-button::after {
  content: '';
  position: absolute;
  bottom: -20px; /* ⬅ отступ вниз от кнопки */
  left: 0;
  right: 0;
  height: 1px;
  background-color: #4e5058;
}

.btn-outline-danger{
    width: 100%;
    height: 2rem;
    border-radius: 6px;
    color: #FFFAFA;
    display: flex;
    align-items: center;
    justify-content: center;
}

</style>
  