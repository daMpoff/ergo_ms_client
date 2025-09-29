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
              <div class="create-analysis-card">
                <div class="create-analysis-header">
                  <div class="header-icon">
                    <Plus :size="24" />
                  </div>
                  <div class="header-content">
                    <h2 class="header-title">Создать новый анализ</h2>
                    <p class="header-subtitle">Настройте параметры и загрузите изображения для анализа пористости</p>
                  </div>
                </div>
                
                <div class="create-analysis-body">
                  <form @submit.prevent="createAnalyses">
                    <div class="analysis-form-grid">
                      <!-- Левая колонка: параметры -->
                      <div class="parameters-section">
                        <div class="section-header">
                          <h3 class="section-title">Параметры анализа</h3>
                          <p class="section-subtitle">Основные настройки для обработки изображений</p>
                        </div>

                        <div class="form-group">
                          <label for="analysisName" class="form-label">
                            Название анализа
                            <span class="optional-badge">необязательно</span>
                          </label>
                          <input
                            type="text"
                            class="form-control"
                            id="analysisName"
                            v-model="newAnalysis.name"
                            placeholder="Автоматически сгенерируется, если не указано"
                          />
                          <div class="form-help">Если не указать, название будет создано автоматически</div>
                        </div>

                        <div class="form-group">
                          <label for="analysisDescription" class="form-label">Описание</label>
                          <textarea
                            class="form-control"
                            id="analysisDescription"
                            v-model="newAnalysis.description"
                            rows="3"
                            placeholder="Дополнительная информация об анализе..."
                          ></textarea>
                        </div>

                        <div class="parameters-grid">
                          <div class="form-group">
                            <label for="scaleValue" class="form-label">Масштаб</label>
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
                              <span class="input-group-text">мкм</span>
                            </div>
                            <div class="form-help">Размер масштабной линейки</div>
                          </div>
                          
                          <div class="form-group">
                            <label for="pixelsPerMicron" class="form-label">Разрешение</label>
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
                            <div class="form-help">Пикселей на микрометр</div>
                          </div>
                        </div>
                      </div>

                      <!-- Правая колонка: загрузка файлов -->
                      <div class="upload-section">
                        <div class="section-header">
                          <h3 class="section-title">Изображения</h3>
                          <p class="section-subtitle">Загрузите одно или несколько изображений</p>
                        </div>

                        <div
                          class="upload-zone"
                          :class="{ 'upload-zone--dragover': dragActive }"
                          @dragenter.prevent="onDragEnter"
                          @dragover.prevent="onDragOver"
                          @dragleave.prevent="onDragLeave"
                          @drop.prevent="onDropFiles"
                          @click="openFileDialog"
                          role="button"
                          tabindex="0"
                        >
                          <div class="upload-icon">
                            <Upload :size="32" />
                          </div>
                          <div class="upload-content">
                            <div class="upload-title">Перетащите файлы сюда</div>
                            <div class="upload-divider">или</div>
                            <button type="button" class="btn-upload" @click.stop="openFileDialog">
                              Выбрать файлы
                            </button>
                            <div class="upload-info">PNG, JPG, JPEG • можно выбрать несколько</div>
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

                        <!-- Список выбранных файлов -->
                        <div v-if="selectedAnalysisImages.length > 0" class="selected-files-section">
                          <div class="files-header">
                            <h4 class="files-count">Выбрано файлов: {{ selectedAnalysisImages.length }}</h4>
                          </div>
                          <div class="files-list">
                            <div
                              v-for="(file, index) in selectedAnalysisImages"
                              :key="index"
                              class="file-item"
                            >
                              <div class="file-info">
                                <Image :size="18" class="file-icon" />
                                <span class="file-name">{{ file.name }}</span>
                                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                              </div>
                              <button
                                type="button"
                                class="file-remove"
                                @click="removeSelectedImage(index)"
                                title="Удалить файл"
                              >
                                <X :size="16" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <!-- Кнопка создания и прогресс -->
                        <div class="action-section">
                          <button 
                            type="submit" 
                            class="btn-create" 
                            :disabled="isCreating || selectedAnalysisImages.length === 0"
                            :class="{ 'btn-create--loading': isCreating }"
                          >
                            <Plus :size="18" />
                            <span>
                              {{ isCreating 
                                ? 'Создание анализов...'
                                : (selectedAnalysisImages.length === 1 ? 'Создать анализ' : `Создать ${selectedAnalysisImages.length} анализов`) }}
                            </span>
                          </button>

                          <!-- Прогресс-бар -->
                          <div v-if="isCreating" class="progress-section">
                            <div class="progress-header">
                              <span class="progress-label">Создание анализов</span>
                              <span class="progress-counter">{{ bulkProgress.processed }} / {{ bulkProgress.total }}</span>
                            </div>
                            <div class="progress-bar-container">
                              <div class="progress-bar" :style="`width: ${bulkProgressPercent}%`"></div>
                            </div>
                            <div class="progress-stats">
                              <span class="stat-success">Успешно: {{ bulkProgress.success }}</span>
                              <span class="stat-failed">Ошибки: {{ bulkProgress.failed }}</span>
                            </div>
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
      concurrencyLimit: 8,
      stats: {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
      }
    }
  },
  async mounted() {
    await Promise.all([
      this.loadStats(),
      this.loadUploadConfig()
    ])
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
          if (!file) break
          try {
            const analysisPayload = {
              name: this.newAnalysis.name ? `${this.newAnalysis.name} — ${file.name.replace(/\.[^/.]+$/, '')}` : '',
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
    },

    async loadUploadConfig() {
      try {
        const response = await porosityAnalysisAPI.getUploadConfig()
        if (response && response.success && response.data) {
          this.concurrencyLimit = response.data.upload_threads || 8
          console.log(`Установлено количество потоков загрузки: ${this.concurrencyLimit}`)
        }
      } catch (error) {
        console.warn('Не удалось загрузить конфигурацию загрузки, используется значение по умолчанию:', error)
        this.concurrencyLimit = 8
      }
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Б'
      const k = 1024
      const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
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

/* Карточка создания анализа */
.create-analysis-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transition: all 0.3s ease;
}

.create-analysis-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

/* Заголовок карточки */
.create-analysis-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  backdrop-filter: blur(10px);
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.4;
}

/* Тело карточки */
.create-analysis-body {
  padding: 2.5rem;
}

/* Сетка формы */
.analysis-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

@media (max-width: 992px) {
  .analysis-form-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

/* Секции */
.parameters-section,
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.section-subtitle {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
  line-height: 1.4;
}

/* Группы форм */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  display: block;
}

.optional-badge {
  display: inline-block;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  margin-left: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.form-control {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
  outline: none;
}

.form-control::placeholder {
  color: #a0aec0;
}

.form-help {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 0.375rem;
  line-height: 1.4;
}

/* Сетка параметров */
.parameters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .parameters-grid {
    grid-template-columns: 1fr;
  }
}

.input-group-text {
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  border-left: none;
  color: #64748b;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Зона загрузки */
.upload-zone {
  border: 3px dashed #cbd5e0;
  border-radius: 16px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8fafc;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.upload-zone:hover {
  border-color: #667eea;
  background: #f0f4ff;
  transform: translateY(-2px);
}

.upload-zone--dragover {
  border-color: #38a169;
  background: #f0fff4;
  transform: scale(1.02);
  box-shadow: 0 8px 32px rgba(56, 161, 105, 0.2);
}

.upload-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.upload-zone--dragover .upload-icon {
  background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.upload-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.upload-divider {
  font-size: 0.9rem;
  color: #a0aec0;
  font-weight: 500;
}

.btn-upload {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-upload:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.upload-info {
  font-size: 0.85rem;
  color: #718096;
  line-height: 1.4;
}

/* Выбранные файлы */
.selected-files-section {
  margin-top: 1.5rem;
}

.files-header {
  margin-bottom: 1rem;
}

.files-count {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.files-list {
  max-height: 240px;
  overflow-y: auto;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background: #edf2f7;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.file-icon {
  color: #667eea;
  flex-shrink: 0;
}

.file-name {
  font-weight: 500;
  color: #2d3748;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.file-size {
  font-size: 0.8rem;
  color: #718096;
  margin-left: auto;
  flex-shrink: 0;
}

.file-remove {
  background: none;
  border: none;
  color: #e53e3e;
  padding: 0.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-remove:hover {
  background: #fed7d7;
  transform: scale(1.1);
}

/* Секция действий */
.action-section {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-create {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 14px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 56px;
}

.btn-create:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(72, 187, 120, 0.3);
}

.btn-create:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-create--loading {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Прогресс */
.progress-section {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
}


.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.progress-counter {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
}

.progress-bar-container {
  background: #e2e8f0;
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-section .progress-bar {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  height: 100%;
  border-radius: 8px;
  transition: width 0.3s ease;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 500;
}

.stat-success {
  color: #38a169;
}

.stat-failed {
  color: #e53e3e;
}

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
/* Адаптивность */
@media (max-width: 576px) {
  .create-analysis-header {
    padding: 1.5rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-icon {
    width: 56px;
    height: 56px;
  }
  
  .header-title {
    font-size: 1.5rem;
  }
  
  .create-analysis-body {
    padding: 1.5rem;
  }
  
  .upload-zone {
    padding: 2rem 1rem;
    min-height: 160px;
  }
  
  .upload-icon {
    width: 56px;
    height: 56px;
  }
  
  .btn-create {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
}
</style> 