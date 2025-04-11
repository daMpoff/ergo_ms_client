import { apiClient } from '../manager';
import { endpoints } from '../endpoints';

import Cookies from 'js-cookie';


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