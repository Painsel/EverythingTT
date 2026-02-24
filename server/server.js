/**
 * EverythingTT Server (Vercel Serverless Compatible)
 * Implements E2EE Decryption, GitHub DB Interface, and Territorial.io Proxy.
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { Octokit } = require("@octokit/rest");
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const CONFIG = {
    territorialApi: 'https://territorial.io/api',
    githubRepoOwner: process.env.GITHUB_REPO_OWNER || 'painsel',
    githubRepoName: process.env.GITHUB_REPO_NAME || 'EverythingTT-DB',
    githubToken: process.env.GITHUB_PAT,
    // Server Private Key (RSA) - In production, this comes from ENV
    serverPrivateKey: process.env.SERVER_PRIVATE_KEY,
    // Internal DB Encryption Key (AES)
    dbEncryptionKey: process.env.DB_ENCRYPTION_KEY || 'development_secret_key_32_bytes!!' 
};

// Initialize GitHub API Client
const octokit = new Octokit({ auth: CONFIG.githubToken });

// --- Security Helpers ---

/**
 * Decrypts the incoming payload using Hybrid Decryption (RSA + AES)
 */
async function decryptPayload(body) {
    const { encryptedKey, iv, ciphertext } = body;
    
    if (!encryptedKey || !iv || !ciphertext) {
        throw new Error("Invalid encrypted payload format");
    }

    // 1. Decrypt AES Session Key using Server Private Key
    const sessionKeyBuffer = crypto.privateDecrypt(
        {
            key: CONFIG.serverPrivateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        Buffer.from(encryptedKey, 'base64')
    );

    // 2. Decrypt Content using Session Key
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm', 
        sessionKeyBuffer, 
        Buffer.from(iv, 'base64')
    );
    
    // In a real implementation, GCM auth tag should be appended or sent separately.
    // For simplicity here, assuming standard AES-GCM decryption without explicit tag handling 
    // or assuming tag is appended to ciphertext (common in some libs, but node crypto requires setAuthTag).
    // *Correction*: Node's crypto requires setAuthTag for GCM. 
    // We will assume for this mock that the client sends 'ciphertext' which includes the tag at the end 
    // OR we simplify to AES-CBC for this demo if GCM complexity is too high without a library helper.
    // However, user asked for AES-GCM. 
    // To fix: We'll assume the client appends the 16-byte tag to the ciphertext.
    
    const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
    const authTag = ciphertextBuffer.slice(ciphertextBuffer.length - 16);
    const actualCiphertext = ciphertextBuffer.slice(0, ciphertextBuffer.length - 16);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(actualCiphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return JSON.parse(decrypted.toString('utf8'));
}

// --- Routes ---

// 1. Territorial.io Proxy (Gold)
app.post('/api/gold/send', async (req, res) => {
    try {
        // E2EE Decryption (In production, enable this. For dev/demo, we allow plaintext fallback)
        let payload = req.body;
        if (req.body.encryptedKey) {
            payload = await decryptPayload(req.body);
        }

        const response = await fetch(`${CONFIG.territorialApi}/gold/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Gold Send Error:', error);
        res.status(500).json({ error: 'Transaction failed', details: error.message });
    }
});

// 2. OpenGraph Proxy
app.get('/api/og', (req, res) => {
    const { path } = req.query; // e.g., news/article-name
    // In a real app, fetch metadata from DB based on path
    const title = "EverythingTT Article"; 
    const description = "Check out this amazing content on EverythingTT.";
    const image = "https://painsel.github.io/EverythingTT/assets/og-image.jpg";
    const redirectUrl = `https://painsel.github.io/EverythingTT/${path || ''}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta property="og:title" content="${title}" />
            <meta property="og:description" content="${description}" />
            <meta property="og:image" content="${image}" />
            <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
        </head>
        <body>
            <p>Redirecting to <a href="${redirectUrl}">${redirectUrl}</a>...</p>
        </body>
        </html>
    `;
    res.send(html);
});

// 3. Database Interaction (GitHub Helper Repo)
// Helper to get path from type
const getDbPath = (type, id) => {
    const map = {
        'user': `db/users/${id}`,
        'item': `db/marketplace/${id}`,
        'inventory': `db/inventory/${id}`,
        'video': `db/tube/videos/${id}`,
        'article': `db/news/${id}`,
        'trade': `db/economy/trades/${id}`
    };
    return map[type] || `db/misc/${id}`;
};

app.post('/api/db/write', async (req, res) => {
    try {
        let payload = req.body;
        if (req.body.encryptedKey) {
            payload = await decryptPayload(req.body);
        }

        const { type, id, data } = payload;
        const path = getDbPath(type, id);
        
        // Fetch existing SHA
        let sha;
        try {
            const { data: existing } = await octokit.repos.getContent({
                owner: CONFIG.githubRepoOwner,
                repo: CONFIG.githubRepoName,
                path: `${path}.json`
            });
            sha = existing.sha;
        } catch (e) {}

        // Commit to GitHub with Optimistic Concurrency Control (Retries)
        const MAX_RETRIES = 3;
        let attempts = 0;
        let success = false;

        while (attempts < MAX_RETRIES && !success) {
            try {
                // Fetch latest SHA immediately before write
                let currentSha = sha;
                if (attempts > 0) {
                     try {
                        const { data: latest } = await octokit.repos.getContent({
                            owner: CONFIG.githubRepoOwner,
                            repo: CONFIG.githubRepoName,
                            path: `${path}.json`
                        });
                        currentSha = latest.sha;
                    } catch (e) {}
                }

                await octokit.repos.createOrUpdateFileContents({
                    owner: CONFIG.githubRepoOwner,
                    repo: CONFIG.githubRepoName,
                    path: `${path}.json`,
                    message: `Update ${type} ${id}`,
                    content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
                    sha: currentSha
                });
                success = true;
            } catch (error) {
                if (error.status === 409) {
                    console.warn(`Concurrency Conflict (409) on attempt ${attempts + 1}. Retrying...`);
                    attempts++;
                    // Optional: Add small delay
                    await new Promise(r => setTimeout(r, 200));
                } else {
                    throw error; // Fatal error
                }
            }
        }

        if (!success) throw new Error("Max retries exceeded for DB Write");

        res.json({ success: true });
    } catch (error) {
        console.error('DB Write Error:', error);
        res.status(500).json({ error: 'Database operation failed' });
    }
});

app.get('/api/db/read', async (req, res) => {
    try {
        const { type, id } = req.query;
        const path = getDbPath(type, id);
        
        const { data } = await octokit.repos.getContent({
            owner: CONFIG.githubRepoOwner,
            repo: CONFIG.githubRepoName,
            path: `${path}.json`
        });
        
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        res.json(JSON.parse(content));
    } catch (error) {
        res.status(404).json({ error: 'Not found' });
    }
});

// 4. Supabase Signed URL Generator (Mock)
app.post('/api/upload/sign', async (req, res) => {
    try {
        // In production, use supabase-js admin client to generate signed upload URL
        // const { data, error } = await supabase.storage.from('videos').createSignedUploadUrl(req.body.path);
        
        // Mock Response
        const mockUrl = `https://xyz.supabase.co/storage/v1/object/public/videos/${req.body.fileName}?token=mock_token`;
        res.json({ url: mockUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate signed URL' });
    }
});

// Vercel Entry Point
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}
