/**
 * Economy Module - Inventory
 */
export default {
    init: (container) => {
        container.innerHTML = `
            <h1>Your Inventory</h1>
            <div class="card">
                <p>You have no items yet. Visit the Marketplace!</p>
                <a href="/eco/marketplace" class="btn btn-secondary mt-1" data-link>Go to Shop</a>
            </div>
        `;
    }
};
