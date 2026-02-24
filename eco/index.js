/**
 * Economy Module - Dashboard
 */
export default {
    init: (container) => {
        container.innerHTML = `
            <h1>Economy Dashboard</h1>
            <div class="grid">
                <div class="card">
                    <h3>🎰 Casino</h3>
                    <p>Play Blackjack, PushToWin, and gamble your Gold!</p>
                    <a href="/eco/casino" class="btn btn-primary mt-1" data-link>Enter Casino</a>
                </div>
                <div class="card">
                    <h3>🛍️ Marketplace</h3>
                    <p>Buy Nitro, Giftcards, and exclusive items.</p>
                    <a href="/eco/marketplace" class="btn btn-secondary mt-1" data-link>Shop Now</a>
                </div>
                <div class="card">
                    <h3>🎒 Inventory</h3>
                    <p>Manage your assets and trade with others.</p>
                    <a href="/eco/inventory" class="btn btn-primary mt-1" data-link>View Inventory</a>
                </div>
            </div>

            <h2 class="mt-2">Top Accounts</h2>
            <div id="top-accounts-list">
                <div class="card mt-1">
                    <div class="eco-stat"><span>Player 1</span> <span>10,000 Gold</span></div>
                    <div class="eco-stat"><span>Player 2</span> <span>8,500 Gold</span></div>
                </div>
            </div>
        `;
    }
};
