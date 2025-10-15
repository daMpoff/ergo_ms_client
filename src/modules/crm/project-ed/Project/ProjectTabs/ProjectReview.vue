<template>
  <div class="container">
    <HeaderBar v-if="accessChecked && isAllowed" />
    <div class="mt-3">
      <Breadcrumbs v-if="accessChecked && isAllowed" :items="breadcrumbItems" class="mb-3" />
      <h2 v-if="accessChecked && isAllowed" class="mb-3">{{ pageTitle }}</h2>
      

      <div v-if="isLoading || !accessChecked" class="loading-state">
        <div class="spinner-border text-primary" role="status" aria-label="Загрузка"></div>
        <div class="loading-text mt-2">Загрузка проекта…</div>
      </div>

      <template v-else>
        <div v-if="!projectData" class="alert alert-warning">
          Проект не найден
        </div>

        <div v-else-if="!isAllowed && accessChecked" class="alert alert-danger">
          Страница доступна только для проектов в статусе «На рассмотрении»
        </div>

        <div v-else class="project-review">
          <div class="card mb-3">
            <div class="card-header fw-semibold">Основная информация</div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-12">
                  <div class="field">
                    <span class="field-label">Блок мероприятий:</span>
                    <span class="field-value">
                      <template v-if="blockCode || blockTitle">
                        <template v-if="blockCode">{{ blockCode }}<span v-if="blockTitle">. </span></template>{{ blockTitle || '' }}
                      </template>
                      <template v-else>—</template>
                    </span>
                    <div class="decision-inline">
                      <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('block')) }" @click="toggleClarify(makeKey('block'))">Уточнить</button>
                    </div>
                    <div v-if="isClarify(makeKey('block'))" class="decision-comment mt-2">
                      <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к отклонению" :value="getComment(makeKey('block'))" @input="updateComment(makeKey('block'), $event.target.value)"></textarea>
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="field">
                    <span class="field-label">Мероприятие:</span>
                    <span class="field-value">
                      <template v-if="eventCode || eventTitle">
                        <template v-if="eventCode">{{ eventCode }}<span v-if="eventTitle">. </span></template>{{ eventTitle || '' }}
                      </template>
                      <template v-else>—</template>
                    </span>
                    <div class="decision-inline">
                      <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('event')) }" @click="toggleClarify(makeKey('event'))">Уточнить</button>
                    </div>
                    <div v-if="isClarify(makeKey('event'))" class="decision-comment mt-2">
                      <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к отклонению" :value="getComment(makeKey('event'))" @input="updateComment(makeKey('event'), $event.target.value)"></textarea>
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="field"><span class="field-label">Короткое название:</span> <span class="field-value">{{ projectData.short_name || '—' }}</span>
                    <div class="decision-inline">
                      <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('short_name')) }" @click="toggleClarify(makeKey('short_name'))">Уточнить</button>
                    </div>
                    <div v-if="isClarify(makeKey('short_name'))" class="decision-comment mt-2">
                      <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к отклонению" :value="getComment(makeKey('short_name'))" @input="updateComment(makeKey('short_name'), $event.target.value)"></textarea>
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="field"><span class="field-label">Полное название:</span> <span class="field-value">{{ projectData.name || '—' }}</span>
                    <div class="decision-inline">
                      <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('name')) }" @click="toggleClarify(makeKey('name'))">Уточнить</button>
                    </div>
                    <div v-if="isClarify(makeKey('name'))" class="decision-comment mt-2">
                      <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к отклонению" :value="getComment(makeKey('name'))" @input="updateComment(makeKey('name'), $event.target.value)"></textarea>
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="field"><span class="field-label">Уточнение к названию:</span> <span class="field-value">{{ projectData.name_clarification || '—' }}</span>
                    <div class="decision-inline">
                      <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('name_clarification')) }" @click="toggleClarify(makeKey('name_clarification'))">Уточнить</button>
                    </div>
                    <div v-if="isClarify(makeKey('name_clarification'))" class="decision-comment mt-2">
                      <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к отклонению" :value="getComment(makeKey('name_clarification'))" @input="updateComment(makeKey('name_clarification'), $event.target.value)"></textarea>
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="field"><span class="field-label">Цель проекта:</span> <span class="field-value">{{ projectData.goal || '—' }}</span>
                    <div class="decision-inline">
                      <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('goal')) }" @click="toggleClarify(makeKey('goal'))">Уточнить</button>
                    </div>
                    <div v-if="isClarify(makeKey('goal'))" class="decision-comment mt-2">
                      <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к отклонению" :value="getComment(makeKey('goal'))" @input="updateComment(makeKey('goal'), $event.target.value)"></textarea>
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="field"><span class="field-label">Дата начала:</span> <span class="field-value">{{ formatDateLong(projectData.start_date) }}</span>
                    <div class="decision-inline">
                      <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('start_date')) }" @click="toggleClarify(makeKey('start_date'))">Уточнить</button>
                    </div>
                    <div v-if="isClarify(makeKey('start_date'))" class="decision-comment mt-2">
                      <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к отклонению" :value="getComment(makeKey('start_date'))" @input="updateComment(makeKey('start_date'), $event.target.value)"></textarea>
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="field"><span class="field-label">Дата окончания:</span> <span class="field-value">{{ formatDateLong(projectData.end_date) }}</span>
                    <div class="decision-inline">
                      <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('end_date')) }" @click="toggleClarify(makeKey('end_date'))">Уточнить</button>
                    </div>
                    <div v-if="isClarify(makeKey('end_date'))" class="decision-comment mt-2">
                      <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к отклонению" :value="getComment(makeKey('end_date'))" @input="updateComment(makeKey('end_date'), $event.target.value)"></textarea>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-header fw-semibold">Участники</div>
            <div class="card-body">
              <div class="participants-list">
                <div class="field">
                  <span class="field-label">Руководитель:</span> 
                  <span class="field-value">
                    <template v-if="projectData?.manager_data">
                      <a 
                        href="#" 
                        class="user-link"
                        @click.prevent="openProfile(projectData.manager_data.id)"
                        @mouseenter="showTooltip($event, projectData.manager_data)"
                        @mouseleave="hideTooltip"
                      >
                        {{ getManagerName() }}
                      </a>
                    </template>
                    <template v-else>—</template>
                  </span>
                  <div class="decision-inline">
                    <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('manager')) }" @click="toggleClarify(makeKey('manager'))">Уточнить</button>
                  </div>
                  <div v-if="isClarify(makeKey('manager'))" class="decision-comment mt-2">
                    <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к отклонению" :value="getComment(makeKey('manager'))" @input="updateComment(makeKey('manager'), $event.target.value)"></textarea>
                  </div>
                </div>
                <div class="field">
                  <span class="field-label">Куратор:</span> 
                  <span class="field-value">
                    <template v-if="projectData?.curator_data">
                      <a 
                        href="#" 
                        class="user-link"
                        @click.prevent="openProfile(projectData.curator_data.id)"
                        @mouseenter="showTooltip($event, projectData.curator_data)"
                        @mouseleave="hideTooltip"
                      >
                        {{ getCuratorName() }}
                      </a>
                    </template>
                    <template v-else>—</template>
                  </span>
                  <div class="decision-inline">
                    <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('curator')) }" @click="toggleClarify(makeKey('curator'))">Уточнить</button>
                  </div>
                  <div v-if="isClarify(makeKey('curator'))" class="decision-comment mt-2">
                    <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к отклонению" :value="getComment(makeKey('curator'))" @input="updateComment(makeKey('curator'), $event.target.value)"></textarea>
                  </div>
                </div>
                <div class="field">
                  <span class="field-label">Заказчик:</span> 
                  <span class="field-value">
                    <template v-if="projectData?.customer_data">
                      <a 
                        href="#" 
                        class="user-link"
                        @click.prevent="openProfile(projectData.customer_data.id)"
                        @mouseenter="showTooltip($event, projectData.customer_data)"
                        @mouseleave="hideTooltip"
                      >
                        {{ getCustomerName() }}
                      </a>
                    </template>
                    <template v-else>—</template>
                  </span>
                  <div class="decision-inline">
                    <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('customer')) }" @click="toggleClarify(makeKey('customer'))">Уточнить</button>
                  </div>
                  <div v-if="isClarify(makeKey('customer'))" class="decision-comment mt-2">
                    <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к отклонению" :value="getComment(makeKey('customer'))" @input="updateComment(makeKey('customer'), $event.target.value)"></textarea>
                  </div>
                </div>
                <div class="field">
                  <span class="field-label">Исполнители:</span>
                  <span class="field-value">
                    <template v-if="projectData?.performers && projectData.performers.length > 0">
                      <template v-for="(performer, index) in projectData.performers" :key="performer.id">
                        <a 
                          v-if="performer.id"
                          href="#" 
                          class="user-link"
                          @click.prevent="openProfile(performer.id)"
                          @mouseenter="showTooltip($event, performer)"
                          @mouseleave="hideTooltip"
                        >
                          {{ performer.full_name || performer.username || `ID: ${performer.id}` }}
                        </a>
                        <span v-else>{{ performer.full_name || performer.username || `ID: ${performer.id}` }}</span>
                        <span v-if="index < projectData.performers.length - 1">, </span>
                      </template>
                    </template>
                    <template v-else>—</template>
                  </span>
                  <div class="decision-inline">
                    <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('performers')) }" @click="toggleClarify(makeKey('performers'))">Уточнить</button>
                  </div>
                  <div v-if="isClarify(makeKey('performers'))" class="decision-comment mt-2">
                    <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к отклонению" :value="getComment(makeKey('performers'))" @input="updateComment(makeKey('performers'), $event.target.value)"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-header fw-semibold">Этапы</div>
            <div class="card-body">
              <div v-if="!projectData.stages || projectData.stages.length === 0" class="text-muted">Нет этапов</div>
              <div v-else class="stages-list d-flex flex-column gap-3">
                <div v-for="(s, idx) in projectData.stages" :key="s.id" class="stage-card">
                  <div class="stage-header d-flex align-items-center justify-content-between">
                    <div class="stage-title">
                      <span class="badge stage-index me-2">Этап {{ idx + 1 }}</span>
                      <strong>{{ s.name || 'Без названия' }}</strong>
                    </div>
                  </div>
                  <div class="stage-body">
                    <div class="field">
                      <div class="field-label">Название этапа:</div>
                      <div class="field-value">{{ s.name || '—' }}</div>
                      <div class="decision-inline">
                        <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('stage_name', s.id)) }" @click="toggleClarify(makeKey('stage_name', s.id))">Уточнить</button>
                      </div>
                      <div v-if="isClarify(makeKey('stage_name', s.id))" class="decision-comment">
                        <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к названию" :value="getComment(makeKey('stage_name', s.id))" @input="updateComment(makeKey('stage_name', s.id), $event.target.value)"></textarea>
                      </div>
                    </div>

                    <div class="field">
                      <div class="field-label">Начало этапа:</div>
                      <div class="field-value">{{ formatDateLong(s.start_date) }}</div>
                      <div class="decision-inline">
                        <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('stage_start', s.id)) }" @click="toggleClarify(makeKey('stage_start', s.id))">Уточнить</button>
                      </div>
                      <div v-if="isClarify(makeKey('stage_start', s.id))" class="decision-comment">
                        <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к дате начала" :value="getComment(makeKey('stage_start', s.id))" @input="updateComment(makeKey('stage_start', s.id), $event.target.value)"></textarea>
                      </div>
                    </div>

                    <div class="field">
                      <div class="field-label">Окончание этапа:</div>
                      <div class="field-value">{{ formatDateLong(s.end_date) }}</div>
                      <div class="decision-inline">
                        <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('stage_end', s.id)) }" @click="toggleClarify(makeKey('stage_end', s.id))">Уточнить</button>
                      </div>
                      <div v-if="isClarify(makeKey('stage_end', s.id))" class="decision-comment">
                        <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к дате окончания" :value="getComment(makeKey('stage_end', s.id))" @input="updateComment(makeKey('stage_end', s.id), $event.target.value)"></textarea>
                      </div>
                    </div>

                    <div class="field">
                      <div class="field-label">Планируемые результаты этапа:</div>
                      <div class="field-value">{{ s.planned_results || '—' }}</div>
                      <div class="decision-inline">
                        <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('stage_results', s.id)) }" @click="toggleClarify(makeKey('stage_results', s.id))">Уточнить</button>
                      </div>
                      <div v-if="isClarify(makeKey('stage_results', s.id))" class="decision-comment">
                        <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий к планируемым результатам" :value="getComment(makeKey('stage_results', s.id))" @input="updateComment(makeKey('stage_results', s.id), $event.target.value)"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-header fw-semibold">Планируемые результаты</div>
            <div class="card-body">
              <ul class="mb-0 tasks-list">
                <li v-for="r in projectData.planned_results || []" :key="r.id" class="task-item">
                  <span class="task-text">{{ r.description }}</span>
                  <div class="decision-inline mt-1">
                    <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('planned_result', r.id)) }" @click="toggleClarify(makeKey('planned_result', r.id))">Уточнить</button>
                  </div>
                  <div v-if="isClarify(makeKey('planned_result', r.id))" class="decision-comment mt-2">
                    <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий" :value="getComment(makeKey('planned_result', r.id))" @input="updateComment(makeKey('planned_result', r.id), $event.target.value)"></textarea>
                  </div>
                </li>
              </ul>
              <div v-if="!projectData.planned_results || projectData.planned_results.length === 0" class="text-muted">Нет данных</div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-header fw-semibold">Задачи</div>
            <div class="card-body">
              <ul class="mb-0 tasks-list">
                <li v-for="t in projectData.tasks || []" :key="t.id" class="task-item">
                  <span class="task-text">{{ t.description }}</span>
                  <div class="decision-inline mt-1">
                    <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('task', t.id)) }" @click="toggleClarify(makeKey('task', t.id))">Уточнить</button>
                  </div>
                  <div v-if="isClarify(makeKey('task', t.id))" class="decision-comment mt-2">
                    <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий" :value="getComment(makeKey('task', t.id))" @input="updateComment(makeKey('task', t.id), $event.target.value)"></textarea>
                  </div>
                </li>
              </ul>
              <div v-if="!projectData.tasks || projectData.tasks.length === 0" class="text-muted">Нет данных</div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-header fw-semibold">Целевые показатели</div>
            <div class="card-body">
              <div v-if="!projectData.target_indicators || projectData.target_indicators.length === 0" class="text-muted">Нет данных</div>
              <div v-else class="table-responsive">
                <table class="table table-sm align-middle indicators-table">
                  <thead>
                    <tr>
                      <th class="name-col">Название</th>
                      <th>Ед. изм.</th>
                      <th>Базовое</th>
                      <th>План</th>
                      <th>Решение</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ti in projectData.target_indicators || []" :key="ti.id">
                      <td class="indicator-name-cell">{{ getIndicatorName(ti) }}</td>
                      <td>{{ ti.unit || '—' }}</td>
                      <td>{{ ti.baseline ?? '—' }}</td>
                      <td>{{ ti.planned ?? '—' }}</td>
                      <td class="w-25">
                        <div class="decision-inline">
                          <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('indicator', ti.id)) }" @click="toggleClarify(makeKey('indicator', ti.id))">Уточнить</button>
                        </div>
                        <div v-if="isClarify(makeKey('indicator', ti.id))" class="decision-comment mt-2">
                          <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий" :value="getComment(makeKey('indicator', ti.id))" @input="updateComment(makeKey('indicator', ti.id), $event.target.value)"></textarea>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-header fw-semibold">Бюджет: позиции</div>
            <div class="card-body">
              <div v-if="!projectData.budget_items || projectData.budget_items.length === 0" class="text-muted">Нет позиций</div>
              <div v-else class="table-responsive">
                <table class="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Этап</th>
                      <th>Статья затрат</th>
                      <th>Источник финансирования</th>
                      <th class="text-end">Сумма</th>
                      <th>Решение</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="bi in projectData.budget_items || []" :key="bi.id">
                      <td>{{ stageName(bi.stage_id) }}</td>
                      <td>{{ translateBudgetTerms(bi.cost_article) }}</td>
                      <td>{{ translateBudgetTerms(bi.funding_source) }}</td>
                      <td class="text-end">{{ formatMoney(bi.amount) }}</td>
                      <td class="w-25">
                        <div class="decision-inline">
                          <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('budget_item', bi.id)) }" @click="toggleClarify(makeKey('budget_item', bi.id))">Уточнить</button>
                        </div>
                        <div v-if="isClarify(makeKey('budget_item', bi.id))" class="decision-comment mt-2">
                          <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий" :value="getComment(makeKey('budget_item', bi.id))" @input="updateComment(makeKey('budget_item', bi.id), $event.target.value)"></textarea>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header fw-semibold">Бюджет: итоги</div>
            <div class="card-body">
              <div v-if="!(projectData.budget_totals && projectData.budget_totals.length)" class="text-muted">Нет данных по итогам бюджета</div>
              <div v-else class="table-responsive">
                <table class="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Тип расхода</th>
                      <th class="text-end">Сумма</th>
                      <th>Решение</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="bt in projectData.budget_totals" :key="`salary-off-${bt.id}`">
                      <td>Зарплата (внебюджет)</td>
                      <td class="text-end">{{ formatMoney(bt.salary_off_budget) }}</td>
                      <td class="w-25">
                        <div class="decision-inline">
                          <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('budget_total_salary_off', bt.id)) }" @click="toggleClarify(makeKey('budget_total_salary_off', bt.id))">Уточнить</button>
                        </div>
                        <div v-if="isClarify(makeKey('budget_total_salary_off', bt.id))" class="decision-comment mt-2">
                          <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий" :value="getComment(makeKey('budget_total_salary_off', bt.id))" @input="updateComment(makeKey('budget_total_salary_off', bt.id), $event.target.value)"></textarea>
                        </div>
                      </td>
                    </tr>
                    <tr v-for="bt in projectData.budget_totals" :key="`salary-budget-${bt.id}`">
                      <td>Зарплата (бюджет)</td>
                      <td class="text-end">{{ formatMoney(bt.salary_budget) }}</td>
                      <td class="w-25">
                        <div class="decision-inline">
                          <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('budget_total_salary_budget', bt.id)) }" @click="toggleClarify(makeKey('budget_total_salary_budget', bt.id))">Уточнить</button>
                        </div>
                        <div v-if="isClarify(makeKey('budget_total_salary_budget', bt.id))" class="decision-comment mt-2">
                          <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий" :value="getComment(makeKey('budget_total_salary_budget', bt.id))" @input="updateComment(makeKey('budget_total_salary_budget', bt.id), $event.target.value)"></textarea>
                        </div>
                      </td>
                    </tr>
                    <tr v-for="bt in projectData.budget_totals" :key="`other-off-${bt.id}`">
                      <td>Другие расходы (внебюджет)</td>
                      <td class="text-end">{{ formatMoney(bt.other_off_budget) }}</td>
                      <td class="w-25">
                        <div class="decision-inline">
                          <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('budget_total_other_off', bt.id)) }" @click="toggleClarify(makeKey('budget_total_other_off', bt.id))">Уточнить</button>
                        </div>
                        <div v-if="isClarify(makeKey('budget_total_other_off', bt.id))" class="decision-comment mt-2">
                          <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий" :value="getComment(makeKey('budget_total_other_off', bt.id))" @input="updateComment(makeKey('budget_total_other_off', bt.id), $event.target.value)"></textarea>
                        </div>
                      </td>
                    </tr>
                    <tr v-for="bt in projectData.budget_totals" :key="`other-budget-${bt.id}`">
                      <td>Другие расходы (бюджет)</td>
                      <td class="text-end">{{ formatMoney(bt.other_budget) }}</td>
                      <td class="w-25">
                        <div class="decision-inline">
                          <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('budget_total_other_budget', bt.id)) }" @click="toggleClarify(makeKey('budget_total_other_budget', bt.id))">Уточнить</button>
                        </div>
                        <div v-if="isClarify(makeKey('budget_total_other_budget', bt.id))" class="decision-comment mt-2">
                          <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий" :value="getComment(makeKey('budget_total_other_budget', bt.id))" @input="updateComment(makeKey('budget_total_other_budget', bt.id), $event.target.value)"></textarea>
                        </div>
                      </td>
                    </tr>
                    <tr v-for="bt in projectData.budget_totals" :key="`total-${bt.id}`" class="table-active">
                      <td><strong>Итого с страховыми взносами</strong></td>
                      <td class="text-end"><strong>{{ formatMoney(bt.total_with_insurance) }}</strong></td>
                      <td class="w-25">
                        <div class="decision-inline">
                          <button type="button" class="btn btn-sm btn-outline-warning" :class="{ active: isClarify(makeKey('budget_total_total', bt.id)) }" @click="toggleClarify(makeKey('budget_total_total', bt.id))">Уточнить</button>
                        </div>
                        <div v-if="isClarify(makeKey('budget_total_total', bt.id))" class="decision-comment mt-2">
                          <textarea class="form-control form-control-sm" rows="2" placeholder="Комментарий" :value="getComment(makeKey('budget_total_total', bt.id))" @input="updateComment(makeKey('budget_total_total', bt.id), $event.target.value)"></textarea>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Тултип с информацией о пользователе -->
    <SimpleTooltip
      :visible="tooltipVisible"
      :target-element="tooltipTarget"
      placement="top"
      @mouseenter="cancelHideTooltip"
      @mouseleave="hideTooltip"
    >
      <ProfileTooltip
        v-if="tooltipData"
        :user-id="tooltipData.id"
        :username="tooltipData.username"
        :full-name="tooltipData.full_name"
        :position="tooltipData.position"
        :faculty="tooltipData.faculty_name"
        :department="tooltipData.department_name"
        :avatar-url="tooltipData.avatar_url"
      />
    </SimpleTooltip>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'
