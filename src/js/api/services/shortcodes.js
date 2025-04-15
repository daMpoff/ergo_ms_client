import { apiClient } from '../manager'
import { endpoints } from '../endpoints'

export const shortcodesService = {
  getTemplates() {
    return apiClient.get(endpoints.shortcodes.templates)
  },

  getPages() {
    return apiClient.get(endpoints.shortcodes.pages)
  },

  getPage(slug) {
    return apiClient.get(`${endpoints.shortcodes.pages}${slug}/`)
  },

  createInstance(data) {
    return apiClient.post(endpoints.shortcodes.instances, data)
  },

  createPage(data) {
    return apiClient.post(endpoints.shortcodes.pages, data)
  },
}
