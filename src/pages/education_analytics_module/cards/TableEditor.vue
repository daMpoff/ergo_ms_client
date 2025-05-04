/**
 * TableEditor.vue
 * Компонент для просмотра и редактирования табличных данных в модуле аналитики образования.
 *
 * Функциональность:
 * - Отображение данных в виде таблицы с сортировкой и поиском
 * - Поддержка пагинации для больших наборов данных
 * - Встроенное редактирование записей через модальное окно
 * - Удаление записей с подтверждением
 * - Добавление новых записей в формате JSON
 * - Поддержка связанных таблиц (relations)
 */

<template>
  <div class="table-editor-full">
    <!-- Добавляем импорт шрифта -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <!-- Заголовок таблицы -->
    <h2>{{ tableTitle }}</h2>

    <!-- Поле поиска -->
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Поиск..."
      class="search-input"
    />

    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="loading-block">Загрузка...</div>

    <div v-else>
      <!-- Основная таблица -->
      <div v-if="hasData" class="table-responsive-x">
        <table class="modern-table-full">
          <thead>
            <tr>
              <th
                v-for="col in columns"
                :key="col"
                @click="sortBy(col)"
                :class="{
                  sortable: true,
                  sorted: sortKey === col,
                  asc: sortOrder === 'asc',
                  desc: sortOrder === 'desc'
                }"
                :data-column="col"
              >
                {{ col }}
                <span v-if="sortKey === col">
                  <svg v-if="sortOrder === 'asc'" width="12" height="12" viewBox="0 0 24 24">
                    <path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                  <svg v-else-if="sortOrder === 'desc'" width="12" height="12" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                </span>
              </th>
              <th v-if="!isRelationTable" style="width: 120px; text-align: center;">Действия</th>
            </tr>
          </thead>
          <tbody class="scrollable-tbody">
            <tr v-for="row in filteredRows" :key="row.id">
              <td
                v-for="col in columns"
                :key="col"
                @click="showDetails(row)"
                :data-column="col"
              >
                <span
                  v-if="isJsonField(row[col])"
                  :title="formatJsonField(row[col])"
                >
                  {{ formatJsonField(row[col]) }}
                </span>
                <span
                  v-else
                  :title="row[col] || '-'"
                >
                  {{ row[col] || '-' }}
                </span>
              </td>
              <td v-if="!isRelationTable" class="actions-cell">
                <button @click="showDetails(row)" title="Просмотр">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button @click="deleteRow(row.id)" title="Удалить">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Сообщение об отсутствии данных -->
      <div v-else-if="!hasData" class="no-data-message">
        <p>Нет данных для отображения. Таблица: {{ props.selectedTable }}</p>
      </div>

      <!-- Пагинация -->
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

      <!-- Кнопка добавления новой записи -->
      <button v-if="!isRelationTable" class="add-btn" @click="openAddModal">
        Добавить запись
      </button>

      <!-- Модальные окна -->
      <!-- Модальное окно для добавления записи -->
      <div v-if="showAddModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Добавить запись (JSON)</h3>
          <textarea
            v-model="jsonInput"
            ref="jsonTextarea"
            class="json-textarea"
            rows="10"
            placeholder='{"field1": "value", ...}'
            @paste="onPasteJson"
          ></textarea>
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
            <div v-if="missingRequiredFields.length" class="json-error" style="margin-top: 4px;">
              Внимание: не заполнены обязательные поля!
            </div>
          </div>
          <div class="modal-actions">
            <button @click="saveAddJsonDebounced" :disabled="!isJsonValid">Сохранить</button>
            <button @click="cancelAdd">Отмена</button>
          </div>
        </div>
      </div>

      <!-- Модальное окно для детализации записи -->
      <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetails">
        <div class="modal-content details-modal" @click.stop>
          <div class="modal-header">
            <h3>Детали записи</h3>
            <div class="modal-actions">
              <button v-if="!isEditing && !isRelationTable" @click="startEditInModal" class="edit-button">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/>
                </svg>
                Редактировать
              </button>
              <template v-else-if="!isRelationTable">
                <button @click="saveEditInModal" class="save-button">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Сохранить
                </button>
                <button @click="cancelEditInModal" class="cancel-button">
                  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Отмена
                </button>
              </template>
              <button class="close-button" @click="closeDetails" title="Закрыть">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="details-content">
            <div v-for="col in columns" :key="col" class="detail-row">
              <div class="detail-label">{{ col }}:</div>
              <div class="detail-value">
                <template v-if="isEditing && !isRelationTable && editableFields.includes(col)">
                  <template v-if="fieldTypes[col] === 'boolean'">
                    <input
                      type="checkbox"
                      v-model="editBuffer[col]"
                      class="edit-input"
                    />
                  </template>
                  <template v-else-if="fieldTypes[col] === 'array'">
                    <select
                      v-model="editBuffer[col]"
                      multiple
                      class="edit-input"
                    >
                      <!-- Здесь нужно добавить options в зависимости от типа поля -->
                    </select>
                  </template>
                  <template v-else>
                    <input
                      v-model="editBuffer[col]"
                      :type="fieldTypes[col] === 'integer' || fieldTypes[col] === 'decimal' ? 'number' : 'text'"
                      :step="fieldTypes[col] === 'decimal' ? '0.01' : '1'"
                      class="edit-input"
                      :placeholder="col"
                    />
                  </template>
                </template>
                <template v-else>
                  {{ selectedRow[col] }}
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Модальное окно подтверждения изменений -->
      <div v-if="showConfirmModal" class="modal-overlay" @click.stop>
        <div class="modal-content confirm-modal" @click.stop>
          <h3>{{ confirmModalData.title }}</h3>
          <p>{{ confirmModalData.message }}</p>

          <!-- Таблица изменений -->
          <div class="changes-table">
            <table>
              <thead>
                <tr>
                  <th>Поле</th>
                  <th>Старое значение</th>
                  <th>Новое значение</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="change in confirmModalData.changes" :key="change.field">
                  <td>{{ change.field }}</td>
                  <td>
                    <span v-if="Array.isArray(change.oldValue)">
                      {{ change.oldValue.join(', ') }}
                    </span>
                    <span v-else>
                      {{ change.oldValue }}
                    </span>
                  </td>
                  <td>
                    <span v-if="Array.isArray(change.newValue)">
                      {{ change.newValue.join(', ') }}
                    </span>
                    <span v-else>
                      {{ change.newValue }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-actions">
            <button class="confirm-btn" @click="confirmModalData.confirmAction()">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Сохранить
            </button>
            <button class="cancel-btn" @click="showConfirmModal = false">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Отмена
            </button>
          </div>
        </div>
      </div>

      <!-- Модальное окно подтверждения выхода -->
      <div v-if="showExitConfirmModal" class="modal-overlay" @click.stop>
        <div class="modal-content exit-confirm-modal" @click.stop>
          <h3>Несохраненные изменения</h3>
          <p>У вас есть несохраненные изменения. Вы действительно хотите выйти без сохранения?</p>
          <div class="exit-confirm-actions">
            <button class="cancel-btn" @click="exitConfirmData.action()">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                <line x1="12" y1="2" x2="12" y2="12"/>
              </svg>
              Выйти
            </button>
            <button class="confirm-btn" @click="showExitConfirmModal = false">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Продолжить
            </button>
          </div>
        </div>
      </div>

      <!-- Модальное окно подтверждения удаления -->
      <div v-if="showDeleteConfirmModal" class="modal-overlay" @click.stop>
        <div class="modal-content delete-confirm-modal" @click.stop>
          <h3>
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Подтверждение удаления
          </h3>
          <p>Вы действительно хотите удалить эту запись? Это действие нельзя будет отменить.</p>

          <div class="delete-details">
            <div v-for="(value, key) in deleteConfirmData.row"
                 :key="key"
                 class="delete-details-row">
              <div class="delete-details-label">{{ key }}:</div>
              <div class="delete-details-value">
                <span v-if="Array.isArray(value)">{{ value.join(', ') }}</span>
                <span v-else>{{ value }}</span>
              </div>
            </div>
          </div>

          <div class="delete-confirm-actions">
            <button class="confirm-btn" @click="showDeleteConfirmModal = false">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Отмена
            </button>
            <button class="cancel-btn" @click="deleteConfirmData.confirmAction()">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
              </svg>
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Компонент уведомлений -->
    <ToastNotification ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { endpoints } from '@/js/api/endpoints';
import { apiClient } from '@/js/api/manager';
import ToastNotification from './ToastNotification.vue';

/**
 * Props компонента
 * @property {string} selectedTable - Имя выбранной таблицы
 */
const props = defineProps({
  selectedTable: {
    type: String,
    required: true,
  },
});

// Состояние компонента
const tableTitle = computed(() => props.selectedTable);
const rows = ref([]);
const columns = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const editBuffer = ref({});
const toastRef = ref(null);

/**
 * Параметры пагинации
 */
const pageSize = 20;
const currentPage = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRowsUnpaged.value.length / pageSize)));

