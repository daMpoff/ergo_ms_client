<template>
  <div class="porosity-analysis-main">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <!-- Заголовок в едином стиле -->
          <div class="page-header">
            <div class="header-content">
              <div class="page-title-section">
                <div class="page-icon">
                  <Microscope :size="28" color="white" />
                </div>
                <div class="page-title">
                  <h1>Анализ пористости</h1>
                  <p class="page-subtitle">Создание анализов и загрузка изображений для обработки</p>
                </div>
              </div>
            </div>
            
          </div>
          
          <!-- Статистика в едином стиле -->
          <div class="row g-4 mb-4">
            <div class="col-xl-3 col-md-6">
              <div class="statistics-card card-primary">
                <div class="card-content">
                  <div class="card-icon">
                    <BarChart3 :size="24" />
                  </div>
                  <div class="card-info">
                    <h6 class="card-subtitle">Всего анализов</h6>
                    <h3 class="card-value">{{ totalAnalyses }}</h3>
                    <div class="card-progress">
                      <div class="progress">
                        <div class="progress-bar bg-primary" style="width: 100%"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-3 col-md-6" v-for="(count, key) in statsByStatus" :key="key">
              <div class="statistics-card" :class="getStatusCardClass(key)">
                <div class="card-content">
                  <div class="card-icon">
                    <component :is="getStatusIcon(key)" :size="24" />
                  </div>
                  <div class="card-info">
                    <h6 class="card-subtitle">{{ getStatusLabel(key) }}</h6>
                    <h3 class="card-value">{{ count }}</h3>
                    <div class="card-progress">
                      <div class="progress">
                        <div class="progress-bar" :class="getStatusProgressClass(key)" :style="`width: ${getPercentage(count)}%`"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Создание анализа с массовой загрузкой -->
          <div class="row g-4">
            <div class="col-12">
              <div class="card h-100 shadow-sm border-0">
                <div class="card-header">
                  <div class="card-icon">
                    <Plus :size="20" />
                  </div>
                  <div class="card-title">
                    <h3>Создать анализ</h3>
                    <p>Название, параметры и массовая загрузка исходных изображений</p>
                  </div>
                </div>
                <div class="card-body p-4">
                  <form @submit.prevent="createAnalyses">
                    <div class="row g-4">
                      <div class="col-lg-7">
                        <div class="mb-3">
                          <label for="analysisName" class="form-label fw-bold">Название анализа</label>
                          <input
                            type="text"
                            class="form-control form-control-lg"
                            id="analysisName"
                            v-model="newAnalysis.name"
                            required
                            placeholder="Введите название анализа"
                          />
                        </div>

                        <div class="mb-3">
                          <label for="analysisDescription" class="form-label fw-bold">Описание</label>
                          <textarea
                            class="form-control"
                            id="analysisDescription"
                            v-model="newAnalysis.description"
                            rows="4"
                            placeholder="Подробное описание анализа"
                          ></textarea>
                        </div>

                        <div class="row g-3">
                          <div class="col-md-6">
                            <label for="scaleValue" class="form-label fw-bold">Масштаб</label>
                            <div class="input-group">
                              <input
                                type="number"
                                class="form-control"
                                id="scaleValue"
                                v-model="newAnalysis.scale_value"
                                step="0.01"
                                min="0"
                                placeholder="100.0"
                              />
                              <span class="input-group-text">мкм/пиксель</span>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <label for="pixelsPerMicron" class="form-label fw-bold">Разрешение</label>
                            <div class="input-group">
                              <input
                                type="number"
                                class="form-control"
                                id="pixelsPerMicron"
                                v-model="newAnalysis.pixels_per_micron"
                                step="0.01"
                                min="0"
                                placeholder="1.0"
                              />
                              <span class="input-group-text">пикс/мкм</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="col-lg-5">
                        <label class="form-label fw-bold d-block">Изображения для анализа</label>
                        <div
                          class="upload-area d-flex flex-column align-items-center justify-content-center"
                          :class="{ dragover: dragActive }"
                          @dragenter.prevent="onDragEnter"
                          @dragover.prevent="onDragOver"
                          @dragleave.prevent="onDragLeave"
                          @drop.prevent="onDropFiles"
                          @click="openFileDialog"
                          role="button"
                          tabindex="0"
                        >
                          <div class="mb-2 d-flex align-items-center justify-content-center">
                            <Upload :size="28" />
                          </div>
                          <div class="text-center">
                            <div class="fw-semibold">Перетащите файлы сюда</div>
                            <small class="text-muted">или</small>
                            <div>
                              <button type="button" class="btn btn-sm btn-outline-primary mt-2" @click.stop="openFileDialog">Выбрать файлы</button>
                            </div>
                            <small class="text-muted d-block mt-2">PNG, JPG, JPEG • можно несколько</small>
                          </div>
                          <input
                            type="file"
                            class="d-none"
                            id="analysisImage"
                            @change="handleAnalysisImageUpload"
                            accept="image/*"
                            multiple
                            ref="analysisImageInput"
                          />
                        </div>

                        <div v-if="selectedAnalysisImages.length > 0" class="mt-3">
                          <h6 class="fw-bold mb-2">Выбрано файлов: {{ selectedAnalysisImages.length }}</h6>
                          <div class="selected-files">
                            <div
                              v-for="(file, index) in selectedAnalysisImages"
                              :key="index"
                              class="file-item d-flex justify-content-between align-items-center p-2 border rounded mb-2"
                            >
                              <div class="d-flex align-items-center">
                                <Image :size="16" class="text-primary me-2" />
                                <span class="text-truncate">{{ file.name }}</span>
                              </div>
                              <button
                                type="button"
                                class="btn btn-sm btn-outline-danger"
                                @click="removeSelectedImage(index)"
                                title="Удалить файл из списка"
                              >
                                <X :size="14" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <button type="submit" class="btn btn-primary btn-lg w-100 mt-3" :disabled="isCreating || selectedAnalysisImages.length === 0">
                          <Plus :size="16" />
                          <span>
                            {{ isCreating 
                              ? 'Создание...'
                              : (selectedAnalysisImages.length === 1 ? 'Создать анализ' : `Создать ${selectedAnalysisImages.length} анализов`) }}
                          </span>
                        </button>

                        <div v-if="isCreating" class="mt-3">
                          <div class="d-flex justify-content-between mb-1">
                            <small class="text-muted">Прогресс</small>
                            <small class="text-muted">{{ bulkProgress.processed }} / {{ bulkProgress.total }}</small>
                          </div>
                          <div class="progress" style="height: 8px;">
                            <div class="progress-bar bg-primary" role="progressbar" :style="`width: ${bulkProgressPercent}%`"></div>
                          </div>
                          <div class="d-flex justify-content-between mt-2">
                            <small class="text-success">Успешно: {{ bulkProgress.success }}</small>
                            <small class="text-danger">Ошибки: {{ bulkProgress.failed }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { porosityAnalysisAPI } from './js/porosity-analysis.js'
import { useToast } from 'vue-toastification'
import { Microscope, List, Plus, Upload, Image, X, BarChart3, Clock, Loader2, CheckCircle, AlertTriangle } from 'lucide-vue-next'

const toast = useToast()

export default {
  components: {
    Microscope,
    List,
    Plus,
    Upload,
    Image,
    X,
    BarChart3
  },
  name: 'PorosityAnalysisMainPage',
  data() {
    return {
      newAnalysis: {
        name: '',
        description: '',
        scale_value: 100,  // Стандартное значение шкалы 100 мкм
        pixels_per_micron: null
      },
      selectedAnalysisImages: [],
      isCreating: false,
      dragActive: false,
      // Прогресс массовой загрузки
      bulkProgress: { total: 0, processed: 0, success: 0, failed: 0 },
      concurrencyLimit: 5,
      stats: {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
      }
    }
  },
  async mounted() {
    await this.loadStats()
  },
  methods: {
    openFileDialog() {
      if (this.$refs.analysisImageInput) {
        this.$refs.analysisImageInput.click()
      }
    },
    onDragEnter() {
      this.dragActive = true
    },
    onDragOver() {
      this.dragActive = true
    },
    onDragLeave() {
      this.dragActive = false
    },
    onDropFiles(event) {
      try {
        const dt = event.dataTransfer
        if (!dt || !dt.files || dt.files.length === 0) return
        const eventLike = { target: { files: dt.files } }
        this.handleAnalysisImageUpload(eventLike)
      } finally {
        this.dragActive = false
      }
    },
    handleAnalysisImageUpload(event) {
      const newFiles = Array.from(event.target.files || [])
      const merged = [...this.selectedAnalysisImages, ...newFiles]
      // Удаляем дубликаты по ключу (name + size + lastModified)
      const seen = new Set()
      const unique = []
      for (const f of merged) {
        const key = `${f.name}__${f.size}__${f.lastModified}`
        if (!seen.has(key)) {
          seen.add(key)
          unique.push(f)
        }
      }
      this.selectedAnalysisImages = unique
      // Сбрасываем значение инпута, чтобы можно было выбрать те же имена снова (если другие файлы)
      if (this.$refs.analysisImageInput) {
        this.$refs.analysisImageInput.value = ''
      }
    },
    
    async createAnalyses() {
      const files = this.selectedAnalysisImages
      if (!files || files.length === 0) return
      this.isCreating = true
      this.bulkProgress = { total: files.length, processed: 0, success: 0, failed: 0 }
      const concurrency = Math.max(1, this.concurrencyLimit)

      const fileQueue = files.slice()

      const worker = async () => {
        while (fileQueue.length > 0) {
          const file = fileQueue.shift()
          try {
            const analysisPayload = {
              name: this.newAnalysis.name ? `${this.newAnalysis.name} — ${file.name.replace(/\.[^/.]+$/, '')}` : `Анализ ${file.name.replace(/\.[^/.]+$/, '')}`,
              description: this.newAnalysis.description || `Автоматически созданный анализ для файла ${file.name}`,
              scale_value: this.newAnalysis.scale_value,
              pixels_per_micron: this.newAnalysis.pixels_per_micron
            }
            const createResp = await porosityAnalysisAPI.createAnalysis(analysisPayload)
            if (!(createResp && createResp.success)) throw new Error(createResp?.message || 'Не удалось создать анализ')
            let analysisId = null
            if (createResp.data && typeof createResp.data === 'object') analysisId = createResp.data.id
            else if (typeof createResp.data === 'number') analysisId = createResp.data
            if (!analysisId) throw new Error('ID анализа не получен')
            const uploadResp = await porosityAnalysisAPI.uploadImage(analysisId, file)
            if (!(uploadResp && uploadResp.success)) throw new Error(uploadResp?.message || 'Ошибка загрузки изображения')
            this.bulkProgress.success += 1
          } catch (e) {
            this.bulkProgress.failed += 1
          } finally {
            this.bulkProgress.processed += 1
          }
        }
      }

      const workers = Array.from({ length: Math.min(concurrency, files.length) }, () => worker())
      await Promise.all(workers)

      if (this.bulkProgress.success > 0 && this.bulkProgress.failed === 0) {
        toast.success(`Создано ${this.bulkProgress.success} анализов`)
      } else if (this.bulkProgress.success > 0 && this.bulkProgress.failed > 0) {
        toast.warning(`Создано ${this.bulkProgress.success}, ошибок: ${this.bulkProgress.failed}`)
      } else {
        toast.error('Не удалось создать анализы')
      }

      this.resetForm()
      this.$router.push('/porosity-analysis/analyses')
      this.isCreating = false
    },

    removeSelectedImage(index) {
      if (index >= 0 && index < this.selectedAnalysisImages.length) {
        this.selectedAnalysisImages.splice(index, 1)
      }
    },
    
    resetForm() {
      this.newAnalysis = {
        name: '',
        description: '',
        scale_value: 100,  // Стандартное значение шкалы 100 мкм
        pixels_per_micron: null
      }
      this.selectedAnalysisImages = []
      if (this.$refs.analysisImageInput) {
        this.$refs.analysisImageInput.value = ''
      }
    },
    
    async loadStats() {
      try {
        const response = await porosityAnalysisAPI.getStatistics()
        if (response && response.success) {
          this.stats = response.data
        }
      } catch (error) {
        // Устанавливаем значения по умолчанию при ошибке
        this.stats = {
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0
        }
      }
    }
  }
  ,
  computed: {
    bulkProgressPercent() {
      if (!this.bulkProgress.total) return 0
      return Math.round((this.bulkProgress.processed / this.bulkProgress.total) * 100)
    },
    totalAnalyses() {
      return (this.stats.pending || 0) + (this.stats.processing || 0) + (this.stats.completed || 0) + (this.stats.failed || 0)
    },
    statsByStatus() {
      return {
        pending: this.stats.pending,
        processing: this.stats.processing,
        completed: this.stats.completed,
        failed: this.stats.failed
      }
    },
    getStatusCardClass() {
      return (status) => {
        const classes = { pending: 'card-secondary', processing: 'card-warning', completed: 'card-success', failed: 'card-danger' }
        return classes[status] || 'card-secondary'
      }
    },
    getStatusProgressClass() {
      return (status) => {
        const classes = { pending: 'bg-secondary', processing: 'bg-warning', completed: 'bg-success', failed: 'bg-danger' }
        return classes[status] || 'bg-secondary'
      }
    },
    getStatusIcon() {
      return (status) => {
        const icons = { pending: Clock, processing: Loader2, completed: CheckCircle, failed: AlertTriangle }
        return icons[status] || Clock
      }
    },
    getStatusLabel() {
      return (status) => {
        const labels = { pending: 'Ожидает', processing: 'Обрабатывается', completed: 'Завершен', failed: 'Ошибка' }
        return labels[status] || status
      }
    },
    getPercentage() {
      return (value) => {
        const total = this.totalAnalyses
        if (!total) return 0
        return Math.round((value / total) * 100)
      }
    }
  }
}
</script>

<style scoped>
.porosity-analysis-main {
  padding: 2rem;
  min-height: 100vh;
  background: var(--bs-gray-100);
}

/* Единый заголовок страницы */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.page-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.page-title h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--bs-heading-color);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: var(--bs-secondary-color);
  margin: 0;
  font-size: 1rem;
}

