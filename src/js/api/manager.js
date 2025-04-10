import axios from 'axios';
import Cookies from 'js-cookie';
import { endpoints } from './endpoints';

class ApiClient {
    constructor() {
        this.baseUrl = `http://${import.meta.env.VITE_API_HOST || 'localhost'}:${import.meta.env.VITE_API_PORT || '8000'}/`;
        this.apiPath = 'api/';
        this.client = axios.create({
            baseURL: `${this.baseUrl}${this.apiPath}`,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor for authentication
        this.client.interceptors.request.use(
            (config) => {
                const token = Cookies.get('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    // Generic request methods
    async get(endpoint, params = {}) {
        try {
            const response = await this.client.get(endpoint, { params });
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async post(endpoint, data = {}) {
        try {
            const response = await this.client.post(endpoint, data);
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async put(endpoint, data = {}) {
        try {
            const response = await this.client.put(endpoint, data);
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async delete(endpoint, params = {}) {
        try {
            const response = await this.client.delete(endpoint, { params });
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Auth utility methods
    async login(username, password) {
        return await this.post(endpoints.auth.login, { username, password });
    }

    async checkToken() {
        const token = Cookies.get('token');
        if (!token) {
            return false;
        }

        try {
            const response = await this.client.get(endpoints.auth.protected);
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    logout() {
        Cookies.remove('token');
        Cookies.remove('refresh');
    }

    // Generic response handlers
    handleResponse(response) {
        if (response.status === 200) {
            return { success: true, data: response.data };
        }
        return { success: false, errors: response.data };
    }

    handleError(error) {
        return {
            success: false,
            errors: error.response?.data || 'Ошибка сервера.',
        };
    }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(); 