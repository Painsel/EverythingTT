/**
 * Main Entry Point
 */
import Router from './core/router/index.js';
import Auth from './core/auth/session.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('EverythingTT SPA Initializing...');
    
    // Initialize Auth (Check LocalStorage)
    await Auth.init();

    // Initialize Router (Handle Navigation)
    Router.init();
});