.card {
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  border: none;
  border-radius: 15px;
  transition: transform 0.2s ease-in-out;
}

.card:hover { transform: translateY(-2px); }

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bs-light);
  border: none;
  border-bottom: 1px solid var(--bs-border-color);
  border-radius: 15px 15px 0 0 !important;
  padding: 1rem 1.25rem;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
}

.card-icon.success { background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); }

.card-title h3 { font-size: 1.25rem; font-weight: 600; margin: 0; }
.card-title p { margin: 0; color: var(--bs-secondary-color); font-size: .875rem; }

/* Статистические карточки */
.statistics-card { background: white; border-radius: 15px; padding: 1.5rem; box-shadow: 0 5px 20px rgba(0,0,0,0.08); transition: all .3s ease; position: relative; overflow: hidden; }
.statistics-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px; }
.statistics-card.card-primary::before { background: linear-gradient(90deg, #007bff 0%, #0056b3 100%); }
.statistics-card.card-warning::before { background: linear-gradient(90deg, #ffc107 0%, #e0a800 100%); }
.statistics-card.card-success::before { background: linear-gradient(90deg, #28a745 0%, #1e7e34 100%); }
.statistics-card.card-danger::before { background: linear-gradient(90deg, #dc3545 0%, #c82333 100%); }
.statistics-card.card-secondary::before { background: linear-gradient(90deg, #6c757d 0%, #5a6268 100%); }
.card-content { display: flex; align-items: center; gap: 1.5rem; }
.card-icon { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; }
.card-primary .card-icon { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); }
.card-warning .card-icon { background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); }
.card-success .card-icon { background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); }
.card-danger .card-icon { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); }
.card-secondary .card-icon { background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%); }
.card-info .card-icon { background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%); }
.card-info { flex: 1; }
.card-subtitle { color: #6c757d; font-size: .875rem; font-weight: 500; margin-bottom: .5rem; }
.card-value { font-size: 2rem; font-weight: 700; margin: 0; color: #2d3436; }
.card-progress { margin-top: .5rem; }
.card-progress .progress { height: 5px; background-color: #e9ecef; border-radius: 5px; }
.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.upload-area:hover {
  border-color: #007bff;
  background-color: #e3f2fd;
}

.upload-area.dragover {
  border-color: #28a745;
  background-color: #d4edda;
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(40, 167, 69, 0.3);
}

.selected-files {
  max-height: 200px;
  overflow-y: auto;
}

.file-item {
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

.file-item:hover {
  background-color: #e9ecef;
}

.text-truncate {
  max-width: 200px;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border-radius: 10px;
}

.form-control-lg {
  border-radius: 10px;
  padding: 0.75rem 1rem;
}

.form-control {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.text-primary {
  color: #007bff !important;
}

.bg-primary {
  background-color: #007bff !important;
}

.bg-success {
  background-color: #28a745 !important;
}

.shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}
</style> 