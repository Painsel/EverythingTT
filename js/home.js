/**
 * Home Module
 */
export default {
    init: (container) => {
        container.innerHTML = `
            <section class="hero">
                <h1>Welcome to EverythingTT</h1>
                <p>The infinite platform for trading, watching, and creating.</p>
                <div class="cta-group">
                    <a href="/eco" class="btn btn-primary" data-link>Start Trading</a>
                    <a href="/tube" class="btn btn-secondary" data-link>Watch Videos</a>
                </div>
            </section>

            <div class="grid">
                <div class="card">
                    <h3>💰 Economy</h3>
                    <p>Trade ETT Coins & Territorial.io Gold. Play Casino, buy Marketplace items.</p>
                    <a href="/eco" class="mt-1" data-link>Go to Economy &rarr;</a>
                </div>
                <div class="card">
                    <h3>📺 Tube</h3>
                    <p>Share videos, shorts, and music. Monetize with Memberships.</p>
                    <a href="/tube" class="mt-1" data-link>Go to Tube &rarr;</a>
                </div>
                <div class="card">
                    <h3>📰 News</h3>
                    <p>Independent journalism platform. Write articles and share your truth.</p>
                    <a href="/news" class="mt-1" data-link>Read News &rarr;</a>
                </div>
            </div>
        `;
    }
};