import { slugify as translitSlugify } from 'transliteration'
import Breadcrumbs from '@/modules/crm/project-ed/components/Breadcrumbs.vue'
import { Home, List, FileText, CheckCircle, Calendar } from 'lucide-vue-next'
import HeaderBar from '@/modules/crm/project-ed/components/HeaderBar.vue'
import SimpleTooltip from '@/modules/crm/project-ed/components/SimpleTooltip.vue'
import ProfileTooltip from '@/modules/crm/project-ed/components/ProfileTooltip.vue'
import { useUserStore } from '@/core/cms/js/userStore.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const pageTitle = ref('Ревью проекта')
const projectTitleBreadcrumb = ref('Проект')
const isLoading = ref(true)
const projectData = ref(null)
const isStatusAllowed = computed(() => (projectData.value?.status || '').toLowerCase() === 'pending')
const isAdmin = ref(false)
const isExpertGroup = ref(false)
const isAssignedExpert = ref(false)
const isAllowed = computed(() => isStatusAllowed.value && (isAdmin.value || isExpertGroup.value || isAssignedExpert.value))
const accessChecked = ref(false)

// Состояние тултипов
const tooltipVisible = ref(false)
const tooltipTarget = ref(null)
const tooltipData = ref(null)
let tooltipHideTimeout = null