/**
 * Параметры сортировки
 */
const sortKey = ref('');
const sortOrder = ref(''); // '', 'asc', 'desc'

/**
 * Состояние модальных окон
 */
const showAddModal = ref(false);
const jsonInput = ref('');
const jsonError = ref('');
const jsonTextarea = ref(null);
const showDetailsModal = ref(false);
const selectedRow = ref({});
const isEditing = ref(false);

// Добавляем новые состояния для модального окна подтверждения
const showConfirmModal = ref(false);
const confirmModalData = ref({
  title: '',
  message: '',
  confirmAction: null,
  changes: null
});

const showExitConfirmModal = ref(false);
const exitConfirmData = ref({
  action: null,
  additionalAction: null
});

// Добавляем новое состояние для модального окна удаления
const showDeleteConfirmModal = ref(false);
const deleteConfirmData = ref({
  row: null,
  confirmAction: null
});

/**
 * Маппинг API endpoints для различных таблиц
 * Содержит пути для операций CRUD для каждой таблицы
 */
const tableApiMap = {
  // Основные таблицы
  la_df_speciality: endpoints.learning_analytics.specialities,
  la_df_curriculum: endpoints.learning_analytics.curriculums,
  la_df_technology: endpoints.learning_analytics.technologies,
  la_df_competency: endpoints.learning_analytics.competencies,
  la_df_base_discipline: endpoints.learning_analytics.baseDisciplines,
  la_df_discipline: endpoints.learning_analytics.disciplines,
  la_df_vacancy: endpoints.learning_analytics.vacancies,
  la_employer: endpoints.learning_analytics.employers,
  la_df_academic_competence_matrix: endpoints.learning_analytics.acms,
  la_df_competency_profile_of_vacancy: endpoints.learning_analytics.vcms,
  la_df_user_competency_matrix: endpoints.learning_analytics.ucms,

  // Таблицы связей (только GET запросы)
  la_df_disc_tech_rel: { get: endpoints.learning_analytics.relations.disciplineTechnology },
  la_df_disc_comp_rel: { get: endpoints.learning_analytics.relations.disciplineCompetency },
  la_df_vacancy_tech_rel: { get: endpoints.learning_analytics.relations.vacancyTechnology },
  la_df_vacancy_comp_rel: { get: endpoints.learning_analytics.relations.vacancyCompetency },
  la_df_vcm_tech_rel: { get: endpoints.learning_analytics.relations.vcmTechnology },
  la_df_vcm_comp_rel: { get: endpoints.learning_analytics.relations.vcmCompetency },

  // Альтернативные имена для обратной совместимости
  la_df_acm: endpoints.learning_analytics.acms,
  la_df_vcm: endpoints.learning_analytics.vcms,
  la_df_ucm: endpoints.learning_analytics.ucms,
  la_df_basediscipline: endpoints.learning_analytics.baseDisciplines
};

