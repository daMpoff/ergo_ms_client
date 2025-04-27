// Компонент для просмотра и редактирования содержимого выбранной таблицы
<template>
  <div class="table-editor-full">
    <h2>{{ tableTitle }}</h2>
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Поиск..."
      class="search-input"
    />
    <div v-if="isLoading" class="loading-block">Загрузка...</div>
    <div v-else>
      <div class="table-responsive-x">
        <table v-if="filteredRows.length" class="modern-table-full">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col" @click="sortBy(col)" :class="{sortable: true, sorted: sortKey === col, asc: sortOrder === 'asc', desc: sortOrder === 'desc'}">
                {{ col }}
                <span v-if="sortKey === col">
                  <svg v-if="sortOrder === 'asc'" width="12" height="12" viewBox="0 0 24 24"><path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="2" fill="none"/></svg>
                  <svg v-else-if="sortOrder === 'desc'" width="12" height="12" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none"/></svg>
                </span>
              </th>
              <th style="width: 120px; text-align: center;">Действия</th>
            </tr>
          </thead>
          <tbody class="scrollable-tbody">
            <!-- Обычные строки -->
            <tr v-for="(row, idx) in filteredRows" :key="row.id">
              <td v-for="col in columns" :key="col">
                <span v-if="editingRow !== idx">{{ row[col] }}</span>
                <input v-else v-model="editBuffer[col]" :placeholder="col" />
              </td>
              <td class="actions-cell">
                <button v-if="editingRow !== idx" @click="startEdit(idx, row)" title="Редактировать">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
                </button>
                <button v-else @click="saveEdit(row.id)" title="Сохранить">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
                <button @click="deleteRow(row.id)" title="Удалить">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>Нет данных для отображения.</p>
      </div>
      <div class="pagination-bar-modern">
        <button @click="goToPage(1)" :disabled="currentPage === 1" title="Первая страница">
          <span>&laquo;</span>
        </button>
        <button @click="prevPage" :disabled="currentPage === 1" title="Назад">
          <span>&lsaquo;</span>
        </button>
        <span v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            :class="['page-btn', {active: page === currentPage}]"
            @click="goToPage(page)"
            :disabled="page === currentPage"
          >{{ page }}</button>
          <span v-else class="pagination-ellipsis">...</span>
        </span>
        <button @click="nextPage" :disabled="currentPage === totalPages" title="Вперёд">
          <span>&rsaquo;</span>
        </button>
        <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" title="Последняя страница">
          <span>&raquo;</span>
        </button>
        <span class="pagination-total">Всего: {{ filteredRowsUnpaged.length }}</span>
      </div>
      <button class="add-btn" @click="openAddModal" v-if="!showAddModal">Добавить запись</button>
      <!-- Модальное окно для добавления записи (JSON) -->
      <div v-if="showAddModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Добавить запись (JSON)</h3>
          <textarea v-model="jsonInput" ref="jsonTextarea" class="json-textarea" rows="10" placeholder='{"field1": "value", ...}' @paste="onPasteJson"></textarea>
          <div v-if="jsonError" class="json-error">{{ jsonError }}</div>
          <div v-if="currentTableHint" class="json-hint-block">
            <div class="json-hint-title">Пример объекта для этой таблицы:</div>
            <pre class="json-hint-pre">{{ JSON.stringify(currentTableHint.example, null, 2) }}</pre>
            <div class="json-hint-title">Обязательные поля:</div>
            <ul class="json-hint-list">
              <li v-for="f in currentTableHint.required" :key="f">
                <span :style="missingRequiredFields.includes(f) ? 'color: var(--color-danger); font-weight: 600;' : ''">{{ f }}</span>
              </li>
            </ul>
            <div v-if="missingRequiredFields.length" class="json-error" style="margin-top: 4px;">Внимание: не заполнены обязательные поля!</div>
          </div>
          <div class="modal-actions">
            <button @click="saveAddJsonDebounced" :disabled="!isJsonValid">Сохранить</button>
            <button @click="cancelAdd">Отмена</button>
          </div>
        </div>
      </div>
    </div>
    <ToastNotification ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { endpoints } from '@/js/api/endpoints';
