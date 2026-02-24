/**
 * News Dashboard
 */
import Auth from '../js/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await Auth.init();

    const container = document.querySelector('main');
    container.innerHTML = `
        <div style="border-bottom: 3px double #000; margin-bottom: 2rem; padding-bottom: 1rem;">
            <h1 style="font-size: 2.5rem; font-style: italic; text-align: center;">Latest Headlines</h1>
        </div>
        
        <div class="news-article">
            <div class="meta">Science • By Painsel</div>
            <h2><a href="article.html?id=why-facts-dont-change-minds">Why Facts Don't Change Minds</a></h2>
            <p class="excerpt">The economist J.K. Galbraith once wrote, "Faced with the choice between changing one's mind and proving that there is no need to do so, almost everyone gets busy on the proof." An exploration into cognitive dissonance...</p>
            <a href="article.html?id=why-facts-dont-change-minds" class="btn btn-secondary">Continue Reading</a>
        </div>

        <div class="news-article">
            <div class="meta">Technology • By Admin</div>
            <h2><a href="#">The Future of Infinite Uptime</a></h2>
            <p class="excerpt">How serverless architecture and static generation are changing the web landscape forever. We dive deep into the stack powering EverythingTT.</p>
            <a href="#" class="btn btn-secondary">Continue Reading</a>
        </div>
    `;
});
