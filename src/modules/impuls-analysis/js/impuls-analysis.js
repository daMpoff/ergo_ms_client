import { apiClient } from '../../../js/api/manager.js'

/**
 * Класс для работы с API анализа импульсов
 */
class ImpulsAnalysisAPI {
  constructor() {
    this.baseEndpoint = 'impuls_analysis/analyses/'
  }

  /**
   * Получить список всех анализов
   */
  async getAnalyses(params = {}) {
    return await apiClient.get(this.baseEndpoint, params)
  }

  /**
   * Получить анализ по ID
   */
  async getAnalysis(id) {
    return await apiClient.get(`${this.baseEndpoint}${id}/`)
  }

  /**
   * Создать новый анализ
   */
  async createAnalysis(data) {
    try {
      console.log('Creating impuls analysis with data:', data)
      const response = await apiClient.post(this.baseEndpoint, data)
      console.log('Impuls analysis creation response:', response)
      return response
    } catch (error) {
      console.error('Error in createAnalysis:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при создании анализа',
        data: null
      }
    }
  }

  /**
   * Обновить анализ
   */
  async updateAnalysis(id, data) {
    return await apiClient.put(`${this.baseEndpoint}${id}/`, data)
  }

  /**
   * Удалить анализ
   */
  async deleteAnalysis(id) {
    const response = await apiClient.delete(`${this.baseEndpoint}${id}/`)
    return response
  }

  /**
   * Загрузить файлы для импорта данных (без привязки к анализу)
   */
  async uploadFiles(forceFile, planFile) {
    try {
      console.log('Uploading files for data import')
      const formData = new FormData()
      
      if (forceFile) {
        formData.append('force_calculation_file', forceFile)
      }
      if (planFile) {
        formData.append('experiment_plan_file', planFile)
      }
      
      const response = await apiClient.post(`${this.baseEndpoint}upload_files/`, formData)
      console.log('Upload response:', response)
      return response
    } catch (error) {
      console.error('Error uploading files:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при загрузке файлов',
        data: null
      }
    }
  }

  /**
   * Получить протоколы анализа
   */
  async getProtocols(analysisId) {
    return await apiClient.get(`${this.baseEndpoint}${analysisId}/protocols/`)
  }

  /**
   * Скачать протокол
   */
  async downloadProtocol(analysisId, protocolId) {
    try {
      const response = await apiClient.downloadFile(
        `${this.baseEndpoint}${analysisId}/download_protocol/`,
        { protocol_id: protocolId }
      )
      return response
    } catch (error) {
      console.error('Error downloading protocol:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при скачивании протокола',
        data: null
      }
    }
  }

  /**
   * Массовое скачивание протоколов
   */
  async bulkDownloadProtocols(analysisIds) {
    try {
      const response = await apiClient.post(`${this.baseEndpoint}bulk_download_protocols/`, {
        analysis_ids: analysisIds
      })
      return response
    } catch (error) {
      console.error('Error in bulk download protocols:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при массовом скачивании протоколов',
        data: null
      }
    }
  }

  /**
   * Получить статистику анализов
   */
  async getStatistics() {
    return await apiClient.get(`${this.baseEndpoint}statistics/`)
  }

  /**
   * Получить доступные протоколы
   */
  async getAvailableProtocols() {
    return await apiClient.get(`${this.baseEndpoint}available_protocols/`)
  }

  /**
   * Создать анализ из протокола
   */
  async createFromProtocol(protocolNumber, title, description, analysisType = 'standard') {
    try {
      const response = await apiClient.post(`${this.baseEndpoint}create_from_protocol/`, {
        protocol_number: protocolNumber,
        title: title,
        description: description,
        analysis_type: analysisType
      })
      return response
    } catch (error) {
      console.error('Error creating analysis from protocol:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при создании анализа из протокола',
        data: null
      }
    }
  }

  /**
   * Получить статус анализа
   */
  async getAnalysisStatus(analysisId) {
    return await apiClient.get(`${this.baseEndpoint}${analysisId}/status/`)
  }

  /**
   * Перезапустить анализ
   */
  async restartAnalysis(analysisId) {
    try {
      const response = await apiClient.post(`${this.baseEndpoint}${analysisId}/restart/`)
      return response
    } catch (error) {
      console.error('Error in restartAnalysis:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при перезапуске анализа',
        data: null
      }
    }
  }

  /**
   * Получить URL для скачивания протокола
   */
  getProtocolDownloadUrl(analysisId, protocolId) {
    return `${apiClient.baseUrl}${apiClient.apiPath}${this.baseEndpoint}${analysisId}/download_protocol/?protocol_id=${protocolId}`
  }

  /**
   * Получить URL для скачивания файла
   */
  getFileDownloadUrl(analysisId, filePath) {
    return `${apiClient.baseUrl}${apiClient.apiPath}${this.baseEndpoint}${analysisId}/download_file/?file=${encodeURIComponent(filePath)}`
  }
}

// Создать и экспортировать синглтон-объект
export const impulsAnalysisAPI = new ImpulsAnalysisAPI()
