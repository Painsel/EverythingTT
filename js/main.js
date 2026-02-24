/**
 * Main Entry Point
 */
import Router from './router.js';
import Auth from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('EverythingTT SPA Initializing...');
    
    // Initialize Auth (Check LocalStorage)
    await Auth.init();

    // Initialize Router (Handle Navigation)
    Router.init();
});
