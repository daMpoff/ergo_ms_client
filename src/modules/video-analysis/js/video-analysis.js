import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'

class VideoAnalysisAPI {
  constructor() {
    this.base = endpoints.video_analysis
  }

  async list(params = {}) {
    return apiClient.get(this.base.list, params)
  }

  async statistics() {
    return apiClient.get(this.base.statistics)
  }

  async create(file, title = '') {
    const form = new FormData()
    form.append('video', file)
    if (title) form.append('title', title)
    return apiClient.post(this.base.create, form)
  }

  async bulkCreate(files, titles = []) {
    const form = new FormData()
    files.forEach(file => {
      form.append('videos', file)
    })
    titles.forEach(title => {
      form.append('titles', title)
    })
    return apiClient.post(this.base.bulkCreate, form)
  }

  async get(id) {
    return apiClient.get(this.base.detail(id))
  }

  async remove(id) {
    return apiClient.delete(this.base.delete(id))
  }

  // Метод для скачивания файлов через API клиент с токеном
  async downloadFile(id, typeOrPath) {
    const endpoint = this.base.download(id)
    const params = {}
    
    if (['audio', 'subtitles', 'video'].includes(typeOrPath)) {
      params.type = typeOrPath
    } else {
      params.path = typeOrPath
    }
    
    return apiClient.downloadFile(endpoint, params)
  }

  // Оставляем старый метод для обратной совместимости
  getDownloadUrl(id, typeOrPath) {
    const baseUrl = `${apiClient.baseUrl}${apiClient.apiPath}${this.base.download(id)}`
    if (['audio', 'subtitles', 'video'].includes(typeOrPath)) {
      return `${baseUrl}?type=${encodeURIComponent(typeOrPath)}`
    }
    return `${baseUrl}?path=${encodeURIComponent(typeOrPath)}`
  }
}

export const videoAnalysisAPI = new VideoAnalysisAPI()


