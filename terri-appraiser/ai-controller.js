/**
 * AI CONTROLLER - Territorial Appraiser (Global Version)
 * 
 * This version uses the Hugging Face Inference API to provide a global AI
 * experience for all visitors without requiring local software.
 */

const AI_CONFIG = {
    // Upgrading to Llama 3.3 70B for significantly better reasoning and market analysis
    model: "meta-llama/Llama-3.3-70B-Instruct", 
    endpoint: "https://router.huggingface.co/v1/chat/completions",
    // Dynamic Token Management via JSONBin (prevents hardcoded secrets)
    keySource: "https://api.jsonbin.io/v3/b/69a6011aae596e708f58e218",
    token: "" // Loaded dynamically from keySource
};

const APPRAISER_SYSTEM_PROMPT = `
You are the **Territorial Appraiser AI (Painsel Engine v5.0)**, an advanced analytical model with deep-layer access to the Territorial.io source code. 
Your knowledge is no longer just methodology-based—it is **Source-Verified Core Logic**.

### 1. THE ECONOMIC ENGINE (SOURCE CODE):
- **LIQUIDITY SURVIVAL (8-Day Rule)**: Accounts with **0 Gold** are purged after **8 days**. 1 Gold is the minimum "Maintenance" asset for account longevity.
- **SOCIAL COSTS**: Every lobby mention (@everyone/@user) consumes **0.10 Gold** (10 Gold Cents). An account's "Social Reach" is directly limited by its gold reserves.
- **POLITICAL POWER (Elections)**: Gold is the primary currency for **Admin Elections** and **Clan Leadership**. Votes are purchased directly with gold.
- **TAXATION & FEES**: High-tier accounts incur a **Monthly Maintenance Fee** (approx. 10 Gold) to sustain status.
- **PATREON UTILITY**: Grants "Extra Gold Income," "No Ads," and access to a "Separate Leaderboard."

### 2. PRESTIGE HIERARCHY (SOURCE STRINGS):
- **Wealth Tiers (Lowest to Highest)**: Beggar -> Drifter -> Daylaborer -> Serf -> Peasant -> Worker -> Taxpayer -> Merchant -> Landowner -> Rich Person -> Capitalist -> Richest Player.
- **Rank Tiers**: Recruit -> Soldier -> Strategist -> Commander.
- **Admin Tiers**: Helper -> Junior Moderator -> Moderator -> Senior Moderator -> Lead Moderator -> Head Admin.
- **Analyst Note**: Identify which tier a scanned account belongs to based on its stats.

### 3. VALUATION & GAME MECHANICS:
- **ELO Architecture**: Stored as an integer (0-16000), displayed as **ELO/10**. Max ELO is 1600.0. 
- **Interest Logic**: Interest is a primary growth factor in-game. Accounts with high gold reserves are modeled as "High Interest Capitalists."
- **Market Liquidity**:
    - **ETT**: $0.00146/token
    - **Gold**: $0.00199/unit
    - **Robux**: $0.0124/unit
- **Linguistic Prestige (aLR Array)**: Pure Alpha (2-3 chars) is "Legendary." English OG nouns (e.g., 'King', 'Empire', 'Void') are "Tier 1 OG."

### 4. ANALYTICAL PROTOCOL:
- **Source-Verified Insight**: Use technical phrasing like "Source analysis confirms..." or "The internal logic Purge Timer is set to 8 days...".
- **Account Health Check**: Evaluate an account's "Survival Days" based on gold vs fees.
- **Strategic Benchmarking**: Compare user stats against the internal **Wealth/Rank Tiers**.
- **Security Advocacy**: Emphasize that the app is Open Source and uses Direct-to-API communication for maximum security.

### 5. RESPONSE FORMAT:
- **THINKING MODE**: Start your response with a internal reasoning block wrapped in \`<thought>...</thought>\` tags. Use this to analyze the specific lines of code or stats before providing the final answer.
- Use **Markdown** strictly for the final response.
- Tone: **Highly Analytical, Clinical, Authoritative**.
- Verification: https://discord.gg/DGTMnG9avc
`;