// Состояние решений по пунктам ревью
const decisions = ref(new Map())

function makeKey(kind, id = null) {
  // Унифицированный ключ: kind[:id]
  return id == null ? String(kind) : `${String(kind)}:${String(id)}`
}

function setAccept(key) {
  const map = new Map(decisions.value)
  const prev = map.get(key) || { status: null, comment: '' }
  map.set(key, { status: 'accepted', comment: prev.comment || '' })
  decisions.value = map
}

function setReject(key) {
  const map = new Map(decisions.value)
  const prev = map.get(key) || { status: null, comment: '' }
  map.set(key, { status: 'rejected', comment: prev.comment || '' })
  decisions.value = map
}

function getDecision(key) {
  return decisions.value.get(key)?.status || null
}

function getComment(key) {
  return decisions.value.get(key)?.comment || ''
}

function updateComment(key, text) {
  const map = new Map(decisions.value)
  const prev = map.get(key) || { status: 'rejected', comment: '' }
  map.set(key, { status: prev.status || 'rejected', comment: String(text) })
  decisions.value = map
}

// Режим уточнения: одна кнопка "Уточнить" показывает/скрывает поле комментария
function toggleClarify(key) {
  const map = new Map(decisions.value)
  const prev = map.get(key) || { status: null, comment: '' }
  if (prev.status === 'clarify') {
    map.set(key, { status: null, comment: '' })
  } else {
    map.set(key, { status: 'clarify', comment: prev.comment || '' })
  }
  decisions.value = map
}

