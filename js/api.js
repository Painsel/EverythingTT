/**
 * API Client Wrapper
 * Handles E2EE payload encryption and standardized fetch requests.
 */
import Security from './crypto.js';

const API_URL = 'http://localhost:3000/api'; // Configure for Production

class ApiClient {
    /**
     * Sends an encrypted POST request to the backend.
     * @param {string} endpoint - The API endpoint (e.g., '/gold/send').
     * @param {Object} data - The JSON payload to encrypt and send.
     * @returns {Promise<Object>} - The JSON response.
     */
    static async securePost(endpoint, data) {
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
    }

    /**
     * Sends a GET request to the backend.
     * @param {string} endpoint - The API endpoint.
     * @returns {Promise<Object|null>} - The JSON response or null on failure.
     */
    static async get(endpoint) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            return null;
        }
    }
}

export default ApiClient;
