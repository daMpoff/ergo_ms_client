<template>
      <!-- Название и текст -->
      <div class="mb-4">
        <label class="form-label fw-bold">Название</label>
        <input v-model="selectedComponent.name" type="text" class="form-control" />
      </div>
      <div class="mb-4">
        <label class="form-label fw-bold">Текст</label>
        <input v-model="selectedComponent.extra_data.text" type="text" class="form-control" />
      </div>

      <div class="accordion" id="settingsAccordion">
        <!-- Визуальные -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingVisual">
            <button class="accordion-button bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#collapseVisual" aria-expanded="true" aria-controls="collapseVisual">
              🎨 Визуальные настройки
            </button>
          </h2>
          <div id="collapseVisual" class="accordion-collapse collapse show" aria-labelledby="headingVisual">
            <div class="accordion-body">
              <!-- Размер текста -->
              <div class="mb-3">
                <label class="form-label">Размер текста</label>
                <div class="btn-group flex-wrap">
                  <button
                    v-for="size in fontSizes"
                    :key="size"
                    type="button"
                    class="btn btn-outline-primary m-1"
                    :class="{ active: selectedComponent.bootstrap_classes.includes(size) }"
                    @click="toggleClass(size, fontSizes)"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>

              <!-- Цвет фона -->
              <div class="mb-3">
                <label class="form-label">Цвет фона</label>
                <div class="btn-group flex-wrap">
                  <button
                    v-for="color in bgColors"
                    :key="color"
                    type="button"
                    class="btn m-1"
                    :class="['btn-' + color, { active: selectedComponent.bootstrap_classes.includes('bg-' + color) }]"
                    @click="toggleClass('bg-' + color, bgColors.map(c => 'bg-' + c))"
                  >
                    {{ color }}
                  </button>
                </div>
              </div>

              <!-- Цвет текста -->
              <div class="mb-3">
                <label class="form-label">Цвет текста</label>
                <div class="btn-group flex-wrap">
                  <button
                    v-for="color in textColors"
                    :key="color"
                    type="button"
                    class="btn m-1"
                    :class="['btn-outline-' + color, { active: selectedComponent.bootstrap_classes.includes('text-' + color) }]"
                    @click="toggleClass('text-' + color, textColors.map(c => 'text-' + c))"
                  >
                    {{ color }}
                  </button>
                </div>
              </div>

              <!-- Выравнивание -->
              <div class="mb-3">
                <label class="form-label">Выравнивание</label>
                <select v-model="selectedComponent.extra_data.align" class="form-select">
                  <option value="">По умолчанию</option>
                  <option value="text-start">Слева</option>
                  <option value="text-center">По центру</option>
                  <option value="text-end">Справа</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Отступы -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingPadding">
            <button class="accordion-button collapsed bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePadding" aria-expanded="false" aria-controls="collapsePadding">
              📏 Внутренние отступы (Padding)
            </button>
          </h2>
          <div id="collapsePadding" class="accordion-collapse collapse" aria-labelledby="headingPadding">
            <div class="accordion-body">
              <div v-for="prefix in paddingKeys" :key="prefix" class="mb-3">
                <label class="form-label">{{ spacingPrefixes[prefix] }}</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  v-model="spacingValues[prefix]"
                  @input="applySpacing(prefix, spacingValues[prefix])"
                  class="form-range"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header" id="headingMargin">
            <button class="accordion-button collapsed bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#collapseMargin" aria-expanded="false" aria-controls="collapseMargin">
              📐 Внешние отступы (Margin)
            </button>
          </h2>
          <div id="collapseMargin" class="accordion-collapse collapse" aria-labelledby="headingMargin">
            <div class="accordion-body">
              <div v-for="prefix in marginKeys" :key="prefix" class="mb-3">
                <label class="form-label">{{ spacingPrefixes[prefix] }}</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  v-model="spacingValues[prefix]"
                  @input="applySpacing(prefix, spacingValues[prefix])"
                  class="form-range"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Прочее -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingExtra">
            <button class="accordion-button collapsed bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExtra" aria-expanded="false" aria-controls="collapseExtra">
              ⚙️ Прочее
            </button>
          </h2>
          <div id="collapseExtra" class="accordion-collapse collapse" aria-labelledby="headingExtra">
            <div class="accordion-body">
              <div class="form-check mb-3">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="toggleVisibility"
                  :checked="selectedComponent.bootstrap_classes.includes('d-none')"
                  @change="toggleVisibility"
                />
                <label class="form-check-label" for="toggleVisibility">
                  Скрыть компонент (d-none)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Предпросмотр классов элемента -->
      <div class="alert alert-secondary mt-4">
        <code>{{ selectedComponent.bootstrap_classes }}</code>
      </div>

      <!-- Кнопка сброса -->
