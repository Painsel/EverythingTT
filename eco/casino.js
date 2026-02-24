/**
 * Casino Logic
 */
import Auth from '../js/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await Auth.init();

    const container = document.querySelector('main');
    container.innerHTML = `
        <h1>Blackjack Table</h1>
        
        <div class="casino-table" style="text-align: center;">
            <div style="margin-bottom: 2rem;">
                <p style="color: #a0a0a0; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">Dealer Must Stand on 17</p>
                <div id="dealer-hand">
                    <div class="card-slot" style="background: #b8860b; color: transparent; border: 2px solid #ffd700;">?</div>
                    <div class="card-slot">A♠</div>
                </div>
            </div>
            
            <div style="margin-top: 2rem;">
                <div id="player-hand">
                    <div class="card-slot">K♥</div>
                    <div class="card-slot">10♦</div>
                </div>
                <p style="margin-top: 1rem; color: white; font-weight: bold; font-size: 1.2rem;">Your Hand: 20</p>
            </div>

            <div class="actions" style="margin-top: 2rem; display: flex; gap: 10px; justify-content: center;">
                <button class="btn btn-primary" style="min-width: 120px;">HIT</button>
                <button class="btn btn-secondary" style="min-width: 120px; border-color: #ffd700; color: #ffd700;">STAND</button>
                <button class="btn btn-secondary" style="min-width: 120px;">DOUBLE</button>
            </div>
        </div>
        
        <div class="chat-room card" style="margin-top: 2rem;">
            <h3>💬 High Roller Chat</h3>
            <div id="chat-messages" style="height: 150px; overflow-y: scroll; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 10px; color: #ccc; font-family: monospace;">
                <div><span style="color: #ffd700;">System:</span> Connecting to secure channel...</div>
            </div>
            <div style="display: flex; gap: 10px;">
                <input type="text" placeholder="Type a message..." style="flex: 1; padding: 10px; border-radius: 5px; border: 1px solid #333; background: #0b1a10; color: white;">
                <button class="btn btn-primary">Send</button>
            </div>
        </div>
    `;

    setTimeout(() => {
        const chat = document.getElementById('chat-messages');
        if(chat) chat.innerHTML += `<div><span style="color: #00ff00;">Connected:</span> Welcome to the VIP Lounge.</div>`;
    }, 1000);
});
