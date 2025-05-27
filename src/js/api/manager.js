import axios from 'axios';
import Cookies from 'js-cookie';

// Класс для работы с API
class ApiClient {
    // Конструктор класса
    constructor() {
        this.baseUrl = `http://${import.meta.env.VITE_API_HOST || 'localhost'}:${import.meta.env.VITE_API_PORT || '8000'}/`;
        this.apiPath = 'api/';
        this.client = axios.create({
            baseURL: `${this.baseUrl}${this.apiPath}`,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Основные методы запросов
    // Метод для GET-запросов
    async get(endpoint, params = {}, needToken = true) {
        try {
            const config = { params };
            if (needToken) {
                this._addAuthToken(config);
            }
            const response = await this.client.get(endpoint, config);
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Метод для POST-запросов
    async post(endpoint, data = {}, needToken = true) {
        try {
            const config = {};
            if (needToken) {
                this._addAuthToken(config);
            }
            const response = await this.client.post(endpoint, data, config);
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Метод для PUT-запросов
    async put(endpoint, data = {}, needToken = true) {
        try {
            const config = {};
            if (needToken) {
                this._addAuthToken(config);
            }
            const response = await this.client.put(endpoint, data, config);
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Метод для DELETE-запросов
    async delete(endpoint, params = {}, needToken = true) {
        try {
            const config = { params };
            if (needToken) {
                this._addAuthToken(config);
            }
            const response = await this.client.delete(endpoint, config);
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Вспомогательный метод для добавления токена авторизации в конфигурацию
    _addAuthToken(config) {
        const token = Cookies.get('token');
        if (token) {
            if (!config.headers) {
                config.headers = {};
            }
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }

    // Метод для удаления токенов авторизации
    logout() {
        Cookies.remove('token');
        Cookies.remove('refresh');
    }

    // Обработчики ответов
    handleResponse(response) {
        if (response.status >= 200 && response.status < 300) {
            return { success: true, data: response.data };
        }
        return { success: false, errors: response.data };
    }

    // Обработчик ошибок
    handleError(error) {
        return {
            success: false,
            errors: error.response?.data || 'Ошибка сервера.',
        };
    }
}

// Создать и экспортировать синглтон-объект
export const apiClient = new ApiClient(); 