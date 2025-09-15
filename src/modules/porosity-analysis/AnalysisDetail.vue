<template>
  <div class="porosity-analysis-detail">
    <!-- Заголовок страницы в едином стиле -->
    <div class="page-header">
      <div class="header-content">
        <nav aria-label="breadcrumb" class="breadcrumb-nav">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/porosity-analysis/analyses" class="breadcrumb-link">
                <Microscope :size="16" />
                <span>Анализ пористости</span>
              </router-link>
            </li>
            <li class="breadcrumb-item active">
              {{ analysis?.name || 'Детали анализа' }}
            </li>
          </ol>
        </nav>

        <div class="analysis-title-section">
          <div class="analysis-icon icon-primary">
            <component :is="getHeaderStatusIcon(analysis.status)" :size="24" color="white" />
          </div>
          <div class="analysis-title">
            <h1>{{ analysis?.name || 'Анализ пористости' }}</h1>
            <div class="analysis-meta-badges">
              <span class="badge" :class="statusClass(analysis.status)">
                {{ getStatusText(analysis.status) }}
              </span>
            </div>
            <p class="analysis-description" v-if="analysis?.description">
              {{ analysis.description }}
            </p>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <router-link to="/porosity-analysis/analyses" class="btn btn-back-to-list">
          <ArrowLeft :size="16" />
          <span>К списку</span>
        </router-link>
        <button 
          v-if="analysis.status === 'failed'"
          type="button"
          class="btn btn-warning"
          @click="restartAnalysis"
          :disabled="restarting"
        >
          <RotateCcw :size="16" />
          <span>{{ restarting ? 'Перезапуск...' : 'Перезапустить' }}</span>
        </button>
        <button
          type="button"
          class="btn btn-delete-analysis"
          @click="deleteAnalysis"
          :disabled="deleting"
        >
          <Trash2 :size="16" />
          <span>{{ deleting ? 'Удаление...' : 'Удалить' }}</span>
        </button>
      </div>
    </div>
    <!-- Модальное окно подтверждения удаления -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="Удаление анализа"
      message="Вы уверены, что хотите удалить этот анализ? Это действие нельзя отменить."
      confirm-text="Удалить"
      cancel-text="Отмена"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDeleteAnalysis"
      @cancel="cancelDeleteAnalysis"
      @close="cancelDeleteAnalysis"
    />
    
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
              <h4 class="card-title mb-0">
                <Microscope class="me-2" size="20" />
                {{ analysis.name }}
              </h4>
              <small class="text-muted">Номер анализа: {{ analysis.id }}</small>
            </div>
            <div class="d-flex gap-2">
              <router-link to="/porosity-analysis/analyses" class="btn btn-outline-primary btn-sm">
                <ArrowLeft size="16" />
                <span>К списку</span>
              </router-link>
              <div v-if="analysis.status === 'completed'" class="dropdown">
                <button
                  class="btn btn-success dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  :disabled="downloadingReport"
                >
                  <FileText class="me-2" size="16" />
                  {{ downloadingReport ? 'Загрузка...' : 'Скачать отчет' }}
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="downloadReport('pdf')">
                      <FileText class="me-2" size="16" />
                      PDF отчет
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="downloadReport('docx')">
                      <FileText class="me-2" size="16" />
                      Word отчет (DOCX)
                    </a>
                  </li>
                </ul>
              </div>
              <button
                v-if="analysis.status === 'failed'"
                type="button"
                class="btn btn-warning"
                @click="restartAnalysis"
                :disabled="restarting"
              >
                <RotateCcw class="me-2" size="16" />
                {{ restarting ? 'Перезапуск...' : 'Перезапустить' }}
              </button>
              <button
                type="button"
                class="btn btn-danger"
                @click="deleteAnalysis"
                :disabled="deleting"
              >
                <Trash2 size="16" />
                <span>{{ deleting ? 'Удаление...' : 'Удалить' }}</span>
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Загрузка...</span>
              </div>
            </div>
            
            <div v-else>
              <!-- Статус анализа -->
              <div class="row mb-3">
                <div class="col-12">
                  <AnalysisStatus 
                    :status="analysis.status"
                    :error-message="analysis.error_message"
                    :show-progress="true"
                  />
                </div>
              </div>
              
              <!-- Основная информация и статус -->
              <div class="row mb-3">
                <div class="col-12">
                  <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                      <h6 class="card-title mb-0">
                        <Info class="me-2" size="20" />
                        Основная информация
                      </h6>
                      <button 
                        type="button" 
                        class="btn btn-sm btn-link p-0"
                        @click="showBasicInfo = !showBasicInfo"
                        style="width: 24px; height: 24px; color: #6c757d;"
                      >
                        <ChevronDown v-if="showBasicInfo" size="16" />
                        <ChevronRight v-else size="16" />
                      </button>
                    </div>
                    <div v-show="showBasicInfo" class="card-body">
                      <div class="row">
                        <div class="col-6">
                          <small class="text-muted">Создан:</small>
                          <div>{{ formatDate(analysis.created_at) }}</div>
                        </div>
                        <div class="col-6">
                          <small class="text-muted">Шкала:</small>
                          <div>{{ analysis.scale_value }} мкм</div>
                        </div>
                      </div>
                      
                      <div v-if="analysis.pixels_per_micron" class="mt-3">
                        <small class="text-muted">Пикселей на микрометр:</small>
                        <div>{{ analysis.pixels_per_micron }}</div>
                      </div>
                      
                      <div v-if="analysis.description" class="mt-3">
                        <small class="text-muted">Описание:</small>
                        <div>{{ analysis.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Загрузка изображения -->
              <div class="row mb-2">
                <div class="col-12">
                  <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                      <h6 class="card-title mb-0">
                        <Upload class="me-2" size="20" />
                        Исходное изображение
                      </h6>
                      <button 
                        type="button" 
                        class="btn btn-sm btn-link p-0"
                        @click="showImageUpload = !showImageUpload"
                        style="width: 24px; height: 24px; color: #6c757d;"
                      >
                        <ChevronDown v-if="showImageUpload" size="16" />
                        <ChevronRight v-else size="16" />
                      </button>
                    </div>
                    <div v-show="showImageUpload" class="card-body compact-card">
                      <ImageUpload
                        :image-url="imageUrl"
                        :has-image="hasImage"
                        :uploading="uploading"
                        @file-select="uploadImage"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Результаты анализа -->
              <div v-if="analysis.status === 'completed'" class="row mb-2">
                <div class="col-12">
                  <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                      <h6 class="card-title mb-0">
                        <BarChart3 class="me-2" size="20" />
                        Результаты анализа
                      </h6>
                      <button 
                        type="button" 
                        class="btn btn-sm btn-link p-0"
                        @click="showResults = !showResults"
                        style="width: 24px; height: 24px; color: #6c757d;"
                      >
                        <ChevronDown v-if="showResults" size="16" />
                        <ChevronRight v-else size="16" />
                      </button>
                    </div>
                    <div v-show="showResults" class="card-body p-0">
                      <AnalysisResults 
                        :analysis="analysis"
                        :result-files="resultFiles"
                        :show-files="true"
                        :downloading="downloading"
                        :generating-reports="generatingReports"
                        :downloading-report="downloadingReport"
                        :has-reports="hasReports"
                        @download-all="downloadAllResults"
                        @download-file="downloadFile"
                        @generate-reports="generateReports"
                        @download-report="downloadReport"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Визуализации анализа -->
              <div v-if="analysis.status === 'completed'" class="row mb-2">
                <div class="col-12">
                  <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                      <h6 class="card-title mb-0">
                        <Images class="me-2" size="20" />
                        Визуализации анализа
                      </h6>
                      <button 
                        type="button" 
                        class="btn btn-sm btn-link p-0"
                        @click="showVisualizations = !showVisualizations"
                        style="width: 24px; height: 24px; color: #6c757d;"
                      >
                        <ChevronDown v-if="showVisualizations" size="16" />
                        <ChevronRight v-else size="16" />
                      </button>
                    </div>
                    <div v-show="showVisualizations" class="card-body p-0">
                      <AnalysisVisualizations 
                        :result-files="analysis.result_files || []"
                        :loading="loading"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.porosity-analysis-detail {
  padding: 2rem 0 0 0;
}

/* Единый заголовок страницы */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.breadcrumb-nav {
  margin-bottom: 1rem;
}

.analysis-title-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.analysis-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.icon-primary { background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); }
.icon-warning { background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); }
.icon-success { background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); }
.icon-danger { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); }
.icon-secondary { background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%); }

