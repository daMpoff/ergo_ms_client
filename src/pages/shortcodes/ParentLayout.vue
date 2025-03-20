<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Шорткоды, разделение по категориям -->
      <div class="col-md-2">
        <h4>Шорткоды</h4>
        <div v-for="(category, categoryIndex) in availableComponents" :key="categoryIndex">
          <h5>{{ category.name }}</h5>
          <div
            v-for="(component, index) in category.components"
            :key="index"
            class="shortcode-item"
            @click="addComponent(component)"
          >
            {{ component.label }}
          </div>
        </div>
      </div>

      <!-- Предпросмотр -->
      <div class="col-md-10">
        <h2>Предпросмотр</h2>
        <div class="preview-area p-3">
          <div
            v-for="(component, index) in selectedComponents"
            :key="index"
            class="component-wrapper"
          >
            <component :is="component.name"></component>
            <button class="btn btn-light btn-sm" @click="openSettings(index)">
              <i class="bi bi-gear-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Боковая панель настроек -->
    <div class="offcanvas offcanvas-end" tabindex="-1" id="settingsOffcanvas" aria-labelledby="settingsOffcanvasLabel">
      <div class="offcanvas-header">
        <h3 class="offcanvas-title" id="settingsOffcanvasLabel">Настройки компонента</h3>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Закрыть"></button>
      </div>
      <div class="offcanvas-body">
        <p>Настройки для компонента {{ selectedComponentIndex !== null ? selectedComponents[selectedComponentIndex].name : '' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { Offcanvas } from 'bootstrap';

const ButtonComponent = {
  template: '<button class="btn btn-primary">Кнопка</button>',
};

const ImageComponent = {
  template: '<img src="" alt="Изображение" class="img-fluid">',
};

const TextComponent = {
  template: '<p>Пример текста</p>',
};

const HeaderComponent = {
  template: `<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Link</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Dropdown
          </a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link disabled" aria-disabled="true">Disabled</a>
        </li>
      </ul>
      <form class="d-flex" role="search">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success" type="submit">Search</button>
      </form>
    </div>
  </div>
</nav>`
};

export default {
  data() {
    return {
      availableComponents: [
        {
          name: 'UI Компоненты',
          components: [
            { name: 'ButtonComponent', label: 'Кнопка' },
            { name: 'ImageComponent', label: 'Изображение' },
            { name: 'TextComponent', label: 'Текст' },
          ],
        },
        {
          name: 'Навигация',
          components: [
            { name: 'HeaderComponent', label: 'Шапка сайта' },
          ],
        },
      ],
      selectedComponents: [],
      selectedComponentIndex: null,
      settingsOffcanvas: null,
    };
  },
  components: {
    ButtonComponent,
    ImageComponent,
    TextComponent,
    HeaderComponent,
  },
  mounted() {
    this.settingsOffcanvas = new Offcanvas(document.getElementById('settingsOffcanvas'));
  },
  methods: {
    addComponent(component) {
      this.selectedComponents.push({ name: component.name });
    },
    openSettings(index) {
      this.selectedComponentIndex = index;
      this.settingsOffcanvas.show();
    },
    closeSettings() {
      this.settingsOffcanvas.hide();
    },
  },
};
</script>

<style scoped>
.shortcode-item {
  cursor: pointer;
  padding: 5px;
  border: 2px dashed #fff;
  margin-bottom: 10px;
  border-radius: 5px;
}
.shortcode-item:hover {
  background-color: #cf3230;
}
.preview-area {
  background: #fff;
  min-height: 500px;
  position: relative;
  border: 3px dashed #cf3230;
}
.component-wrapper {
  position: relative;
  margin-bottom: 15px;
}
.settings-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  height: 50px;
  width: 50px;
}
</style>
