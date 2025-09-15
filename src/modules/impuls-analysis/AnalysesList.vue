<template>
  <div class="impuls-analysis-dashboard">
    <!-- Заголовок страницы с современным дизайном -->
    <div class="page-header">
      <div class="header-content">
        <div class="page-title-section">
          <div class="page-icon">
            <Zap :size="28" color="white" />
          </div>
          <div class="page-title">
            <h1>Мои анализы</h1>
            <p class="page-subtitle">Управление и мониторинг анализов импульсных нагрузок</p>
          </div>
        </div>
      </div>
      
    </div>
          
    <!-- Фильтры и поиск -->
    <div class="filters-card">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">
              <Search :size="16" />
              <span>Поиск</span>
            </label>
            <input 
              v-model.trim="filters.search" 
              type="text" 
              class="form-control" 
              placeholder="Название или описание анализа..."
              @input="debouncedSearch"
            />
          </div>
          <div class="col-md-2">
            <label class="form-label">Статус</label>
            <select v-model="filters.status" class="form-select" @change="applyFilters">
              <option value="">Все статусы</option>
              <option value="pending">Ожидает</option>
              <option value="processing">Обрабатывается</option>
              <option value="completed">Завершен</option>
              <option value="failed">Ошибка</option>
              <option value="cancelled">Отменен</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Сортировка</label>
            <select v-model="ordering" class="form-select" @change="applyFilters">
              <option value="-created_at">По дате создания ↓</option>
              <option value="created_at">По дате создания ↑</option>
              <option value="title">По названию ↑</option>
              <option value="-title">По названию ↓</option>
              <option value="status">По статусу</option>
            </select>
          </div>
          <div class="col-md-1 d-grid align-self-end">
            <button class="btn btn-reset-filters" @click="clearFilters" title="Сбросить фильтры и обновить список">
              <RotateCcw :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
          
    <!-- Статистические карточки -->
    <div class="row g-4 mb-4">
      <div class="col-xl-3 col-md-6">
        <div class="statistics-card card-primary">
          <div class="card-content">
            <div class="card-icon">
              <BarChart3 :size="24" />
            </div>
            <div class="card-info">
              <h6 class="card-subtitle">Всего анализов</h6>
              <h3 class="card-value">{{ stats.total }}</h3>
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
                  <div 
                    class="progress-bar" 
                    :class="getStatusProgressClass(key)"
                    :style="`width: ${getPercentage(count)}%`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Список анализов -->
    <div v-if="isLoading" class="loading-state">
      <div class="d-flex flex-column align-items-center justify-content-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p class="text-muted">Загружаем анализы...</p>
      </div>
    </div>

    <div v-else-if="analyses.length === 0" class="empty-state">
      <div class="text-center">
        <Zap :size="64" class="empty-icon mb-4" />
        <h4 class="text-muted mb-3">Анализы не найдены</h4>
        <p class="text-muted mb-4">Попробуйте изменить фильтры поиска</p>
      </div>
    </div>

    <div v-else class="analyses-grid">
      <div class="analysis-card" v-for="analysis in analyses" :key="analysis.id">
        <div class="analysis-header" :class="getAnalysisHeaderClass(analysis.status)">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge" :class="statusClass(analysis.status)">
              {{ getStatusLabel(analysis.status) }}
            </span>
            <div class="analysis-actions">
              <button 
                class="btn btn-sm btn-delete-analysis" 
                @click="showDeleteConfirm(analysis.id)"
                title="Удалить анализ"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
          <h5 class="analysis-title mb-0">{{ analysis.title || 'Без названия' }}</h5>
        </div>
        
        <div class="analysis-body">
          <!-- Информация об анализе -->
          <div class="analysis-info">
            
            <div class="info-item" v-if="analysis.protocol_number">
              <FileText :size="16" class="info-icon" />
              <div class="info-content">
                <span class="info-label">Протокол</span>
                <span class="info-value">№{{ analysis.protocol_number }}</span>
              </div>
            </div>
            
            <div class="info-item">
              <Calendar :size="16" class="info-icon" />
              <div class="info-content">
                <span class="info-label">Создан</span>
                <span class="info-value">{{ formatDate(analysis.created_at) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Прогресс обработки -->
          <div v-if="analysis.status === 'processing'" class="processing-section">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small">Обработка анализа...</span>
            </div>
            <div class="progress">
              <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" style="width: 100%"></div>
            </div>
          </div>
        </div>
        
        <div class="analysis-footer">
          <router-link 
            :to="`/impuls-analysis/analysis/${analysis.id}`" 
            class="btn btn-view-analysis"
          >
            <Eye :size="16" />
            <span>Открыть анализ</span>
          </router-link>
          
          <div class="analysis-actions-footer" v-if="analysis.status === 'completed'">
            <button 
              v-if="(analysis.protocols || []).length > 0"
              @click="downloadProtocol(analysis)" 
              class="btn btn-download-icon btn-download-protocol" 
              title="Скачать протокол"
            >
              <FileText :size="14" />
            </button>
            <button 
              @click="downloadResults(analysis.id)" 
              class="btn btn-download-icon btn-download-results" 
              title="Скачать результаты"
            >
              <Download :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>
                
    <!-- Пагинация -->
    <PaginationComponent
      v-if="analyses.length > 0"
      :current-page="pagination.current_page"
      :total-pages="Math.ceil(pagination.total / pagination.page_size)"
      :total-items="pagination.total"
      :page-size="pagination.page_size"
      :has-next="pagination.has_next"
      :has-previous="pagination.has_previous"
      :next-page="pagination.next_page"
      :previous-page="pagination.previous_page"
      @page-change="loadPage"
      @page-size-change="onPageSizeChange"
    />
    
    <!-- Модальное окно подтверждения удаления анализа -->
    <ConfirmDialog
      :show="showDeleteModal"
      title="Удаление анализа"
      message="Вы уверены, что хотите удалить этот анализ? Это действие нельзя отменить."
      confirm-text="Удалить"
      cancel-text="Отмена"
      variant="danger"
      @confirm="confirmDeleteAnalysis"
      @cancel="cancelDeleteAnalysis"
      @close="cancelDeleteAnalysis"
    />
  </div>
</template>

<script>
import { impulsAnalysisAPI } from './js/impuls-analysis.js'
import AnalysisStats from './components/AnalysisStats.vue'
import AnalysisStatus from './components/AnalysisStatus.vue'
import PaginationComponent from './components/PaginationComponent.vue'
import { useToast } from 'vue-toastification'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { 
  X, FileX, Eye, Trash2, Loader2, Zap, 
  Search, RotateCcw, BarChart3, Clock, Hourglass, CheckCircle, 
  AlertTriangle, FileText, Calendar, Download, ChevronLeft, 
  ChevronRight
} from 'lucide-vue-next'

const toast = useToast()

export default {
  components: {
    AnalysisStats,
    AnalysisStatus,
    PaginationComponent,
    ConfirmDialog,
    X,
    FileX,
    Eye,
    Trash2,
    Loader2,
    Zap,
    Search,
    RotateCcw,
    BarChart3,
    Clock,
    Hourglass,
    CheckCircle,
    AlertTriangle,
    FileText,
    Calendar,
    Download,
    ChevronLeft,
    ChevronRight
  },
  name: 'AnalysesList',
  data() {
    return {
      analyses: [],
      isLoading: false,
      filters: {
        status: '',
        search: ''
      },
      ordering: '-created_at',
      stats: {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0
      },
      pagination: {
        current_page: 1,
        page_size: 20,
        total: 0,
        has_next: false,
        has_previous: false,
        start_index: 0,
        end_index: 0
      },
      searchTimeout: null,
      showDeleteModal: false,
      analysisIdToDelete: null
    }
  },
  computed: {
    visiblePages() {
      const current = this.pagination.current_page
      const total = Math.ceil(this.pagination.total / this.pagination.page_size)
      const pages = []
      
      let start = Math.max(1, current - 2)
      let end = Math.min(total, current + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    },
    
    statsByStatus() {
      return {
        pending: this.stats.pending,
        processing: this.stats.processing,
        completed: this.stats.completed,
        failed: this.stats.failed,
        cancelled: this.stats.cancelled
      }
    }
  },
  async mounted() {
    await this.loadAnalyses()
    await this.loadStats()
  },
  methods: {
    async downloadProtocol(analysis) {
      try {
        const protocols = (analysis?.protocols || []).slice().sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at))
        if (!protocols.length) {
          toast.info('Нет протоколов для скачивания')
          return
        }
        const last = protocols[0]
        const resp = await impulsAnalysisAPI.downloadProtocol(analysis.id, last.id)
        if (resp && resp.success) {
          const blob = resp.data
          let filename = `protocol_${analysis.title || 'analysis'}.docx`
          const disposition = resp.headers && (resp.headers['content-disposition'] || resp.headers['Content-Disposition'])
          if (disposition && disposition.includes('filename=')) {
            const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/)
            const name = decodeURIComponent(match?.[1] || match?.[2] || '').trim()
            if (name) filename = name
          }
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          document.body.appendChild(a)
          a.click()
          a.remove()
          window.URL.revokeObjectURL(url)
          toast.success('Протокол скачан')
        } else {
          toast.error(resp?.message || 'Ошибка при скачивании протокола')
        }
      } catch (e) {
        toast.error('Ошибка при скачивании протокола')
      }
    },
    async loadAnalyses() {
      this.isLoading = true
      try {
        const params = {
          page: this.pagination.current_page,
          page_size: this.pagination.page_size,
          ordering: this.ordering,
          ...this.filters
        }
        
        const response = await impulsAnalysisAPI.getAnalyses(params)
        if (response && response.success) {
          this.analyses = response.data.results || []
          this.pagination = {
            current_page: response.data.current_page || 1,
            page_size: response.data.page_size || 20,
            total: response.data.total || 0,
            has_next: response.data.has_next || false,
            has_previous: response.data.has_previous || false,
            start_index: response.data.start_index || 0,
            end_index: response.data.end_index || 0
          }
        }
      } catch (error) {
        console.error('Error loading analyses:', error)
        toast.error('Ошибка при загрузке анализов')
      } finally {
        this.isLoading = false
      }
    },
    
    async loadStats() {
      try {
        const response = await impulsAnalysisAPI.getStatistics()
        if (response && response.success) {
          this.stats = response.data
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    },
    
    
    applyFilters() {
      this.pagination.current_page = 1
      this.loadAnalyses()
    },
    
    debouncedSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      this.searchTimeout = setTimeout(() => {
        this.applyFilters()
      }, 500)
    },
    
    clearFilters() {
      this.filters = {
        status: '',
        search: ''
      }
      this.ordering = '-created_at'
      this.applyFilters()
    },
    
    loadPage(page) {
      this.pagination.current_page = page
      this.loadAnalyses()
    },
    
    onPageSizeChange(newPageSize) {
      this.pagination.page_size = newPageSize
      this.pagination.current_page = 1 // Сбрасываем на первую страницу
      this.loadAnalyses()
    },
    
    getTypeBadgeClass(type) {
      const classes = {
        'standard': 'bg-primary',
        'advanced': 'bg-info',
        'custom': 'bg-secondary'
      }
      return classes[type] || 'bg-secondary'
    },
    
    formatDate(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU')
    },
    
    formatTime(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    },
    
    async restartAnalysis(analysisId) {
      try {
        const response = await impulsAnalysisAPI.restartAnalysis(analysisId)
        if (response && response.success) {
          toast.success('Анализ перезапущен')
          await Promise.all([
            this.loadAnalyses(),
            this.loadStats()
          ])
        } else {
          toast.error(response?.message || 'Ошибка при перезапуске анализа')
        }
      } catch (error) {
        toast.error('Ошибка при перезапуске анализа')
      }
    },
    
    showDeleteConfirm(analysisId) {
      this.analysisIdToDelete = analysisId
      this.showDeleteModal = true
    },
    async confirmDeleteAnalysis() {
      if (!this.analysisIdToDelete) return
      try {
        const response = await impulsAnalysisAPI.deleteAnalysis(this.analysisIdToDelete)
        if (response && response.success) {
          toast.success('Анализ удален')
          await Promise.all([
            this.loadAnalyses(),
            this.loadStats()
          ])
        } else {
          toast.error(response?.message || 'Ошибка при удалении анализа')
        }
      } catch (error) {
        toast.error('Ошибка при удалении анализа')
      } finally {
        this.showDeleteModal = false
        this.analysisIdToDelete = null
      }
    },
    cancelDeleteAnalysis() {
      this.showDeleteModal = false
      this.analysisIdToDelete = null
    },
    
    async downloadResults(analysisId) {
      try {
        const response = await impulsAnalysisAPI.downloadResults(analysisId)
        if (response && response.success) {
          const files = response.data?.files || []
          if (!files.length) {
            toast.info('Нет файлов результатов для скачивания')
            return
          }
          for (const f of files) {
            if (!f.url) continue
            try {
              const dl = await impulsAnalysisAPI.downloadByUrl(f.url)
              if (dl && dl.success) {
                const blob = dl.data
                let filename = f.filename || 'result'
                const disposition = dl.headers && (dl.headers['content-disposition'] || dl.headers['Content-Disposition'])
                if (disposition && disposition.includes('filename=')) {
                  const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/)
                  const name = decodeURIComponent(match?.[1] || match?.[2] || '').trim()
                  if (name) filename = name
                }
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = filename
                document.body.appendChild(a)
                a.click()
                a.remove()
                window.URL.revokeObjectURL(url)
              }
            } catch (e) {
              console.error('Ошибка скачивания файла результата:', f.url, e)
            }
          }
          toast.success('Результаты анализа скачаны')
        } else {
          toast.error(response?.message || 'Ошибка при получении результатов')
        }
      } catch (error) {
        toast.error('Ошибка при получении результатов')
      }
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
    
    getStatusLabel(status) {
      const labels = {
        'pending': 'Ожидает',
        'processing': 'Обрабатывается',
        'completed': 'Завершен',
        'failed': 'Ошибка',
        'cancelled': 'Отменен'
      }
      return labels[status] || status
    },
    
    getStatusIcon(status) {
      const icons = {
        'pending': Hourglass,
        'processing': Loader2,
        'completed': CheckCircle,
        'failed': AlertTriangle,
        'cancelled': AlertTriangle
      }
      return icons[status] || Clock
    },
    
    getStatusCardClass(status) {
      const classes = {
        'pending': 'card-secondary',
        'processing': 'card-warning',
        'completed': 'card-success',
        'failed': 'card-danger',
        'cancelled': 'card-info'
      }
      return classes[status] || 'card-secondary'
    },
    
    getStatusProgressClass(status) {
      const classes = {
        'pending': 'bg-secondary',
        'processing': 'bg-warning',
        'completed': 'bg-success',
        'failed': 'bg-danger',
        'cancelled': 'bg-info'
      }
      return classes[status] || 'bg-secondary'
    },
    
    getAnalysisHeaderClass(status) {
      const classes = {
        'pending': 'header-secondary',
        'processing': 'header-warning',
        'completed': 'header-success',
        'failed': 'header-danger',
        'cancelled': 'header-info'
      }
      return classes[status] || 'header-secondary'
    },
    
    getPercentage(value) {
      if (this.stats.total === 0) return 0
      return Math.round((value / this.stats.total) * 100)
    }
  }
}
</script>

<style scoped lang="scss">
.impuls-analysis-dashboard {
  padding: 2rem;
  min-height: 100vh;
  background: var(--bs-gray-100);
}

// Заголовок страницы
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  
  .header-content {
    flex: 1;
  }
  
}

