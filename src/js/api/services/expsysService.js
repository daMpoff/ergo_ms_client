// expsysService.js
import { apiClient } from '../manager';
import { endpoints } from '../endpoints';
import Cookies from 'js-cookie';

// expsysService.js
export const fetchSubjectCompetencies = async (subjectId) => {
  if (!subjectId) return [];
  try {
    const response = await apiClient.get(endpoints.expsys.subjects.allcompenencies, {
       subject_id: parseInt(subjectId)
    });

    if (!response.success) {
      throw new Error(response.errors?.message || 'Ошибка при загрузке компетенций');
    }

    return response.data.data.map(comp => ({
      id: comp.id,
      name: comp.name,
      description: comp.description,
      sat_coef: comp.sat_coef,
      subject_id: comp.subject_id,
      icon: 'award',
      iconBackground: 'bg-success',
      knowledge:comp.knowledge,
      ability:comp.ability,
      mastered:comp.mastered,
      stats: {
        courses: 0,
        students: 0
      }
    }));
  } catch (error) {
    console.error('Ошибка в fetchSubjectCompetencies:', error.message);
    throw error;
  }
};

export const fetchCompetencies = async () => {
  try {
    const response = await apiClient.get(endpoints.expsys.subjects.competencies, {
    });

    if (!response.success) {
      throw new Error(response.errors?.message || 'Ошибка при загрузке компетенций');
    }

    return response.data.data.map(comp => ({
      id: comp.id,
      name: comp.name,
      description: comp.description,
    }));
  } catch (error) {
    console.error('Ошибка в fetchCompetencies:', error.message);
    throw error;
  }
};

export const fetchTeacherSubjects = async () => {
  try {
    const userId = Cookies.get('userId');

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

        console.log('Response from server:', response);

        if (response.success) {
            return response.data;
        }

        throw new Error(response.errors?.message || 'Ошибка при создании предмета');

    } catch (error) {
        console.error('Ошибка в createSubject:', {
            error: error.message,
            response: error.response?.data || error.message
        });

        let errorMessage = 'Не удалось создать предмет';

        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};