/**
 * Вычисляемые свойства
 */
// Определяет, является ли текущая таблица таблицей связей
const isRelationTable = computed(() => {
  return [
    'la_df_disc_tech_rel',
    'la_df_disc_comp_rel',
    'la_df_vacancy_tech_rel',
    'la_df_vacancy_comp_rel',
    'la_df_vcm_tech_rel',
    'la_df_vcm_comp_rel'
  ].includes(props.selectedTable);
});

// Проверяет валидность JSON при добавлении записи
const isJsonValid = computed(() => {
  try {
    if (!jsonInput.value.trim()) return false;
    JSON.parse(jsonInput.value);
    return true;
  } catch {
    return false;
  }
});

// Получает подсказки для текущей таблицы
const currentTableHint = computed(() => tableJsonHints[props.selectedTable] || null);

// Проверяет наличие обязательных полей в JSON
const missingRequiredFields = computed(() => {
  if (!isJsonValid.value || !currentTableHint.value) return [];
  let obj;
  try {
    obj = JSON.parse(jsonInput.value);
  } catch { return []; }
  if (Array.isArray(obj)) return [];
  return currentTableHint.value.required.filter(f => !(f in obj));
});

/**
 * Методы фильтрации и сортировки
 */
// Фильтрует записи по поисковому запросу
const filteredRowsUnpaged = computed(() => {
  let arr = rows.value;
  if (searchQuery.value) {
    arr = arr.filter(row =>
      columns.value.some(col => String(row[col] || '').toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
  }
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

// Возвращает записи для текущей страницы
const filteredRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredRowsUnpaged.value.slice(start, start + pageSize);
});

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

/**
 * Методы работы с API
 */
// Получает API endpoints для текущей таблицы
function getApi() {
  return tableApiMap[props.selectedTable];
}

// Загружает данные из API
async function fetchData() {
  isLoading.value = true;
  try {
    const api = getApi();
    if (!api) throw new Error('Нет API для этой таблицы');
    let response = await apiClient.get(api.get);
    let data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    rows.value = data;
    columns.value = data.length ? Object.keys(data[0]) : [];
  } catch (error) {
    console.error('Error fetching data:', error);
    rows.value = [];
    columns.value = [];
    toastRef.value?.show('Ошибка загрузки данных', 'error');
  } finally {
    isLoading.value = false;
  }
}

// Модифицируем функцию удаления
async function deleteRow(id) {
  if (isRelationTable.value) {
    toastRef.value?.show('Удаление записей в таблицах связей не поддерживается', 'warning');
    return;
  }

  const row = rows.value.find(r => r.id === id);
  if (!row) {
    toastRef.value?.show('Запись не найдена', 'error');
    return;
  }

  deleteConfirmData.value = {
    row,
    confirmAction: async () => {
      try {
        const api = getApi();
        await apiClient.delete(api.delete(id));
        toastRef.value?.show('Запись удалена', 'success');
        showDeleteConfirmModal.value = false;
        await fetchData();
        nextTick(() => {
          if (filteredRows.value.length === 0 && currentPage.value > 1) {
            currentPage.value--;
          }
        });
      } catch (error) {
        console.error('Delete error:', error);
        toastRef.value?.show(
          `Ошибка при удалении: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
          'error'
        );
      }
    }
  };
  showDeleteConfirmModal.value = true;
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

// Пагинация
function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function goToPage(page) {
  if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

// Модальное окно добавления
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

function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

const saveAddJsonDebounced = debounce(saveAddJson, 120);

function onPasteJson() {
  nextTick(() => {});
}

async function saveAddJson() {
  if (isRelationTable.value) {
    toastRef.value?.show('Добавление записей в таблицы связей не поддерживается', 'warning');
    return;
  }
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
    if (resp.data && (resp.data.id || resp.data.pk || resp.data.added || resp.data.message)) {
      toastRef.value?.show('Запись(и) добавлены', 'success');
      showAddModal.value = false;
      jsonInput.value = '';
      await fetchData();
    } else {
      toastRef.value?.show('Ошибка при добавлении', 'error');
    }
  } catch (e) {
    jsonError.value = 'Ошибка при добавлении: ' + (e?.response?.data?.message || e.message || '');
  }
}

/**
 * Хуки жизненного цикла
 */
// Следит за изменением выбранной таблицы
watch(() => props.selectedTable, () => {
  currentPage.value = 1;
  sortKey.value = '';
  sortOrder.value = '';
  searchQuery.value = '';
  fetchData();
});

onMounted(fetchData);

/**
 * Подсказки для JSON-форматов различных таблиц
 * Содержат примеры и обязательные поля для каждой таблицы
 */
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

// Добавляем новые методы
function showDetails(row) {
  selectedRow.value = row;
  showDetailsModal.value = true;
}

function closeDetails() {
  if (isEditing.value && JSON.stringify(editBuffer.value) !== JSON.stringify(selectedRow.value)) {
    exitConfirmData.value = {
      action: () => {
        isEditing.value = false;
        editBuffer.value = {};
        showDetailsModal.value = false;
        selectedRow.value = {};
        showExitConfirmModal.value = false;
      }
    };
    showExitConfirmModal.value = true;
  } else {
    showDetailsModal.value = false;
    selectedRow.value = {};
    isEditing.value = false;
    editBuffer.value = {};
  }
}

// Добавим новые вычисляемые свойства
const editableFields = computed(() => {
  const hint = tableJsonHints[props.selectedTable];
  if (!hint) return [];

  // Получаем все поля из примера
  const fields = Object.keys(hint.example);

  // Исключаем поля, которые не должны редактироваться
  const nonEditableFields = ['id', 'created_at', 'updated_at'];
  return fields.filter(field => !nonEditableFields.includes(field));
});

const fieldTypes = computed(() => {
  const hint = tableJsonHints[props.selectedTable];
  if (!hint) return {};

  // Определяем типы полей на основе примера
  const types = {};
  Object.entries(hint.example).forEach(([field, value]) => {
    if (Array.isArray(value)) {
      types[field] = 'array';
    } else if (typeof value === 'boolean') {
      types[field] = 'boolean';
    } else if (typeof value === 'number') {
      types[field] = Number.isInteger(value) ? 'integer' : 'decimal';
    } else {
      types[field] = 'string';
    }
  });
  return types;
});

// Модифицируем функцию startEditInModal
function startEditInModal() {
  isEditing.value = true;
  // Копируем только редактируемые поля
  editBuffer.value = {};
  editableFields.value.forEach(field => {
    editBuffer.value[field] = selectedRow.value[field];
  });
}

// Модифицируем функцию saveEditInModal
async function saveEditInModal() {
  if (isRelationTable.value) {
    toastRef.value?.show('Редактирование записей в таблицах связей не поддерживается', 'warning');
    return;
  }

  // Проверяем, были ли изменения только в редактируемых полях
  const changedFields = {};
  editableFields.value.forEach(field => {
    const oldValue = selectedRow.value[field];
    const newValue = editBuffer.value[field];

    // Особая обработка для разных типов данных
    if (Array.isArray(oldValue) || Array.isArray(newValue)) {
      // Для массивов сравниваем содержимое
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changedFields[field] = Array.isArray(newValue) ? newValue : [];
      }
    } else if (typeof oldValue === 'number' || fieldTypes.value[field] === 'decimal' || fieldTypes.value[field] === 'integer') {
      // Для чисел преобразуем строки в числа перед сравнением
      const oldNum = Number(oldValue);
      const newNum = Number(newValue);
      if (!isNaN(newNum) && oldNum !== newNum) {
        changedFields[field] = newNum;
      }
    } else if (typeof oldValue === 'boolean' || fieldTypes.value[field] === 'boolean') {
      // Для булевых значений
      const oldBool = Boolean(oldValue);
      const newBool = typeof newValue === 'boolean' ? newValue : newValue === 'true';
      if (oldBool !== newBool) {
        changedFields[field] = newBool;
      }
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changedFields[field] = newValue || null; // Используем null вместо undefined
    }
  });

  if (Object.keys(changedFields).length === 0) {
    toastRef.value?.show('Нет изменений для сохранения', 'info');
    return;
  }

  // Валидация обязательных полей
  const hint = tableJsonHints[props.selectedTable];
  if (hint?.required) {
    const missingRequired = hint.required.filter(field => {
      const value = changedFields[field] ?? selectedRow.value[field];
      return value === null || value === undefined || value === '';
    });
    if (missingRequired.length > 0) {
      toastRef.value?.show(`Не заполнены обязательные поля: ${missingRequired.join(', ')}`, 'error');
      return;
    }
  }

  // Форматируем данные в соответствии с типами полей
  const formattedData = {};
  Object.entries(changedFields).forEach(([field, value]) => {
    const type = fieldTypes.value[field];
    switch (type) {
      case 'array':
        formattedData[field] = Array.isArray(value) ? value : [];
        break;
      case 'integer':
        formattedData[field] = Number.isInteger(Number(value)) ? Number(value) : Math.round(Number(value));
        break;
      case 'decimal':
        formattedData[field] = Number.isFinite(Number(value)) ? Number(value) : null;
        break;
      case 'boolean':
        formattedData[field] = Boolean(value);
        break;
      default:
        formattedData[field] = value === undefined ? null : value;
    }
  });

  // Показываем модальное окно подтверждения
  confirmModalData.value = {
    title: 'Подтверждение изменений',
    message: 'Вы действительно хотите сохранить следующие изменения?',
    changes: Object.entries(formattedData).map(([key, value]) => ({
      field: key,
      oldValue: selectedRow.value[key],
      newValue: value
    })),
    confirmAction: async () => {
      try {
        const api = getApi();
        console.log('Отправляемые данные:', formattedData);
        console.log('URL запроса:', api.update(selectedRow.value.id));

        // Добавляем все обязательные поля, даже если они не изменились
        if (hint?.required) {
          hint.required.forEach(field => {
            if (!(field in formattedData)) {
              formattedData[field] = selectedRow.value[field];
            }
          });
        }

        await apiClient.put(api.update(selectedRow.value.id), formattedData);
        toastRef.value?.show('Изменения сохранены', 'success');
        isEditing.value = false;
        showConfirmModal.value = false;
        await fetchData();
        closeDetails();
      } catch (error) {
        console.error('Save error:', error);
        console.error('Response data:', error.response?.data);
        toastRef.value?.show(
          `Ошибка при сохранении: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
          'error'
        );
      }
    }
  };
  showConfirmModal.value = true;
}

const isJsonField = (value) => {
  return Array.isArray(value) || (typeof value === 'object' && value !== null);
};

const formatJsonField = (value) => {
  if (Array.isArray(value)) {
    return value.join(', ');
  } else if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return value;
};

// Добавим вычисляемое свойство для проверки наличия данных
const hasData = computed(() => rows.value.length > 0 && columns.value.length > 0);

// Модифицируем функцию cancelEditInModal
function cancelEditInModal() {
  if (JSON.stringify(editBuffer.value) !== JSON.stringify(selectedRow.value)) {
    exitConfirmData.value = {
      action: () => {
        isEditing.value = false;
        editBuffer.value = {};
        showExitConfirmModal.value = false;
      }
    };
    showExitConfirmModal.value = true;
  } else {
    isEditing.value = false;
    editBuffer.value = {};
  }
}
</script>

<style scoped>
/* Определяем переменные для шрифтов */
:root {
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
}

/* Основные стили таблицы */
.table-editor-full {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  background: var(--color-primary-background);
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.table-responsive-x {
  width: 100%;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--table-border-radius);
  box-shadow: var(--table-shadow);
  background: var(--color-secondary-background);
  position: relative;
}

.modern-table-full {
  width: 100%;
  border-radius: var(--table-border-radius);
  border: var(--table-border);
  background: var(--color-secondary-background);
  margin: 0;
  border-collapse: separate;
  border-spacing: 0;
}

/* Стили для заголовков и ячеек */
.modern-table-full th,
.modern-table-full td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
  line-height: 1.5;
  background: transparent;
  color: var(--color-primary-text);
  font-family: var(--font-family-base);
}

/* Стили для заголовков */
.modern-table-full th {
  background: var(--color-table-header);
  font-weight: 600;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 2;
}

/* Стили для ячеек */
.modern-table-full td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Специальные размеры для разных типов колонок */
.modern-table-full td[data-column="id"],
.modern-table-full th[data-column="id"] {
  width: 80px;
  min-width: 80px;
}

.modern-table-full td[data-column="name"],
.modern-table-full th[data-column="name"],
.modern-table-full td[data-column="title"],
.modern-table-full th[data-column="title"] {
  min-width: 200px;
}

.modern-table-full td[data-column="description"],
.modern-table-full th[data-column="description"] {
  min-width: 300px;
}

/* Стили для колонки действий */
.actions-cell {
  position: sticky !important;
  left: 0;
  z-index: 3;
  background: var(--color-secondary-background) !important;
  border-right: 1px solid var(--color-border);
  width: 90px !important;
  min-width: 90px !important;
  max-width: 90px !important;
  padding: 8px !important;
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
}

/* Заголовок колонки действий */
.modern-table-full th[style*="width: 120px"] {
  position: sticky !important;
  left: 0;
  z-index: 4;
  background: var(--color-table-header) !important;
  border-right: 1px solid var(--color-border);
  width: 90px !important;
  min-width: 90px !important;
  max-width: 90px !important;
  padding: 8px !important;
  text-align: center;
}

/* Стили для кнопок в ячейке действий */
.actions-cell button {
  width: 32px;
  height: 32px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  background: transparent;
  border: none;
  cursor: pointer;
}

.actions-cell button:hover {
  background: rgba(208,50,45,0.07);
}

.actions-cell button svg {
  width: 20px;
  height: 20px;
}

/* Стили для строк при наведении */
.modern-table-full tbody tr:hover {
  background-color: var(--color-table-row-hover);
}

.modern-table-full tbody tr:hover .actions-cell {
  background-color: var(--color-table-row-hover) !important;
}

/* Адаптивные стили */
@media (max-width: 1200px) {
  .modern-table-full td,
  .modern-table-full th {
    padding: 10px 14px;
  }
}

@media (max-width: 768px) {
  .modern-table-full td,
  .modern-table-full th {
    padding: 8px 12px;
    font-size: 13px;
  }
}

/* Стили для скроллбара */
.table-responsive-x::-webkit-scrollbar {
  height: 8px;
}

.table-responsive-x::-webkit-scrollbar-track {
  background: var(--color-primary-background);
  border-radius: 4px;
}

.table-responsive-x::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.table-responsive-x::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent);
}