<button
  type="button"
  class="btn btn-outline-danger w-100 mt-2"
  @click="resetSettings"
>
  🔄Сбросить настройки
</button>
</template>

<script setup>
import { ref, watch } from 'vue'
import { selectedComponent } from '../shortcodeStore'

const fontSizes = ['fs-1', 'fs-2', 'fs-3', 'fs-4', 'fs-5']
const bgColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']
const textColors = ['dark', 'light', 'primary', 'secondary', 'success', 'danger', 'warning', 'info']

const spacingPrefixes = {
  'px': 'Горизонтальные внутренние отступы (px)',
  'py': 'Вертикальные внутренние отступы (py)',
  'pt': 'Верхний внутренний отступ (pt)',
  'pb': 'Нижний внутренний отступ (pb)',
  'ps': 'Левый внутренний отступ (ps)',
  'pe': 'Правый внутренний отступ (pe)',
  'mx': 'Горизонтальные внешние отступы (mx)',
  'mb': 'Нижний внешний отступ (mb)',
  'mt': 'Верхний внешний отступ (mt)',
  'me': 'Правый внешний отступ (me)',
  'ms': 'Левый внешний отступ (ms)'
}

const paddingKeys = ['px', 'py', 'pt', 'pb', 'ps', 'pe']
const marginKeys = ['mx', 'mb', 'mt', 'me', 'ms']

const spacingValues = ref({})

watch(selectedComponent, (val) => {
  if (val?.bootstrap_classes) {
    for (const prefix in spacingPrefixes) {
      spacingValues.value[prefix] = extractSpacing(prefix, val.bootstrap_classes)
    }
    if (!val.extra_data) val.extra_data = {}
  }
}, { immediate: true })

function toggleClass(targetClass, classGroup) {
  if (!selectedComponent.value) return
  const current = selectedComponent.value.bootstrap_classes
    .split(' ')
    .filter(cls => !classGroup.includes(cls))
  selectedComponent.value.bootstrap_classes = [...current, targetClass].join(' ')
}

function applySpacing(prefix, value) {
  const group = Array.from({ length: 6 }, (_, i) => `${prefix}-${i}`)
  toggleClass(`${prefix}-${value}`, group)
}

function extractSpacing(prefix, classString) {
  const match = classString.match(new RegExp(`${prefix}-(\\d)`))
  return match ? Number(match[1]) : 3
}

function toggleVisibility(event) {
  if (!selectedComponent.value) return
  const cls = selectedComponent.value.bootstrap_classes
  if (event.target.checked && !cls.includes('d-none')) {
    selectedComponent.value.bootstrap_classes += ' d-none'
  } else if (!event.target.checked && cls.includes('d-none')) {
    selectedComponent.value.bootstrap_classes = cls.replace('d-none', '').trim()
  }
}

function resetSettings() {
  if (!selectedComponent.value) return

  /* 1. Откатываем базовые классы */
  selectedComponent.value.bootstrap_classes = ''

  /* 2. обнуляем/ставим дефолт для слайдеров отступов */
  const defaults = {}
  for (const prefix of [...paddingKeys, ...marginKeys]) {
    defaults[prefix] = 0
  }
  spacingValues.value = defaults
}

</script>