.analysis-title h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--bs-heading-color);
  margin: 0 0 0.5rem 0;
}

.analysis-meta-badges { display: flex; gap: .5rem; margin-bottom: .75rem; }

.btn-back-to-list {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
}
.card-header .btn-link {
  text-decoration: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #6c757d !important;
  background-color: transparent;
}

.card-header .btn-link:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
  color: #495057 !important;
}

.card-header .btn-link:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}



.card-body.p-0 {
  padding: 0 !important;
}

.card-body.p-0 .analysis-results {
  margin-top: 0;
  margin-bottom: 0;
}

/* Добавляем отступ между карточками */
.card-body.p-0 .analysis-results .row:first-child {
  margin-bottom: 10px;
}

/* Уменьшаем отступ в карточке с изображением */
.card-body .image-upload {
  margin-top: 0;
  margin-bottom: 0;
}

.card-body .image-upload .image-info {
  margin-top: 0.25rem !important;
  margin-bottom: 0 !important;
}

.card-body .image-upload .image-preview {
  margin-bottom: 0;
}

/* Уменьшаем отступ в card-body для карточки с изображением */
.card-body.compact-card {
  padding: 1rem !important;
}

/* Стили для dropdown меню в заголовке */
.card-header .dropdown-menu {
  min-width: 180px;
}

