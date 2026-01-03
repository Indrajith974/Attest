import axios from 'axios';

// Use environment variable for production, fallback to relative URL for dev
const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Session expiry handler - will be set by AuthContext
let onSessionExpired = null;

export const setSessionExpiredHandler = (handler) => {
    onSessionExpired = handler;
};

// Response interceptor for handling session expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Session expired or not authenticated
            if (onSessionExpired && window.location.pathname !== '/login') {
                onSessionExpired();
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const auth = {
    requestOTP: (email) => api.post('/auth/request-otp', { email }),
    verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
    getMe: () => api.get('/auth/me'),
    updateName: (name) => api.post('/auth/update-name', { name }),
    logout: () => api.post('/auth/logout')
};

// Claims API
export const claims = {
    create: (data) => api.post('/claims', data),
    list: () => api.get('/claims'),
    get: (id) => api.get(`/claims/${id}`),
    uploadEvidence: (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/claims/${id}/evidence`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    createInvite: (id) => api.post(`/claims/${id}/invite`)
};

// Witness API
export const witness = {
    getClaim: (token) => api.get(`/witness/${token}`),
    submitResponse: (token, data, evidenceFile) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('relationship', data.relationship);
        formData.append('responseType', data.responseType);
        if (data.comment) formData.append('comment', data.comment);
        if (evidenceFile) formData.append('evidence', evidenceFile);

        return api.post(`/witness/${token}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

// Public API
export const publicApi = {
    getProof: (claimId) => api.get(`/proof/${claimId}`),
    getPdfUrl: (claimId) => `/api/proof/${claimId}/pdf`,
    getQrCode: (claimId) => api.get(`/proof/${claimId}/qr`)
};

export default api;