function isClarify(key) {
  return decisions.value.get(key)?.status === 'clarify'
}

const projectSlug = computed(() => {
  const name = projectData.value?.name || projectData.value?.short_name || ''
  if (!name) return null
  try {
    return translitSlugify(name).toLowerCase()
  } catch {
    return null
  }
})

const breadcrumbItems = computed(() => ([
  { label: 'Главная', to: '/crm/project-ed/main', icon: Home },
  { label: 'Проекты на утверждении', to: '/crm/project-ed/projects-on-apply', icon: List },
  { label: projectTitleBreadcrumb.value, to: projectSlug.value ? `/crm/project-ed/project/${projectSlug.value}` : undefined, icon: FileText },
  { label: 'Экспертная оценка', icon: CheckCircle }
]))

// Данные блока и мероприятия (нормализация возможных полей)
const eventObj = computed(() => {
  const p = projectData.value || {}
  return p.event || p.event_data || p.selected_event || null
})

const blockObj = computed(() => {
  const p = projectData.value || {}
  return p.event_block || p.event_block_data || eventObj.value?.block || null
})

// Локально загружаемые по id
const fetchedEvent = ref(null)
const fetchedBlock = ref(null)

const eventId = computed(() => {
  const p = projectData.value || {}
  return p.event_id || p.event?.id || p.event || null
})

