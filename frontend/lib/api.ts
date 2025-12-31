import axios from 'axios';

const API_BASE_URL = 'http://localhost:3005';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API 함수들
export const districtsApi = {
    getAll: () => api.get('/districts'),
};

export const eventsApi = {
    getAll: (params?: any) => api.get('/events', { params }),
    getOne: (id: number) => api.get(`/events/${id}`),
    incrementView: (id: number) => api.post(`/events/${id}/view`),
};

export const categoriesApi = {
    getAll: () => api.get('/categories'),
};
