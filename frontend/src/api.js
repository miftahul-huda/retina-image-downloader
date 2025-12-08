import axios from 'axios';

// Determine API base URL
const getBaseURL = () => {
    // Check if VITE_API_URL is explicitly set and not empty
    const envApiUrl = import.meta.env.VITE_API_URL;
    if (envApiUrl && envApiUrl.trim() !== '') {
        console.log('Using VITE_API_URL:', envApiUrl);
        return envApiUrl;
    }

    if (typeof window !== 'undefined') {
        // In development, frontend is on port 5173
        if (window.location.port === '5173') {
            console.log('Development mode: using localhost:3000');
            return 'http://localhost:3000/api';
        }
        // In production, use same origin with relative path
        console.log('Production mode: using relative path /api');
        return '/api';
    }

    // Fallback for SSR
    return '/api';
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
