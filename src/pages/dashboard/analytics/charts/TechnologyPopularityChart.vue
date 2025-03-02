<template>
    <div class="chart-container">
      <h2>Популярность технологий</h2>
      <apexchart
        v-if="popularitySeries.length"
        type="line"
        :options="lineOptions"
        :series="lineSeries"
        width="100%"
        height="320"
      ></apexchart>
      <p v-else>Загрузка данных...</p>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue";
  
  const color = "#d0322d"; // Основной цвет графика
  const name = "Популярность технологий"; // Название графика
  const popularitySeries = ref([]); // Данные графика
  const categories = ref([]); // Названия технологий для оси X
  
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
  
  onMounted(fetchData);
  
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
        color
      }
    },
    colors: [color],
    stroke: {
      width: 4,
      curve: "smooth"
    },
    markers: {
      size: 6,
      colors: ["#ffffff"],
      strokeColors: color,
      strokeWidth: 3,
      hover: { size: 8 }
    },
    tooltip: {
      theme: "light",
      x: { show: false },
      marker: { show: false },
      y: {
        formatter: (val) => `${val}%`
      }
    },
    grid: {
      borderColor: "#ddd",
      strokeDashArray: 4,
      padding: { top: 10, left: 15, right: 15, bottom: 10 }
    },
    xaxis: {
      categories: categories.value,
      labels: {
        style: {
          colors: "#777",
          fontSize: "12px"
        }
      },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: {
        style: {
          colors: "#777",
          fontSize: "12px"
        }
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        gradientToColors: ["#71C9CE"],
        opacityFrom: 0.8,
        opacityTo: 0.3,
        stops: [0, 100]
      }
    }
  }));
  </script>
  
  <style scoped>
  .chart-container {
    max-width: 850px;
    margin: auto;
    text-align: center;
    background: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  }
  h2 {
    font-size: 20px;
    color: #333;
    margin-bottom: 10px;
  }
  </style>
  