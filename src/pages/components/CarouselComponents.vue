<script setup></script>

<template>
  <div class="card mb-4">
    <h4 class="mb-3">Простая карусель</h4>
    <div id="carouselExample" class="carousel slide">
      <div class="carousel-inner rounded">
        <div class="carousel-item active">
          <img src="@/assets/carousel/photo-1.png" class="d-block w-100" alt="Image" />
        </div>
        <div class="carousel-item">
          <img src="@/assets/carousel/photo-2.png" class="d-block w-100" alt="Image" />
        </div>
        <div class="carousel-item">
          <img src="@/assets/carousel/photo-3.png" class="d-block w-100" alt="Image" />
        </div>
      </div>
      <button
        class="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExample"
        data-bs-slide="prev"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Предыдущий</span>
      </button>
      <button
        class="carousel-control-next"
        type="button"
        data-bs-target="#carouselExample"
        data-bs-slide="next"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Следующий</span>
      </button>
    </div>
  </div>
  <div class="card mb-4">
    <h4 class="mb-3">Карусель с индикаторами</h4>
    <div id="carouselExampleIndicators" class="carousel slide">
      <div class="carousel-indicators">
        <button
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide-to="0"
          class="active"
          aria-current="true"
          aria-label="Slide 1"
        ></button>
        <button
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide-to="1"
          aria-label="Slide 2"
        ></button>
        <button
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide-to="2"
          aria-label="Slide 3"
        ></button>
      </div>
      <div class="carousel-inner rounded">
        <div class="carousel-item active">
          <img src="@/assets/carousel/photo-2.png" class="d-block w-100" alt="Image" />
        </div>
        <div class="carousel-item">
          <img src="@/assets/carousel/photo-3.png" class="d-block w-100" alt="Image" />
        </div>
        <div class="carousel-item">
          <img src="@/assets/carousel/photo-1.png" class="d-block w-100" alt="Image" />
        </div>
      </div>
      <button
        class="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="prev"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Предыдущий</span>
      </button>
      <button
        class="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="next"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Следующий</span>
      </button>
    </div>
  </div>
  <div class="card mb-4">
    <h4 class="mb-3">Карусель с подписями</h4>
    <div id="carouselExampleCaptions" class="carousel slide">
      <div class="carousel-indicators">
        <button
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide-to="0"
          class="active"
          aria-current="true"
          aria-label="Slide 1"
        ></button>
        <button
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide-to="1"
          aria-label="Slide 2"
        ></button>
        <button
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide-to="2"
          aria-label="Slide 3"
        ></button>
      </div>
      <div class="carousel-inner rounded">
        <div class="carousel-item active">
          <img src="@/assets/carousel/photo-3.png" class="d-block w-100" alt="Image" />
          <div class="carousel-caption d-none d-md-block">
            <h5>Метка первого слайда</h5>
            <p>Некоторый репрезентативный заполнитель для первого слайда.</p>
          </div>
        </div>
        <div class="carousel-item">
          <img src="@/assets/carousel/photo-1.png" class="d-block w-100" alt="Image" />
          <div class="carousel-caption d-none d-md-block">
            <h5>Метка второго слайда</h5>
            <p>Некоторый репрезентативный заполнитель для второго слайда.</p>
          </div>
        </div>
        <div class="carousel-item">
          <img src="@/assets/carousel/photo-2.png" class="d-block w-100" alt="Image" />
          <div class="carousel-caption d-none d-md-block">
            <h5>Метка третьего слайда</h5>
            <p>Некоторый репрезентативный заполнитель для третьего слайда.</p>
          </div>
        </div>
      </div>
      <button
        class="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="prev"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Предыдущий</span>
      </button>
      <button
        class="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="next"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Следующий</span>
      </button>
    </div>
  </div>
  <div class="card mb-4">
    <h4 class="mb-3">Карусель с плавным переходом</h4>
    <div id="carouselExampleFade" class="carousel slide carousel-fade">
      <div class="carousel-inner rounded">
        <div class="carousel-item active">
          <img src="@/assets/carousel/photo-1.png" class="d-block w-100" alt="Image" />
        </div>
        <div class="carousel-item">
          <img src="@/assets/carousel/photo-3.png" class="d-block w-100" alt="Image" />
        </div>
        <div class="carousel-item">
          <img src="@/assets/carousel/photo-2.png" class="d-block w-100" alt="Image" />
        </div>
      </div>
      <button
        class="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleFade"
        data-bs-slide="prev"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Предыдущий</span>
      </button>
      <button
        class="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleFade"
        data-bs-slide="next"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Следующий</span>
      </button>
    </div>
  </div>
  <div class="card">
    <h4 class="mb-3">Автоматическая карусель</h4>
    <div id="carouselExampleAutoplaying" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-inner rounded">
        <div class="carousel-item active">
          <img src="@/assets/carousel/photo-2.png" class="d-block w-100" alt="Image" />
        </div>
        <div class="carousel-item">
          <img src="@/assets/carousel/photo-1.png" class="d-block w-100" alt="Image" />
        </div>
        <div class="carousel-item">
          <img src="@/assets/carousel/photo-3.png" class="d-block w-100" alt="Image" />
        </div>
      </div>
      <button
        class="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleAutoplaying"
        data-bs-slide="prev"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Предыдущий</span>
      </button>
      <button
        class="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleAutoplaying"
        data-bs-slide="next"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Следующий</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
