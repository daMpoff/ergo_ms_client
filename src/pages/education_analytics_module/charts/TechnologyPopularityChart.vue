<template>
  <div class="chart-container">
    <h2>Популярность технологий</h2>
    <apexchart
      v-if="popularitySeries.length"
      type="area"
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
import { endpoints } from '@/js/api/endpoints'
import { apiClient } from '@/js/api/manager'
const color = "var(--color-accent)";
const popularitySeries = ref([]);
const ratingSeries = ref([]);
const categories = ref([]);

const chartWidth = ref("100%");
const chartHeight = ref("400");

const updateChartSize = () => {
  if (window.innerWidth < 768) {
    chartWidth.value = "100%";
    chartHeight.value = "300";
  } else {
    chartWidth.value = "100%";
    chartHeight.value = "400";
  }
};

const fetchData = async () => {
  try {
    const response = await apiClient.get(endpoints.learning_analytics.technologies.get);
    const techs = Array.isArray(response.data?.data) ? response.data.data : [];
    if (techs.length) {
      // Без ограничения: выводим все технологии
      const sorted = [...techs].sort((a, b) => b.popularity - a.popularity);
      popularitySeries.value = sorted.map((tech) => Number(tech.popularity));
      ratingSeries.value = sorted.map((tech) => Number(tech.rating));
      categories.value = sorted.map((tech) => tech.name);
    } else {
      popularitySeries.value = [];
      ratingSeries.value = [];
      categories.value = [];
    }
  } catch {
    popularitySeries.value = [];
    ratingSeries.value = [];
    categories.value = [];
  }
};

onMounted(() => {
  fetchData();
  updateChartSize();
  window.addEventListener("resize", updateChartSize);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateChartSize);
});


const zoomed = ref(false);

const minPopularity = computed(() =>
  popularitySeries.value.length ? Math.min(...popularitySeries.value) : 0
);
const maxPopularity = computed(() =>
  popularitySeries.value.length ? Math.max(...popularitySeries.value) : 100
);
const minRating = computed(() =>
  ratingSeries.value.length ? Math.min(...ratingSeries.value) : 0
);
const maxRating = computed(() =>
  ratingSeries.value.length ? Math.max(...ratingSeries.value) : 5
);

const lineSeries = computed(() => [
  {
    name: "Популярность, %",
    type: 'line',
    data: popularitySeries.value,
  },
  {
    name: "Рейтинг",
    type: 'line',
    data: ratingSeries.value,
  }
]);

const lineOptions = computed(() => ({
  chart: {
    parentHeightOffset: 0,
    toolbar: { show: false },
    background: "transparent",
    animations: { enabled: true, easing: "easeinout", speed: 900 },
    fontFamily: 'Inter, Arial, sans-serif',
    stacked: false,
    zoom: {
      enabled: true,
      type: 'x',
      autoScaleYaxis: true,
      resetIcon: {
        offsetX: 0,
        offsetY: 0,
        fillColor: '#fff',
        strokeColor: '#374151',
      },
      selection: {
        enabled: true,
        fill: {
          color: '#d0322d',
          opacity: 0.15
        },
        stroke: {
          color: '#d0322d',
          opacity: 0.4,
          width: 2
        }
      }
    },
    events: {
      zoomed() {
        zoomed.value = true;
      },
      beforeResetZoom() {
        zoomed.value = false;
      }
    },
    sparkline: { enabled: false },
  },
  colors: [color, '#00b894'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 4,
    curve: "smooth",
    lineCap: 'round',
  },
  markers: {
    size: 0, // отключаем точки на кривых
    colors: [color, '#00b894'],
    strokeColors: [color, '#00b894'],
    strokeWidth: 3,
    hover: { size: 0 },
  },
  tooltip: {
    theme: "light",
    shared: true,
    x: { show: true },
    custom: ({series, dataPointIndex, w}) => {
      const name = categories.value[dataPointIndex];
      return `
        <div style='padding:14px 18px; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px #0001; min-width:200px;'>
          <div style='font-size:1.08em; font-weight:700; color:#222; margin-bottom:4px;'>${name}</div>
          <div style='display:flex; align-items:center; gap:8px;'>
            <span style='display:inline-block;width:12px;height:12px;border-radius:50%;background:#d0322d;'></span>
            <span style='color:#d0322d;'>Популярность:</span>
            <b style='margin-left:2px; color:#111; font-size:1.13em;'>${series[0][dataPointIndex]}%</b>
          </div>
          <div style='display:flex; align-items:center; gap:8px; margin-top:2px;'>
            <span style='display:inline-block;width:12px;height:12px;border-radius:50%;background:#00b894;'></span>
            <span style='color:#00b894;'>Рейтинг:</span>
            <b style='margin-left:2px; color:#111; font-size:1.13em;'>${series[1][dataPointIndex]}★</b>
          </div>
        </div>
      `;
    }
  },
  grid: {
    borderColor: "var(--color-border)",
    strokeDashArray: 2,
    padding: { top: 10, left: 10, right: 10, bottom: 10 },
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    categories: categories.value,
    tickPlacement: 'on',
    labels: {
      style: {
        colors: "var(--color-secondary-text)",
        fontSize: window.innerWidth < 768 ? "6px" : "8px",
        fontWeight: 700,
        lineHeight: 1.4,
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        padding: '0 8px',
      },
      rotate: -30,
      trim: false,
      minHeight: 50,
      maxHeight: 140,
      hideOverlappingLabels: false,
      showDuplicates: true,
      formatter: (val) => val,
      tooltip: { enabled: true, offsetY: 10, style: { fontWeight: 700 } },
    },
    axisTicks: { show: false },
    axisBorder: { show: false },
    tooltip: { enabled: true },
  },
  yaxis: [
    {
      title: { text: undefined },
      labels: {
        style: {
          colors: "var(--color-secondary-text)",
          fontSize: window.innerWidth < 768 ? "12px" : "14px",
        },
      },
      min: minPopularity.value,
      max: maxPopularity.value,
      tickAmount: 5,
    },
    {
      opposite: true,
      title: { text: undefined },
      labels: {
        style: {
          colors: "#00b894",
          fontSize: window.innerWidth < 768 ? "12px" : "14px",
        },
      },
      min: minRating.value,
      max: maxRating.value,
      tickAmount: 5,
    }
  ],
  legend: {
    show: true,
    position: 'top',
    fontSize: '17px',
    fontWeight: 700,
    labels: { colors: '#222', useSeriesColors: true },
    markers: { width: 18, height: 18, strokeWidth: 2 }, // стандартные маркеры ApexCharts
    itemMargin: { horizontal: 22, vertical: 0 },
    containerMargin: { left: 0, top: 10 },
    onItemClick: { toggleDataSeries: true },
    onItemHover: { highlightDataSeries: true },
    formatter: undefined, // убираем кастомный HTML, используем стандартную легенду
  },
}));
</script>

<style scoped>
:root {
  --color-accent: #d0322d;
  --color-accent-light: #f8d7da;
  --color-primary-background: #f8f9fa;
  --color-secondary-background: #ffffff;
  --color-primary-text: #333;
  --color-secondary-text: #777;
  --color-border: #ddd;
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
  font-size: clamp(18px, 4vw, 24px);
  color: var(--color-primary-text);
  margin-bottom: 10px;
}
@media (max-width: 768px) {
  .chart-container {
    padding: 15px;
  }
}
</style>