import axios from 'axios';

// Determine API base URL
// - Development: frontend on :5173, backend on :3000
// - Production: same origin
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
    baseURL: getBaseURL(),
    withCredentials: true  // Important for cookies/sessions
});

export default api;
