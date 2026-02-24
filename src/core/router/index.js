/**
 * SPA Router
 * Handles client-side routing and dynamic module loading.
 */

const Router = {
    routes: {
        '/': () => import('../../modules/home.js'),
        '/eco': () => import('../../modules/eco/index.js'),
        '/eco/casino': () => import('../../modules/eco/casino.js'),
        '/eco/marketplace': () => import('../../modules/eco/marketplace.js'),
        '/eco/inventory': () => import('../../modules/eco/inventory.js'),
        '/tube': () => import('../../modules/tube/index.js'),
        '/tube/studio': () => import('../../modules/tube/studio.js'),
        '/news': () => import('../../modules/news/index.js'),
        '/news/create': () => import('../../modules/news/create.js')
    },

    init: async () => {
        // Check for redirect from 404.html
        const redirect = sessionStorage.getItem('redirect');
        if (redirect) {
            sessionStorage.removeItem('redirect');
            history.replaceState(null, null, redirect);
        }

        // Handle Navigation
        window.addEventListener('popstate', Router.handleRoute);
        document.body.addEventListener('click', (e) => {
            if (e.target.matches('a') && e.target.href.startsWith(window.location.origin)) {
                e.preventDefault();
                history.pushState(null, null, e.target.href);
                Router.handleRoute();
            }
        });

        Router.handleRoute();
    },

    handleRoute: async () => {
        const path = window.location.pathname.replace('/EverythingTT', '') || '/';
        // Simple matching logic (can be expanded for params)
        let match = Router.routes[path];
        
        // Fallback for sub-routes if exact match fails
        if (!match) {
            if (path.startsWith('/news/')) match = () => import('../../modules/news/article.js');
        }

        if (match) {
            try {
                const module = await match();
                if (module.default && module.default.init) {
                    // Cleanup previous module if needed (store current module ref in future)
                    document.querySelector('main').innerHTML = ''; // Clear content
                    module.default.init(document.querySelector('main'));
                }
            } catch (err) {
                console.error("Route Error:", err);
                document.querySelector('main').innerHTML = '<h1>404 - Module Not Found</h1>';
            }
        } else {
            document.querySelector('main').innerHTML = '<h1>404 - Page Not Found</h1>';
        }
    }
};

export default Router;
