/**
 * Tube Dashboard
 */
import Auth from '../js/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await Auth.init();

    // Update User Panel in Header
    const userPanel = document.querySelector('.user-panel');
    if (Auth.state.user) {
        const userDiv = document.createElement('div');
        userDiv.style.width = '32px';
        userDiv.style.height = '32px';
        userDiv.style.borderRadius = '50%';
        userDiv.style.backgroundColor = 'purple';
        userDiv.style.color = 'white';
        userDiv.style.display = 'flex';
        userDiv.style.alignItems = 'center';
        userDiv.style.justifyContent = 'center';
        userDiv.innerText = Auth.state.user.email[0].toUpperCase();
        userPanel.appendChild(userDiv);
    } else {
        const loginBtn = document.createElement('button');
        loginBtn.className = 'btn-primary';
        loginBtn.innerText = 'Sign In';
        loginBtn.onclick = () => Auth.login();
        userPanel.appendChild(loginBtn);
    }

    const container = document.querySelector('.main-content');
    
    // Mock Data
    const videos = [
        { title: "Epic Gaming Moments #42", channel: "GamerPro", views: "1.2M", time: "2 days ago", color: "#444" },
        { title: "How to Code in 2026", channel: "DevTips", views: "500K", time: "1 week ago", color: "#333" },
        { title: "Relaxing Lofi Beats", channel: "MusicHub", views: "3M", time: "1 month ago", color: "#222" },
        { title: "Territorial.io Strategy", channel: "MapMaster", views: "800K", time: "3 days ago", color: "#555" },
        { title: "Building a YouTube Clone", channel: "CodeWithMe", views: "100K", time: "5 hours ago", color: "#666" },
        { title: "Top 10 Memes", channel: "MemeLord", views: "2M", time: "1 year ago", color: "#777" },
        { title: "SpaceX Launch Live", channel: "SpaceNews", views: "4M", time: "Live", color: "#888" },
        { title: "Cooking with Fire", channel: "ChefJohn", views: "200K", time: "4 days ago", color: "#999" }
    ];

    let gridHtml = '<div class="video-grid">';
    
    videos.forEach(v => {
        gridHtml += `
            <div class="video-card">
                <div class="thumbnail" style="background-color: ${v.color}"></div>
                <div class="video-info">
                    <div class="channel-icon"></div>
                    <div class="video-details">
                        <div class="video-title">${v.title}</div>
                        <div class="channel-name">${v.channel}</div>
                        <div class="video-meta">${v.views} views • ${v.time}</div>
                    </div>
                </div>
            </div>
        `;
    });

    gridHtml += '</div>';
    container.innerHTML = gridHtml;
});
