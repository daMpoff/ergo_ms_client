<template>
  <div class="impuls-analysis-layout">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <!-- Заголовок модуля -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="h2 mb-2 text-primary">
                <Zap class="me-3" size="32" />
                Анализ импульсов
              </h1>
              <p class="text-muted mb-0">Цифровая лаборатория для анализа импульсов</p>
            </div>
            <div class="d-flex gap-2">
              <router-link to="/impuls-analysis/create" class="btn btn-outline-primary">
                <Plus class="me-2" size="16" />
                Создать анализ
              </router-link>
              <router-link to="/impuls-analysis/analyses" class="btn btn-outline-secondary">
                <List class="me-2" size="16" />
                Мои анализы
              </router-link>
            </div>
          </div>
          
          <!-- Навигация по модулю -->
          <nav class="navbar navbar-expand-lg navbar-light bg-light rounded mb-4">
            <div class="container-fluid">
              <div class="navbar-nav">
                <router-link 
                  to="/impuls-analysis/create" 
                  class="nav-link"
                  :class="{ active: $route.name === 'ImpulsAnalysisMain' }"
                >
                  <FileText class="me-2" size="16" />
                  Создание анализа
                </router-link>
                <router-link 
                  to="/impuls-analysis/analyses" 
                  class="nav-link"
                  :class="{ active: $route.name === 'ImpulsAnalysisList' }"
                >
                  <List class="me-2" size="16" />
                  Мои анализы
                </router-link>
                <router-link 
                  to="/impuls-analysis/protocols" 
                  class="nav-link"
                  :class="{ active: $route.name === 'ImpulsAnalysisProtocols' }"
                >
                  <FileCheck class="me-2" size="16" />
                  Протоколы
                </router-link>
              </div>
            </div>
          </nav>
          
          <!-- Контент страницы -->
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Zap, Plus, List, FileText, FileCheck } from 'lucide-vue-next'

export default {
  name: 'ImpulsAnalysisParentLayout',
  components: {
    Zap,
    Plus,
    List,
    FileText,
    FileCheck
  }
}
</script>

<style scoped>
.impuls-analysis-layout {
  padding: 20px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.navbar {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.nav-link {
  color: #6c757d;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 0 4px;
  padding: 8px 16px !important;
}

.nav-link:hover {
  color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

.nav-link.active {
  color: #007bff;
  background-color: rgba(0, 123, 255, 0.15);
  font-weight: 600;
}

.text-primary {
  color: #007bff !important;
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

.bg-light {
  background-color: #f8f9fa !important;
}
</style>