import { apiClient } from '@/js/api/manager';
import ToastNotification from './ToastNotification.vue';

const props = defineProps({
  selectedTable: {
    type: String,
    required: true,
  },
});

const tableTitle = computed(() => props.selectedTable);
const rows = ref([]);
const columns = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const editingRow = ref(null);
const editBuffer = ref({});
const toastRef = ref(null);

// Пагинация
const pageSize = 20;
const currentPage = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRowsUnpaged.value.length / pageSize)));

// Сортировка
const sortKey = ref('');
const sortOrder = ref(''); // '', 'asc', 'desc'

// Мапа endpoints для всех таблиц
const tableApiMap = {
  la_df_technology: endpoints.learning_analytics.technologies,
  la_df_competency: endpoints.learning_analytics.competencies,
  la_df_speciality: endpoints.learning_analytics.specialities,
  la_df_curriculum: endpoints.learning_analytics.curriculums,
  la_df_discipline: endpoints.learning_analytics.disciplines,
  la_df_basediscipline: endpoints.learning_analytics.baseDisciplines,
  la_df_vacancy: endpoints.learning_analytics.vacancies,
  la_employer: endpoints.learning_analytics.employers,
  la_df_acm: endpoints.learning_analytics.acms,
  la_df_vcm: endpoints.learning_analytics.vcms,
  la_df_ucm: endpoints.learning_analytics.ucms,
};

function getApi() {
  return tableApiMap[props.selectedTable];
}

const fetchData = async () => {
  isLoading.value = true;
  try {
    const api = getApi();
    if (!api) throw new Error('Нет API для этой таблицы');
    let response = await apiClient.get(api.get);
    let data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    rows.value = data;
    columns.value = data.length ? Object.keys(data[0]) : [];
  } catch {
    rows.value = [];
    columns.value = [];
    toastRef.value?.show('Ошибка загрузки данных', 'error');
  } finally {
    isLoading.value = false;
  }
};

// Фильтрация без пагинации
const filteredRowsUnpaged = computed(() => {
  let arr = rows.value;
  if (searchQuery.value) {
    arr = arr.filter(row =>
      columns.value.some(col => String(row[col] || '').toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
  }
  // Сортировка
  if (sortKey.value && sortOrder.value) {
    arr = [...arr].sort((a, b) => {
      if (a[sortKey.value] === b[sortKey.value]) return 0;
      if (sortOrder.value === 'asc') return a[sortKey.value] > b[sortKey.value] ? 1 : -1;
      if (sortOrder.value === 'desc') return a[sortKey.value] < b[sortKey.value] ? 1 : -1;
      return 0;
    });
  }
  return arr;
});

// Пагинированные строки
const filteredRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredRowsUnpaged.value.slice(start, start + pageSize);
});

function startEdit(idx, row) {
  editingRow.value = idx;
  editBuffer.value = { ...row };
}

async function saveEdit(id) {
  try {
    const api = getApi();
    await apiClient.put(api.update(id), editBuffer.value);
    toastRef.value?.show('Изменения сохранены', 'success');
    editingRow.value = null;
    searchQuery.value = '';
    await fetchData();
    // После обновления — найти индекс изменённой строки и показать нужную страницу
    nextTick(() => {
      const idx = filteredRowsUnpaged.value.findIndex(r => r.id === id);
      if (idx !== -1) currentPage.value = Math.floor(idx / pageSize) + 1;
    });
  } catch {
    toastRef.value?.show('Ошибка при сохранении', 'error');
  }
}