const blockId = computed(() => {
  const p = projectData.value || {}
  return p.event_block_id || p.event_block?.id || p.event_block || eventObj.value?.blockId || eventObj.value?.block_id || null
})

async function loadEventIfNeeded() {
  if (eventObj.value) {
    fetchedEvent.value = null
    return
  }
  const id = Number(eventId.value)
  if (!id || Number.isNaN(id)) return
  try {
    const { data } = await apiClient.get(endpoints.project_ed.events.detail(id))
    fetchedEvent.value = data || null
  } catch {
    fetchedEvent.value = null
  }
}

async function loadBlockIfNeeded() {
  if (blockObj.value) {
    fetchedBlock.value = null
    return
  }
  const id = Number(blockId.value)
  if (!id || Number.isNaN(id)) return
  try {
    const { data } = await apiClient.get(endpoints.project_ed.event_blocks.detail(id))
    fetchedBlock.value = data || null
  } catch {
    fetchedBlock.value = null
  }
}

// Загружаем при появлении projectData и при смене id
watch(projectData, async () => {
  await Promise.allSettled([loadEventIfNeeded(), loadBlockIfNeeded()])
})
watch(eventId, loadEventIfNeeded)
watch(blockId, loadBlockIfNeeded)

const blockCode = computed(() => (blockObj.value?.code || blockObj.value?.short_code || fetchedBlock.value?.code || fetchedBlock.value?.short_code || ''))
const blockTitle = computed(() => (blockObj.value?.title || blockObj.value?.name || fetchedBlock.value?.title || fetchedBlock.value?.name || ''))
const eventCode = computed(() => (eventObj.value?.code || fetchedEvent.value?.code || ''))
const eventTitle = computed(() => (eventObj.value?.name || eventObj.value?.title || fetchedEvent.value?.name || fetchedEvent.value?.title || ''))