.search-input {
  font-family: var(--font-family-base);
  font-size: 15px;
  letter-spacing: -0.011em;
}

.loading-block {
  text-align: center;
  color: var(--color-secondary-text);
  margin: 30px 0;
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

button:last-child {
  margin-right: 0;
}

button:hover {
  color: var(--color-danger);
  background: rgba(208,50,45,0.07);
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

.modal-overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
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

.modern-table-full input {
  width: 100%;
  padding: 8px 12px;
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

/* Стили для модального окна детализации */
.details-modal {
  max-width: 700px;
  width: 90%;
  background: var(--color-secondary-background);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 22px;
  color: var(--color-primary-text);
  font-weight: 600;
}

/* Стили для кнопки закрытия */
.close-button {
  position: relative;
  width: 32px;
  height: 32px;
  padding: 6px;
  border: none;
  background: transparent;
  color: var(--color-secondary-text);
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: var(--color-danger-hover);
  color: white;
  transform: rotate(90deg);
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.details-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 16px;
  margin-right: -16px;
}

.details-content::-webkit-scrollbar {
  width: 8px;
}

.details-content::-webkit-scrollbar-track {
  background: var(--color-primary-background);
  border-radius: 4px;
}

.details-content::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.details-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent);
}

.detail-row {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.detail-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-label {
  flex: 0 0 220px;
  font-weight: 600;
  color: var(--color-secondary-text);
  padding-right: 24px;
  font-size: 15px;
}

.detail-value {
  flex: 1;
  color: var(--color-primary-text);
  word-break: break-word;
  font-size: 15px;
  line-height: 1.5;
}

/* Стили для режима редактирования */
.edit-input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid var(--color-accent);
  border-radius: 6px;
  font-size: 15px;
  background: var(--color-primary-background);
  color: var(--color-primary-text);
  transition: all 0.2s ease;
  box-sizing: border-box;
  outline: none;
}

.edit-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(80,120,255,0.1);
}