async function deleteRow(id) {
  try {
    const api = getApi();
    await apiClient.delete(api.delete(id));
    toastRef.value?.show('Запись удалена', 'success');
    await fetchData();
    // После удаления — если текущая страница пуста, перейти на предыдущую
    nextTick(() => {
      if (filteredRows.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
    });
  } catch {
    toastRef.value?.show('Ошибка при удалении', 'error');
  }
}

const showAddModal = ref(false);
const jsonInput = ref('');
const jsonError = ref('');
const jsonTextarea = ref(null);
const isJsonValid = computed(() => {
  try {
    if (!jsonInput.value.trim()) return false;
    JSON.parse(jsonInput.value);
    return true;
  } catch {
    return false;
  }
});

function openAddModal() {
  showAddModal.value = true;
  jsonInput.value = '';
  jsonError.value = '';
  nextTick(() => {
    jsonTextarea.value?.focus();
  });
}
function cancelAdd() {
  showAddModal.value = false;
  jsonInput.value = '';
  jsonError.value = '';
}

// Debounce-функция
function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

const saveAddJsonDebounced = debounce(saveAddJson, 120);

function onPasteJson() {
  nextTick(() => {}); // просто форсируем обновление
}

async function saveAddJson() {
  jsonError.value = '';
  let payload;
  try {
    payload = JSON.parse(jsonInput.value);
  } catch (e) {
    jsonError.value = 'Ошибка парсинга JSON: ' + e.message;
    return;
  }
  const api = getApi();
  try {
    const resp = await apiClient.post(api.create, payload);
    // Проверяем успешность (может быть массив или объект)
    if (resp.data && (resp.data.id || resp.data.pk || resp.data.added || resp.data.message)) {
      toastRef.value?.show('Запись(и) добавлены', 'success');
      showAddModal.value = false;
      jsonInput.value = '';
      await fetchData();
      // Можно не делать автопереход по страницам, т.к. может быть массив
    } else {
      toastRef.value?.show('Ошибка при добавлении', 'error');
    }
  } catch (e) {
    jsonError.value = 'Ошибка при добавлении: ' + (e?.response?.data?.message || e.message || '');
  }
}

function sortBy(col) {
  if (sortKey.value !== col) {
    sortKey.value = col;
    sortOrder.value = 'asc';
  } else if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc';
  } else if (sortOrder.value === 'desc') {
    sortOrder.value = '';
    sortKey.value = '';
  } else {
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

// Современная пагинация с быстрым переходом и многоточиями
const visiblePages = computed(() => {
  const pages = [];
  if (totalPages.value <= 5) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i);
  } else {
    if (currentPage.value <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages.value);
    } else if (currentPage.value >= totalPages.value - 2) {
      pages.push(1, '...', totalPages.value - 3, totalPages.value - 2, totalPages.value - 1, totalPages.value);
    } else {
      pages.push(1, '...', currentPage.value - 1, currentPage.value, currentPage.value + 1, '...', totalPages.value);
    }
  }
  return pages;
});
function goToPage(page) {
  if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

watch(() => props.selectedTable, () => {
  currentPage.value = 1;
  sortKey.value = '';
  sortOrder.value = '';
  searchQuery.value = '';
  fetchData();
});

onMounted(fetchData);

// Примеры и обязательные поля для каждой таблицы
const tableJsonHints = {
  la_df_speciality: {
    example: {
      code: '09.03.01',
      name: 'Информатика и вычислительная техника',
      specialization: 'Программное обеспечение',
      department: 'Кафедра информатики',
      faculty: 'Факультет информационных технологий'
    },
    required: ['code', 'name', 'specialization', 'department', 'faculty']
  },
  la_df_curriculum: {
    example: {
      speciality: 1,
      education_duration: 4,
      year_of_admission: '2023',
      is_active: true
    },
    required: ['speciality', 'education_duration', 'year_of_admission']
  },
  la_df_technology: {
    example: {
      name: 'Python',
      description: 'Язык программирования',
      popularity: 95.5,
      rating: 4.85
    },
    required: ['name', 'description', 'popularity', 'rating']
  },
  la_df_competency: {
    example: {
      code: 'ПК-1',
      name: 'Разработка ПО',
      description: 'Умеет разрабатывать ПО',
      know_level: 'Знать основы',
      can_level: 'Уметь программировать',
      master_level: 'Владеть современными инструментами',
      blooms_level: 'APPLY',
      blooms_verbs: 'анализировать, проектировать',
      complexity: 5,
      demand: 7
    },
    required: ['code', 'name', 'description', 'know_level', 'can_level', 'master_level', 'blooms_level', 'blooms_verbs', 'complexity', 'demand']
  },
  la_df_basediscipline: {
    example: {
      code: 'БД-1',
      name: 'Математика',
      description: 'Базовая математика'
    },
    required: ['code', 'name', 'description']
  },
  la_df_discipline: {
    example: {
      curriculum: 1,
      base_discipline: 1,
      code: 'Д-1',
      name: 'Математический анализ',
      semesters: '1,2',
      contact_work_hours: 32,
      independent_work_hours: 16,
      control_work_hours: 8,
      technologies: [1,2],
      competencies: [1,2]
    },
    required: ['curriculum', 'base_discipline', 'code', 'name', 'semesters', 'contact_work_hours', 'independent_work_hours', 'control_work_hours']
  },
  la_df_vacancy: {
    example: {
      employer: 1,
      title: 'Python Developer',
      description: 'Разработка backend...',
      requirements: 'Опыт работы с Django',
      responsibilities: 'Разработка и поддержка сервисов',
      salary_min: 100000,
      salary_max: 200000,
      is_active: true,
      location: 'Москва',
      employment_type: 'FULL',
      technologies: [1,2],
      competencies: [1,2]
    },
    required: ['employer', 'title', 'description']
  },
  la_employer: {
    example: {
      company_name: 'Tech Innovations Inc.',
      description: 'Компания, специализирующаяся на ИИ',
      email: 'info@techinnovations.com',
      rating: 4.75
    },
    required: ['company_name', 'description', 'email', 'rating']
  },
  la_df_acm: {
    example: {
      curriculum: 1,
      discipline_list: [1,2,3],
      technology_stack: [1,2,3]
    },
    required: ['curriculum', 'discipline_list', 'technology_stack']
  },
  la_df_vcm: {
    example: {
      vacancy_name: 'Data Scientist',
      vacancy: 1,
      competencies_stack: [1,2],
      technology_stack: [1,2],
      description: 'Профиль вакансии для DS'
    },
    required: ['vacancy_name', 'competencies_stack', 'technology_stack', 'description']
  },
  la_df_ucm: {
    example: {
      user_id: 1,
      competencies_stack: [1,2],
      technology_stack: [1,2]
    },
    required: ['user_id', 'competencies_stack', 'technology_stack']
  }
};

const currentTableHint = computed(() => tableJsonHints[props.selectedTable] || null);

// Проверка обязательных полей (только для одиночного объекта)
const missingRequiredFields = computed(() => {
  if (!isJsonValid.value || !currentTableHint.value) return [];
  let obj;
  try {
    obj = JSON.parse(jsonInput.value);
  } catch { return []; }
  if (Array.isArray(obj)) return [];
  return currentTableHint.value.required.filter(f => !(f in obj));
});
</script>

<style scoped>
:root {
  --color-accent: #2d8cf0;
  --color-accent-hover: #1867c0;
  --color-danger: #d0322d;
  --color-success: #2ecc71;
  --color-primary-background: #f8f9fa;
  --color-secondary-background: #fff;
  --color-primary-text: #222;
  --color-secondary-text: #888;
  --color-border: #e0e0e0;
  --color-table-header: #f1f3f6;
  --color-table-row-hover: #f5faff;
}

body.dark-theme :root,
.dark-theme {
  --color-accent: #409eff;
  --color-accent-hover: #1867c0;
  --color-danger: #ff4d4f;
  --color-success: #2ecc71;
  --color-primary-background: #23272f;
  --color-secondary-background: #2c313a;
  --color-primary-text: #f3f3f3;
  --color-secondary-text: #b0b0b0;
  --color-border: #3a3f4b;
  --color-table-header: #23272f;
  --color-table-row-hover: #232b3a;
}

.table-editor-full {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  background: var(--color-primary-background);
  padding: 24px;
  box-sizing: border-box;
}
.table-responsive-x {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 2px;
}
h2 {
  font-size: 22px;
  margin: 0 0 18px 0;
  color: var(--color-primary-text);
}
.search-input {
  width: 100%;
  margin: 0 0 18px 0;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 16px;
  background: var(--color-secondary-background);
  color: var(--color-primary-text);
  transition: border 0.2s, background 0.2s;
  box-sizing: border-box;
}
.search-input:focus {
  border-color: var(--color-accent);
  background: var(--color-table-header);
}
.loading-block {
  text-align: center;
  color: var(--color-secondary-text);
  margin: 30px 0;
}
.modern-table-full {
  width: 100%;
  border-radius: 14px;
  box-shadow: 0 2px 16px rgba(80,120,255,0.07);
  border: 1.5px solid var(--color-border);
  overflow: hidden;
  background: var(--color-secondary-background);
  margin-bottom: 10px;
  transition: background 0.3s;
}
.modern-table-full th, .modern-table-full td {
  border: none;
  border-bottom: 1px solid var(--color-border);
  padding: 8px 8px;
  font-size: 15px;
  color: var(--color-primary-text);
  background: transparent;
  min-width: 80px;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  transition: background 0.3s, color 0.3s;
}
.modern-table-full th {
  background: var(--color-table-header);
  font-weight: 700;
  color: var(--color-primary-text);
  border-bottom: 2px solid var(--color-border);
  font-size: 15px;
  letter-spacing: 0.02em;
}
.modern-table-full tbody tr:nth-child(even) {
  background: rgba(0,0,0,0.02);
}
.modern-table-full tbody tr:nth-child(odd) {
  background: var(--color-secondary-background);
}
.modern-table-full tbody tr:hover {
  background: var(--color-table-row-hover);
}
.modern-table-full input {
  width: 100%;
  padding: 7px 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 15px;
  background: var(--color-primary-background);
  color: var(--color-primary-text);
  transition: border 0.2s, background 0.2s;
  box-sizing: border-box;
}
.modern-table-full input:focus {
  border-color: var(--color-accent);
  background: var(--color-table-header);
}
.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  vertical-align: middle;
  height: 100%;
}
.add-btn {
  margin: 18px 0 0 0;
  padding: 11px 22px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(80, 120, 255, 0.08);
  width: 100%;
}
.add-btn:hover {
  background: var(--color-accent-hover);
}
button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: var(--color-accent);
  transition: color 0.2s, background 0.2s;
  border-radius: 6px;
  padding: 4px 7px;
  display: flex;
  align-items: center;
  justify-content: center;
}
button[title]:hover::after {
  content: attr(title);
  position: absolute;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  background: var(--color-secondary-background);
  color: var(--color-primary-text);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 13px;
  white-space: nowrap;
  margin-top: 4px;
  z-index: 10;
  pointer-events: none;
  opacity: 0.95;
}
button:last-child {
  margin-right: 0;
}
button:hover {
  color: var(--color-danger);
  background: rgba(208,50,45,0.07);
}
@media (max-width: 900px) {
  .modern-table-full, .table-editor-full {
    min-width: 0;
    width: 100%;
    padding: 0;
  }
  .add-btn {
    width: 100%;
    margin: 12px 0 0 0;
    padding: 10px 0;
    font-size: 15px;
  }
}
@media (max-width: 600px) {
  .modern-table-full th, .modern-table-full td {
    padding: 8px 4px;
    font-size: 14px;
  }
  h2 {
    margin: 0 0 12px 0;
  }
  .search-input {
    width: 100%;
    margin: 0 0 12px 0;
  }
  .add-btn {
    width: 100%;
    margin: 12px 0 0 0;
  }
  .table-editor-full {
    padding: 10px;
  }
}
.scrollable-tbody {
  display: block;
  max-height: 520px;
  overflow-y: auto;
  width: 100%;
}
.modern-table-full thead, .modern-table-full tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}
.modern-table-full thead {
  position: sticky;
  top: 0;
  z-index: 2;
}
.modern-table-full tbody {
  width: 100%;
  display: block;
}
@media (max-width: 600px) {
  .scrollable-tbody {
    max-height: 320px;
  }
}
.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
}
.sorted {
  color: var(--color-accent);
}
.asc svg, .desc svg {
  vertical-align: middle;
  margin-left: 2px;
}
.pagination-bar-modern {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 18px 0 0 0;
  flex-wrap: wrap;
}
.pagination-bar-modern button {
  border: none;
  background: var(--color-secondary-background);
  color: var(--color-primary-text);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 17px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}
