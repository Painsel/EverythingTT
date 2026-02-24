/**
 * News Module - Dashboard
 */
export default {
    init: (container) => {
        container.innerHTML = `
            <h1>Latest Articles</h1>
            <div class="mb-2">
                <a href="/news/create" class="btn btn-primary" data-link>Write Article</a>
            </div>
            
            <div class="news-article card">
                <h2 class="mb-1">Why Facts Don't Change Minds</h2>
                <p class="mb-1" style="color:#aaa;">By Painsel • Feb 24, 2026 • Science</p>
                <p>An exploration into cognitive dissonance and why beliefs are so hard to shake...</p>
                <button class="btn btn-secondary mt-1">Read More</button>
            </div>
        `;
    }
};
