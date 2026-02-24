/**
 * SPA Router
 * Handles dynamic module loading and History API management.
 */

class Router {
    constructor() {
        this.routes = {
            '/': () => import('./home.js'),
            '/eco': () => import('../eco/index.js'),
            '/eco/casino': () => import('../eco/casino.js'),
            '/eco/marketplace': () => import('../eco/marketplace.js'),
            '/eco/inventory': () => import('../eco/inventory.js'),
            '/tube': () => import('../tube/index.js'),
            '/tube/studio': () => import('../tube/studio.js'),
            '/news': () => import('../news/index.js'),
            '/news/create': () => import('../news/create.js')
        };
    }

    /**
     * Initializes the router and handles the initial path.
     * Checks for 404 redirect hack from GitHub Pages.
     */
    init() {
        // Recover path from 404 hack
        const redirect = sessionStorage.getItem('redirect');
        if (redirect) {
            sessionStorage.removeItem('redirect');
            history.replaceState(null, null, redirect);
        }

        // Bind events
        window.addEventListener('popstate', () => this.handleRoute());
        document.body.addEventListener('click', (e) => this.handleLinkClick(e));

        // Initial Load
        this.handleRoute();
    }

    /**
     * Intercepts anchor clicks for SPA navigation.
     * @param {Event} e 
     */
    handleLinkClick(e) {
        if (e.target.matches('a') && e.target.href.startsWith(window.location.origin)) {
            e.preventDefault();
            history.pushState(null, null, e.target.href);
            this.handleRoute();
        }
    }

    /**
     * Resolves the current path and loads the corresponding module.
     */
    async handleRoute() {
        const path = window.location.pathname.replace('/EverythingTT', '') || '/';
        let match = this.routes[path];
        
        // Dynamic Route Matching (e.g., /news/article-slug)
        if (!match) {
            if (path.startsWith('/news/')) match = () => import('../news/article.js');
        }

        const mainContainer = document.querySelector('main');
        
        if (match) {
            try {
                const module = await match();
                if (module.default && typeof module.default.init === 'function') {
                    // Reset container
                    mainContainer.innerHTML = ''; 
                    module.default.init(mainContainer);
                }
            } catch (err) {
                console.error("Module Load Error:", err);
                mainContainer.innerHTML = '<h1>Error Loading Module</h1>';
            }
        } else {
            mainContainer.innerHTML = '<h1>404 - Page Not Found</h1>';
        }
    }
}

const routerInstance = new Router();
export default routerInstance;
