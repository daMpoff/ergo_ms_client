<template>
    <div class="additional-info">
        <div class="step-header">
            <h2 class="step-title">Дополнительная информация</h2>
            <p class="step-description">
                Укажите дополнительную информацию о рисках, ресурсах и примечаниях
            </p>
        </div>

        <div class="form-content">
            <form class="info-form">
                <!-- Риски проекта -->
                <div class="form-section">
                    <h3 class="section-title">
                        <AlertTriangle class="section-icon" :size="20" />
                        Риски проекта
                    </h3>
                    
                    <div class="form-group">
                        <label for="risks" class="form-label">
                            Потенциальные риски и способы их минимизации
                        </label>
                        <textarea
                            id="risks"
                            v-model="localInfo.risks"
                            class="form-textarea"
                            rows="4"
                            placeholder="Опишите основные риски проекта и меры по их предотвращению или снижению"
                        ></textarea>
                        <div class="form-help">
                            Укажите возможные проблемы, которые могут повлиять на выполнение проекта
                        </div>
                    </div>
                </div>

                <!-- Ресурсы -->
                <div class="form-section">
                    <h3 class="section-title">
                        <Users class="section-icon" :size="20" />
                        Ресурсы проекта
                    </h3>
                    
                    <div class="form-group">
                        <label for="resources" class="form-label">
                            Необходимые ресурсы
                        </label>
                        <textarea
                            id="resources"
                            v-model="localInfo.resources"
                            class="form-textarea"
                            rows="4"
                            placeholder="Опишите необходимые человеческие, материальные и технические ресурсы"
                        ></textarea>
                        <div class="form-help">
                            Укажите все ресурсы, необходимые для успешного выполнения проекта
                        </div>
                    </div>
                </div>

                <!-- Дополнительные примечания -->
                <div class="form-section">
                    <h3 class="section-title">
                        <FileText class="section-icon" :size="20" />
                        Дополнительные примечания
                    </h3>
                    
                    <div class="form-group">
                        <label for="notes" class="form-label">
                            Примечания и комментарии
                        </label>
                        <textarea
                            id="notes"
                            v-model="localInfo.notes"
                            class="form-textarea"
                            rows="4"
                            placeholder="Любая дополнительная информация, которая может быть полезна для понимания проекта"
                        ></textarea>
                        <div class="form-help">
                            Добавьте любую дополнительную информацию, которая может быть важна для проекта
                        </div>
                    </div>
                </div>

                <!-- Контактная информация -->
                <div class="form-section">
                    <h3 class="section-title">
                        <Phone class="section-icon" :size="20" />
                        Контактная информация
                    </h3>
                    
                    <div class="contact-grid">
                        <div class="form-group">
                            <label for="projectManager" class="form-label">
                                Руководитель проекта
                            </label>
                            <input
                                id="projectManager"
                                v-model="localInfo.projectManager"
                                type="text"
                                class="form-input"
                                placeholder="ФИО руководителя проекта"
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="contactEmail" class="form-label">
                                Email для связи
                            </label>
                            <input
                                id="contactEmail"
                                v-model="localInfo.contactEmail"
                                type="email"
                                class="form-input"
                                placeholder="email@example.com"
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="contactPhone" class="form-label">
                                Телефон для связи
                            </label>
                            <input
                                id="contactPhone"
                                v-model="localInfo.contactPhone"
                                type="tel"
                                class="form-input"
                                placeholder="+7 (XXX) XXX-XX-XX"
                            />
                        </div>
                    </div>
                </div>

                <!-- Дополнительные файлы -->
                <div class="form-section">
                    <h3 class="section-title">
                        <Paperclip class="section-icon" :size="20" />
                        Дополнительные файлы
                    </h3>
                    
                    <div class="file-upload">
                        <div class="upload-area">
                            <Upload class="upload-icon" :size="32" />
                            <h4>Загрузить файлы</h4>
                            <p>Перетащите файлы сюда или нажмите для выбора</p>
                            <input
                                ref="fileInput"
                                type="file"
                                multiple
                                class="file-input"
                                @change="handleFileUpload"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                            />
                        </div>
                        
                        <div v-if="localInfo.files.length > 0" class="files-list">
                            <h5>Загруженные файлы:</h5>
                            <div class="file-item" v-for="(file, index) in localInfo.files" :key="index">
                                <File class="file-icon" :size="16" />
                                <span class="file-name">{{ file.name }}</span>
                                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                                <button
                                    type="button"
                                    class="btn-remove-file"
                                    @click="removeFile(index)"
                                >
                                    <X class="icon" :size="14" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>

    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { 
    AlertTriangle, 
    Users, 
    FileText, 
    Phone, 
    Paperclip, 
    Upload, 
    File, 
    X
} from 'lucide-vue-next'

const props = defineProps({
    info: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:info'])

// Локальные данные
const localInfo = ref({
    risks: props.info.risks || '',
    resources: props.info.resources || '',
    notes: props.info.notes || '',
    projectManager: props.info.projectManager || '',
    contactEmail: props.info.contactEmail || '',
    contactPhone: props.info.contactPhone || '',
    files: [...(props.info.files || [])]
})

const fileInput = ref(null)

// Методы
const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    files.forEach(file => {
        if (!localInfo.value.files.find(f => f.name === file.name)) {
            localInfo.value.files.push(file)
        }
    })
    // Очищаем input для возможности повторной загрузки того же файла
    event.target.value = ''
}

const removeFile = (index) => {
    localInfo.value.files.splice(index, 1)
}

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}


// Следим за изменениями и обновляем родительский компонент
watch(localInfo, (newValue) => {
    emit('update:info', newValue)
}, { deep: true })
</script>

<style scoped lang="scss">
.additional-info {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.step-header {
    text-align: center;
    margin-bottom: 1rem;
}

.step-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.5rem 0;
}

.step-description {
    color: #6c757d;
    margin: 0;
}

.form-content {
    flex: 1;
}

.info-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #dee2e6;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 1.5rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #0d6efd;
}

.section-icon {
    color: #0d6efd;
    flex-shrink: 0;
}

.form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.5rem;

    &:last-child {
        margin-bottom: 0;
    }
}

.form-label {
    font-weight: 500;
    color: #212529;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
}

.form-input,
.form-textarea {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
        outline: none;
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }

    &::placeholder {
        color: #6c757d;
    }
}

.form-textarea {
    resize: vertical;
    min-height: 100px;
}

.form-help {
    font-size: 0.75rem;
    color: #6c757d;
    margin-top: 0.25rem;
}

.contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.file-upload {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.upload-area {
    position: relative;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #0d6efd;
        background: #f8f9ff;
    }

    .upload-icon {
        color: #6c757d;
        margin-bottom: 1rem;
    }

    h4 {
        margin: 0 0 0.5rem 0;
        color: #212529;
        font-size: 1rem;
    }

    p {
        margin: 0;
        color: #6c757d;
        font-size: 0.875rem;
    }
}

.file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

.files-list {
    h5 {
        margin: 0 0 1rem 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #212529;
    }
}

.file-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    margin-bottom: 0.5rem;

    &:last-child {
        margin-bottom: 0;
    }
}

.file-icon {
    color: #6c757d;
    flex-shrink: 0;
}

.file-name {
    flex: 1;
    font-size: 0.875rem;
    color: #212529;
    font-weight: 500;
}

.file-size {
    font-size: 0.75rem;
    color: #6c757d;
}

.btn-remove-file {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background: #c82333;
    }

    .icon {
        flex-shrink: 0;
    }
}


// Адаптивность
@media (max-width: 768px) {
}
</style>
