import { apiClient } from '../manager';
import { endpoints } from '../endpoints';
import Cookies from 'js-cookie';

export const fetchTeacherSubjects = async () => {
  try {
    const userId = Cookies.get('userId'); // получаем user_id из cookie

    if (!userId) {
      throw new Error('ID пользователя не найден в cookies');
    }

    const response = await apiClient.get(`${endpoints.expsys.subjects.allsubjects}?user_id=${userId}`);

    const responseData = response?.data;

    if (!responseData || !Array.isArray(responseData.data)) {
      console.error('Некорректный формат данных предметов:', responseData);
      return [];
    }

    return responseData.data.map(subject => ({
      id: subject.id,
      name: subject.name,
      description: subject.description,
      creationDate: subject.creationdate,
      lastUpdate: subject.lastupdate,
      teacherId: subject.teacher_id,
      icon: 'book',
      iconBackground: 'bg-blue',
      caption: subject.description?.substring(0, 100) || '',
      stats: {
        students: 0,
        lessons: 0,
        tasks: 0
      }
    }));
    
  } catch (error) {
    console.error('Ошибка при загрузке предметов:', error?.response?.data || error.message || error);
    return [];
  }
};
export const createSubject = async (subjectData) => {
    try {
        const response = await apiClient.post(
            endpoints.expsys.subjects.create,
            subjectData
        );

        // Логирование для диагностики
        console.log('Response from server:', response);

        // Проверка на наличие ответа и правильной структуры данных
        if (response && response.data && response.data.status === 'success') {
            return response.data.data;  // Возвращаем данные предмета
        }

        // Если сервер вернул ошибку
        if (response && response.data && response.data.status === 'error') {
            throw new Error(response.data.message || 'Ошибка при создании предмета');
        }

        // Если ответ не соответствует ожидаемой структуре
      
        
    } catch (error) {
        // Логирование ошибки
        console.error('Ошибка в createSubject:', {
            error: error.message,
            response: error.response?.data || error.message // Используем error.message в случае, если нет ответа
        });

        // Формируем понятное сообщение об ошибке
        let errorMessage = 'Не удалось создать предмет';
        
        // Проверяем error.response или error.message, чтобы вывести более информативное сообщение
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
};