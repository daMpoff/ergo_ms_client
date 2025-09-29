<template>
  <div class="porosity-analyses-list">
    <!-- Заголовок страницы в едином стиле -->
    <div class="page-header">
      <div class="header-content">
        <div class="page-title-section">
          <div class="page-icon">
            <Microscope :size="28" color="white" />
          </div>
          <div class="page-title">
            <h1>Мои анализы пористости</h1>
            <p class="page-subtitle">Управление, перезапуск, скачивание результатов и отчетов</p>
          </div>
        </div>
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
      :loading="deletingAnalysis !== null"
      @confirm="confirmDeleteAnalysis"
      @cancel="cancelDeleteAnalysis"
      @close="cancelDeleteAnalysis"
    />

    <!-- Модальное окно подтверждения массового удаления -->
    <ConfirmDialog
      :show="showBulkDeleteConfirm"
      title="Массовое удаление анализов"
      :message="bulkDeleteMessage"
      confirm-text="Удалить выбранные"
      cancel-text="Отмена"
      variant="danger"
      :loading="bulkDeleting"
      @confirm="confirmBulkDelete"
      @cancel="cancelBulkDelete"
      @close="cancelBulkDelete"
    />
    
    <div class="row">
      <div class="col-12">
            <!-- Фильтры и поиск (как в видео-аналитике) -->
            <div class="filters-card mb-3">
              <div class="card-body">
                <div class="row g-3 align-items-end">
                  <div class="col-md-4">
                    <label class="form-label">
                      <Search :size="16" />
                      <span>Поиск</span>
                    </label>
                    <input 
                      v-model.trim="search" 
                      type="text" 
                      class="form-control" 
                      placeholder="Название или описание анализа..."
                    />
                  </div>
                  <div class="col-auto">
                    <label ref="statusLabel" class="form-label">Статус</label>
                    <select 
                      ref="statusSelect"
                      v-model="currentFilter" 
                      class="form-select w-auto d-inline-block" 
                      :style="{ minWidth: statusMinWidth }"
                      @change="changePage(1)"
                    >
                      <option value="all">Все</option>
                      <option value="pending">Ожидает</option>
                      <option value="processing">Обрабатывается</option>
                      <option value="completed">Завершен</option>
                      <option value="failed">Ошибка</option>
                    </select>
                  </div>
                  <div class="col-auto">
                    <label ref="orderingLabel" class="form-label">Сортировка</label>
                    <select 
                      ref="orderingSelect"
                      v-model="ordering" 
                      class="form-select w-auto d-inline-block"
                      :style="{ minWidth: orderingMinWidth }"
                    >
                      <option value="-created_at">По дате создания ↓</option>
                      <option value="created_at">По дате создания ↑</option>
                      <option value="-start_time">По дате запуска ↓</option>
                      <option value="start_time">По дате запуска ↑</option>
                      <option value="name">По названию ↑</option>
                      <option value="-name">По названию ↓</option>
                      <option value="status">По статусу ↑</option>
                      <option value="-status">По статусу ↓</option>
                    </select>
                  </div>
                  <div class="col-auto">
                    <label ref="pageSizeLabel" class="form-label">На странице</label>
                    <select 
                      ref="pageSizeSelect"
                      v-model.number="pagination.page_size" 
                      class="form-select w-auto d-inline-block" 
                      :style="{ minWidth: pageSizeMinWidth }"
                      @change="changePage(1)"
                    >
                      <option :value="5">5</option>
                      <option :value="10">10</option>
                      <option :value="20">20</option>
                      <option :value="50">50</option>
                    </select>
                  </div>
                  <div class="col align-self-end">
                    <button 
                      class="btn btn-reset-filters w-100" 
                      :style="resetBtnStyle"
                      @click="resetFilters" 
                      title="Сбросить фильтры и обновить список"
                    >
                      <RotateCcw :size="16" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- Статистические карточки -->
            <div class="row g-4 mb-3">
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
                      <h6 class="card-subtitle">{{ getStatusText(key) }}</h6>
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

            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Загрузка...</span>
              </div>
            </div>
            
            <div v-else-if="filteredAnalyses.length === 0" class="text-center py-4">
              <Inbox class="text-muted mb-3" size="48" />
              <h5 class="text-muted">Анализы не найдены</h5>
              <p class="text-muted">Попробуйте изменить параметры фильтрации/сортировки или создайте новый анализ</p>
            </div>
            
            <div v-else>
              <!-- Панель удаления -->
              <div class="card mb-3 bulk-actions">
                <div class="card-body">
                  <div class="row g-3 align-items-center">
                    <!-- Блок удаления по номерам -->
                    <div class="col-12 col-md-6">
                      <label class="form-label d-flex align-items-center gap-2 mb-2">
                        <Search :size="16" />
                        <span class="fw-bold">Удалить по номерам</span>
                      </label>
                      <div class="input-group">
                        <span class="input-group-text d-inline-flex align-items-center">
                          <FileText size="16" />
                        </span>
                        <input
                          v-model.trim="bulkInput"
                          type="text"
                          class="form-control"
                          placeholder="Например: 12-15, 18; 20"
                          aria-label="Номера анализов"
                        />
                        <button
                          class="btn btn-danger d-inline-flex align-items-center gap-1 lh-1"
                          :disabled="!canBulkDeleteByInput || bulkDeleting"
                          @click="requestBulkDeleteByInput"
                        >
                          <Trash2 size="16" />
                          <span class="d-inline-flex align-items-center">Удалить</span>
                        </button>
                      </div>
                      <div class="form-text text-muted mt-1">
                        Указывайте номера через запятую, пробел или точку с запятой. Диапазоны — через тире (например: 12-15).
                      </div>
                    </div>

                    <!-- Блок действий с выделением -->
                    <div class="col-12 col-md-6">
                      <div class="d-flex flex-wrap gap-2 justify-content-md-end align-items-center h-100">
                        <button class="btn btn-danger d-inline-flex align-items-center" :disabled="selectedIds.length === 0 || bulkDeleting" @click="requestBulkDeleteSelected">
                          <Trash2 class="me-1" size="16" /> Удалить выбранные ({{ selectedIds.length }})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Блок скачивания архива отчетов -->
              <div class="card mb-3 download-actions">
                <div class="card-body">
                  <div class="row g-3 align-items-end">
                    <div class="col-12">
                      <label class="form-label d-flex align-items-center gap-2 mb-2">
                        <Download :size="16" />
                        <span class="fw-bold">Скачать архив отчетов</span>
                      </label>
                      <div class="input-group">
                        <span class="input-group-text d-inline-flex align-items-center">
                          <Hash size="16" />
                        </span>
                        <input
                          v-model.trim="downloadInput"
                          type="text"
                          class="form-control"
                          placeholder="Например: 1-100, 150, 200-300"
                          aria-label="Номера анализов для скачивания"
                        />
                        <select v-model="reportType" class="form-select" style="max-width: 100px;">
                          <option value="docx">DOCX</option>
                          <option value="pdf">PDF</option>
                        </select>
                        <button
                          class="btn btn-primary d-inline-flex align-items-center gap-1 lh-1"
                          :disabled="!canDownloadByInput || downloadingReports"
                          @click="downloadMultipleReports"
                        >
                          <Download size="16" />
                          <span v-if="downloadingReports">Скачивание...</span>
                          <span v-else>Скачать архив</span>
                        </button>
                      </div>
                      <div class="form-text text-muted mt-1">
                        Введите номера анализов через запятую или тире для диапазонов (например: 1-100, 150, 200-300). Ограничений по количеству нет.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row">
                <div
                  v-for="analysis in paginatedAnalyses"
                  :key="analysis.id"
                  class="col-md-6 col-lg-4 mb-4"
                >
                  <div class="analysis-card" :class="{ selected: isSelected(analysis.id) }" @click="onCardClick(analysis.id, $event)">
                    <div class="analysis-header d-flex justify-content-between align-items-start" :class="getAnalysisHeaderClass(analysis.status)">
                      <div class="d-flex justify-content-between align-items-start w-100">
                        <h6 class="card-title mb-0">{{ analysis.name || 'Анализ пористости' }}</h6>
                        <span :class="getStatusBadgeClass(analysis.status)">
                          <component :is="getStatusIcon(analysis.status)" class="me-1" size="14" />
                          {{ getStatusText(analysis.status) }}
                        </span>
                      </div>
                    </div>
                    <div class="card-body">
                      <p class="card-text text-muted small">
                        {{ analysis.description || 'Описание отсутствует' }}
                      </p>
                      
                      <div class="analysis-info">
                        <div class="info-row">
                          <div class="info-col">
                            <div class="info-item">
                              <FileText class="me-1" size="14" />
                              <small class="text-muted">Номер анализа:</small>
                              <div>{{ analysis.id }}</div>
                            </div>
                            <div class="info-item">
                              <Calendar class="me-1" size="14" />
                              <small class="text-muted">Создан:</small>
                              <div>&nbsp;{{ formatDate(analysis.created_at) }}</div>
                            </div>
                            <div class="info-item" v-if="analysis.start_time">
                              <Clock class="me-1" size="14" />
                              <small class="text-muted">Запущен:</small>
                              <div>&nbsp;{{ formatDate(analysis.start_time) }}</div>
                            </div>
                          </div>
                          <div class="info-col">
                            <div class="info-item">
                              <Ruler class="me-1" size="14" />
                              <small class="text-muted">Шкала:</small>
                              <div>{{ analysis.scale_value }} мкм</div>
                            </div>
                            <div class="info-item" v-if="analysis.duration_human">
                              <Clock class="me-1" size="14" />
                              <small class="text-muted">Длительность:</small>
                              <div>{{ analysis.duration_human }}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div v-if="analysis.status === 'completed'" class="results-row">
                          <div class="info-item">
                            <BarChart3 class="me-1" size="14" />
                            <small class="text-muted">Пористость:</small>
                            <div class="fw-bold text-success">{{ analysis.porosity_percentage?.toFixed(2) }}%</div>
                          </div>
                          <div class="info-item">
                            <CircleDot class="me-1" size="14" />
                            <small class="text-muted">Пор:</small>
                            <div class="fw-bold">{{ analysis.number_of_pores }}</div>
                          </div>
                        </div>
                        
                        <div v-if="analysis.status === 'failed'" class="error-row">
                          <div class="alert alert-danger small mb-0">
                            <AlertTriangle class="me-1" size="14" />
                            {{ analysis.error_message || 'Неизвестная ошибка' }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="card-footer">
                      <div class="action-buttons">
                        <!-- Удален переход на детальную страницу -->
                        
                        <button
                          v-if="analysis.status === 'failed'"
                          type="button"
                          class="action-btn warning"
                          @click="restartAnalysis(analysis.id)"
                          :disabled="restartingAnalysis === analysis.id"
                          title="Перезапустить анализ с ошибкой"
                        >
                          <RotateCcw class="me-1" size="16" />
                          {{ restartingAnalysis === analysis.id ? 'Перезапуск...' : 'Перезапустить' }}
                        </button>
                        
                        <button
                          v-if="analysis.status === 'completed'"
                          type="button"
                          class="action-btn info"
                          @click="restartAnalysis(analysis.id)"
                          :disabled="restartingAnalysis === analysis.id"
                          title="Перезапустить завершенный анализ"
                        >
                          <RotateCcw class="me-1" size="16" />
                          {{ restartingAnalysis === analysis.id ? 'Перезапуск...' : 'Перезапустить' }}
                        </button>
                        
                        
                        <div v-if="analysis.status === 'completed'" class="dropdown d-inline-block">
                          <button
                            type="button"
                            class="action-btn success dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            :disabled="downloadingAnalysis === analysis.id"
                          >
                            <Download class="me-1" size="16" />
                            {{ downloadingAnalysis === analysis.id ? 'Скачивание...' : 'Скачать' }}
                          </button>
                          <ul class="dropdown-menu">
                            <li>
                              <a class="dropdown-item" href="#" @click.prevent="downloadReport(analysis.id, 'pdf')">
                                <FileText class="me-2" size="16" />
                                PDF отчет
                              </a>
                            </li>
                            <li>
                              <a class="dropdown-item" href="#" @click.prevent="downloadReport(analysis.id, 'docx')">
                                <FileText class="me-2" size="16" />
                                Word отчет
                              </a>
                            </li>
                          </ul>
                        </div>
                        
                        <button
                          type="button"
                          class="action-btn danger"
                          @click="deleteAnalysis(analysis.id)"
                          :disabled="deletingAnalysis === analysis.id"
                        >
                          <Trash2 class="me-1" size="16" />
                          {{ deletingAnalysis === analysis.id ? 'Удаление...' : 'Удалить' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Пагинация: всегда отображается -->
            <div class="d-flex justify-content-center mt-4">
              <nav aria-label="Навигация по страницам">
                <ul class="pagination">
                  <!-- Кнопка "Первая" -->
                  <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                    <button 
                      class="page-link" 
                      @click="changePage(1)"
                      :disabled="pagination.current_page === 1"
                      title="Первая страница"
                    >
                      <ChevronsLeft :size="16" />
                    </button>
                  </li>
                  
                  <!-- Кнопка "Предыдущая" -->
                  <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                    <button 
                      class="page-link" 
                      @click="changePage(pagination.current_page - 1)"
                      :disabled="pagination.current_page === 1"
                    >
                      <ChevronLeft class="me-1" size="16" />
                      Предыдущая
                    </button>
                  </li>
                  
                  <!-- Номера страниц -->
                  <li 
                    v-for="page in visiblePages" 
                    :key="page"
                    class="page-item"
                    :class="{ active: page === pagination.current_page }"
                  >
                    <button 
                      class="page-link" 
                      @click="changePage(page)"
                    >
                      {{ page }}
                    </button>
                  </li>
                  
                  <!-- Кнопка "Следующая" -->
                  <li class="page-item" :class="{ disabled: pagination.current_page === displayTotalPages }">
                    <button 
                      class="page-link" 
                      @click="changePage(pagination.current_page + 1)"
                      :disabled="pagination.current_page === displayTotalPages"
                    >
                      Следующая
                      <ChevronRight class="ms-1" size="16" />
                    </button>
                  </li>
                  
                  <!-- Кнопка "Последняя" -->
                  <li class="page-item" :class="{ disabled: pagination.current_page === displayTotalPages }">
                    <button 
                      class="page-link" 
                      @click="changePage(displayTotalPages)"
                      :disabled="pagination.current_page === displayTotalPages"
                      title="Последняя страница"
                    >
                      <ChevronsRight :size="16" />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
            
            <!-- Информация о страницах: всегда отображается -->
            <div class="text-center mt-3">
              <small class="text-muted">
                Страница {{ pagination.current_page }} из {{ displayTotalPages }} 
                ({{ displayTotalItems }} анализов всего)
              </small>
            </div>
          
      </div>
    </div>
  </div>
</template>

<script>
import { porosityAnalysisAPI } from './js/porosity-analysis.js'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { 
  Microscope, Clock, Loader2, CheckCircle, AlertTriangle, Inbox, Plus,
  Calendar, Ruler, BarChart3, CircleDot, Eye, RotateCcw, Download, Trash2, FileText,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Hash
} from 'lucide-vue-next'

import { useToast } from 'vue-toastification'

const toast = useToast()

export default {
  name: 'PorosityAnalysesList',
  components: {
    ConfirmDialog,
    Microscope, Clock, Loader2, CheckCircle, AlertTriangle, Inbox, Plus,
    Calendar, Ruler, BarChart3, CircleDot, Eye, RotateCcw, Download, Trash2, FileText,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Hash
  },
  data() {
    return {
      analyses: [],
      loading: true,
      currentFilter: 'all',
      search: '',
      ordering: '-created_at',
      restartingAnalysis: null,
      downloadingAnalysis: null,
      deletingAnalysis: null,
      showDeleteConfirm: false,
      analysisToDelete: null,
      restartingMultiple: false,
      // Массовое удаление
      selectedIds: [],
      bulkInput: '',
      showBulkDeleteConfirm: false,
      bulkDeleting: false,
      bulkMode: 'selected',
      bulkPreviewIds: [],
      bulkPreviewExistingIds: [],
      bulkPreviewNotFound: [],
      bulkPreviewExistingCount: 0,
      // Скачивание архива отчетов
      downloadInput: '',
      reportType: 'docx',
      downloadingReports: false,
      // Данные для пагинации
      pagination: {
        current_page: 1,
        total_pages: 1,
        count: 0,
        page_size: 10
      },
      // Статистика по статусам
      stats: {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
      },
      // Минимальная ширина для селектов (под заголовок)
      statusMinWidth: 'auto',
      orderingMinWidth: 'auto',
      pageSizeMinWidth: 'auto',
      // Размеры для кнопки сброса
      resetBtnStyle: {}
    }
  },
  computed: {
    filteredAnalyses() {
      let list = this.analyses

      // Фильтр по статусу
      if (this.currentFilter !== 'all') {
        list = list.filter(analysis => analysis.status === this.currentFilter)
      }

      // Поиск по имени и описанию
      const query = (this.search || '').toString().trim().toLowerCase()
      if (query) {
        list = list.filter(a => {
          const name = (a.name || '').toString().toLowerCase()
          const desc = (a.description || '').toString().toLowerCase()
          return name.includes(query) || desc.includes(query)
        })
      }

      // Сортировка на клиенте
      const ord = this.ordering || '-created_at'
      const sorted = [...list]
      const getDate = v => (v ? new Date(v).getTime() : 0)
      const statusRank = {
        pending: 1,
        processing: 2,
        completed: 3,
        failed: 4
      }
      if (ord === 'created_at') {
        sorted.sort((a, b) => getDate(a.created_at) - getDate(b.created_at))
      } else if (ord === '-created_at') {
        sorted.sort((a, b) => getDate(b.created_at) - getDate(a.created_at))
      } else if (ord === 'start_time') {
        sorted.sort((a, b) => getDate(a.start_time) - getDate(b.start_time))
      } else if (ord === '-start_time') {
        sorted.sort((a, b) => getDate(b.start_time) - getDate(a.start_time))
      } else if (ord === 'name') {
        sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      } else if (ord === '-name') {
        sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
      } else if (ord === 'status') {
        sorted.sort((a, b) => (statusRank[a.status] || 0) - (statusRank[b.status] || 0))
      } else if (ord === '-status') {
        sorted.sort((a, b) => (statusRank[b.status] || 0) - (statusRank[a.status] || 0))
      }
      return sorted
    },
    // Количество элементов и страниц для отображения
    displayTotalItems() {
      return this.filteredAnalyses.length
    },
    displayTotalPages() {
      return Math.max(1, Math.ceil(this.displayTotalItems / this.pagination.page_size))
    },
    // Элементы текущей страницы
    paginatedAnalyses() {
      const start = (this.pagination.current_page - 1) * this.pagination.page_size
      const end = start + this.pagination.page_size
      return this.filteredAnalyses.slice(start, end)
    },
    
    failedAnalyses() {
      return this.analyses.filter(analysis => analysis.status === 'failed')
    },
    
    // Вычисляем видимые страницы для пагинации
    visiblePages() {
      const current = this.pagination.current_page
      const total = this.displayTotalPages
      const delta = 2 // Количество страниц с каждой стороны от текущей
      
      let start = Math.max(1, current - delta)
      let end = Math.min(total, current + delta)
      
      // Если страниц мало, показываем все
      if (end - start < 4) {
        start = Math.max(1, end - 4)
        end = Math.min(total, start + 4)
      }
      
      const pages = []
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
        failed: this.stats.failed
      }
    },
    canBulkDeleteByInput() {
      return (this.bulkInput || '').trim().length > 0
    },
    bulkDeleteMessage() {
      const ids = this.bulkPreviewIds || []
      if (!ids.length) return 'Не указаны корректные номера анализов.'
      const existing = this.bulkPreviewExistingCount
      return `Будут удалены ${existing} анализ(а/ов). Действие необратимо.`
    },
    canDownloadByInput() {
      return (this.downloadInput || '').trim().length > 0 && !this.downloadingReports
    }
  },
  async mounted() {
    this.syncSelectMinWidths()
    await Promise.all([ this.loadAnalyses(), this.loadStats() ])
  },
  methods: {
    syncSelectMinWidths() {
      // Вычисляем минимальную ширину селектов по ширине соответствующих label (+ небольшой отступ)
      const pad = 16
      const setMin = (labelRef, key) => {
        const el = this.$refs[labelRef]
        if (el && el instanceof HTMLElement) {
          const width = Math.ceil(el.getBoundingClientRect().width) + pad
          this[key] = `${width}px`
        }
      }
      setMin('statusLabel', 'statusMinWidth')
      setMin('orderingLabel', 'orderingMinWidth')
      setMin('pageSizeLabel', 'pageSizeMinWidth')
      // Подгоняем кнопку под высоту одного из селектов и ширину в 4 раза больше
      this.$nextTick(() => {
        const refSelect = this.$refs.pageSizeSelect || this.$refs.orderingSelect || this.$refs.statusSelect
        if (refSelect && refSelect instanceof HTMLElement) {
          const rect = refSelect.getBoundingClientRect()
          const height = Math.ceil(rect.height)
          const width = Math.ceil(rect.width) * 4
          this.resetBtnStyle = {
            height: `${height}px`
          }
        }
      })
    },
    getDisplayName(analysis) {
      // Больше не используем, оставлено для совместимости, возвращаем только имя
      return (analysis && analysis.name) ? analysis.name : 'Анализ пористости'
    },
    resetFilters() {
      this.search = ''
      this.ordering = '-created_at'
      this.currentFilter = 'all'
      this.pagination.current_page = 1
      // Перезагружаем список и статистику
      this.loadAnalyses(1)
      this.loadStats().catch(() => {})
    },
    async loadStats() {
      try {
        const response = await porosityAnalysisAPI.getStatistics()
        if (response && response.success) {
          this.stats = {
            total: (response.data?.pending || 0) + (response.data?.processing || 0) + (response.data?.completed || 0) + (response.data?.failed || 0),
            pending: response.data?.pending || 0,
            processing: response.data?.processing || 0,
            completed: response.data?.completed || 0,
            failed: response.data?.failed || 0
          }
        }
      } catch (e) {
        // игнорируем, оставим нули
      }
    },
    getStatusCardClass(status) {
      const classes = {
        pending: 'card-secondary',
        processing: 'card-warning',
        completed: 'card-success',
        failed: 'card-danger'
      }
      return classes[status] || 'card-secondary'
    },
    getStatusProgressClass(status) {
      const classes = {
        pending: 'bg-secondary',
        processing: 'bg-warning',
        completed: 'bg-success',
        failed: 'bg-danger'
      }
      return classes[status] || 'bg-secondary'
    },
    getStatusIcon(status) {
      const icons = {
        pending: 'Clock',
        processing: 'Loader2',
        completed: 'CheckCircle',
        failed: 'AlertTriangle'
      }
      return icons[status] || 'Clock'
    },
    getPercentage(value) {
      if (!this.stats.total) return 0
      return Math.round((value / this.stats.total) * 100)
    },
    getAnalysisHeaderClass(status) {
      const classes = {
        pending: 'header-secondary',
        processing: 'header-warning',
        completed: 'header-success',
        failed: 'header-danger'
      }
      return classes[status] || 'header-secondary'
    },
    async loadAnalyses(page = 1) {
      this.loading = true
      try {
        const params = {
          page: page,
          page_size: this.pagination.page_size
        }
        
        const response = await porosityAnalysisAPI.getAnalyses(params)
        if (response && response.success && response.data) {
          // Обрабатываем ответ с пагинацией
          if (response.data.results) {
            this.analyses = response.data.results
            this.pagination = {
              current_page: response.data.current_page || page,
              total_pages: response.data.total_pages || 1,
              count: response.data.count || 0,
              page_size: response.data.page_size || this.pagination.page_size
            }
          } else {
            // Fallback для старого формата ответа
            this.analyses = response.data || []
            this.pagination = {
              current_page: 1,
              total_pages: 1,
              count: this.analyses.length,
              page_size: this.pagination.page_size
            }
          }
        } else {
          toast.error(response?.message || 'Ошибка при загрузке анализов')
          this.analyses = []
          this.pagination = {
            current_page: 1,
            total_pages: 1,
            count: 0,
            page_size: 20
          }
        }
      } catch (error) {
        let errorMessage = 'Ошибка при загрузке анализов'
        if (error && typeof error === 'object') {
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || error.response.data.detail || errorMessage
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        toast.error(errorMessage)
        // Устанавливаем пустой массив при ошибке
        this.analyses = []
        this.pagination = {
          current_page: 1,
          total_pages: 1,
          count: 0,
          page_size: 20
        }
      } finally {
        this.loading = false
      }
    },
    isSelected(id) {
      return this.selectedIds.includes(id)
    },
    toggleSelect(id) {
      const idx = this.selectedIds.indexOf(id)
      if (idx === -1) this.selectedIds.push(id)
      else this.selectedIds.splice(idx, 1)
    },
    onCardClick(id, event) {
      // Не переключаем выделение при клике по интерактивным элементам внутри карточки
      const interactiveSelectors = 'a, button, input, select, textarea, .dropdown-menu, .dropdown-toggle'
      const target = event.target
      if (target && (target.closest(interactiveSelectors))) {
        return
      }
      this.toggleSelect(id)
    },
    selectAllOnPage() {
      const pageIds = this.paginatedAnalyses.map(a => a.id)
      const set = new Set(this.selectedIds)
      pageIds.forEach(id => set.add(id))
      this.selectedIds = Array.from(set)
    },
    clearSelection() {
      this.selectedIds = []
    },
    parseIdsFromInput(text) {
      if (!text) return []
      const tokens = String(text).split(/[,;\s]+/).map(t => t.trim()).filter(Boolean)
      const ids = []
      for (const token of tokens) {
        if (/^\d+$/.test(token)) {
          ids.push(parseInt(token, 10))
          continue
        }
        const m = token.match(/^(\d+)-(\d+)$/)
        if (m) {
          const start = parseInt(m[1], 10)
          const end = parseInt(m[2], 10)
          if (start <= end) {
            for (let i = start; i <= end; i += 1) ids.push(i)
          } else {
            for (let i = start; i >= end; i -= 1) ids.push(i)
          }
          continue
        }
        // игнорируем некорректные токены, уведомим отдельно
      }
      return Array.from(new Set(ids)).sort((a, b) => a - b)
    },
    requestBulkDeleteSelected() {
      if (this.selectedIds.length === 0) return
      this.bulkMode = 'selected'
      this.bulkPreviewIds = [...this.selectedIds]
      this.previewBulkDeletion()
    },
    requestBulkDeleteByInput() {
      const raw = String(this.bulkInput || '')
      const tokens = raw.split(/[,;\s]+/).map(t => t.trim()).filter(Boolean)
      const ids = this.parseIdsFromInput(raw)
      if (ids.length === 0) {
        toast.warning('Укажите корректные номера анализов')
        return
      }
      const validTokenRe = /^(\d+)|(\d+)-(\d+)$/
      const invalid = tokens.filter(t => !validTokenRe.test(t))
      if (invalid.length > 0) {
        toast.warning(`Некорректные элементы: ${invalid.join(', ')}`)
      }
      this.bulkMode = 'input'
      this.bulkPreviewIds = ids
      this.previewBulkDeletion()
    },
    async previewBulkDeletion() {
      try {
        const params = { analysis_ids: this.bulkPreviewIds, dry_run: true }
        const response = await porosityAnalysisAPI.deleteMultipleAnalyses(params)
        // Ответ в dry_run success: true, would_delete_count, existing_ids, not_found
        if (response && response.success) {
          const payload = response.data || response
          this.bulkPreviewExistingCount = payload.would_delete_count || (payload.existing_ids ? payload.existing_ids.length : 0) || 0
          this.bulkPreviewExistingIds = payload.existing_ids || []
          this.bulkPreviewNotFound = payload.not_found || []
        } else {
          this.bulkPreviewExistingCount = this.bulkPreviewIds.length
          this.bulkPreviewExistingIds = [...this.bulkPreviewIds]
          this.bulkPreviewNotFound = []
        }
      } catch (e) {
        this.bulkPreviewExistingCount = this.bulkPreviewIds.length
        this.bulkPreviewExistingIds = [...this.bulkPreviewIds]
        this.bulkPreviewNotFound = []
      } finally {
        this.showBulkDeleteConfirm = true
      }
    },
    async confirmBulkDelete() {
      this.bulkDeleting = true
      try {
        let params = {}
        if (this.bulkMode === 'selected') {
          params = { analysis_ids: this.selectedIds }
        } else {
          params = { analysis_ids: this.bulkPreviewIds }
        }
        const response = await porosityAnalysisAPI.deleteMultipleAnalyses(params)
        if (response && response.success) {
          const payload = response.data || response
          const deletedCount = payload.deleted_count || payload.deleted || 0
          toast.success(`Удалено ${deletedCount} анализов`)
          // Удаляем из локального списка
          const deletedIds = new Set((payload.deleted_ids || this.bulkPreviewExistingIds || []).concat(this.bulkPreviewIds))
          this.analyses = this.analyses.filter(a => !deletedIds.has(a.id))
          // Сначала закрываем модалку, затем очищаем стейты предпросмотра/выделения
          this.showBulkDeleteConfirm = false
          this.$nextTick(() => {
            this.clearSelection()
            this.bulkInput = ''
            this.bulkPreviewIds = []
            this.bulkPreviewExistingIds = []
            this.bulkPreviewNotFound = []
            this.bulkPreviewExistingCount = 0
          })
          // Обновляем статистику и список в фоне
          try { await this.loadStats() } catch {}
          this.loadAnalyses(this.pagination.current_page).catch(() => {})
        } else {
          toast.error(response?.error || response?.message || 'Ошибка при массовом удалении')
        }
      } catch (error) {
        const msg = error?.response?.data?.message || error?.message || 'Ошибка при массовом удалении'
        toast.error(msg)
      } finally {
        this.bulkDeleting = false
      }
    },
    cancelBulkDelete() {
      this.showBulkDeleteConfirm = false
      this.bulkPreviewIds = []
    },
    
    // Метод для смены страницы
    async changePage(page) {
      const total = this.displayTotalPages
      if (page >= 1 && page <= total && page !== this.pagination.current_page) {
        this.pagination.current_page = page
        // Данные уже загружены; пагинация клиентская
      }
    },
    
    // setFilter больше не используется (старые фильтры удалены)
    
    getStatusBadgeClass(status) {
      const classes = {
        pending: 'badge badge-warning',
        processing: 'badge badge-info',
        completed: 'badge badge-success',
        failed: 'badge badge-danger'
      }
      return classes[status] || 'badge badge-secondary'
    },
    
    getStatusIcon(status) {
      const icons = {
        pending: 'Clock',
        processing: 'Loader2',
        completed: 'CheckCircle',
        failed: 'AlertTriangle'
      }
      return icons[status] || 'HelpCircle'
    },
    
    getStatusText(status) {
      const texts = {
        pending: 'Ожидает',
        processing: 'Обрабатывается',
        completed: 'Завершен',
        failed: 'Ошибка'
      }
      return texts[status] || status
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    async restartAnalysis(analysisId) {
      this.restartingAnalysis = analysisId
      try {
        const response = await porosityAnalysisAPI.restartAnalysis(analysisId)
        if (response && response.success) {
          toast.success('Анализ перезапущен')
          
          // Немедленно обновляем статус анализа в списке
          const analysisIndex = this.analyses.findIndex(a => a.id === analysisId)
          if (analysisIndex !== -1) {
            this.analyses[analysisIndex].status = 'pending'
            this.analyses[analysisIndex].start_time = new Date().toISOString()
            this.analyses[analysisIndex].updated_at = new Date().toISOString()
          }
          
          // Обновляем список в фоне с обработкой ошибок
          try {
            await this.loadAnalyses(this.pagination.current_page)
          } catch (error) {
            console.warn('Ошибка при обновлении списка анализов:', error)
            // Не показываем ошибку пользователю, так как основной функционал работает
          }
        } else {
          toast.error((response && response.message) ? response.message : 'Ошибка при перезапуске анализа')
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
        this.restartingAnalysis = null
      }
    },
    
    async restartFailedAnalyses() {
      if (this.failedAnalyses.length === 0) {
        toast.warning('Нет анализов с ошибками для перезапуска')
        return
      }
      
      this.restartingMultiple = true
      try {
        const response = await porosityAnalysisAPI.restartMultipleAnalyses({
          status: 'failed'
        })
        
        if (response && response.success) {
          toast.success(`Перезапущено ${response.restarted_count} анализов`)
          
          // Немедленно обновляем статусы анализов в списке
            this.failedAnalyses.forEach(analysis => {
            const analysisIndex = this.analyses.findIndex(a => a.id === analysis.id)
            if (analysisIndex !== -1) {
              this.analyses[analysisIndex].status = 'pending'
              this.analyses[analysisIndex].start_time = new Date().toISOString()
              this.analyses[analysisIndex].updated_at = new Date().toISOString()
            }
          })
          
          // Обновляем список в фоне
          try {
            await this.loadAnalyses(this.pagination.current_page)
          } catch (error) {
            console.warn('Ошибка при обновлении списка анализов:', error)
          }
        } else {
          toast.error((response && response.message) ? response.message : 'Ошибка при массовом перезапуске')
        }
      } catch (error) {
        let errorMessage = 'Ошибка при массовом перезапуске'
        if (error && typeof error === 'object') {
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || error.response.data.detail || errorMessage
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        toast.error(errorMessage)
      } finally {
        this.restartingMultiple = false
      }
    },
    
    // Удален скачиваемый ZIP архив результатов
    
    deleteAnalysis(analysisId) {
      this.analysisToDelete = analysisId
      this.showDeleteConfirm = true
    },
    
    async confirmDeleteAnalysis() {
      if (!this.analysisToDelete) return
      
      this.deletingAnalysis = this.analysisToDelete
      try {
        const response = await porosityAnalysisAPI.deleteAnalysis(this.analysisToDelete)
        
        // Проверяем успешность удаления - учитываем разные форматы ответов
        const isSuccess = response && (
          response.success === true || 
          response.status === 204 || 
          response.status === 200 ||
          (response.data && response.data.success === true)
        )
        
        if (isSuccess) {
          toast.success('Анализ удален')
          
          // Немедленно удаляем анализ из списка
          this.analyses = this.analyses.filter(analysis => analysis.id !== this.analysisToDelete)
          // Обновляем статистику карточек сразу
          try { await this.loadStats() } catch {}
          
          // Пытаемся обновить список в фоне, но не блокируем UI
          this.loadAnalyses(this.pagination.current_page).catch(() => {
            // Игнорируем ошибки при обновлении списка
          })
        } else {
          const errorMsg = (response && response.message) ? response.message : 'Ошибка при удалении анализа'
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
        this.deletingAnalysis = null
        this.showDeleteConfirm = false
        this.analysisToDelete = null
      }
    },
    
    cancelDeleteAnalysis() {
      this.showDeleteConfirm = false
      this.analysisToDelete = null
    },
    
    async downloadReport(analysisId, reportType) {
      this.downloadingAnalysis = analysisId
      try {
        console.log(`Downloading report type: ${reportType} for analysis: ${analysisId}`)
        
        // Используем API клиент для скачивания файла
        const response = await porosityAnalysisAPI.downloadReport(analysisId, reportType)
        
        if (response && response.success && response.data) {
          // Создаем blob из данных
          const blob = new Blob([response.data], {
            type: reportType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          })
          
          // Создаем ссылку для скачивания
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url

          // Пытаемся получить имя файла из заголовка Content-Disposition
          let filename = null
          try {
            const cd = response.headers && (response.headers['content-disposition'] || response.headers['Content-Disposition'])
            if (cd && typeof cd === 'string') {
              const match = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)
              if (match) {
                filename = decodeURIComponent(match[1] || match[2] || '')
              }
            }
          } catch (_) { /* ignore */ }

          // Фолбек: используем название анализа
          if (!filename) {
            const a = this.analyses.find(x => x.id === analysisId)
            const baseName = (a && a.name ? a.name : `analysis_${analysisId}`)
            const safeName = String(baseName).replace(/[^\w\s\-]/g, '').trim() || `analysis_${analysisId}`
            filename = `${safeName}.${reportType}`
          }

          link.download = filename
          
          // Добавляем ссылку в DOM, кликаем и удаляем
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Освобождаем URL
          window.URL.revokeObjectURL(url)
          
          toast.success(`Отчет ${reportType.toUpperCase()} скачивается`)
        } else {
          throw new Error((response && response.message) ? response.message : 'Ошибка при скачивании отчета')
        }
      } catch (error) {
        console.error('Download error:', error)
        toast.error(error.message || 'Ошибка при скачивании отчета')
      } finally {
        this.downloadingAnalysis = null
      }
    },
    async downloadMultipleReports() {
      if (!this.canDownloadByInput) {
        return
      }

      this.downloadingReports = true

      try {
        const params = {
          input: this.downloadInput.trim(),
          report_type: this.reportType
        }

        console.log('Downloading multiple reports with params:', params)

        const response = await porosityAnalysisAPI.downloadMultipleReports(params)
        console.log('Download response:', response)

        if (response && response.success && response.data) {
          // Получаем blob из ответа
          const blob = response.data
          
          // Создаем ссылку для скачивания
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          
          // Формируем имя файла
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
          link.download = `porosity_reports_${this.reportType}_${timestamp}.zip`
          
          // Добавляем ссылку в DOM, кликаем и удаляем
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Освобождаем URL
          window.URL.revokeObjectURL(url)
          
          // Показываем информацию о результате скачивания
          const successCount = parseInt(response.headers?.['X-Reports-Count'] || '0')
          const failedCount = parseInt(response.headers?.['X-Failed-Count'] || '0')
          const notFound = response.headers?.['X-Not-Found']
          
          let message = ''
          let toastType = 'success'
          
          if (successCount > 0) {
            message = `Архив отчетов скачивается. Успешно создано отчетов: ${successCount}`
            if (failedCount > 0) {
              message += `, с ошибками: ${failedCount}`
              toastType = 'warning'
            }
            if (notFound) {
              message += `, не найдено анализов: ${notFound.split(',').length}`
              toastType = 'warning'
            }
          } else {
            // Если ни одного отчета не создано
            if (notFound) {
              message = `Архив скачивается с информацией. Не найдено анализов: ${notFound.split(',').length}`
            } else {
              message = 'Архив скачивается с информацией об ошибках'
            }
            toastType = 'info'
          }
          
          // Показываем соответствующий тип уведомления
          if (toastType === 'success') {
            toast.success(message)
          } else if (toastType === 'warning') {
            toast.warning(message)
          } else {
            toast.info(message)
          }
          
          // Очищаем поле ввода после успешного скачивания
          this.downloadInput = ''
        } else {
          throw new Error((response && response.message) ? response.message : 'Ошибка при скачивании архива отчетов')
        }
      } catch (error) {
        console.error('Download multiple reports error:', error)
        toast.error(error.message || 'Ошибка при скачивании архива отчетов')
      } finally {
        this.downloadingReports = false
      }
    }
  }
}
</script>

<style scoped>
.porosity-analyses-list {
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

/* Статистические карточки */
.statistics-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.statistics-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px; }
.statistics-card.card-primary::before { background: linear-gradient(90deg, #007bff 0%, #0056b3 100%); }
.statistics-card.card-warning::before { background: linear-gradient(90deg, #ffc107 0%, #e0a800 100%); }
.statistics-card.card-success::before { background: linear-gradient(90deg, #28a745 0%, #1e7e34 100%); }
.statistics-card.card-danger::before { background: linear-gradient(90deg, #dc3545 0%, #c82333 100%); }
.statistics-card.card-secondary::before { background: linear-gradient(90deg, #6c757d 0%, #5a6268 100%); }

.card-content { display: flex; align-items: center; gap: 1.5rem; }
.card-icon { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; }
.card-warning .card-icon { background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); }
.card-primary .card-icon { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); }
.card-success .card-icon { background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); }
.card-danger .card-icon { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); }
.card-secondary .card-icon { background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%); }
.card-info .card-icon { background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%); }
.card-info { flex: 1; }
.card-subtitle { color: #6c757d; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
.card-value { font-size: 2rem; font-weight: 700; margin: 0; color: #2d3436; }
.card-progress { margin-top: 0.5rem; }
.card-progress .progress { height: 5px; background-color: #e9ecef; border-radius: 5px; }

.filters-card { background: white; border-radius: 15px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08); }
.filters-card .card-body { padding: 1rem; }
.filters-card .form-label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: var(--bs-heading-color); margin-bottom: 0.5rem; }
.filters-card .form-control, .filters-card .form-select { border-radius: 8px; border-color: var(--bs-border-color); }
.filters-card .form-control:focus, .filters-card .form-select:focus { border-color: var(--bs-primary); box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25); }
.btn-reset-filters { display: flex; align-items: center; justify-content: center; width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); border: none; color: white; font-weight: 600; border-radius: 8px; transition: all 0.2s ease; }
.btn-reset-filters { width: auto; padding: 0 0.625rem; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; }
.btn-reset-filters:hover { background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(220, 53, 69, 0.35); }
.btn-reset-filters:active { transform: translateY(0); }

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  background-color: #fff;
  color: #6c757d;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  cursor: pointer;
}

/* Цветные стили для кнопок фильтров */
.filter-btn[data-filter="all"] {
  border-color: #6c757d;
  color: #6c757d;
}

.filter-btn[data-filter="all"]:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
  transform: translateY(-1px);
}

.filter-btn[data-filter="all"].active {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
  box-shadow: 0 2px 4px rgba(108, 117, 125, 0.3);
}

.filter-btn[data-filter="pending"] {
  border-color: #ffc107;
  color: #856404;
}

.filter-btn[data-filter="pending"]:hover {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #212529;
  transform: translateY(-1px);
}

.filter-btn[data-filter="pending"].active {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #212529;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
}

.filter-btn[data-filter="processing"] {
  border-color: #17a2b8;
  color: #0c5460;
}

.filter-btn[data-filter="processing"]:hover {
  background-color: #17a2b8;
  border-color: #17a2b8;
  color: #fff;
  transform: translateY(-1px);
}

.filter-btn[data-filter="processing"].active {
  background-color: #17a2b8;
  border-color: #17a2b8;
  color: #fff;
  box-shadow: 0 2px 4px rgba(23, 162, 184, 0.3);
}

.filter-btn[data-filter="completed"] {
  border-color: #28a745;
  color: #155724;
}

.filter-btn[data-filter="completed"]:hover {
  background-color: #28a745;
  border-color: #28a745;
  color: #fff;
  transform: translateY(-1px);
}

.filter-btn[data-filter="completed"].active {
  background-color: #28a745;
  border-color: #28a745;
  color: #fff;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
}

.filter-btn[data-filter="failed"] {
  border-color: #dc3545;
  color: #721c24;
}

.filter-btn[data-filter="failed"]:hover {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #fff;
  transform: translateY(-1px);
}

.filter-btn[data-filter="failed"].active {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #fff;
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

.analysis-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 480px;
  margin: 0 auto;
  position: relative;
  overflow: visible;
}

.analysis-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
  z-index: 1050;
}
.analysis-card.selected {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220,53,69,0.25), 0 10px 24px rgba(220,53,69,0.15);
  background: linear-gradient(180deg, rgba(220,53,69,0.06) 0%, rgba(220,53,69,0.03) 100%);
  transform: translateY(-4px);
}

/* Курсор и hover для взаимодействия */
.analysis-card { cursor: pointer; }
/* Для интерактивных элементов внутри карточки показываем указатель */
.analysis-card .action-buttons,
.analysis-card .dropdown,
.analysis-card a,
.analysis-card button,
.analysis-card .dropdown-menu .dropdown-item {
  cursor: pointer;
}

/* Бейдж в углу при выделении */
.analysis-card.selected::before {
  content: 'Выбрано';
  position: absolute;
  top: 8px;
  right: 8px;
  background: #dc3545;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgba(220,53,69,0.3);
}
.analysis-header {
  padding: 1rem;
  background: var(--bs-light);
  border-left: 4px solid;
  border-bottom: 1px solid #e9ecef;
  border-radius: 0.5rem 0.5rem 0 0;
}

/* Чтобы длинное название не выталкивало статус за карточку */
.analysis-header .d-flex > .card-title {
  flex: 1;
  min-width: 0; /* позволяет работать text-overflow в flex-контейнере */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.analysis-header .d-flex > .badge {
  flex-shrink: 0;
  white-space: nowrap;
}

.analysis-header.header-secondary { border-color: var(--bs-secondary); }
.analysis-header.header-warning { border-color: var(--bs-warning); }
.analysis-header.header-success { border-color: var(--bs-success); }
.analysis-header.header-danger { border-color: var(--bs-danger); }


.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e9ecef;
  padding: 1rem;
  border-radius: 0.5rem 0.5rem 0 0;
}

.card-title {
  font-weight: 600;
  color: #212529;
  margin: 0;
  line-height: 1.2;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.badge-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.badge-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.badge-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Стили для цветных иконок в статусах */
.badge svg {
  flex-shrink: 0;
  margin-right: 0.25rem;
}

.badge-warning svg {
  color: #ffc107;
}

.badge-info svg {
  color: #17a2b8;
}

.badge-success svg {
  color: #28a745;
}

.badge-danger svg {
  color: #dc3545;
}

/* Дополнительные стили для иконок в фильтрах */
.filter-btn svg {
  flex-shrink: 0;
  margin-right: 0.25rem;
}

/* Цветные иконки для фильтров */
.filter-btn[data-filter="all"] svg {
  color: #6c757d;
}

.filter-btn[data-filter="all"]:hover svg,
.filter-btn[data-filter="all"].active svg {
  color: #fff;
}

.filter-btn[data-filter="pending"] svg {
  color: #856404;
}

.filter-btn[data-filter="pending"]:hover svg,
.filter-btn[data-filter="pending"].active svg {
  color: #212529;
}

.filter-btn[data-filter="processing"] svg {
  color: #0c5460;
}

.filter-btn[data-filter="processing"]:hover svg,
.filter-btn[data-filter="processing"].active svg {
  color: #fff;
}

.filter-btn[data-filter="completed"] svg {
  color: #155724;
}

.filter-btn[data-filter="completed"]:hover svg,
.filter-btn[data-filter="completed"].active svg {
  color: #fff;
}

.filter-btn[data-filter="failed"] svg {
  color: #721c24;
}

.filter-btn[data-filter="failed"]:hover svg,
.filter-btn[data-filter="failed"].active svg {
  color: #fff;
}

/* Стили для иконок в кнопках действий */
.action-btn svg {
  flex-shrink: 0;
  margin-right: 0.25rem;
}

/* Специальные цвета для иконок в кнопках */
.action-btn.primary svg {
  color: #fff;
}

.action-btn.warning svg {
  color: #212529;
}

.action-btn.success svg {
  color: #fff;
}

.action-btn.danger svg {
  color: #fff;
}

.action-btn.info svg {
  color: #fff;
}

.action-btn.secondary svg {
  color: #fff;
}

/* Стили для кнопки массового перезапуска */
.bulk-actions .btn svg {
  flex-shrink: 0;
  margin-right: 0.4rem;
  color: #212529;
  position: relative;
  top: -0.5px;
}

.bulk-actions .btn:hover svg {
  color: #212529;
}

.bulk-actions .btn:disabled svg {
  color: #6c757d;
}

/* Улучшения визуала блока массовых действий */
.bulk-actions .card-body { padding: 1rem; }
.bulk-actions .input-group-text { background-color: #f8f9fa; }
.bulk-actions .form-text { font-size: 0.8rem; }
.bulk-actions .btn { min-height: 38px; }
.bulk-actions .d-flex.gap-2 > .btn { flex-shrink: 0; }
.bulk-actions .ms-auto { margin-left: auto !important; }

/* Стили для блока скачивания архива */
.download-actions .card-body { padding: 1rem; }
.download-actions .input-group-text { 
  background-color: #f8f9fa; 
  border-color: #dee2e6;
  color: #6c757d;
}
.download-actions .form-text { font-size: 0.8rem; }
.download-actions .btn { min-height: 38px; }
.download-actions .input-group .form-select {
  border-left: 0;
  border-right: 0;
}

.card-body {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-text {
  margin-bottom: 1rem;
  line-height: 1.5;
}

.analysis-info {
  margin-top: 0;
}

.info-row, .results-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1rem;
  margin-bottom: 0.75rem;
}

.info-col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.1rem;
  margin-bottom: 0.25rem;
  flex-wrap: wrap;
}

.info-item .lucide {
  min-width: 18px;
  min-height: 18px;
  width: 18px;
  height: 18px;
  margin-right: 0.15rem;
  display: inline-block;
  vertical-align: middle;
  color: #6c757d;
}

/* Цветные иконки для информационных блоков */
.info-item .lucide[data-icon="calendar"] {
  color: #17a2b8;
}

.info-item .lucide[data-icon="ruler"] {
  color: #6f42c1;
}

.info-item .lucide[data-icon="bar-chart-3"] {
  color: #28a745;
}

.info-item .lucide[data-icon="circle-dot"] {
  color: #fd7e14;
}

.info-item .lucide[data-icon="alert-triangle"] {
  color: #dc3545;
}

.info-item .date-text {
  font-size: 0.8em;
  word-break: break-all;
}

.info-item small {
  font-size: 0.75rem;
  margin-bottom: 0;
}
.info-item small + div { margin-left: 4px; }

.info-item div {
  font-size: 0.875rem;
  font-weight: 500;
}

.error-row {
  margin-top: 0.75rem;
}

.card-footer {
  padding: 1rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 0.5rem 0.5rem;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem;
  width: 100%;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  height: 40px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  text-align: center;
  line-height: 1.2;
}

.action-btn:hover {
  transform: translateY(-1px);
  text-decoration: none;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-btn.primary {
  background-color: #007bff;
  color: #fff;
  border-color: #007bff;
}

.action-btn.primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
  color: #fff;
}

.action-btn.warning {
  background-color: #ffc107;
  color: #212529;
  border-color: #ffc107;
}

.action-btn.warning:hover {
  background-color: #e0a800;
  border-color: #e0a800;
  color: #212529;
}

.action-btn.success {
  background-color: #28a745;
  color: #fff;
  border-color: #28a745;
}

.action-btn.success:hover {
  background-color: #218838;
  border-color: #218838;
  color: #fff;
}

.action-btn.danger {
  background-color: #dc3545;
  color: #fff;
  border-color: #dc3545;
}

.action-btn.danger:hover {
  background-color: #c82333;
  border-color: #c82333;
  color: #fff;
}

.action-btn.info {
  background-color: #17a2b8;
  color: #fff;
  border-color: #17a2b8;
}

.action-btn.info:hover {
  background-color: #138496;
  border-color: #138496;
  color: #fff;
}

.action-btn.secondary {
  background-color: #6c757d;
  color: #fff;
  border-color: #6c757d;
}

.action-btn.secondary:hover {
  background-color: #5a6268;
  border-color: #5a6268;
  color: #fff;
}

@media (max-width: 768px) {
  .porosity-analyses-list { padding: 1rem; }
  .filter-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .filter-btn {
    justify-content: center;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .info-row, .results-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
    height: 44px; /* Увеличиваем высоту для лучшего тапа на мобильных */
  }
  
  .analysis-card .dropdown {
    width: 100%;
  }
  
  /* Улучшение отображения кнопок перезапуска на мобильных */
  .action-btn[title*="Перезапустить"] {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

/* Стили для dropdown меню в карточках анализов */
.analysis-card .dropdown {
  width: 100%;
  display: block;
}

.analysis-card .dropdown .action-btn {
  width: 100%;
}

.analysis-card .dropdown-menu {
  min-width: 180px;
  margin-top: 0.25rem;
  z-index: 2000;
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  opacity: 1;
  backdrop-filter: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  will-change: opacity, transform;
}

/* Плавное появление/скрытие дропдауна */
.analysis-card .dropdown .dropdown-menu { opacity: 0; transform: translateY(4px); }
.analysis-card .dropdown .dropdown-menu.show { opacity: 1; transform: translateY(0); }

/* Разделители между пунктами меню */
.analysis-card .dropdown-menu .dropdown-item + .dropdown-item { border-top: 1px solid #e9ecef; }

/* Дополнительные стили для grid-сетки кнопок */
.action-buttons > * {
  width: 100%;
}

.analysis-card .dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.analysis-card .dropdown-item svg {
  flex-shrink: 0;
  margin-right: 0.5rem;
  color: #6c757d;
}

.analysis-card .dropdown-item:hover {
  background-color: #f8f9fa;
}

.analysis-card .dropdown-item:hover svg {
  color: #495057;
}

/* Стиль для кнопки с dropdown */
.action-btn.dropdown-toggle::after {
  margin-left: 0.5rem;
}

/* Стили для пагинации */
.pagination {
  margin-bottom: 0;
}

.page-link {
  color: #007bff;
  background-color: #fff;
  border: 1px solid #dee2e6;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  transition: all 0.2s ease;
}

/* Промежутки между кнопками пагинации */
.pagination .page-item + .page-item {
  margin-left: 0.25rem;
}

.pagination .page-item { display: inline-flex; }

.page-link:hover {
  color: #0056b3;
  background-color: #e9ecef;
  border-color: #dee2e6;
  transform: translateY(-1px);
}

.page-link:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}

.page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
}

.page-item.disabled .page-link {
  color: #6c757d;
  background-color: #fff;
  border-color: #dee2e6;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-item.disabled .page-link:hover {
  transform: none;
}

/* Стили для иконок в пагинации */
.page-link svg {
  flex-shrink: 0;
  margin: 0 0.25rem;
}

/* Адаптивность для пагинации */
@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .page-link {
    min-width: 36px;
    height: 36px;
    font-size: 0.8rem;
    padding: 0.4rem 0.6rem;
  }
  
  .page-link svg {
    width: 14px;
    height: 14px;
  }
}
</style> 