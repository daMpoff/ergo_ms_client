import axios from 'axios';
import { endpoints } from '../endpoints';

// Используем импорт переменных окружения из Vue
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/';

export const crmService = {

    async getMonthlyStats(year = null) {
        try {
            const url = `${API_URL}${endpoints.crm.monthlyStats}`;
            const params = year ? { year } : {};

            const response = await axios.get(url, { params });
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении статистики задач:', error);
            throw error;
        }
    },

    async getPriorityStats() {
        try {
            const url = `${API_URL}${endpoints.crm.priorityStats}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении статистики задач по приоритетам:', error);
            throw error;
        }
    },

    async getEfficiencyStats() {
        try {
            const url = `${API_URL}${endpoints.crm.efficiencyStats}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении данных об эффективности:', error);
            throw error;
        }
    },

    async getSectionStats() {
        try {
            const url = `${API_URL}${endpoints.crm.sectionStats}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении статистики по секциям:', error);
            throw error;
        }
    }
};

export default crmService;
