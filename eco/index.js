/**
 * Economy Dashboard
 */
import Auth from '../js/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await Auth.init();
    
    const container = document.querySelector('main');
    container.innerHTML = `
        <h1>High Stakes Economy</h1>
        <div class="grid">
            <div class="card" style="text-align:center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎰</div>
                <h3>Casino</h3>
                <p>Play Blackjack, Roulette, and Slots.</p>
                <a href="casino.html" class="btn btn-primary">Enter Casino</a>
            </div>
            <div class="card" style="text-align:center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🛍️</div>
                <h3>Marketplace</h3>
                <p>Buy exclusive items and upgrades.</p>
                <a href="marketplace.html" class="btn btn-secondary">Go Shopping</a>
            </div>
            <div class="card" style="text-align:center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">💼</div>
                <h3>Inventory</h3>
                <p>Manage your assets and wealth.</p>
                <a href="inventory.html" class="btn btn-primary">View Assets</a>
            </div>
        </div>

        <h2 style="text-align:center; margin-top:3rem; color:white; font-size:2rem;">🏆 Leaderboard</h2>
        <div class="card" style="max-width: 600px; margin: 1rem auto;">
            <div class="eco-stat"><span>1. PlayerOne</span> <span>10,000 Gold</span></div>
            <div class="eco-stat"><span>2. HighRoller</span> <span>8,500 Gold</span></div>
            <div class="eco-stat"><span>3. LuckyDuck</span> <span>5,000 Gold</span></div>
        </div>
    `;
});