.pagination-bar-modern button:not(:disabled):hover {
  background: var(--color-accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(80,120,255,0.13);
  z-index: 1;
}
.pagination-bar-modern button:disabled {
  background: var(--color-border);
  color: var(--color-secondary-text);
  cursor: not-allowed;
  opacity: 0.7;
}
.page-btn {
  font-weight: 500;
  margin: 0 1px;
  min-width: 36px;
  height: 36px;
  border-radius: 18px;
  background: var(--color-secondary-background);
  color: var(--color-primary-text);
  border: none;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  box-shadow: none;
}
.page-btn:not(:disabled):hover {
  background: var(--color-accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(80,120,255,0.13);
}
.page-btn.active,
.page-btn.active:disabled {
  background: var(--color-accent);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(80,120,255,0.13);
  cursor: default;
}
.pagination-bar-modern button svg,
.pagination-bar-modern button span {
  font-size: 18px;
  line-height: 1;
}
/* Кнопки навигации — чуть меньше и менее яркие */
.pagination-bar-modern button:not(.page-btn) {
  min-width: 30px;
  height: 30px;
  background: var(--color-table-header);
  color: var(--color-secondary-text);
  font-size: 15px;
  border-radius: 50%;
  padding: 0;
}
.pagination-bar-modern button:not(.page-btn):not(:disabled):hover {
  background: var(--color-accent);
  color: #fff;
}
.pagination-ellipsis {
  display: inline-block;
  width: 32px;
  text-align: center;
  color: var(--color-secondary-text);
  font-size: 18px;
  user-select: none;
}
.pagination-total {
  margin-left: 12px;
  color: var(--color-secondary-text);
  font-size: 14px;
}
/* Модальное окно для добавления записи (JSON) */
.modal-overlay {
  position: fixed;
  left: 0; top: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: var(--color-secondary-background);
  color: var(--color-primary-text);
  padding: 32px 24px;
  border-radius: 12px;
  min-width: 320px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 4px 32px rgba(0,0,0,0.12);
  max-height: 80vh;
  overflow-y: auto;
}
.modal-content h3 {
  margin-top: 0;
  margin-bottom: 18px;
  font-size: 20px;
  color: var(--color-primary-text);
}
.modal-field {
  margin-bottom: 16px;
}
.modal-field label {
  display: block;
  margin-bottom: 4px;
  color: var(--color-secondary-text);
  font-size: 15px;
}
.modal-field input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 15px;
  background: var(--color-primary-background);
  color: var(--color-primary-text);
  transition: border 0.2s, background 0.2s;
  box-sizing: border-box;
}
.modal-field input:focus {
  border-color: var(--color-accent);
  background: var(--color-table-header);
}
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 18px;
}
/* JSON textarea и ошибки */
.json-textarea {
  width: 100%;
  font-family: monospace;
  font-size: 15px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 10px;
  background: var(--color-primary-background);
  color: var(--color-primary-text);
  margin-bottom: 8px;
  resize: vertical;
}
.json-error {
  color: var(--color-danger);
  margin-bottom: 8px;
  font-size: 14px;
}
.json-hint-block {
  margin-top: 10px;
  background: var(--color-table-header);
  border-radius: 8px;
  padding: 12px 14px 10px 14px;
  font-size: 14px;
  color: var(--color-secondary-text);
}
.json-hint-title {
  font-weight: 600;
  margin-bottom: 2px;
  color: var(--color-primary-text);
}
.json-hint-pre {
  background: var(--color-primary-background);
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 13px;
  margin: 0 0 8px 0;
  color: var(--color-primary-text);
  overflow-x: auto;
}
.json-hint-list {
  margin: 0 0 6px 0;
  padding-left: 18px;
}
</style>