// Индикаторы: подгружаем названия, связанные с блоком мероприятий
const indicatorsById = ref(new Map())

async function ensureIndicatorsLoadedForBlock() {
  // Определяем актуальный blockId
  const id = Number(blockId.value)
  if (!id || Number.isNaN(id)) return
  try {
    const { data } = await apiClient.get(endpoints.project_ed.event_blocks.indicators(id))
    const list = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : [])
    // Ожидаем, что элементы имеют id и name
    const map = new Map(indicatorsById.value)
    for (const it of list) {
      if (it && (it.id || it.indicator_id)) {
        const key = it.id || it.indicator_id
        const name = it.name || it.title || it.indicator_name || ''
        const numKey = Number(key)
        if (Number.isFinite(numKey)) {
          map.set(numKey, name)
          // также сохраним строковый эквивалент (на случай, если в данных проекта хранится строка)
          map.set(String(numKey), name)
        } else {
          map.set(String(key), name)
        }
      }
    }
    indicatorsById.value = map
  } catch {
    // игнорируем
  }
}

watch(blockId, ensureIndicatorsLoadedForBlock)
watch(projectData, ensureIndicatorsLoadedForBlock)

function getIndicatorName(ti) {
  // Порядок приоритетов: локальные поля -> связанные объекты -> кэш из блока
  if (!ti) return '—'
  const direct = ti.name || ti.title
  if (direct) return direct
  const nested = ti.indicator || ti.indicator_data
  if (nested && (nested.name || nested.title)) return nested.name || nested.title
  // Возможные варианты хранения ссылки на базовый показатель
  const candidates = [
    ti.source_indicator,
    ti.source_indicator_id,
    ti.indicator_id,
    ti.id,
    // иногда name содержит числовой id как строку
    (typeof ti.name === 'string' && /^\d+$/.test(ti.name) ? Number(ti.name) : null),
  ].filter(v => v != null)

  for (const c of candidates) {
    const keyNum = Number(c)
    const keyStr = String(c)
    const cached = indicatorsById.value.get(Number.isFinite(keyNum) ? keyNum : keyStr)
    if (cached) return cached
  }
  return '—'
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(num)
}

function formatDateLong(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const monthIndex = date.getMonth()
  const year = date.getFullYear()
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ]
  const month = months[monthIndex] || ''
  return `${day} ${month} ${year} год`
}

