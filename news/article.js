/**
 * Article Viewer Logic
 */
import Auth from '../js/auth.js';
import API from '../js/api.js';

document.addEventListener('DOMContentLoaded', async () => {
    await Auth.init();

    const container = document.querySelector('main');
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('id');
    
    if (!slug) {
        container.innerHTML = `<h1 style="text-align:center;">404: Article Not Found</h1>`;
        return;
    }

    container.innerHTML = `<h2 style="text-align:center;">Fetching from Archives...</h2>`;

    // Fetch Article from DB
    const article = await API.get(`/db/read?type=article&id=${slug}`);

    if (article) {
        container.innerHTML = `
            <article style="background: white; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                <h1 style="font-size: 3rem; text-align: center; margin-bottom: 10px;">${article.title}</h1>
                <div style="text-align: center; color: #555; font-family: sans-serif; text-transform: uppercase; font-size: 0.8rem; border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 30px;">
                    By <strong>${article.author}</strong> | ${new Date(article.date).toLocaleDateString()}
                </div>
                
                <div class="article-content" style="font-size: 1.25rem; max-width: 700px; margin: 0 auto;">
                    ${article.content}
                </div>

                <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-style: italic; color: #888;">
                    End of Article
                </div>
            </article>
        `;
    } else {
        container.innerHTML = `<h1 style="text-align:center;">Article Not Found in Archives</h1>`;
    }
});
