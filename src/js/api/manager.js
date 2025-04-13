import axios from 'axios';
import Cookies from 'js-cookie';

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
    }

    // Generic request methods
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

    // Helper method to add auth token to config
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