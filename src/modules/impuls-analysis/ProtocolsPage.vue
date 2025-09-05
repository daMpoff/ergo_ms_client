<template>
  <div class="protocols-page">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <!-- Заголовок -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 class="h3 mb-2">Протоколы анализа импульсов</h2>
              <p class="text-muted mb-0">Управление протоколами и создание анализов</p>
            </div>
            <div class="d-flex gap-2">
              <button 
                class="btn btn-outline-primary"
                @click="refreshProtocols"
                :disabled="isLoading"
              >
                <RefreshCw class="me-2" size="16" :class="{ 'spinning': isLoading }" />
                Обновить
              </button>
              <router-link to="/impuls-analysis/create" class="btn btn-primary">
                <Plus class="me-2" size="16" />
                Создать анализ
              </router-link>
            </div>
          </div>
          
          <!-- Информационная панель -->
          <div class="alert alert-info mb-4">
            <div class="d-flex align-items-center">
              <Info class="me-3" size="20" />
              <div>
                <strong>Информация о протоколах:</strong>
                <p class="mb-0 mt-1">
                  Протоколы становятся доступными для создания анализа после загрузки и обработки файлов 
                  "Расчет силы" и "План эксперимента". Протокол должен быть заполнен в обеих таблицах.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Статистика протоколов -->
          <div class="row mb-4">
            <div class="col-md-3">
              <div class="stat-card stat-total">
                <div class="stat-icon">
                  <FileCheck size="24" />
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ availableProtocols.length }}</div>
                  <div class="stat-label">Доступных протоколов</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-completed">
                <div class="stat-icon">
                  <CheckCircle size="24" />
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ completedAnalyses }}</div>
                  <div class="stat-label">Созданных анализов</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-processing">
                <div class="stat-icon">
                  <Loader2 size="24" />
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ processingAnalyses }}</div>
                  <div class="stat-label">В обработке</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-pending">
                <div class="stat-icon">
                  <Clock size="24" />
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ pendingAnalyses }}</div>
                  <div class="stat-label">Ожидают</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Список протоколов -->
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Доступные протоколы</h5>
            </div>
            <div class="card-body p-0">
              <div v-if="isLoading" class="text-center py-5">
                <Loader2 class="spinning text-primary" size="32" />
                <p class="mt-3 text-muted">Загрузка протоколов...</p>
              </div>
              
              <div v-else-if="availableProtocols.length === 0" class="text-center py-5">
                <FileX class="text-muted mb-3" size="48" />
                <h5 class="text-muted">Нет доступных протоколов</h5>
                <p class="text-muted">Загрузите файлы для создания протоколов</p>
                <router-link to="/impuls-analysis/create" class="btn btn-primary">
                  <Plus class="me-2" size="16" />
                  Создать анализ
                </router-link>
              </div>
              
              <div v-else>
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Номер протокола</th>
                        <th>Данные расчета силы</th>
                        <th>Данные плана эксперимента</th>
                        <th>Статус</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="protocol in availableProtocols" :key="protocol.protocol_number">
                        <td>
                          <div class="fw-bold text-primary">
                            {{ protocol.protocol_number }}
                          </div>
                        </td>
                        <td>
                          <div class="protocol-data">
                            <div class="data-item">
                              <span class="label">Pст:</span>
                              <span class="value">{{ protocol.force_data.pct_static || '—' }}%</span>
                            </div>
                            <div class="data-item">
                              <span class="label">Энергия:</span>
                              <span class="value">{{ protocol.force_data.energy_j || '—' }} Дж</span>
                            </div>
                            <div class="data-item">
                              <span class="label">Скорость:</span>
                              <span class="value">{{ protocol.force_data.velocity_ms || '—' }} м/с</span>
                            </div>
                            <div class="data-item">
                              <span class="label">Сила:</span>
                              <span class="value">{{ protocol.force_data.force_n || '—' }} Н</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="protocol-data">
                            <div class="data-item">
                              <span class="label">Pст:</span>
                              <span class="value">{{ protocol.plan_data.p_static || '—' }}%</span>
                            </div>
                            <div class="data-item">
                              <span class="label">L1/L2:</span>
                              <span class="value">{{ protocol.plan_data.l1_l2_ratio || '—' }}</span>
                            </div>
                            <div class="data-item">
                              <span class="label">L1:</span>
                              <span class="value">{{ protocol.plan_data.l1_m || '—' }} м</span>
                            </div>
                            <div class="data-item">
                              <span class="label">m1:</span>
                              <span class="value">{{ protocol.plan_data.m1_kg || '—' }} кг</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="badge bg-success">
                            <CheckCircle class="me-1" size="12" />
                            Готов
                          </span>
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button 
                              class="btn btn-outline-primary"
                              @click="createAnalysisFromProtocol(protocol)"
                              title="Создать анализ"
                            >
                              <Plus size="14" />
                            </button>
                            <button 
                              class="btn btn-outline-info"
                              @click="viewProtocolDetails(protocol)"
                              title="Подробности"
                            >
                              <Eye size="14" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно создания анализа из протокола -->
    <div 
      class="modal fade" 
      id="createAnalysisModal" 
      tabindex="-1" 
      aria-labelledby="createAnalysisModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="createAnalysisModalLabel">
              Создать анализ из протокола {{ selectedProtocol?.protocol_number }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitCreateAnalysis">
              <div class="mb-3">
                <label for="analysisTitle" class="form-label">Название анализа</label>
                <input
                  type="text"
                  class="form-control"
                  id="analysisTitle"
                  v-model="newAnalysis.title"
                  required
                  :placeholder="`Анализ протокола ${selectedProtocol?.protocol_number}`"
                />
              </div>
              
              <div class="mb-3">
                <label for="analysisDescription" class="form-label">Описание</label>
                <textarea
                  class="form-control"
                  id="analysisDescription"
                  v-model="newAnalysis.description"
                  rows="3"
                  placeholder="Описание анализа из протокола"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="analysisType" class="form-label">Тип анализа</label>
                <select
                  class="form-select"
                  id="analysisType"
                  v-model="newAnalysis.analysis_type"
                  required
                >
                  <option value="standard">Стандартный анализ</option>
                  <option value="advanced">Расширенный анализ</option>
                  <option value="custom">Пользовательский анализ</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="submitCreateAnalysis"
              :disabled="isCreating"
            >
              <Plus class="me-2" size="16" />
              {{ isCreating ? 'Создание...' : 'Создать анализ' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно деталей протокола -->
    <div 
      class="modal fade" 
      id="protocolDetailsModal" 
      tabindex="-1" 
      aria-labelledby="protocolDetailsModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="protocolDetailsModalLabel">
              Детали протокола {{ selectedProtocol?.protocol_number }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedProtocol" class="row">
              <div class="col-md-6">
                <h6 class="text-primary">Данные расчета силы</h6>
                <div class="protocol-details">
                  <div class="detail-item">
                    <span class="label">Pст:</span>
                    <span class="value">{{ selectedProtocol.force_data.pct_static || '—' }}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Энергия удара:</span>
                    <span class="value">{{ selectedProtocol.force_data.energy_j || '—' }} Дж</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Скорость удара:</span>
                    <span class="value">{{ selectedProtocol.force_data.velocity_ms || '—' }} м/с</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Сила удара:</span>
                    <span class="value">{{ selectedProtocol.force_data.force_n || '—' }} Н</span>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <h6 class="text-primary">Данные плана эксперимента</h6>
                <div class="protocol-details">
                  <div class="detail-item">
                    <span class="label">Pст:</span>
                    <span class="value">{{ selectedProtocol.plan_data.p_static || '—' }}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Pст значение:</span>
                    <span class="value">{{ selectedProtocol.plan_data.p_static_value || '—' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">L1/L2:</span>
                    <span class="value">{{ selectedProtocol.plan_data.l1_l2_ratio || '—' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">L1:</span>
                    <span class="value">{{ selectedProtocol.plan_data.l1_m || '—' }} м</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">d1:</span>
                    <span class="value">{{ selectedProtocol.plan_data.d1_m || '—' }} м</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">m1:</span>
                    <span class="value">{{ selectedProtocol.plan_data.m1_kg || '—' }} кг</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">L2:</span>
                    <span class="value">{{ selectedProtocol.plan_data.l2_m || '—' }} м</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">d2:</span>
                    <span class="value">{{ selectedProtocol.plan_data.d2_m || '—' }} м</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Т:</span>
                    <span class="value">{{ selectedProtocol.plan_data.t_s || '—' }} с</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">А:</span>
                    <span class="value">{{ selectedProtocol.plan_data.a_j || '—' }} Дж</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">V:</span>
                    <span class="value">{{ selectedProtocol.plan_data.v_ms || '—' }} м/с</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">С1,2:</span>
                    <span class="value">{{ selectedProtocol.plan_data.c12_kg_s || '—' }} кг/с</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Р:</span>
                    <span class="value">{{ selectedProtocol.plan_data.p_n || '—' }} Н</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="createAnalysisFromProtocol(selectedProtocol)"
            >
              <Plus class="me-2" size="16" />
              Создать анализ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { impulsAnalysisAPI } from './js/impuls-analysis.js'
import { useToast } from 'vue-toastification'
import { 
  RefreshCw, Plus, FileCheck, CheckCircle, Loader2, Clock, 
  FileX, Eye, Info 
} from 'lucide-vue-next'

const toast = useToast()

export default {
  components: {
    RefreshCw,
    Plus,
    FileCheck,
    CheckCircle,
    Loader2,
    Clock,
    FileX,
    Eye,
    Info
  },
  name: 'ProtocolsPage',
  data() {
    return {
      availableProtocols: [],
      isLoading: false,
      selectedProtocol: null,
      newAnalysis: {
        title: '',
        description: '',
        analysis_type: 'standard'
      },
      isCreating: false,
      stats: {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0
      }
    }
  },
  computed: {
    completedAnalyses() {
      return this.stats.completed || 0
    },
    processingAnalyses() {
      return this.stats.processing || 0
    },
    pendingAnalyses() {
      return this.stats.pending || 0
    }
  },
  async mounted() {
    await Promise.all([
      this.loadAvailableProtocols(),
      this.loadStats()
    ])
  },
  methods: {
    async loadAvailableProtocols() {
      this.isLoading = true
      try {
        const response = await impulsAnalysisAPI.getAvailableProtocols()
        if (response && response.success) {
          this.availableProtocols = response.data.protocols || []
        }
      } catch (error) {
        console.error('Error loading available protocols:', error)
        toast.error('Ошибка при загрузке протоколов')
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
    
    async refreshProtocols() {
      await Promise.all([
        this.loadAvailableProtocols(),
        this.loadStats()
      ])
    },
    
    createAnalysisFromProtocol(protocol) {
      this.selectedProtocol = protocol
      this.newAnalysis.title = `Анализ протокола ${protocol.protocol_number}`
      this.newAnalysis.description = ''
      this.newAnalysis.analysis_type = 'standard'
      
      // Показываем модальное окно
      this.$nextTick(() => {
        const modalElement = document.getElementById('createAnalysisModal')
        if (modalElement && window.bootstrap) {
          const modal = new window.bootstrap.Modal(modalElement)
          modal.show()
        }
      })
    },
    
    async submitCreateAnalysis() {
      if (!this.selectedProtocol) return
      
      this.isCreating = true
      try {
        const response = await impulsAnalysisAPI.createFromProtocol(
          this.selectedProtocol.protocol_number,
          this.newAnalysis.title,
          this.newAnalysis.description,
          this.newAnalysis.analysis_type
        )
        
        if (response && response.success) {
          toast.success('Анализ создан из протокола успешно!')
          
          // Закрываем модальное окно
          const modalElement = document.getElementById('createAnalysisModal')
          if (modalElement && window.bootstrap) {
            const modal = window.bootstrap.Modal.getInstance(modalElement)
            if (modal) modal.hide()
          }
          
          // Переходим к созданному анализу
          this.$router.push(`/impuls-analysis/analysis/${response.data.id}`)
        } else {
          toast.error(response?.message || 'Ошибка при создании анализа из протокола')
        }
      } catch (error) {
        let errorMessage = 'Ошибка при создании анализа из протокола'
        if (error && typeof error === 'object') {
          errorMessage = error.response?.data?.message || error.message || errorMessage
        }
        toast.error(errorMessage)
      } finally {
        this.isCreating = false
      }
    },
    
    viewProtocolDetails(protocol) {
      this.selectedProtocol = protocol
      
      // Показываем модальное окно
      this.$nextTick(() => {
        const modalElement = document.getElementById('protocolDetailsModal')
        if (modalElement && window.bootstrap) {
          const modal = new window.bootstrap.Modal(modalElement)
          modal.show()
        }
      })
    }
  }
}
</script>

<style scoped>
.protocols-page {
  padding: 20px 0;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-total {
  border-left-color: #6c757d;
}

.stat-pending {
  border-left-color: #ffc107;
}

.stat-processing {
  border-left-color: #17a2b8;
}

.stat-completed {
  border-left-color: #28a745;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-total .stat-icon {
  background: linear-gradient(135deg, #6c757d, #495057);
}

.stat-pending .stat-icon {
  background: linear-gradient(135deg, #ffc107, #e0a800);
}

.stat-processing .stat-icon {
  background: linear-gradient(135deg, #17a2b8, #138496);
}

.stat-completed .stat-icon {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.table {
  margin-bottom: 0;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table td {
  vertical-align: middle;
  border-top: 1px solid #f1f3f4;
}

.protocol-data {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-item .label {
  color: #6c757d;
  font-weight: 500;
}

.data-item .value {
  color: #495057;
  font-weight: 600;
}

.protocol-details {
  display: grid;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.detail-item .label {
  color: #6c757d;
  font-weight: 500;
  font-size: 0.875rem;
}

.detail-item .value {
  color: #495057;
  font-weight: 600;
  font-size: 0.875rem;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.alert {
  border: none;
  border-radius: 12px;
}

.alert-info {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.form-control, .form-select {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: border-color 0.2s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .stat-card {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
  }
  
  .protocol-data {
    grid-template-columns: 1fr;
  }
}
</style>
