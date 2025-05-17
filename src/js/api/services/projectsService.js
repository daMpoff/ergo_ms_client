import { apiClient } from '../manager';
import { endpoints } from '../endpoints';

import Cookies from 'js-cookie';
import { useToast } from 'vue-toastification'


export const fetchUserProjects = async () => {
    try {
      console.log(endpoints.crm.projects.allprojects)
      const response = await apiClient.get(endpoints.crm.projects.allprojects, { user_id: parseInt(Cookies.get('userId')) })
      // Возвращаем массив проектов
      return response.data.data.map(project => ({
        id: project.id,
        name: project.name,
        dateofcreation: project.dateofcreation,
        creator_id: project.creator_id,
        user_id:project.user_id,
        icon: null,
        iconBackground: 'bg-gray',
        caption: project.description,
        date: { start: new Date(project.dateofcreation).getTime() / 1000, deadline: new Date(project.deadline).getTime() / 1000},
        hours: 0,
        tasks: { current: 0, all: 0 }
      }));
    } catch (error) {
      console.error('Ошибка при загрузке проектов:', error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
};

export const fetchPersonalUserProjects = async () => {
  try {
    console.log(endpoints.crm.projects.personalprojects)
    const response = await apiClient.get(endpoints.crm.projects.personalprojects, { user_id: parseInt(Cookies.get('userId')) })
    // Возвращаем массив проектов
    return response.data.data.map(project => ({
      id: project.id,
      name: project.name,
      dateofcreation: project.dateofcreation,
      creator_id: project.creator_id,
      user_id:project.user_id,
      icon: null,
      iconBackground: 'bg-gray',
      caption: project.description,
      date: { start: new Date(project.dateofcreation).getTime() / 1000, deadline: new Date(project.deadline).getTime() / 1000},
      hours: 0,
      tasks: { current: 0, all: 0 }
    }));
  } catch (error) {
    console.error('Ошибка при загрузке проектов:', error);
    return []; // Возвращаем пустой массив в случае ошибки
  }
};

export const createNewProject = async (projectData) => {
  const toast = useToast()
  
  try {
    const response = await apiClient.post(
      endpoints.crm.projects.addproject,
      projectData,
      true // Требуется авторизация
    )

    if (response.success) {
      return {
        success: true,
        project: {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description,
          creator_id: response.data.creator_id,
          dateofcreation: response.data.dateofcreation,
          deadline: response.data.deadline
        }
      }
    } else {
      const errorMsg = response.errors?.message || response.data?.message || 'Ошибка при создании проекта'
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  } catch (error) {
    console.error('Ошибка при создании проекта:', error)
    const errorMsg = error.response?.data?.message || error.message || 'Неизвестная ошибка'
    toast.error(errorMsg)
    return { success: false, error: errorMsg }
  }
}

export const createNewProjectUser = async (projectuserData) => {
    try {
        const response = await apiClient.post(
            endpoints.crm.projects.addprojectuser,
            projectuserData,
            true // Требуется авторизация
        );

        console.log('Response from server:', response);

        if (response.success) {
            return {
                success: true,
                userProject: response.data
            };
        }

        return {
            success: false,
            error: response.errors?.message || response.data?.message || 'Ошибка при добавлении в проект'
        };

    } catch (error) {
        console.error('Ошибка в createNewProjectUser:', {
            error: error.message,
            response: error.response?.data || error.message
        });

        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Неизвестная ошибка'
        };
    }
};

export const fetchInvitedUserProjects = async () => {
  try {
    console.log(endpoints.crm.projects.invitedprojects)
    const response = await apiClient.get(endpoints.crm.projects.invitedprojects, { user_id: parseInt(Cookies.get('userId')) })
    // Возвращаем массив проектов
    return response.data.data.map(project => ({
      id: project.id,
      name: project.name,
      dateofcreation: project.dateofcreation,
      creator_id: project.creator_id,
      user_id:project.user_id,
      icon: null,
      iconBackground: 'bg-gray',
      caption: project.description,
      date: { start: new Date(project.dateofcreation).getTime() / 1000, deadline: new Date(project.deadline).getTime() / 1000},
      hours: 0,
      tasks: { current: 0, all: 0 }
    }));
  } catch (error) {
    console.error('Ошибка при загрузке проектов:', error);
    return []; // Возвращаем пустой массив в случае ошибки
  }
};