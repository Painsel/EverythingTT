/**
 * Authentication Manager
 * Handles Supabase JWT sessions and local user state.
 */
import API from './api.js';

class AuthManager {
    constructor() {
        this.state = {
            user: null,
            gold: 0,
            ettCoins: 0,
            session: null
        };
        
        // Initialize Supabase Client
        // @ts-ignore
        this.supabase = window.supabase ? window.supabase.createClient(
            'https://xyz.supabase.co', 
            'public-anon-key'
        ) : null;
    }

    /**
     * Initializes the authentication state.
     * Checks for existing session and fetches user data.
     * @returns {Promise<void>}
     */
    async init() {
        if (!this.supabase) return;

        const { data: { session } } = await this.supabase.auth.getSession();
        
        if (session) {
            this.state.session = session;
            this.state.user = session.user;
            await this.refreshUserData();
        }

        // Listen for auth changes
        this.supabase.auth.onAuthStateChange((_event, session) => {
            this.state.session = session;
            this.state.user = session?.user || null;
            this.updateUI();
        });

        this.updateUI();
    }

    /**
     * Refreshes extended user data (Gold, Coins) from the backend.
     * @returns {Promise<void>}
     */
    async refreshUserData() {
        if (!this.state.user) return;

        // Fetch Gold from Territorial Proxy
        // Note: This assumes username mapping exists or is stored in user_metadata
        const username = this.state.user.user_metadata.username;
        if (username) {
            const accountData = await API.securePost('/account/get', {
                account_name: username
            });
            if (accountData?.account_data) {
                this.state.gold = accountData.account_data.gold_cents / 100;
            }
        }

        // Fetch ETT Coins from DB
        const userData = await API.get(`/db/read?type=user&id=${this.state.user.id}`);
        if (userData) {
            this.state.ettCoins = userData.ettCoins || 0;
        }
    }

    /**
     * Logs in the user via Supabase (OAuth or Email).
     * @returns {Promise<void>}
     */
    async login() {
        if (!this.supabase) return;
        // Example: Sign in with GitHub
        await this.supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.href
            }
        });
    }

    /**
     * Logs out the current user.
     * @returns {Promise<void>}
     */
    async logout() {
        if (!this.supabase) return;
        await this.supabase.auth.signOut();
        window.location.reload();
    }

    /**
     * Updates the UI based on auth state.
     * @private
     */
    updateUI() {
        const navContainer = document.querySelector('.user-panel');
        if (!navContainer) return;

        if (this.state.user) {
            const username = this.state.user.user_metadata.username || this.state.user.email;
            navContainer.innerHTML = `
                <span class="gold-display" title="Gold">🟡 ${this.state.gold}</span>
                <span class="ett-coins" title="ETT Coins">🪙 ${this.state.ettCoins}</span>
                <span class="user-name">${username}</span>
                <button id="logout-btn" class="btn btn-secondary">Logout</button>
            `;
            document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
        } else {
            navContainer.innerHTML = `
                <button id="login-btn" class="btn btn-primary">Login</button>
            `;
            document.getElementById('login-btn')?.addEventListener('click', () => this.login());
        }
    }
}

const authInstance = new AuthManager();
export default authInstance;
