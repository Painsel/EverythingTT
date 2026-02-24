/**
 * Tube Studio Logic
 */
import Auth from '../js/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await Auth.init();

    const container = document.querySelector('.main-content');
    container.innerHTML = `
        <h1 style="margin-bottom: 24px; font-size: 1.5rem;">Channel Dashboard</h1>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px;">
            <!-- Upload Card -->
            <div style="background: #1f1f1f; padding: 24px; border-radius: 8px; border: 1px solid #333; text-align: center;">
                <div style="width: 100px; height: 100px; background: #2a2a2a; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">⬆️</div>
                <p style="margin-bottom: 16px; color: #aaa;">Upload videos to get started</p>
                <button class="btn-primary">Upload Videos</button>
            </div>

            <!-- Analytics Card -->
            <div style="background: #1f1f1f; padding: 24px; border-radius: 8px; border: 1px solid #333;">
                <h3 style="margin-bottom: 16px; font-size: 1.1rem;">Channel Analytics</h3>
                <p style="margin-bottom: 8px;">Current Subscribers</p>
                <h2 style="font-size: 2rem; margin-bottom: 16px;">1,205</h2>
                <hr style="border: 0; border-top: 1px solid #333; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #aaa;">Views</span>
                    <span>10.4K</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">Watch Time</span>
                    <span>450.5 hr</span>
                </div>
            </div>

            <!-- Recent Activity -->
            <div style="background: #1f1f1f; padding: 24px; border-radius: 8px; border: 1px solid #333;">
                <h3 style="margin-bottom: 16px; font-size: 1.1rem;">Recent Comments</h3>
                <div style="margin-bottom: 16px;">
                    <p style="font-size: 0.9rem; margin-bottom: 4px;"><strong>User123</strong> on <em>Epic Gaming Moments</em></p>
                    <p style="color: #aaa; font-size: 0.9rem;">"This was insane! How did you do that?"</p>
                </div>
                <div>
                    <p style="font-size: 0.9rem; margin-bottom: 4px;"><strong>Troll99</strong> on <em>Tutorial</em></p>
                    <p style="color: #aaa; font-size: 0.9rem;">"First!"</p>
                </div>
            </div>
        </div>
    `;
});
