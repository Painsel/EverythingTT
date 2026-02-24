/**
 * Auth Module
 * Manages user session and state.
 */
import API from '../api/client.js';

const Auth = {
    state: {
        user: null,
        gold: 0,
        ettCoins: 0
    },

    init: async () => {
        const storedUser = localStorage.getItem('ett_user');
        if (storedUser) {
            Auth.state.user = JSON.parse(storedUser);
            // Refresh Data
            const accountData = await API.securePost('/account/get', {
                account_name: Auth.state.user.username,
                password: Auth.state.user.password
            });
            
            if (accountData && accountData.account_data) {
                Auth.state.gold = accountData.account_data.gold_cents / 100;
            }

            const userData = await API.get(`/db/read?type=user&id=${Auth.state.user.id}`);
            if (userData) {
                Auth.state.ettCoins = userData.ettCoins || 0;
            }
        }
        Auth.updateUI();
    },

    login: (username, password) => {
        const user = { username, password, id: 'user_' + Date.now() };
        localStorage.setItem('ett_user', JSON.stringify(user));
        Auth.state.user = user;
        window.location.reload();
    },

    logout: () => {
        localStorage.removeItem('ett_user');
        Auth.state.user = null;
        window.location.reload();
    },

    updateUI: () => {
        const navContainer = document.querySelector('.user-panel');
        if (!navContainer) return;

        if (Auth.state.user) {
            navContainer.innerHTML = `
                <span class="gold-display" title="Gold">🟡 ${Auth.state.gold}</span>
                <span class="ett-coins" title="ETT Coins">🪙 ${Auth.state.ettCoins}</span>
                <span class="user-name">${Auth.state.user.username}</span>
                <button id="logout-btn" class="btn btn-secondary">Logout</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', Auth.logout);
        } else {
            navContainer.innerHTML = `
                <button id="login-btn" class="btn btn-primary">Login</button>
            `;
            document.getElementById('login-btn').addEventListener('click', () => {
                // Simple prompt for now, modal component later
                const u = prompt("Username:");
                const p = prompt("Password:");
                if(u && p) Auth.login(u, p);
            });
        }
    }
};

export default Auth;
