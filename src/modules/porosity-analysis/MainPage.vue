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
          
          <!-- Формы создания -->
          <div class="row g-4">
            <div class="col-lg-6">
              <div class="card h-100 shadow-sm border-0">
                <div class="card-header">
                  <div class="card-icon">
                    <Plus :size="20" />
                  </div>
                  <div class="card-title">
                    <h3>Создать анализ</h3>
                    <p>Название, параметры и загрузка исходного изображения</p>
                  </div>
                </div>
                <div class="card-body p-4">
                  <form @submit.prevent="createAnalysis">
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
                        rows="3"
                        placeholder="Подробное описание анализа"
                      ></textarea>
                    </div>
                    
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="scaleValue" class="form-label fw-bold">Масштаб (мкм/пиксель)</label>
                          <input
                            type="number"
                            class="form-control"
                            id="scaleValue"
                            v-model="newAnalysis.scale_value"
                            step="0.01"
                            min="0"
                            placeholder="100.0"
                          />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="pixelsPerMicron" class="form-label fw-bold">Пикселей на микрон</label>
                          <input
                            type="number"
                            class="form-control"
                            id="pixelsPerMicron"
                            v-model="newAnalysis.pixels_per_micron"
                            step="0.01"
                            min="0"
                            placeholder="1.0"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div class="mb-3">
                      <label for="analysisImage" class="form-label fw-bold">Изображение для анализа</label>
                      <input
                        type="file"
                        class="form-control"
                        id="analysisImage"
                        @change="handleAnalysisImageUpload"
                        accept="image/*"
                        required
                        ref="analysisImageInput"
                      />
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-lg w-100" :disabled="isCreating || !selectedAnalysisImage">
                      <Plus :size="16" />
                      <span>{{ isCreating ? 'Создание...' : 'Создать анализ' }}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
            
            <div class="col-lg-6">
              <div class="card h-100 shadow-sm border-0">
                <div class="card-header">
                  <div class="card-icon success">
                    <Upload :size="20" />
                  </div>
                  <div class="card-title">
                    <h3>Быстрая загрузка</h3>
                    <p>Перетащите набор изображений и создайте несколько анализов</p>
                  </div>
                </div>
                <div class="card-body p-4">
                  <div class="mb-4">
                    <label for="quickUpload" class="form-label fw-bold">Выберите изображения</label>
                    <div 
                      class="upload-area" 
                      @click="$refs.quickUploadInput.click()" 
                      @dragover.prevent="handleDragOver" 
                      @dragleave.prevent="handleDragLeave"
                      @drop.prevent="handleDrop"
                      :class="{ 'dragover': isDragOver }"
                    >
                      <input
                        type="file"
                        class="d-none"
                        id="quickUpload"
                        @change="handleQuickUpload"
                        multiple
                        accept="image/*"
                        ref="quickUploadInput"
                      />
                      <div class="text-center">
                        <Upload :size="32" class="text-muted mb-2" />
                        <p class="mb-2">Перетащите файлы сюда или нажмите для выбора</p>
                        <p class="text-muted small">Поддерживаются форматы: PNG, JPG, JPEG</p>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="quickUploadFiles.length > 0" class="mb-4">
                    <h6 class="fw-bold mb-3">Выбранные файлы:</h6>
                    <div class="selected-files">
                      <div
                        v-for="(file, index) in quickUploadFiles"
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
                          @click="removeQuickUploadFile(index)"
                        >
                          <X :size="14" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    class="btn btn-success btn-lg w-100"
                    @click="createMultipleAnalyses"
                    :disabled="quickUploadFiles.length === 0 || isCreatingMultiple"
                  >
                    <i class="fas fa-upload me-2"></i>
                    {{ isCreatingMultiple ? 'Создание...' : `Создать ${quickUploadFiles.length} анализов` }}
                  </button>
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
      selectedAnalysisImage: null,
      quickUploadFiles: [],
      isCreating: false,
      isCreatingMultiple: false,
      isDragOver: false,
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
    handleAnalysisImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        this.selectedAnalysisImage = file
      }
    },
    
    async createAnalysis() {
      this.isCreating = true
      try {
        // Создаем анализ
        const response = await porosityAnalysisAPI.createAnalysis(this.newAnalysis)
        
        if (response && response.success) {
          let analysisId = null
          if (response.data && typeof response.data === 'object') {
            analysisId = response.data.id
          } else if (typeof response.data === 'number') {
            analysisId = response.data
          }
          

          
          if (analysisId && this.selectedAnalysisImage) {
            // Загружаем изображение для созданного анализа
            const uploadResponse = await porosityAnalysisAPI.uploadImage(analysisId, this.selectedAnalysisImage)
            if (uploadResponse && uploadResponse.success) {
              toast.success('Анализ создан и изображение загружено успешно!')
              this.resetForm()
              this.$router.push(`/porosity-analysis/analysis/${analysisId}`)
            } else {
              toast.error(uploadResponse?.message || 'Ошибка при загрузке изображения')
            }
          } else {
            toast.success('Анализ создан успешно!')
            this.resetForm()
            this.$router.push('/porosity-analysis/analyses')
          }
        } else {
          toast.error(response?.message || 'Ошибка при создании анализа')
        }
      } catch (error) {
        let errorMessage = 'Ошибка при создании анализа'
        if (error && typeof error === 'object') {
          errorMessage = error.response?.data?.message || error.message || errorMessage
        }
        toast.error(errorMessage)
      } finally {
        this.isCreating = false
      }
    },
    
    handleQuickUpload(event) {
      const files = Array.from(event.target.files)
      this.quickUploadFiles = files
    },
    
    handleDragOver(event) {
      event.preventDefault()
      this.isDragOver = true
    },
    
    handleDragLeave(event) {
      event.preventDefault()
      this.isDragOver = false
    },
    
    handleDrop(event) {
      event.preventDefault()
      this.isDragOver = false
      const files = Array.from(event.dataTransfer.files)
      this.quickUploadFiles = files
    },
    
    removeQuickUploadFile(index) {
      this.quickUploadFiles.splice(index, 1)
    },
    
    async createMultipleAnalyses() {
      this.isCreatingMultiple = true
      try {
        const results = await porosityAnalysisAPI.createMultipleAnalyses(this.quickUploadFiles, 100.0)
        
        console.log('Multiple analyses results:', results)
        console.log('Results type:', typeof results)
        console.log('Results is array:', Array.isArray(results))
        
        if (Array.isArray(results) && results.length > 0) {
          const validResults = results.filter(r => r !== null && r !== undefined)
          const successCount = validResults.filter(r => r && typeof r === 'object' && r.success === true).length
          const failedCount = validResults.length - successCount
          
          console.log(`Valid results: ${validResults.length}, Success: ${successCount}, Failed: ${failedCount}`)
          
          if (successCount > 0) {
            toast.success(`Создано ${successCount} из ${this.quickUploadFiles.length} анализов`)
          }
          
          if (failedCount > 0) {
            toast.warning(`${failedCount} анализов не удалось создать`)
          }
        } else if (results && typeof results === 'object') {
          // Если API вернул одиночный результат
          if (results.success === true) {
            toast.success('Анализ создан успешно')
          } else if (results.data) {
            console.log('Results with data:', results)
            toast.success('Анализ создан успешно')
          } else {
            console.warn('Unexpected single result format:', results)
            toast.success('Анализ отправлен на обработку')
          }
        } else {
          // Если результаты не в ожидаемом формате
          console.warn('Unexpected results format:', results)
          toast.success('Анализы отправлены на обработку')
        }
        
        this.quickUploadFiles = []
        if (this.$refs.quickUploadInput) {
          this.$refs.quickUploadInput.value = ''
        }
        
        // Переходим к списку анализов
        this.$router.push('/porosity-analysis/analyses')
        
      } catch (error) {
        let errorMessage = 'Ошибка при создании анализов'
        if (error && typeof error === 'object') {
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || error.response.data.detail || errorMessage
          } else if (error.message) {
            errorMessage = error.message
          }
        } else if (error && typeof error === 'string') {
          errorMessage = error
        }
        console.error('Error creating multiple analyses:', error)
        toast.error(errorMessage)
      } finally {
        this.isCreatingMultiple = false
      }
    },
    
    resetForm() {
      this.newAnalysis = {
        name: '',
        description: '',
        scale_value: 100,  // Стандартное значение шкалы 100 мкм
        pixels_per_micron: null
      }
      this.selectedAnalysisImage = null
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