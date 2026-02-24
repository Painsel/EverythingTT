/**
 * API Client
 * Wraps Fetch with E2EE and standardized error handling.
 */
import Security from './security.js';

const API_URL = 'http://localhost:3000/api'; // Update for Production

const API = {
    securePost: async (endpoint, data) => {
        try {
            const encryptedPayload = await Security.encryptPayload(data);
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(encryptedPayload)
            });
            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            return { error: error.message };
        }
    },

    get: async (endpoint) => {
        try {
            const response = await fetch(`${API_URL}${endpoint}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            return null;
        }
    }
};

export default API;
