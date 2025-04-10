<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Анализ сайта -->
      <div class="col-md-12">
        <h2 class="mb-3">SEO Анализ сайта</h2>
        <div class="preview-area p-3">
          <!-- Форма для ввода URL -->
          <div class="mb-2">
            <div class="input-group">
              <input type="url" class="form-control" style="height: 7vh" v-model="siteUrl" placeholder="Введите URL сайта (например, https://example.com)" required>
              <button class="btn mx-auto btn-primary w-auto" @click="analyzeSite">Анализировать</button>
            </div>
            <div class="form-check mt-3">
              <input class="form-check-input" type="checkbox" v-model="checkMobile" id="mobileCheck">
              <label class="form-check-label" for="mobileCheck">
                Проверить мобильную версию
              </label>
            </div>
          </div>

          <!-- Прогресс бар -->
          <div class="progress mb-4" v-if="loading">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" role="progressbar" style="width: 100%"></div>
          </div>

          <!-- Результаты анализа -->
          <div v-if="results">
            <!-- Общая сводка -->
            <div class="card mb-4">
              <div class="card-header bg-danger text-white">
                <h5 class="mb-0">Общая сводка</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4">
                    <div class="d-flex align-items-center">
                      <div class="bg-light rounded p-3 me-3">
                        <i class="bi bi-speedometer2 fs-1 text-danger"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">Общий балл</h6>
                        <h2 class="mb-0">{{ results.score }}/100</h2>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="d-flex align-items-center">
                      <div class="bg-light rounded p-3 me-3">
                        <i class="bi bi-list-check fs-1 text-danger"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">Проблемы</h6>
                        <h2 class="mb-0 text-danger">{{ results.issuesCount }}</h2>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="d-flex align-items-center">
                      <div class="bg-light rounded p-3 me-3">
                        <i class="bi bi-check-circle fs-1 text-danger"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">Рекомендации</h6>
                        <h2 class="mb-0">{{ results.recommendationsCount }}</h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Детальный отчет -->
            <div class="card mb-4">
              <div class="card-header bg-danger text-white">
                <h5 class="mb-0">Детальный отчет</h5>
              </div>
              <div class="card-body">
                <ul class="nav nav-tabs mb-4" id="seoTabs" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="technical-tab" data-bs-toggle="tab" data-bs-target="#technical" type="button" role="tab">Технические</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link" id="content-tab" data-bs-toggle="tab" data-bs-target="#content" type="button" role="tab">Контент</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link" id="links-tab" data-bs-toggle="tab" data-bs-target="#links" type="button" role="tab">Ссылки</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link" id="performance-tab" data-bs-toggle="tab" data-bs-target="#performance" type="button" role="tab">Производительность</button>
                  </li>
                </ul>

                <div class="tab-content" id="seoTabsContent">
                  <!-- Технические показатели -->
                  <div class="tab-pane fade show active" id="technical" role="tabpanel">
                    <div class="table-responsive">
                      <table class="table table-striped">
                        <thead>
                          <tr>
                            <th>Параметр</th>
                            <th>Статус</th>
                            <th>Значение</th>
                            <th>Важность</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="item in results.technical" :key="item.name">
                            <td>{{ item.name }}</td>
                            <td>
                              <span :class="`badge bg-${getStatusClass(item.status)}`">
                                {{ item.status }}
                              </span>
                            </td>
                            <td>{{ item.value }}</td>
                            <td>
                              <i class="bi" :class="`bi-${getPriorityIcon(item.priority)} text-${getPriorityClass(item.priority)}`"></i>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Контент -->
                  <div class="tab-pane fade" id="content" role="tabpanel">
                    <div class="table-responsive">
                      <table class="table table-striped">
                        <thead>
                          <tr>
                            <th>Параметр</th>
                            <th>Статус</th>
                            <th>Значение</th>
                            <th>Рекомендации</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="item in results.content" :key="item.name">
                            <td>{{ item.name }}</td>
                            <td>
                              <span :class="`badge bg-${getStatusClass(item.status)}`">
                                {{ item.status }}
                              </span>
                            </td>
                            <td>{{ item.value }}</td>
                            <td>{{ item.recommendation || '-' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Ссылки -->
                  <div class="tab-pane fade" id="links" role="tabpanel">
                    <div class="row">
                      <div class="col-md-6">
                        <h5>Внутренние ссылки</h5>
                        <ul class="list-group mb-4">
                          <li class="list-group-item d-flex justify-content-between align-items-center" v-for="link in results.links.internal" :key="link.url">
                            {{ truncate(link.url, 40) }}
                            <span class="badge bg-primary rounded-pill">{{ link.count }}</span>
                          </li>
                        </ul>
                      </div>
                      <div class="col-md-6">
                        <h5>Внешние ссылки</h5>
                        <ul class="list-group">
                          <li class="list-group-item d-flex justify-content-between align-items-center" v-for="link in results.links.external" :key="link.url">
                            {{ truncate(link.url, 40) }}
                            <span class="badge bg-primary rounded-pill">{{ link.count }}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- Производительность -->
                  <div class="tab-pane fade" id="performance" role="tabpanel">
                    <div class="row mb-4">
                      <div class="col-md-6">
                        <h5>Время загрузки</h5>
                        <div class="chart-container">
                          <canvas id="performanceChart"></canvas>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <h5>Рекомендации по скорости</h5>
                        <div class="list-group">
                          <a href="#" class="list-group-item list-group-item-action" v-for="(tip, index) in results.performance.tips" :key="index">
                            <div class="d-flex w-100 justify-content-between">
                              <h6 class="mb-1">{{ tip.title }}</h6>
                              <small class="text-danger">{{ tip.priority }}</small>
                            </div>
                            <p class="mb-1">{{ tip.description }}</p>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Кнопки экспорта -->
            <div class="d-flex justify-content-end mb-4">
              <button class="btn btn-outline-danger me-2" @click="exportToPDF">
                <i class="bi bi-file-earmark-pdf me-1"></i> Экспорт в PDF
              </button>
              <button class="btn btn-outline-danger" @click="exportToCSV">
                <i class="bi bi-file-earmark-excel me-1"></i> Экспорт в CSV
              </button>
            </div>
          </div>

          <!-- Сообщение, если анализ не проводился -->
          <div class="text-center py-5" v-if="!results && !loading">
            <i class="bi bi-search fs-1"></i>
            <h4 class="mt-3">Введите URL сайта для проведения SEO анализа</h4>
            <p>Мы проверим технические параметры, контент, ссылки и производительность вашего сайта</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      siteUrl: '',
      checkMobile: false,
      loading: false,
      results: null,
      sampleResults: {
        score: 72,
        issuesCount: 8,
        recommendationsCount: 15,
        technical: [
          { name: 'Индексация сайта', status: 'OK', value: 'Разрешена', priority: 'high' },
          { name: 'SSL сертификат', status: 'OK', value: 'Установлен', priority: 'high' },
          { name: 'ЧПУ URL', status: 'Warning', value: 'Некоторые URL не оптимизированы', priority: 'medium' },
          { name: 'Фавикон', status: 'Error', value: 'Отсутствует', priority: 'low' },
        ],
        content: [
          { name: 'Title страницы', status: 'OK', value: 'Оптимальная длина', recommendation: '' },
          { name: 'Meta Description', status: 'Warning', value: 'Слишком короткий', recommendation: 'Увеличить до 120-160 символов' },
          { name: 'H1 заголовок', status: 'Error', value: 'Отсутствует', recommendation: 'Добавить H1 заголовок' },
        ],
        links: {
          internal: [
            { url: '/about', count: 12 },
            { url: '/contact', count: 8 },
          ],
          external: [
            { url: 'https://facebook.com', count: 2 },
            { url: 'https://twitter.com', count: 1 },
          ]
        },
        performance: {
          loadTime: 2.4,
          tips: [
            { title: 'Оптимизировать изображения', description: '35% изображений можно сжать без потери качества', priority: 'Высокая' },
            { title: 'Включить кэширование', description: 'Кэширование статических ресурсов не настроено', priority: 'Средняя' },
          ]
        }
      }
    }
  },
  methods: {
    analyzeSite() {
      if (!this.siteUrl) return;

      this.loading = true;
      //запрос к API
      setTimeout(() => {
        this.results = this.sampleResults;
        this.loading = false;
        this.renderChart();
      }, 2000);
    },
    getStatusClass(status) {
      switch(status.toLowerCase()) {
        case 'ok': return 'success';
        case 'warning': return 'warning';
        case 'error': return 'danger';
        default: return 'secondary';
      }
    },
    getPriorityClass(priority) {
      switch(priority.toLowerCase()) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'secondary';
      }
    },
    getPriorityIcon(priority) {
      switch(priority.toLowerCase()) {
        case 'high': return 'exclamation-triangle-fill';
        case 'medium': return 'exclamation-circle-fill';
        case 'low': return 'info-circle-fill';
        default: return 'question-circle-fill';
      }
    },
    truncate(text, length) {
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    renderChart() {
      //можно использовать chart.js
      console.log('Вывод графиков');
    },
    exportToPDF() {
      alert('Функция экспорта в PDF будет реализована');
    },
    exportToCSV() {
      alert('Функция экспорта в CSV будет реализована');
    }
  }
}
</script>

<style scoped>
.preview-area {
  background: #fff;
  min-height: 500px;
  position: relative;
  /*border: 5px dashed #cf3230*/;
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
.chart-container {
  position: relative;
  height: 250px;
}
.nav-tabs .nav-link {
  color: #495057;
  font-weight: 500;
}
.nav-tabs .nav-link.active {
  color: #cf3230;
  font-weight: bold;
  border-bottom: 3px solid #cf3230;
}
</style>
