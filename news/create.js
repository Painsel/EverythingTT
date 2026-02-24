/**
 * Create Article Logic
 */
import Auth from '../js/auth.js';
import API from '../js/api.js';

document.addEventListener('DOMContentLoaded', async () => {
    await Auth.init();

    const container = document.querySelector('main');
    container.innerHTML = `
        <h1 style="text-align: center; margin-bottom: 2rem;">Compose Article</h1>
        
        <div class="card" style="box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
            <input type="text" id="article-title" placeholder="Headline...">
            
            <div class="editor-toolbar">
                <button class="btn btn-secondary"><strong>B</strong></button>
                <button class="btn btn-secondary"><em>I</em></button>
                <button class="btn btn-secondary">“Quote”</button>
            </div>
            
            <div id="editor-content" class="editor-content" contenteditable="true">
                <p>Dateline: NEW YORK—</p>
                <p>Start writing your story here...</p>
            </div>
            
            <div style="margin-top: 2rem; text-align: right;">
                <button id="publish-btn" class="btn btn-primary" style="padding: 12px 24px; font-size: 1rem;">Publish to Press</button>
            </div>
        </div>
    `;

    document.getElementById('publish-btn').addEventListener('click', async () => {
        // ... (Logic remains same, just style updated)
        const title = document.getElementById('article-title').value;
        const content = document.getElementById('editor-content').innerHTML;
        
        if(!title) return alert('Headline required');

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const articleData = {
            id: slug,
            title,
            content,
            date: new Date().toISOString(),
            author: Auth.state.user ? (Auth.state.user.user_metadata.username || Auth.state.user.email) : 'Anonymous Correspondent'
        };

        const result = await API.securePost('/db/write', {
            type: 'article',
            id: slug,
            data: articleData
        });

        if(result && result.success) {
            alert('Extra! Extra! Read all about it! (Published)');
            window.location.href = `article.html?id=${slug}`;
        } else {
            alert('Stop the presses! (Failed to publish)');
        }
    });
});
