<template>
    <ModalCenter :title="'Добавление параметра'" :modal-id="modalId">
        <form @submit.prevent="onAdd">
            <div class="form-grid">
                <div class="mb-3">
                    <div class="form-label-container">
                        <label class="form-label">Название</label>
                        <HelpTooltip :size="18">
                            <div class="tooltip-title">Ограничения на имя параметра:</div>
                            <ul class="tooltip-list">
                                <li>Допускаются только латинские буквы (A–Z, a–z), цифры, знак тире "-" и нижнее подчёркивание "_".</li>
                                <li>Длина имени не должна превышать 36 символов.</li>
                                <li>Имя не должно начинаться с символа нижнего подчёркивания: <code>_name</code>.</li>
                                <li>Зарезервированные имена, которые нельзя использовать: <code>tab</code>, <code>state</code>, <code>mode</code>, <code>focus</code>, <code>grid</code>, <code>tz</code>, <code>from</code>, <code>to</code>.</li>
                            </ul>
                        </HelpTooltip>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <input v-model="name" type="text" class="form-control" placeholder="" />
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Тип</label>
                    <DataTypeCombobox v-model="type" />
                </div>

                <div class="mb-3">
                    <label class="form-label">Значение по умолчанию</label>
                    <template v-if="type === 'boolean'">
                        <div class="d-flex align-items-center gap-3">
                            <div class="form-check form-check-inline m-0">
                                <input class="form-check-input" type="radio" name="defaultBool"
                                       :value="true" v-model="defaultValue" id="defaultBoolTrue">
                                <label class="form-check-label" for="defaultBoolTrue">True</label>
                            </div>
                            <div class="form-check form-check-inline m-0">
                                <input class="form-check-input" type="radio" name="defaultBool"
                                       :value="false" v-model="defaultValue" id="defaultBoolFalse">
                                <label class="form-check-label" for="defaultBoolFalse">False</label>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <input
                            v-model="defaultValue"
                            :type="inputType"
                            class="form-control"
                            placeholder=""
                        />
                    </template>
                </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Отмена</button>
                <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Добавить</button>
            </div>
        </form>
    </ModalCenter>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ModalCenter from '@/components/ModalCenter.vue'
import { HelpCircle } from 'lucide-vue-next'
import DataTypeCombobox from '@/modules/bi/components/combobox_datetype.vue'
import HelpTooltip from '@/modules/bi/components/help_tooltip.vue'

const props = defineProps({
    modalId: { type: String, default: 'paramsAddModal' },
})

const emit = defineEmits(['submit'])

const name = ref('')
const type = ref('string')
const defaultValue = ref('')


const inputType = computed(() => {
    if (type.value === 'integer' || type.value === 'float') return 'number'
    if (type.value === 'date') return 'date'
    if (type.value === 'datetime') return 'datetime-local'
    return 'text'
})

function onAdd() {
    emit('submit', {
        name: name.value,
        type: type.value,
        default: defaultValue.value,
    })
}

watch(type, (newType) => {
    if (newType === 'boolean') {
        defaultValue.value = null
    } else {
        defaultValue.value = ''
    }
})
</script>

<style scoped lang="scss">
.form-grid{
    display: grid;
    grid-template-columns: 1fr;
}

.form-label-container{
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0 0 8px 0;
}

.form-label-container .form-label{
    margin: 0;
    line-height: 1.2;
    display: inline-flex;
    align-items: center;
}

.form-label-container .lucide{
    display: flex;
    justify-content: center;
    align-items: center;
}


.select-icon{
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.lucide{
    vertical-align: middle;
}

.tooltip-title{
    font-weight: 600;
    margin-bottom: 6px;
}

.tooltip-list{
    margin: 0;
    padding-left: 18px;
}

.tooltip-list li{
    margin: 4px 0;
}
</style>

