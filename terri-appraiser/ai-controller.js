/**
 * AI CONTROLLER - Territorial Appraiser (Global Version)
 * 
 * This version uses the Hugging Face Inference API to provide a global AI
 * experience for all visitors without requiring local software.
 */

const AI_CONFIG = {
    // Using Llama 3.2 3B - Very stable and lightweight for chat completions
    model: "meta-llama/Llama-3.2-3B-Instruct", 
    endpoint: "https://router.huggingface.co/v1/chat/completions",
    // Dynamic Token Management via JSONBin (prevents hardcoded secrets)
    keySource: "https://api.jsonbin.io/v3/b/69a6011aae596e708f58e218",
    token: "" // Loaded dynamically from keySource
};

const APPRAISER_SYSTEM_PROMPT = `
You are the Territorial Appraiser AI (Painsel Model).
MARKET RATES: 4100 ETT = $5.99, 1000 Gold = $1.99.
AUCTION RECORD HIGHS: Logo: 2,500 Gold, Role: 15,500 Gold, Emoji: 4,500 Gold, Nitro: 8,500 Gold.
VALUATION: Clan Rank 1-500 ($1.21 - $17.99), Gold Rank 1-500 ($0.23 - $39.99).
MISSION: Analyze account scans and predict market trends for Territorial.io.
Refer to Discord: https://discord.gg/DGTMnG9avc
`;

const AI = {
    isChatOpen: false,
    isRefreshing: false,

    /**
     * Fetches the latest API key from JSONBin to prevent manual update needs
     */
    async refreshApiKey() {
        if (this.isRefreshing) return;
        this.isRefreshing = true;
        try {
            const response = await fetch(AI_CONFIG.keySource, {
                headers: { "X-Bin-Meta": "false" }
            });
            const data = await response.json();
            if (data.api_key) {
                AI_CONFIG.token = data.api_key;
                console.log("AI: Token Refreshed Successfully");
            }
        } catch (err) {
            console.error("AI: Token Refresh Failed", err);
        } finally {
            this.isRefreshing = false;
        }
    },

    toggleChat() {
        const modal = document.getElementById('aiChatModal');
        this.isChatOpen = !this.isChatOpen;
        if (this.isChatOpen) {
            modal.classList.remove('hidden-modal');
            // Refresh key on open to ensure it's fresh
            this.refreshApiKey();
            if (document.getElementById('ai-messages').children.length === 0) {
                this.addMessage("AI", "Hello! I am your Global AI Analyst. How can I help you with the Territorial market?");
            }
        } else {
            modal.classList.add('hidden-modal');
        }
    },

    addMessage(sender, text) {
        const container = document.getElementById('ai-messages');
        const msgDiv = document.createElement('div');
        msgDiv.style.marginBottom = "1rem";
        msgDiv.style.padding = "0.75rem";
        msgDiv.style.borderRadius = "1rem";
        msgDiv.style.fontSize = "0.8rem";
        
        if (sender === "AI") {
            msgDiv.style.backgroundColor = "rgba(99, 102, 241, 0.1)";
            msgDiv.style.color = "white";
            msgDiv.innerHTML = `<strong>Appraiser AI:</strong><br>${text}`;
        } else {
            msgDiv.style.backgroundColor = "rgba(30, 41, 59, 0.5)";
            msgDiv.style.color = "var(--text-muted)";
            msgDiv.style.alignSelf = "flex-end";
            msgDiv.innerHTML = `<strong>You:</strong><br>${text}`;
        }
        
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
    },

    async sendMessage() {
        const input = document.getElementById('ai-input');
        const text = input.value.trim();
        if (!text) return;

        // If token is missing, attempt to fetch it before sending
        if (!AI_CONFIG.token) {
            this.addMessage("AI", "Initializing secure connection... please wait.");
            await this.refreshApiKey();
            if (!AI_CONFIG.token) {
                this.addMessage("AI", "Could not establish a secure connection. Please try again in a moment.");
                return;
            }
        }

        this.addMessage("User", text);
        input.value = '';

        try {
            let context = "";
            const currentWorth = document.getElementById('res-val').innerText;
            if (currentWorth !== "$0.00") {
                const user = document.getElementById('res-user').innerText;
                const gold = document.getElementById('res-gold').innerText;
                context = `[Context: Currently analyzing ${user}, Worth ${currentWorth}, Gold ${gold}] `;
            }

            let response = await fetch(AI_CONFIG.endpoint, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AI_CONFIG.token}`
                },
                body: JSON.stringify({
                    model: AI_CONFIG.model,
                    messages: [
                        { role: "user", content: APPRAISER_SYSTEM_PROMPT + "\n\n" + context + text }
                    ],
                    max_tokens: 300,
                    temperature: 0.7
                })
            });

            // Handle token expiration/errors by refreshing once
            if (response.status === 401 || response.status === 403) {
                await this.refreshApiKey();
                response = await fetch(AI_CONFIG.endpoint, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${AI_CONFIG.token}`
                    },
                    body: JSON.stringify({
                            model: AI_CONFIG.model,
                            messages: [
                                { role: "user", content: APPRAISER_SYSTEM_PROMPT + "\n\n" + context + text }
                            ],
                            max_tokens: 300,
                            temperature: 0.7
                        })
                });
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = typeof errorData.error === 'object' 
                    ? (errorData.error.message || JSON.stringify(errorData.error)) 
                    : (errorData.error || `HTTP ${response.status}`);
                throw new Error(errorMsg);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content.trim();
            this.addMessage("AI", aiResponse);

        } catch (err) {
            this.addMessage("AI", "The Global Brain is currently busy or experiencing a connection issue. Error: " + err.message);
            console.error("AI Error:", err);
        }
    }
};
