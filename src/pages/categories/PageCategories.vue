<template>
  <div class="categories-card min-vh-100 d-flex align-items-center">
    <div class="container pt-3">
      <div class="fancy-title mx-auto">Управление категориями и тегами</div>

      <div class="main-card mx-auto">
        <div class="main-card-header">
          <component :is="Tag" size="36" class="main-card-icon" />
          <div class="main-card-title">Менеджер</div>
        </div>
        <div class="row gx-4 gy-4 mt-1">
          <div class="col-12 col-md-6">
            <div class="section-card" @click="navigateTo('/shortcodes/categories-list')">
              <component :is="Tag" size="28" class="section-icon text-success" />
              <div class="section-content">
                <div class="section-title">Менеджер категорий</div>
                <div class="section-desc">Создавайте, редактируйте и удаляйте категории</div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="section-card" @click="navigateTo('/shortcodes/tags-list')">
              <component :is="Grid2x2" size="28" class="section-icon text-primary" />
              <div class="section-content">
                <div class="section-title">Менеджер тегов</div>
                <div class="section-desc">Управляйте тегами для быстрого поиска</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Tag, Grid2x2 } from 'lucide-vue-next'

const router = useRouter()
const navigateTo = (route) => router.push(route)
</script>

<style scoped>
.categories-card {
  background: #f4f6f9;
}
.fancy-title {
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 2.2rem;
  font-weight: 600;
  color: #212529;
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  display: inline-block;
}
.fancy-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 4px;
  background-color: var(--bs-primary);
  border-radius: 2px;
}

.main-card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 6px 24px rgba(0,0,0,0.11);
  padding: 3rem 3rem 2rem 3rem;
  max-width: 900px;
  margin: 0 auto;
}

.main-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}
.main-card-icon {
  background: #eaf0fc;
  border-radius: 50%;
  margin-right: 1.2rem;
  padding: 0.7rem;
}
.main-card-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a233a;
}
.section-card {
  display: flex;
  align-items: center;
  padding: 2.2rem 2rem;
  min-height: 180px;
  background: #f9fafd;
  border-radius: 1.2rem;
  box-shadow: 0 2px 8px rgba(50,80,180,0.03);
  cursor: pointer;
  transition: box-shadow 0.22s, transform 0.22s;
  border-left: 5px solid var(--bs-primary);
  margin-bottom: 1rem;
}
.section-card:hover {
  box-shadow: 0 8px 24px rgba(30,80,180,0.11);
  transform: translateY(-4px) scale(1.03);
  border-left-width: 8px;
}
.section-icon {
  margin-right: 1.5rem;
  font-size: 2rem;
}
.section-title {
  font-size: 1.32rem;
  font-weight: 600;
  color: #253152;
}
.section-desc {
  font-size: 1.12rem;
  color: #627083;
  margin-top: 0.3rem;
}
</style>