.card-header .dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.card-header .dropdown-item svg {
  flex-shrink: 0;
  margin-right: 0.5rem;
}

.card-header .dropdown-item:hover {
  background-color: #f8f9fa;
}

/* Стиль для кнопок в заголовке */
.card-header .d-flex.gap-2 {
  gap: 0.5rem;
}
</style>

<script>
import { porosityAnalysisAPI } from './js/porosity-analysis.js'
import AnalysisStatus from './components/AnalysisStatus.vue'
import AnalysisResults from './components/AnalysisResults.vue'
import AnalysisVisualizations from './components/AnalysisVisualizations.vue'
import ImageUpload from './components/ImageUpload.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useToast } from 'vue-toastification'
import { 
  Microscope, 
  ArrowLeft, 
  RotateCcw, 
  Trash2, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Images,
  ChevronDown,
  ChevronRight,
  Info,
  Upload,
  FileText
} from 'lucide-vue-next'

const toast = useToast()

export default {
  components: {
    AnalysisStatus,
    AnalysisResults,
    AnalysisVisualizations,
    ImageUpload,
    ConfirmDialog,
    Microscope,
    ArrowLeft,
    RotateCcw,
    Trash2,
    CheckCircle,
    Clock,
    BarChart3,
    Images,
    ChevronDown,
    ChevronRight,
    Info,
    Upload,
    FileText
  },
  name: 'PorosityAnalysisDetail',
  data() {
    return {
      analysis: {},
      loading: true,
      restarting: false,
      downloading: false,
      uploading: false,
      deleting: false,
      resultFiles: [],
      hasImage: false,
      imageUrl: '',
      // Состояния видимости карточек
      showBasicInfo: true,
      showImageUpload: true,
      showResults: true,
      showVisualizations: true,
      // Модальное окно удаления
      showDeleteConfirm: false,
      // Состояния для отчетов
      generatingReports: false,
      downloadingReport: false,
      hasReports: false
    }
  },
  async mounted() {
    await this.loadAnalysis()
  },
  methods: {
    getHeaderStatusIcon(status) {
      const map = {
        pending: Clock,
        processing: Clock,
        completed: CheckCircle,
        failed: Trash2
      }
      return map[status] || Clock
    },
    statusClass(status) {
      switch (status) {
        case 'completed': return 'bg-success'
        case 'processing': return 'bg-warning'
        case 'failed': return 'bg-danger'
        case 'pending': return 'bg-secondary'
        default: return 'bg-light text-dark'
      }
    },
    getStatusText(status) {
      const texts = { pending: 'Ожидает', processing: 'Обрабатывается', completed: 'Завершен', failed: 'Ошибка' }
      return texts[status] || status
    },
    async loadAnalysis() {
      this.loading = true
      try {
        const analysisId = this.$route.params.id
        const response = await porosityAnalysisAPI.getAnalysis(analysisId)
        
        if (response && response.success) {
          this.analysis = response.data
          this.hasImage = !!this.analysis.original_image_uuid
          
          if (this.hasImage) {
            this.imageUrl = porosityAnalysisAPI.getImageUrl(this.analysis.original_image_uuid)
          }
          
          if (this.analysis.status === 'completed') {
            await this.loadResultFiles()
            // Проверяем наличие отчетов
            this.checkReportsExistence()
          }
        } else {
          toast.error(response?.message || 'Ошибка при загрузке анализа')
        }
      } catch (error) {
        let errorMessage = 'Ошибка при загрузке анализа'
        if (error && typeof error === 'object') {
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || error.response.data.detail || errorMessage
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        toast.error(errorMessage)
      } finally {
        this.loading = false
      }
    },
    
    async loadResultFiles() {
      try {
        const response = await porosityAnalysisAPI.getDownloadResults(this.analysis.id)
        if (response && response.success) {
          this.resultFiles = response.data.files || []
        }
      } catch (error) {
        // Игнорируем ошибки загрузки файлов результатов
      }
    },
    
    async uploadImage(file) {
      if (!file) return
      
      this.uploading = true
      try {
        const response = await porosityAnalysisAPI.uploadImage(this.analysis.id, file)
        
        if (response && response.success) {
          toast.success('Изображение загружено успешно')
          this.hasImage = true
          this.imageUrl = URL.createObjectURL(file)
          await this.loadAnalysis()
        } else {
          toast.error(response?.message || 'Ошибка при загрузке изображения')
        }
      } catch (error) {
        let errorMessage = 'Ошибка при загрузке изображения'
        if (error && typeof error === 'object') {
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || error.response.data.detail || errorMessage
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        toast.error(errorMessage)
      } finally {
        this.uploading = false
      }
    },
    
    async restartAnalysis() {
      this.restarting = true
      try {
        const response = await porosityAnalysisAPI.restartAnalysis(this.analysis.id)
        if (response && response.success) {
          toast.success('Анализ перезапущен')
          await this.loadAnalysis()
        } else {
          toast.error(response?.message || 'Ошибка при перезапуске анализа')
        }
      } catch (error) {
        let errorMessage = 'Ошибка при перезапуске анализа'
        if (error && typeof error === 'object') {
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || error.response.data.detail || errorMessage
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        toast.error(errorMessage)
      } finally {
        this.restarting = false
      }
    },
    
    async downloadAllResults() {
      this.downloading = true
      try {
        this.resultFiles.forEach(file => {
          const link = document.createElement('a')
          link.href = porosityAnalysisAPI.getDownloadUrl(this.analysis.id, file.path)
          link.download = file.name
          link.click()
        })
        toast.success('Файлы скачиваются')
      } catch (error) {
        toast.error('Ошибка при скачивании файлов')
      } finally {
        this.downloading = false
      }
    },
    
    downloadFile(filePath) {
      const link = document.createElement('a')
      link.href = porosityAnalysisAPI.getDownloadUrl(this.analysis.id, filePath)
      link.download = filePath.split('/').pop()
      link.click()
    },
    
    deleteAnalysis() {
      this.showDeleteConfirm = true
    },
    
    async confirmDeleteAnalysis() {
      this.deleting = true
      try {
        const response = await porosityAnalysisAPI.deleteAnalysis(this.analysis.id)
        
        // Проверяем успешность удаления - учитываем разные форматы ответов
        const isSuccess = response && (
          response.success === true || 
          response.status === 204 || 
          response.status === 200 ||
          (response.data && response.data.success === true)
        )
        
        if (isSuccess) {
          toast.success('Анализ удален')
          this.$router.push('/porosity-analysis/analyses')
        } else {
          const errorMsg = response && response.message ? response.message : 'Ошибка при удалении анализа'
          toast.error(errorMsg)
        }
      } catch (error) {
        let errorMessage = 'Ошибка при удалении анализа'
        if (error && typeof error === 'object') {
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || error.response.data.detail || errorMessage
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        toast.error(errorMessage)
      } finally {
        this.deleting = false
        this.showDeleteConfirm = false
      }
    },
    
        cancelDeleteAnalysis() {
      this.showDeleteConfirm = false
    },
    
    async generateReports() {
      this.generatingReports = true
      try {
        const response = await porosityAnalysisAPI.generateReports(this.analysis.id)
        if (response && response.success) {
          toast.success('Отчеты успешно сгенерированы')
          this.hasReports = true
        } else {
          toast.error(response?.message || 'Ошибка при генерации отчетов')
        }
      } catch (error) {
        let errorMessage = 'Ошибка при генерации отчетов'
        if (error && typeof error === 'object') {
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || error.response.data.detail || errorMessage
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        toast.error(errorMessage)
      } finally {
        this.generatingReports = false
      }
    },
    
    async downloadReport(reportType) {
      this.downloadingReport = true
      try {
        console.log(`Downloading report type: ${reportType} for analysis: ${this.analysis.id}`)
        
        // Сначала проверяем, есть ли уже отчеты, если нет - генерируем
        if (!this.hasReports) {
          await this.generateReports()
        }
        
        // Используем API клиент для скачивания файла
        const response = await porosityAnalysisAPI.downloadReport(this.analysis.id, reportType)
        
        if (response && response.success && response.data) {
          // Создаем blob из данных
          const blob = new Blob([response.data], {
            type: reportType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          })
          
          // Создаем ссылку для скачивания
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `porosity_analysis_${this.analysis.id}_${this.analysis.created_at.split('T')[0]}.${reportType}`
          
          // Добавляем ссылку в DOM, кликаем и удаляем
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Освобождаем URL
          window.URL.revokeObjectURL(url)
          
          toast.success(`Отчет ${reportType.toUpperCase()} скачивается`)
        } else {
          throw new Error(response?.message || 'Ошибка при скачивании отчета')
        }
      } catch (error) {
        console.error('Download error:', error)
        toast.error(error.message || 'Ошибка при скачивании отчета')
      } finally {
        this.downloadingReport = false
      }
    },
    
    checkReportsExistence() {
      // Проверяем наличие папки reports в результатах
      if (this.resultFiles && this.resultFiles.length > 0) {
        // Если есть файлы отчетов, устанавливаем флаг
        this.hasReports = this.resultFiles.some(file => 
          file.name.includes('porosity_report') && 
          (file.name.endsWith('.pdf') || file.name.endsWith('.docx'))
        )
      }
    },
    
    // Убран метод loadQueueInfo, так как ограничения сняты
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.porosity-analysis-detail {
  padding: 20px 0;
}

.result-item {
  text-align: center;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
}

.result-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #0d6efd;
}

.result-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 5px;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header .card-title {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

.card-header .card-title svg {
  flex-shrink: 0;
}

/* Стили для заголовка анализа */
.card-header h4.card-title {
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.card-header small {
  margin-top: 0;
  line-height: 1.2;
}

/* Стили для выравнивания кнопок */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  text-align: center;
  line-height: 1;
}

.btn svg {
  flex-shrink: 0;
}

.btn span {
  display: inline-flex;
  align-items: center;
}

/* Стили для равных карточек */
.row {
  display: flex;
  flex-wrap: wrap;
}

.row > [class*="col-"] {
  display: flex;
  flex-direction: column;
}

.card.h-100 {
  height: 100% !important;
  display: flex;
  flex-direction: column;
}

.card.h-100 .card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style> 