.edit-input:hover {
  border-color: var(--color-accent-hover);
}

/* Стили для кнопок в модальном окне */
.modal-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.edit-button,
.save-button,
.cancel-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.edit-button {
  background: var(--color-accent);
  color: white;
}

.edit-button:hover {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
}

.save-button {
  background: var(--color-success);
  color: white;
}

.save-button:hover {
  background: var(--color-success-hover);
  transform: translateY(-1px);
}

.cancel-button {
  background: var(--color-danger);
  color: white;
}

.cancel-button:hover {
  background: var(--color-danger-hover);
  transform: translateY(-1px);
}

.edit-button svg,
.save-button svg,
.cancel-button svg {
  width: 16px;
  height: 16px;
}

/* Стили для полей ввода в модальном окне */
.detail-value .edit-input {
  width: 100%;
  max-width: 400px;
}

/* Медиа-запросы для кнопок в модальном окне */
@media (max-width: 600px) {
  .modal-actions {
    flex-wrap: wrap;
  }

  .edit-button,
  .save-button,
  .cancel-button {
    padding: 6px 12px;
    font-size: 13px;
  }
}

.no-data-message {
  text-align: center;
  padding: 2rem;
  background: var(--color-secondary-background);
  border-radius: var(--table-border-radius);
  margin: 1rem 0;
  color: var(--color-secondary-text);
}