// Секция заголовка страницы
.page-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .page-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  }
  
  .page-title {
    h1 {
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
  }
}

// Карточка фильтров
.filters-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  
  .card-body {
    padding: 1.5rem;
  }
  
  .form-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: var(--bs-heading-color);
    margin-bottom: 0.5rem;
  }
  
  .form-control,
  .form-select {
    border-radius: 8px;
    border-color: var(--bs-border-color);
    
    &:focus {
      border-color: var(--bs-primary);
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
  }
  
  .btn-reset-filters {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    border: none;
    color: white;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

// Статистические карточки
.statistics-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
  }

  &.card-primary::before {
    background: linear-gradient(90deg, #007bff 0%, #0056b3 100%);
  }

  &.card-warning::before {
    background: linear-gradient(90deg, #ffc107 0%, #e0a800 100%);
  }

  &.card-success::before {
    background: linear-gradient(90deg, #28a745 0%, #1e7e34 100%);
  }

  &.card-info::before {
    background: linear-gradient(90deg, #17a2b8 0%, #117a8b 100%);
  }

  &.card-danger::before {
    background: linear-gradient(90deg, #dc3545 0%, #c82333 100%);
  }

  &.card-secondary::before {
    background: linear-gradient(90deg, #6c757d 0%, #5a6268 100%);
  }
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.card-primary .card-icon {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
}

.card-warning .card-icon {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
}

.card-success .card-icon {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
}

.card-info .card-icon {
  background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%);
}

.card-danger .card-icon {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.card-secondary .card-icon {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
}

.card-info {
  flex: 1;
}

.card-subtitle {
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.card-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #2d3436;
}

.card-progress {
  margin-top: 0.5rem;
}

.card-progress .progress {
  height: 5px;
  background-color: #e9ecef;
  border-radius: 5px;
}

// Состояния загрузки и пустого списка
.loading-state,
.empty-state {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 3rem 2rem;
  text-align: center;
  
  .empty-icon {
    color: var(--bs-gray-400);
    margin-bottom: 1rem;
  }
  
  h4 {
    color: var(--bs-heading-color);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--bs-secondary-color);
    margin-bottom: 1.5rem;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    font-weight: 600;
    border-radius: 8px;
  }
}

// Сетка анализов
.analyses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.analysis-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
}

.analysis-header {
  padding: 1.5rem;
  background: var(--bs-light);
  border-left: 4px solid;
  
  &.header-primary {
    border-color: var(--bs-primary);
  }
  
  &.header-warning {
    border-color: var(--bs-warning);
  }
  
  &.header-success {
    border-color: var(--bs-success);
  }
  
  &.header-danger {
    border-color: var(--bs-danger);
  }
  
  &.header-info {
    border-color: var(--bs-info);
  }
  
  &.header-secondary {
    border-color: var(--bs-secondary);
  }
  
  .analysis-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--bs-heading-color);
    margin: 0;
  }
  
  .analysis-actions {
    display: flex;
    gap: 0.5rem;
    
    .btn-delete-analysis {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      border: none;
      color: white;
      font-weight: 600;
      border-radius: 6px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      
      &:hover {
        background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }
}

.analysis-body {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  
  .analysis-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bs-gray-100);
      border-radius: 8px;
      
      .info-icon {
        color: var(--bs-secondary-color);
      }
      
      .info-content {
        display: flex;
        flex-direction: column;
        
        .info-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--bs-secondary-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-value {
          font-weight: 600;
          color: var(--bs-heading-color);
        }
      }
    }
  }
  
  .processing-section {
    margin-top: auto;
    padding: 1rem;
    background: rgba(255, 193, 7, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(255, 193, 7, 0.3);
  }
}

.analysis-footer {
  padding: 1rem 1.5rem;
  background: var(--bs-gray-100);
  border-top: 1px solid var(--bs-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .btn-view-analysis {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(255, 107, 53, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #f7931e 0%, #e8851a 100%);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(255, 107, 53, 0.4);
      text-decoration: none;
    }
  }
  
  .analysis-actions-footer {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-download-icon {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s ease;
    text-decoration: none;
    position: relative;
    border: none;
    font-weight: 600;
    
    &.btn-download-results {
      background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
      color: white;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #1e7e34 0%, #155724 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
      }
    }
    
    &.btn-download-protocol {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
      }
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
}

// Пагинация
.pagination-modern {
  .page-item {
    margin: 0 2px;
    
    .page-link {
      border-radius: 9999px;
    }
  }
  
  .page-link {
    border: none;
    background: white;
    color: var(--bs-secondary-color);
    padding: 0.5rem 1rem;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--bs-primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    &:focus {
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
  }
  
  .page-item.active .page-link {
    background: var(--bs-primary);
    color: white;
  }
  
  .page-item.disabled .page-link {
    background: var(--bs-gray-200);
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      background: var(--bs-gray-200);
      color: var(--bs-secondary-color);
    }
  }
}

.pagination-info {
  margin-top: 1rem;
  
  .text-muted {
    font-size: 0.875rem;
  }
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Адаптивность
@media (max-width: 768px) {
  .impuls-analysis-dashboard {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .page-title-section {
    .page-title h1 {
      font-size: 1.5rem;
    }
  }
  
  .analyses-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .statistics-card {
    .card-content {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }
  }
  
  .analysis-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    
    .btn-view-analysis {
      justify-content: center;
    }
    
    .analysis-actions-footer {
      justify-content: center;
    }
  }
}
</style>