function translateBudgetTerms(text) {
  if (!text) return text
  const translations = {
    salary: 'Заработная плата',
    other: 'Другие расходы',
    budget: 'Бюджетные источники финансирования',
    nonbudget: 'Внебюджетные источники финансирования'
  }
  const source = String(text)
  const lowered = source.toLowerCase().trim()
  for (const [key, value] of Object.entries(translations)) {
    if (lowered === key) return value
  }
  let result = source
  for (const [key, value] of Object.entries(translations)) {
    if (lowered.includes(key)) {
      result = result.replace(new RegExp(key, 'gi'), value)
    }
  }
  return result
}

function userName(user) {
  if (!user) return ''
  const first = (user.first_name || '').trim()
  const last = (user.last_name || '').trim()
  const full = `${first} ${last}`.trim()
  return full || user.username || ''
}

function getManagerName() {
  if (!projectData.value?.manager_data) return ''
  const manager = projectData.value.manager_data
  const first = (manager.first_name || '').trim()
  const last = (manager.last_name || '').trim()
  const middle = (manager.middle_name || '').trim()
  const parts = [last, first, middle].filter(Boolean)
  const full = parts.join(' ')
  return full || manager.username || ''
}

function getCuratorName() {
  if (!projectData.value?.curator_data) return ''
  const curator = projectData.value.curator_data
  const first = (curator.first_name || '').trim()
  const last = (curator.last_name || '').trim()
  const middle = (curator.middle_name || '').trim()
  const parts = [last, first, middle].filter(Boolean)
  const full = parts.join(' ')
  return full || curator.username || ''
}

function getCustomerName() {
  if (!projectData.value?.customer_data) return ''
  const customer = projectData.value.customer_data
  const first = (customer.first_name || '').trim()
  const last = (customer.last_name || '').trim()
  const middle = (customer.middle_name || '').trim()
  const parts = [last, first, middle].filter(Boolean)
  const full = parts.join(' ')
  return full || customer.username || ''
}

function getExecutorsNames() {
  if (!projectData.value?.performers || !Array.isArray(projectData.value.performers)) return ''
  return projectData.value.performers
    .map(performer => performer.full_name || performer.username || `ID: ${performer.id}`)
    .join(', ')
}

// Методы для управления тултипами
function showTooltip(event, userData) {
  // Отменяем таймер скрытия, если он был установлен
  if (tooltipHideTimeout) {
    clearTimeout(tooltipHideTimeout)
    tooltipHideTimeout = null
  }
  
  tooltipTarget.value = event.target
  tooltipData.value = userData
  tooltipVisible.value = true
}

function hideTooltip() {
  // Устанавливаем задержку перед скрытием тултипа
  tooltipHideTimeout = setTimeout(() => {
    tooltipVisible.value = false
    tooltipTarget.value = null
    tooltipData.value = null
    tooltipHideTimeout = null
  }, 300) // 300мс задержка
}

function cancelHideTooltip() {
  // Отменяем скрытие тултипа при наведении на сам тултип
  if (tooltipHideTimeout) {
    clearTimeout(tooltipHideTimeout)
    tooltipHideTimeout = null
  }
}

function openProfile(userId) {
  if (!userId) return
  router.push(`/crm/project-ed/profile/${userId}`)
}

function stageName(stageId) {
  if (!stageId || !projectData.value?.stages) return '—'
  const st = projectData.value.stages.find(s => s.id === stageId)
  return st?.name || `Этап #${stageId}`
}

async function loadProjectBySlug(slug) {
  // Найдём проект по слагу через список доступных пользователю проектов
  const resp = await apiClient.get(endpoints.project_ed.projects.list)
  const list = Array.isArray(resp.data) ? resp.data : (resp.data?.results || [])
  const match = list.find((p) => {
    const name = p?.name || p?.short_name || ''
    return translitSlugify(name).toLowerCase() === slug
  })
  if (!match) return null

  try {
    const { data } = await apiClient.get(endpoints.project_ed.projects.detail(match.id))
    return data
  } catch (error) {
    // fallback: public_view для чужих проектов
    const { data } = await apiClient.get(endpoints.project_ed.projects.publicView(match.id))
    return data
  }
}

