import api from './api';

// ========== USER API CALLS ==========
export const getUserById = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ========== ACTIVITIES API CALLS ==========
export const getActivitiesByUser = async (userId) => {
    try {
        const response = await api.get(`/activities/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getActivitiesByUserAndType = async (userId, activityType) => {
    try {
        const response = await api.get(`/activities/${userId}/type/${activityType}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getActivityDetail = async (activityId) => {
    try {
        const response = await api.get(`/activities/detail/${activityId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ========== STRAVA API CALLS ==========
export const connectStrava = async () => {
    try {
        const response = await api.get('/strava/connect');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const stravaCallback = async (code) => {
    try {
        const response = await api.get(`/strava/callback?code=${code}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const syncActivities = async (userId) => {
    try {
        const response = await api.post(`/strava/sync/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ========== ANALYZED ACTIVITIES API CALLS ==========
export const addToAnalyzed = async (activityData) => {
    try {
        const response = await api.post('/analyzed', activityData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAnalyzedActivities = async (userId) => {
    try {
        const response = await api.get(`/analyzed/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const removeFromAnalyzed = async (analyzedId) => {
    try {
        const response = await api.delete(`/analyzed/${analyzedId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const removeFromAnalyzedByActivity = async (userId, activityId) => {
    try {
        const response = await api.delete(`/analyzed/activity/${userId}/${activityId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const checkIfAnalyzed = async (userId, activityId) => {
    try {
        const response = await api.get(`/analyzed/check/${userId}/${activityId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
// ========== ML API CALLS ==========
export const getMLEstadisticasGlobales = async () => {
    try {
        const response = await api.get('/ml/estadisticas/globales');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMLEstadisticasZonas = async () => {
    try {
        const response = await api.get('/ml/estadisticas/zonas');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMLActividades = async () => {
    try {
        const response = await api.get('/ml/actividades');
        return response.data;
    } catch (error) {
        throw error;
    }
};
