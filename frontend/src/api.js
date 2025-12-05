import axios from 'axios';

// Determine API base URL
const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    if (typeof window !== 'undefined') {
        // In development, frontend is on port 5173
        if (window.location.port === '5173') {
            return 'http://localhost:3000/api';
        }
        // In production, use same origin
        return `${window.location.origin}/api`;
    }

    // Fallback for SSR
    return 'http://localhost:3000/api';
};

const api = axios.create({
    baseURL: getBaseURL()
});

// Add JWT token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 responses (token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid, clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Optionally redirect to login or refresh page
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;