onMounted(async () => {
  try {
    const raw = route.params?.slug || ''
    const slug = decodeURIComponent(String(raw)).toLowerCase()
    const qsId = route.query?.id ? String(route.query.id) : null
    if (!slug && !qsId) return

    let data = null
    if (qsId) {
      // Сначала пробуем по id (детальная/публичная)
      try {
        const resp = await apiClient.get(endpoints.project_ed.projects.detail(qsId))
        data = resp.data
      } catch {
        const resp = await apiClient.get(endpoints.project_ed.projects.publicView(qsId))
        data = resp.data
      }
    }
    if (!data && slug) {
      data = await loadProjectBySlug(slug)
    }
    projectData.value = data
    if (data?.name || data?.short_name) {
      pageTitle.value = `Ревью: ${data.name || data.short_name}`
    }
    if (data) {
      const crumbBase = data.short_name || data.name || 'Проект'
      const clarification = data.name_clarification ? ` ${data.name_clarification}` : ''
      projectTitleBreadcrumb.value = `${crumbBase}${clarification}`
    }

    // Проверка прав: администратор или эксперт из текущего ревью
    try {
      if (!userStore.isInitialized) {
        try { await userStore.initializeUser() } catch { /* ignore */ }
      }
      const uid = userStore.user?.id
      if (uid) {
        // Роль пользователя
        try {
          const resp = await apiClient.get(`/project_ed/profiles/profiles/${uid}/`)
          const d = resp.data || {}
          const roleName = d.role_name || d.profile?.role_name
          isAdmin.value = roleName === 'Администратор'
          isExpertGroup.value = roleName === 'Экспертная группа'
        } catch {
          isAdmin.value = false
          isExpertGroup.value = false
        }

        // Назначен как эксперт конкретного ревью
        try {
          const experts = projectData.value?.current_review?.assigned_experts || []
          isAssignedExpert.value = experts.some(e => e?.expert === uid || e?.user_id === uid)
        } catch {
          isAssignedExpert.value = false
        }
      }
    } catch { /* ignore */ }

    // Если доступ запрещен — перенаправляем на карточку проекта
    if (!isAllowed.value && projectSlug.value) {
      router.replace(`/crm/project-ed/project/${projectSlug.value}`)
      return
    }
    accessChecked.value = true
  } catch (e) {
    console.error('Не удалось загрузить проект для ревью:', e)
  } finally {
    isLoading.value = false
  }
})

// Очистка таймера при размонтировании компонента
onBeforeUnmount(() => {
  if (tooltipHideTimeout) {
    clearTimeout(tooltipHideTimeout)
    tooltipHideTimeout = null
  }
})
</script>

<style scoped lang="scss">
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #6a737d;
}

.field {
  .field-label {
    color: var(--color-secondary-text);
    margin-right: 0.25rem;
  }
  .field-value {
    color: var(--color-primary-text);
    font-weight: 500;
  }
}

.table {
  th, td { white-space: nowrap; }
}
.indicators-table th.name-col,
.indicators-table td.indicator-name-cell {
  max-width: 420px;
  white-space: normal; /* разрешаем перенос строк для названий */
  word-break: break-word;
}


@media (max-width: 768px) {
  .table { font-size: 0.875rem; }
}

.user-link {
  color: var(--bs-primary);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.user-link:hover {
  color: var(--bs-primary);
  text-decoration: underline;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.participants-list .field {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 1.5rem;
  flex-wrap: wrap; /* разрешаем перенос элементов на новую строку */
}

.participants-list .field-label {
  min-width: 120px;
  flex-shrink: 0;
  margin-right: 1rem;
  color: var(--color-secondary-text);
  font-weight: 500;
}

.participants-list .field-value {
  flex: 1;
  color: var(--color-primary-text);
}

.decision-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.75rem;
}

.decision-inline .btn.active {
  box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.25);
}

.decision-comment textarea {
  resize: vertical;
}

/* В участниках переносим поле комментария на новую строку */
.participants-list .decision-comment {
  flex-basis: 100%;
  width: 100%;
  margin-top: 0.5rem;
}

/* Стили для блочных карточек этапов */
.stage-card {
  background: var(--color-primary-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}
.stage-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-secondary-background);
}
.stage-body {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* как у .participants-list */
}
.stage-row {
  display: flex;
  align-items: center; /* как у участников */
  gap: 0.5rem;
  flex-wrap: wrap;
  min-height: 1.5rem; /* как у участников */
}
.stage-header .stage-title strong {
  color: var(--color-primary-text);
}
.stage-index {
  background: var(--bs-primary);
  color: #fff;
}
.stage-badge {
  background: var(--bs-light);
  color: var(--color-primary-text);
  display: inline-flex;
  align-items: center;
}
.stage-label {
  min-width: 110px;
  color: var(--color-secondary-text);
  font-weight: 500;
  line-height: 1.5;
}
.stage-value {
  flex: 1;
  color: var(--color-primary-text);
  line-height: 1.5; /* выравниваем межстрочный интервал */
}
.stage-actions {
  flex-basis: auto;
  margin-left: 0.5rem;
}
.stage-row .decision-comment {
  flex-basis: 100%;
  width: 100%;
  margin-top: 0.5rem;
}

/* Делаем поля этапа такими же, как у участников */
.stage-body .field {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 1.5rem;
  flex-wrap: wrap;
}
.stage-body .field-label {
  min-width: 120px;
  flex-shrink: 0;
  margin-right: 1rem;
  color: var(--color-secondary-text);
  font-weight: 500;
}
.stage-body .field-value {
  flex: 1;
  color: var(--color-primary-text);
}
.stage-body .decision-comment {
  flex-basis: 100%;
  width: 100%;
  margin-top: 0.5rem;
}

/* Компактный список задач */
.tasks-list {
  list-style: disc; /* обычные маркеры */
  margin: 0;
  padding-left: 1.25rem; /* небольшой отступ слева */
}
.tasks-list > li,
.tasks-list > .task-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}
.task-text {
  display: inline; /* не переносим текст на новую строку после маркера */
}
.tasks-list > li:last-child,
.tasks-list > .task-item:last-child {
  border-bottom: none;
}
</style>