import { ref } from 'vue'
import { apiClient } from '@/js/api/manager'

export function useDbTablesList() {
  const dbTables = ref([])
  const isDbLoading = ref(false)

  async function loadDbTables(connectionId) {
    if (!connectionId) return
    
    console.log('[loadDbTables] Загружаем таблицы для подключения:', connectionId)
    
    isDbLoading.value = true
    try {
      const res = await apiClient.get(`bi_analysis/bi_connections/${connectionId}/tables/`)
      if (res.success) {
        console.log('[loadDbTables] Таблицы загружены успешно, количество:', res.data?.length || 0)
        dbTables.value = res.data
      } else {
        console.error('[loadDbTables] Ошибка загрузки таблиц:', res)
      }
    } catch (error) {
      console.error('[loadDbTables] Исключение при загрузке таблиц:', error)
    } finally {
      isDbLoading.value = false
    }
  }

  return {
    dbTables,
    isDbLoading,
    loadDbTables
  }
}