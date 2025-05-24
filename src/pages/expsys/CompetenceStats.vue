
<script>
export default {
  name: 'CompetenceStats',
  props: {
    selectedCompetence: {
      type: Object,
      required: true,
      default: () => ({
        id: null,
        name: 'Не выбрана',
        description: 'Выберите компетенцию для просмотра статистики'
      })
    },
    studentsData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedGroup: '',
      filteredStudents: [],
      availableGroups: []
    }
  },
  watch: {
    studentsData: {
      immediate: true,
      handler(newVal) {
        this.extractGroups(newVal)
        this.filterStudents()
      }
    }
  },
  methods: {
    extractGroups(students) {
      const groups = new Set()
      students.forEach(student => groups.add(student.group))
      this.availableGroups = Array.from(groups).sort()
    },
    filterStudents() {
      if (!this.selectedGroup) {
        this.filteredStudents = [...this.studentsData]
      } else {
        this.filteredStudents = this.studentsData.filter(
          student => student.group === this.selectedGroup
        )
      }
    },
    getMasteryClass(level) {
      if (level >= 80) return 'bg-success'
      if (level >= 50) return 'bg-warning text-dark'
      return 'bg-danger'
    },
    getProgressBarClass(level) {
      if (level >= 80) return 'bg-success'
      if (level >= 50) return 'bg-warning'
      return 'bg-danger'
    },
    formatDate(dateString) {
      if (!dateString) return 'Нет данных'
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('ru-RU', options)
    }
  }
}
</script>
<template>
  <div class="competence-stats-container">
    <div class="stats-header mb-4">
      <h2 class="mb-3">Статистика освоения компетенции</h2>
      <div class="d-flex justify-content-between align-items-center">
        <div class="group-filter">
          <label for="groupFilter" class="form-label">Фильтр по группам:</label>
          <select 
            id="groupFilter" 
            class="form-select" 
            v-model="selectedGroup"
            @change="filterStudents"
          >
            <option value="">Все группы</option>
            <option v-for="group in availableGroups" :key="group" :value="group">
              {{ group }}
            </option>
          </select>
        </div>
        <div class="competence-info">
          <h4>{{ selectedCompetence.name }}</h4>
          <p class="text-muted">{{ selectedCompetence.description }}</p>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th>Студент</th>
            <th>Группа</th>
            <th>Уровень освоения</th>
            <th>Последняя активность</th>
            <th>Прогресс</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in filteredStudents" :key="student.id">
            <td>{{ student.fullName }}</td>
            <td>{{ student.group }}</td>
            <td>
              <span class="badge" :class="getMasteryClass(student.masteryLevel)">
                {{ student.masteryLevel }}%
              </span>
            </td>
            <td>{{ formatDate(student.lastActivity) }}</td>
            <td>
              <div class="progress">
                <div 
                  class="progress-bar" 
                  :class="getProgressBarClass(student.masteryLevel)"
                  role="progressbar" 
                  :style="{ width: student.masteryLevel + '%' }"
                  :aria-valuenow="student.masteryLevel"
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  {{ student.masteryLevel }}%
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filteredStudents.length === 0" class="no-results text-center py-5">
      <p>Нет данных для отображения</p>
    </div>
  </div>
</template>

<style scoped>
.competence-stats-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stats-header {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.group-filter {
  width: 250px;
}

.competence-info h4 {
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.competence-info p {
  margin-bottom: 0;
}

.table {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.table th {
  font-weight: 600;
  color: #495057;
  border-top: none;
}

.table td {
  vertical-align: middle;
}

.progress {
  height: 24px;
  border-radius: 4px;
}

.no-results {
  background-color: white;
  border-radius: 8px;
  color: #6c757d;
}

.badge {
  font-size: 0.85em;
  padding: 0.35em 0.65em;
  border-radius: 4px;
}
</style>