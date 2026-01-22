import axios from 'axios';
import config from '../../config';

// Instancia de axios configurada con la base URL
const api = axios.create({
    baseURL: config.baseURL_API,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
