import { ref } from 'vue'
import { apiClient } from '@/js/api/manager'

export function useConnectionInfo(routeParamName = 'pk') {
  const connectionName = ref('')
  const connectionDetails = ref(null)

  async function loadConnectionInfo(route) {
    const connectionId = route.params[routeParamName]
    if (!connectionId) {
      return
    }

    try {
      const res = await apiClient.get(`bi_analysis/bi_connections/${connectionId}/`)
      if (res.success && res.data) {
        connectionDetails.value = res.data
        connectionName.value = res.data.name
      }
    } catch (err) {
      console.error('[useConnectionInfo] Ошибка запроса:', err)
    }
  }

  return {
    connectionName,
    connectionDetails,
    loadConnectionInfo
  }
}
