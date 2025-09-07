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

  async create(file, title = '', subtitleOptions = {}) {
    const form = new FormData()
    form.append('video', file)
    if (title) form.append('title', title)
    
    // Добавляем настройки субтитров
    if (subtitleOptions.subtitle_lines_count !== undefined) {
      form.append('subtitle_lines_count', subtitleOptions.subtitle_lines_count)
    }
    if (subtitleOptions.subtitle_font_size !== undefined) {
      form.append('subtitle_font_size', subtitleOptions.subtitle_font_size)
    }
    if (subtitleOptions.subtitle_font_color) {
      form.append('subtitle_font_color', subtitleOptions.subtitle_font_color)
    }
    if (subtitleOptions.subtitle_background_color) {
      form.append('subtitle_background_color', subtitleOptions.subtitle_background_color)
    }
    if (subtitleOptions.subtitle_background_transparent !== undefined) {
      form.append('subtitle_background_transparent', subtitleOptions.subtitle_background_transparent)
    }
    
    return apiClient.post(this.base.create, form)
  }

  async bulkCreate(files, titles = [], subtitleOptions = {}) {
    const form = new FormData()
    files.forEach(file => {
      form.append('videos', file)
    })
    titles.forEach(title => {
      form.append('titles', title)
    })
    
    // Добавляем настройки субтитров
    console.log('Добавляем настройки в FormData:', subtitleOptions)
    
    if (subtitleOptions.subtitle_lines_count !== undefined) {
      form.append('subtitle_lines_count', subtitleOptions.subtitle_lines_count)
      console.log('Добавлено subtitle_lines_count:', subtitleOptions.subtitle_lines_count)
    }
    if (subtitleOptions.subtitle_font_size !== undefined) {
      form.append('subtitle_font_size', subtitleOptions.subtitle_font_size)
      console.log('Добавлено subtitle_font_size:', subtitleOptions.subtitle_font_size)
    }
    if (subtitleOptions.subtitle_font_color) {
      form.append('subtitle_font_color', subtitleOptions.subtitle_font_color)
      console.log('Добавлено subtitle_font_color:', subtitleOptions.subtitle_font_color)
    }
    if (subtitleOptions.subtitle_background_color) {
      form.append('subtitle_background_color', subtitleOptions.subtitle_background_color)
      console.log('Добавлено subtitle_background_color:', subtitleOptions.subtitle_background_color)
    }
    if (subtitleOptions.subtitle_background_transparent !== undefined) {
      form.append('subtitle_background_transparent', subtitleOptions.subtitle_background_transparent)
      console.log('Добавлено subtitle_background_transparent:', subtitleOptions.subtitle_background_transparent)
    }
    
    return apiClient.post(this.base.bulkCreate, form)
  }

  async get(id) {
    return apiClient.get(this.base.detail(id))
  }

  async remove(id) {
    return apiClient.delete(this.base.delete(id))
  }

  async update(id, data) {
    return apiClient.patch(this.base.detail(id), data)
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


