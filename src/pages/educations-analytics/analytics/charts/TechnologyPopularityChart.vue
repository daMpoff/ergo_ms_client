<template>
  <div class="chart-container">
    <h2>Популярность технологий</h2>
    <apexchart
      v-if="popularitySeries.length"
      type="line"
      :options="lineOptions"
      :series="lineSeries"
      :width="chartWidth"
      :height="chartHeight"
    ></apexchart>
    <p v-else>Загрузка данных...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const color = "var(--color-accent)"; // Основной цвет графика
const name = "Популярность технологий"; // Название графика
const popularitySeries = ref([]); // Данные графика
const categories = ref([]); // Названия технологий для оси X

// Адаптивная ширина и высота графика
const chartWidth = ref("100%");
const chartHeight = ref("400");

// Функция для обновления размеров графика
const updateChartSize = () => {
  if (window.innerWidth < 768) {
    chartWidth.value = "100%";
    chartHeight.value = "300"; // Уменьшаем высоту на мобильных устройствах
  } else {
    chartWidth.value = "100%";
    chartHeight.value = "400"; // Стандартная высота на десктопах
  }
};

// Запрос данных
const fetchData = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/learning_analytics/technologies/");
    const result = await response.json();
    popularitySeries.value = result.data.map((tech) => tech.popularity);
    categories.value = result.data.map((tech) => tech.name);
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  }
};

onMounted(() => {
  fetchData();
  updateChartSize();
  window.addEventListener("resize", updateChartSize); // Следим за изменением размера окна
});

onUnmounted(() => {
  window.removeEventListener("resize", updateChartSize); // Убираем слушатель при уничтожении компонента
});

// Данные графика
const lineSeries = computed(() => [{ name, data: popularitySeries.value }]);

// Опции графика
const lineOptions = computed(() => ({
  chart: {
    parentHeightOffset: 0,
    toolbar: { show: false },
    animations: { enabled: true, easing: "easeinout", speed: 800 },
    background: "transparent",
    dropShadow: {
      enabled: true,
      top: 10,
      left: 0,
      blur: 6,
      opacity: 0.5,
      color,
    },
  },
  colors: [color],
  stroke: {
    width: 4,
    curve: "smooth",
  },
  markers: {
    size: 6,
    colors: ["var(--color-secondary-background)"], // Цвет маркеров
    strokeColors: color, // Цвет обводки маркеров
    strokeWidth: 3,
    hover: { size: 8 },
  },
  tooltip: {
    theme: "light",
    x: { show: false },
    marker: { show: false },
    y: {
      formatter: (val) => `${val}%`,
    },
  },
  grid: {
    borderColor: "var(--color-border)", // Цвет сетки
    strokeDashArray: 4,
    padding: { top: 10, left: 15, right: 15, bottom: 10 },
  },
  xaxis: {
    categories: categories.value,
    labels: {
      style: {
        colors: "var(--color-secondary-text)", // Цвет текста оси X
        fontSize: window.innerWidth < 768 ? "10px" : "12px", // Меньше шрифт на мобильных
      },
    },
    axisTicks: { show: false },
    axisBorder: { show: false },
  },
  yaxis: {
    labels: {
      style: {
        colors: "var(--color-secondary-text)", // Цвет текста оси Y
        fontSize: window.innerWidth < 768 ? "10px" : "12px", // Меньше шрифт на мобильных
      },
    },
  },
  fill: {
    type: "solid", // Однотонная заливка
    colors: [color], // Используем акцентный цвет
    opacity: 0.2, // Прозрачность заливки
  },
}));
</script>

<style scoped>
:root {
  --color-accent: #d0322d; /* Акцентный цвет (красный) */
  --color-accent-light: #f8d7da; /* Светлый акцентный цвет */
  --color-primary-background: #f8f9fa; /* Основной фон */
  --color-secondary-background: #ffffff; /* Вторичный фон */
  --color-primary-text: #333; /* Основной текст */
  --color-secondary-text: #777; /* Вторичный текст */
  --color-border: #ddd; /* Цвет границ */
}

.chart-container {
  max-width: 850px;
  margin: auto;
  text-align: center;
  background: var(--color-primary-background);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: clamp(18px, 4vw, 24px); /* Адаптивный размер шрифта */
  color: var(--color-primary-text);
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .chart-container {
    padding: 15px; /* Меньше отступы на мобильных устройствах */
  }
}
</style>