/* Стили для модального окна подтверждения */
.confirm-modal {
  max-width: 450px;
  width: 90%;
  padding: 24px;
}

.confirm-modal h3 {
  color: var(--color-primary-text);
  margin: 0 0 16px 0;
  font-size: 20px;
}

.confirm-modal p {
  color: var(--color-secondary-text);
  margin: 0 0 24px 0;
  font-size: 16px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-actions button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.modal-actions button svg {
  width: 18px;
  height: 18px;
}

.confirm-btn {
  background: var(--color-accent);
  color: white;
}

.confirm-btn:hover {
  background: var(--color-accent-hover);
}

.cancel-btn {
  background: var(--color-danger);
  color: white;
}

.cancel-btn:hover {
  background: var(--color-danger-hover);
}

/* Стили для таблицы изменений */
.changes-table {
  margin-bottom: 24px;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.changes-table table {
  width: 100%;
  border-collapse: collapse;
}

.changes-table th,
.changes-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
}

.changes-table th {
  background: var(--color-table-header);
  font-weight: 600;
  color: var(--color-primary-text);
  position: sticky;
  top: 0;
  z-index: 1;
}

.changes-table td {
  color: var(--color-secondary-text);
}

.changes-table tr:last-child td {
  border-bottom: none;
}

/* Модальное окно подтверждения выхода */
.exit-confirm-modal {
  max-width: 400px;
  width: 90%;
  padding: 24px;
  text-align: center;
}

.exit-confirm-modal h3 {
  color: var(--color-primary-text);
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.exit-confirm-modal p {
  color: var(--color-secondary-text);
  margin: 0 0 24px 0;
  font-size: 15px;
  line-height: 1.5;
}

.exit-confirm-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.exit-confirm-actions button {
  min-width: 140px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.exit-confirm-actions button svg {
  width: 16px;
  height: 16px;
  opacity: 0.9;
}

.exit-confirm-actions button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.exit-confirm-actions button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Добавляем стили для модального окна удаления */
.delete-confirm-modal {
  max-width: 450px;
  width: 90%;
  padding: 24px;
}

.delete-confirm-modal h3 {
  color: var(--color-danger);
  font-size: 20px;
  font-weight: var(--font-weight-semibold);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-confirm-modal h3 svg {
  width: 24px;
  height: 24px;
}

.delete-confirm-modal p {
  color: var(--color-secondary-text);
  font-size: 15px;
  line-height: 1.5;
  margin: 0 0 20px 0;
}

.delete-details {
  background: var(--color-table-header);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.delete-details-row {
  display: flex;
  margin-bottom: 8px;
}

.delete-details-row:last-child {
  margin-bottom: 0;
}

.delete-details-label {
  flex: 0 0 120px;
  color: var(--color-secondary-text);
  font-size: 14px;
}

.delete-details-value {
  flex: 1;
  color: var(--color-primary-text);
  font-weight: var(--font-weight-medium);
  font-size: 14px;
}

.delete-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.delete-confirm-actions button {
  min-width: 120px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.delete-confirm-actions button svg {
  width: 16px;
  height: 16px;
}
</style>