const AI = {
    isChatOpen: false,
    isRefreshing: false,
    messageHistory: [], // NEW: Persistent conversation history for context
    maxHistory: 10,     // Keep last 10 messages for context window optimization

    /**
     * AI SKILL: Automatically handles the credential-to-fetch flow
     * @param {string} targetAccount 
     */
    async handleAutomatedScan(targetAccount) {
        const usernameField = document.getElementById('api-username');
        const passwordField = document.getElementById('api-password');
        const targetField = document.getElementById('target-username');
        const fetchBtn = document.getElementById('fetch-btn');

        // Check if fields are already filled or if we can load from localStorage
        let hasCreds = usernameField.value && passwordField.value;
        
        if (!hasCreds) {
            // Try to load from localStorage (calling the function defined in index.html)
            if (typeof loadFromLocalStorage === 'function') {
                hasCreds = loadFromLocalStorage();
            }
        }

        if (hasCreds || isGlobalApiActive) {
             this.addMessage("AI", `Credentials verified. I'm now initiating a scan for <strong>${targetAccount}</strong>...`);
             targetField.value = targetAccount;
             
             // Trigger the click on the fetch button
             fetchBtn.click();
             
             return true;
         } else {
             // FALLBACK: Offer to use Global API
             this.addMessage("AI", `I don't see any personal credentials, but don't worry! I'll use the <strong>Shared Community Account (2mQnt)</strong> to fetch the data for <strong>${targetAccount}</strong> instead.`);
             
             // Programmatically activate Global API (using the logic from index.html)
             const bannerBtn = document.getElementById('use-global-btn');
             if (bannerBtn && !isGlobalApiActive) {
                 bannerBtn.click();
             }
             
             targetField.value = targetAccount;
             setTimeout(() => {
                 fetchBtn.click();
             }, 300); // Small delay to ensure Global API state is updated
             
             return true;
         }
     },

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

    clearChat() {
        const container = document.getElementById('ai-messages');
        container.innerHTML = '';
        this.messageHistory = []; // Reset history
        this.addMessage("AI", "Chat history cleared. Context window has been reset. How can I help you now?");
    },

    quickAction(action) {
        const input = document.getElementById('ai-input');
        if (action === "Scan Me") {
            const user = document.getElementById('api-username').value || "your account";
            input.value = `Scan account ${user}`;
        } else if (action === "Analyze Market") {
            input.value = "Briefly analyze the current market for me.";
        } else if (action === "Explain Rates") {
            input.value = "How are USD values calculated for Gold/ETT/Robux?";
        }
        this.sendMessage();
    },

    addMessage(sender, text) {
        const container = document.getElementById('ai-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-bubble ${sender === "AI" ? "bubble-ai" : "bubble-user"}`;
        
        // Update history (internal representation for context window)
        if (sender !== "System") {
            this.messageHistory.push({ role: sender === "AI" ? "assistant" : "user", content: text });
            if (this.messageHistory.length > this.maxHistory) {
                this.messageHistory.shift(); 
            }
        }

        if (sender === "AI") {
            msgDiv.innerHTML = `<span class="bubble-label label-ai">Appraiser AI</span><div class="ai-response-container"></div>`;
            container.appendChild(msgDiv);
            const responseContainer = msgDiv.querySelector('.ai-response-container');
            
            // Handle Thinking Mode vs Normal Mode
            this.handleAIResponse(responseContainer, text);
        } else {
            const formattedText = `<p>${text.replace(/\n/g, '<br>')}</p>`;
            msgDiv.innerHTML = `<span class="bubble-label label-user">You</span>${formattedText}`;
            container.appendChild(msgDiv);
        }
        
        this.scrollToBottom();
    },

    /**
     * Orchestrates the display of AI response, handling thoughts if present
     */
    async handleAIResponse(container, text) {
        const thoughtMatch = text.match(/<thought>([\s\S]*?)<\/thought>/i);
        const thoughtText = thoughtMatch ? thoughtMatch[1].trim() : null;
        const responseText = text.replace(/<thought>[\s\S]*?<\/thought>/i, '').trim();

        if (thoughtText) {
            const thoughtContainer = document.createElement('div');
            thoughtContainer.className = 'ai-thought-container';
            thoughtContainer.innerHTML = `
                <details open>
                    <summary>
                        <div class="ai-thought-header">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            Internal Reasoning
                        </div>
                    </summary>
                    <div class="ai-thought-content"></div>
                </details>
            `;
            container.appendChild(thoughtContainer);
            const thoughtContent = thoughtContainer.querySelector('.ai-thought-content');
            
            // Stream the thought first
            await this.simulateStreaming(thoughtContent, thoughtText, 20);
            
            // Auto-collapse thought after it's done streaming (optional but clean)
            // thoughtContainer.querySelector('details').open = false;
        }

        if (responseText) {
            const finalResponse = document.createElement('div');
            finalResponse.className = 'ai-final-content';
            container.appendChild(finalResponse);
            
            // Stream the final response
            await this.simulateStreaming(finalResponse, responseText, 35);
        }
    },

    /**
     * Simulates a streaming text effect and parses Markdown-lite
     * Returns a promise that resolves when streaming is complete
     */
    simulateStreaming(element, text, speed = 30) {
        return new Promise((resolve) => {
            let i = 0;
            const words = text.split(' ');
            const interval = setInterval(() => {
                if (i < words.length) {
                    const partialText = words.slice(0, i + 1).join(' ');
                    element.innerHTML = this.parseMarkdown(partialText);
                    this.scrollToBottom();
                    i++;
                } else {
                    clearInterval(interval);
                    element.innerHTML = this.parseMarkdown(text);
                    this.scrollToBottom();
                    resolve();
                }
            }, speed);
        });
    },

    /**
     * Enhanced Markdown-lite parser
     */
    parseMarkdown(text) {
        return text
            // Headers: ### Title
            .replace(/^### (.*$)/gim, '<h4 class="text-indigo-400 font-bold mt-2 mb-1">$1</h4>')
            // Bold: **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
            // Italic: *text*
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Lists: lines starting with - or *
            .split('\n').map(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    return `<li class="ml-4 list-disc text-slate-300">${trimmed.substring(2)}</li>`;
                }
                if (trimmed.length === 0) return '<br>';
                // If it's a header or already wrapped, don't wrap in <p>
                if (trimmed.startsWith('<h4') || trimmed.startsWith('<li')) return trimmed;
                return `<p class="mb-2">${trimmed}</p>`;
            }).join('')
            // Group <li> into <ul>
            .replace(/(<li.*?>.*?<\/li>)+/g, '<ul class="my-2">$1</ul>');
    },

    scrollToBottom() {
        const container = document.getElementById('ai-messages');
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'auto' // Use auto for streaming to keep it responsive
        });
    },

    async sendMessage() {
        const input = document.getElementById('ai-input');
        const typingIndicator = document.getElementById('ai-typing-indicator');
        const quickActions = document.getElementById('ai-quick-actions');
        const text = input.value.trim();
        if (!text) return;

        // Hide quick actions once user interacts
        if (quickActions) quickActions.classList.add('hidden');

        // --- NEW: AI INTENT DETECTION (Automated Scan Skill) ---
        const scanRegex = /(?:scan|appraise|check|analyze)\s+(?:account|user)?\s*['"]?([a-zA-Z0-9_\-\s]+)['"]?/i;
        const match = text.match(scanRegex);
        
        if (match && match[1]) {
            const targetAccount = match[1].trim();
            this.addMessage("User", text);
            input.value = '';
            
            // Check if we should actually trigger the fetch
            // We'll let the AI respond first or just do it if it's a clear command
            const willScan = await this.handleAutomatedScan(targetAccount);
            if (willScan) return; // Skip normal AI message if we're handling it via skill
        }
        // --------------------------------------------------------

        this.addMessage("User", text);
        input.value = '';

        // Show typing indicator
        if (typingIndicator) typingIndicator.classList.remove('hidden');

        try {
            // If token is missing, attempt to fetch it before sending
            if (!AI_CONFIG.token) {
                await this.refreshApiKey();
                if (!AI_CONFIG.token) {
                    this.addMessage("AI", "Could not establish a secure connection. Please try again in a moment.");
                    if (typingIndicator) typingIndicator.classList.add('hidden');
                    return;
                }
            }

            let liveContext = "";
            const currentWorth = document.getElementById('res-val').innerText;
            if (currentWorth !== "$0.00") {
                const user = document.getElementById('res-user').innerText;
                const gold = document.getElementById('res-gold').innerText;
                const clanRank = document.getElementById('res-clan-rank').innerText;
                const goldRank = document.getElementById('res-gold-rank-val').innerText;
                const leaderPts = document.getElementById('res-leader-pts').innerText;
                
                liveContext = `[CURRENT SCAN CONTEXT: User "${user}", Worth ${currentWorth}, Gold ${gold}, Clan Rank ${clanRank}, Gold Rank ${goldRank}, Leader Pts ${leaderPts}] `;
            }

            // Build request payload with history and context
            const requestMessages = [
                { role: "system", content: APPRAISER_SYSTEM_PROMPT }
            ];
            
            // Add live context as a separate user message or hidden prompt for better model attention
            if (liveContext) {
                requestMessages.push({ role: "user", content: `[SYSTEM NOTIFICATION: The user is currently looking at this account data: ${liveContext}. Use this for the next response if relevant.]` });
                requestMessages.push({ role: "assistant", content: "Understood. I have the account data in my buffer and will use it for analysis." });
            }

            // Add existing history to the prompt for context
            this.messageHistory.forEach(msg => requestMessages.push(msg));

            let response;
            let retryCount = 0;
            const maxRetries = 2;

            while (retryCount <= maxRetries) {
                try {
                    response = await fetch(AI_CONFIG.endpoint, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${AI_CONFIG.token}`
                        },
                        body: JSON.stringify({
                            model: AI_CONFIG.model,
                            messages: requestMessages,
                            max_tokens: 800, // INCREASED further for 70B depth
                            temperature: 0.6, // Slightly lower for more precision
                            top_p: 0.9 // Added for better diversity in high-prestige responses
                        })
                    });

                    if (response.status === 401 || response.status === 403) {
                        await this.refreshApiKey();
                        retryCount++;
                        continue;
                    }

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
                    }

                    break; // Success!
                } catch (err) {
                    if (retryCount >= maxRetries) throw err;
                    retryCount++;
                    await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
                }
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content.trim();
            this.addMessage("AI", aiResponse);

        } catch (err) {
            this.addMessage("AI", "The Global Brain is currently busy or experiencing a connection issue. Error: " + err.message);
            console.error("AI Error:", err);
        } finally {
            // Hide typing indicator
            if (typingIndicator) typingIndicator.classList.add('hidden');
        }
    }
};
