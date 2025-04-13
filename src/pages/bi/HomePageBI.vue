<template>
    <div class="homepage-bi space-y-12" style="margin-left: 5rem; margin-right: 5rem;">
      <h1 class="text-uppercase text-light m-0"
          style="font-family: 'Segoe UI', 'Inter', sans-serif; font-size: 43px; letter-spacing: 0.5px; font-weight: 700;">
        ERGO MS BI
      </h1>
        <!-- Баннер -->
      <div class="banner-wrapper" style="margin-top: 20px;">
        <div class="banner-content">
          <h2 class="text-2xl font-bold">Тариф PRO+ открывает дополнительные возможности</h2>
          <p class="text-sm text-zinc-300 mt-2">
            Статистика использования, стилизация UI, безопасное встраивание,<br>
            SLA, приоритетная поддержка и другие преимущества.
          </p>
          <div class="buttons" style="margin-top: 25px; display: flex; gap: 15px;">
            <button type="button" class="btn btn-danger">Попробовать</button>
            <button type="button" class="btn btn-outline-danger">Узнать больше</button>
          </div>
        </div>
      </div>
  
      <!-- Блоки -->
      <div style="margin-top: 30px; display: flex; gap: 20px;">
        <div style="padding: 20px; display: flex; flex-direction: column; background-color: #18181a; border-radius: 15px;"><CardModalBody :icon="Plug" title="Датасеты" description="Создавайте и управляйте моделями данных с вычисляемыми полями, фильтрами и структурой для анализа." modalId="TransactionsModal"><CardTransactions /></CardModalBody></div>
        <div style="padding: 20px; display: flex; flex-direction: column; background-color: #18181a; border-radius: 15px;"><CardModalBody :icon="Database" title="Подключения" description="Добавляйте внешние источники данных, настраивайте синхронизацию и объединяйте данные из разных систем." modalId="TransactionsModal"><CardTransactions /></CardModalBody></div>
        <div style="padding: 20px; display: flex; flex-direction: column; background-color: #18181a; border-radius: 15px;"><CardModalBody :icon="BarChart3" title="Чарты" description="Создавайте графики, таблицы и визуальные представления данных для эффективного анализа и принятия решений." modalId="TransactionsModal"><CardTransactions /></CardModalBody></div>
      </div>
    </div>    
  </template>
  
  <script setup>
    import { Plug, Database, BarChart3 } from 'lucide-vue-next'
    import CardModalBody from '@/pages/modals/CardModalBody.vue'
  </script>
  
  <style scoped lang="scss">
  .banner-wrapper {
    height: 260px;
    border-radius: 10px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0)), url('/src/assets/carousel/photo-3.png');
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    overflow: hidden;
  }
  
  .banner-content {
    color: white;
    padding-left: 30px;
    max-width: 560px;
  }
  </style>
  