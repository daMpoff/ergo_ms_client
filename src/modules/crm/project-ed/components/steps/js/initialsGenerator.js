/**
 * Утилита для генерации инициалов из полного имени
 * Формат: "Фамилия Имя. Отчество."
 * 
 * Примеры:
 * "Иванов Александр Александрович" -> "Иванов А.А." (одинаковые имена)
 * "Петров Петр Петрович" -> "Петров П.П." (все одинаковые)
 * "Сидоров Сергей Сергеевич" -> "Сидоров С.С." (все одинаковые)
 * "Козлов Константин Константинович" -> "Козлов К.К." (все одинаковые)
 * "Морозов Михаил Иванович" -> "Морозов М.И." (разные имена)
 * "Волков Владимир Владимирович" -> "Волков В.В." (все одинаковые)
 */

/**
 * Генерирует инициалы из полного имени
 * @param {string} fullName - Полное имя в формате "Фамилия Имя Отчество" или "Имя Фамилия"
 * @returns {string} - Инициалы в формате "Фамилия И.О."
 */
export const generateInitials = (fullName) => {
    if (!fullName || fullName === 'Гость') return 'Иванов И.А.'
    
    const nameParts = fullName.trim().split(' ').filter(part => part.length > 0)
    if (nameParts.length < 2) return 'Иванов И.А.'
    
    // Определяем, где фамилия - обычно это первое слово, но может быть и последнее
    // Для русских имен обычно: Фамилия Имя Отчество
    // Для западных имен обычно: Имя Фамилия
    let lastName, firstName, middleName
    
    if (nameParts.length === 2) {
        // Только имя и фамилия
        firstName = nameParts[0]
        lastName = nameParts[1]
        middleName = ''
    } else if (nameParts.length >= 3) {
        // Фамилия Имя Отчество (русский формат)
        lastName = nameParts[0]
        firstName = nameParts[1]
        middleName = nameParts[2]
    }
    
    // Начинаем с фамилии
    let initials = lastName + ' '
    
    // Генерируем инициалы для имени
    if (firstName) {
        let nameInitials = firstName.charAt(0).toUpperCase()
        
        // Проверяем совпадения с отчеством
        if (middleName) {
            let matchCount = 0
            
            // Считаем количество совпадающих букв
            for (let i = 0; i < Math.min(firstName.length, middleName.length); i++) {
                if (firstName.charAt(i).toUpperCase() === middleName.charAt(i).toUpperCase()) {
                    matchCount++
                } else {
                    break
                }
            }
            
            // Добавляем дополнительные буквы в зависимости от количества совпадений
            for (let i = 1; i <= matchCount && i < firstName.length; i++) {
                nameInitials += firstName.charAt(i).toUpperCase()
            }
        }
        
        initials += nameInitials + '.'
    }
    
    // Генерируем инициалы для отчества
    if (middleName) {
        let middleInitials = middleName.charAt(0).toUpperCase()
        
        // Проверяем совпадения с именем
        if (firstName) {
            let matchCount = 0
            
            // Считаем количество совпадающих букв
            for (let i = 0; i < Math.min(firstName.length, middleName.length); i++) {
                if (firstName.charAt(i).toUpperCase() === middleName.charAt(i).toUpperCase()) {
                    matchCount++
                } else {
                    break
                }
            }
            
            // Добавляем дополнительные буквы в зависимости от количества совпадений
            for (let i = 1; i <= matchCount && i < middleName.length; i++) {
                middleInitials += middleName.charAt(i).toUpperCase()
            }
        }
        
        initials += ' ' + middleInitials + '.'
    }
    
    return initials
}

/**
 * Генерирует наименование проекта в формате: КодМероприятия-Год-Инициалы-Наименование
 * @param {Object} selectedEvent - Выбранное мероприятие
 * @param {Object} userInfo - Информация о пользователе (может быть computed из userStore)
 * @returns {string} - Сгенерированное наименование проекта
 */
export const generateProjectName = (selectedEvent, userInfo) => {
    if (!selectedEvent) {
        return ''
    }
    
    const currentYear = new Date().getFullYear()
    const eventCode = selectedEvent.code || ''
    const eventTitle = selectedEvent.title || ''
    
    // Генерируем инициалы из полного имени
    let userInitials = 'И.А.' // Значение по умолчанию
    
    if (userInfo) {
        if (userInfo.initials) {
            userInitials = userInfo.initials
        } else if (userInfo.name) {
            userInitials = generateInitials(userInfo.name)
        }
    }
    
    return `${eventCode}-${currentYear}-${userInitials}-${eventTitle}`
}

/**
 * Валидирует полное имя
 * @param {string} fullName - Полное имя для валидации
 * @returns {boolean} - true если имя валидно
 */
export const validateFullName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return false
    
    const nameParts = fullName.trim().split(' ').filter(part => part.length > 0)
    return nameParts.length >= 2 && nameParts.every(part => part.length > 0)
}

/**
 * Генерирует краткое наименование проекта в формате: КодМероприятия-Год-Инициалы
 * @param {Object} selectedEvent - Выбранное мероприятие
 * @param {Object} userInfo - Информация о пользователе (может быть computed из userStore)
 * @returns {string} - Сгенерированное краткое наименование проекта
 */
export const generateShortProjectName = (selectedEvent, userInfo) => {
    if (!selectedEvent) {
        return ''
    }
    
    const currentYear = new Date().getFullYear()
    const eventCode = selectedEvent.code || ''
    
    // Генерируем инициалы из полного имени
    let userInitials = 'И.А.' // Значение по умолчанию
    
    if (userInfo) {
        if (userInfo.initials) {
            userInitials = userInfo.initials
        } else if (userInfo.name) {
            userInitials = generateInitials(userInfo.name)
        }
    }
    
    return `${eventCode}-${currentYear}-${userInitials}`
}

/**
 * Форматирует имя для отображения
 * @param {string} fullName - Полное имя
 * @returns {string} - Отформатированное имя
 */
export const formatFullName = (fullName) => {
    if (!fullName) return ''
    
    return fullName
        .trim()
        .split(' ')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ')
}
