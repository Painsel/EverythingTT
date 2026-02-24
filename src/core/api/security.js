/**
 * Security Module (Client-Side)
 * Handles AES-GCM Key Generation and RSA Encryption of Payloads.
 */

const Security = {
    config: {
        serverPublicKeyPem: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...INSERT_REAL_KEY_HERE...
-----END PUBLIC KEY-----`
    },

    utils: {
        strmM2ArrayBuffer: (str) => {
            const buf = new ArrayBuffer(str.length);
            const bufView = new Uint8Array(buf);
            for (let i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        },
        
        arrayBufferToBase64: (buffer) => {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        },

        importPublicKey: async (pem) => {
            const pemHeader = "-----BEGIN PUBLIC KEY-----";
            const pemFooter = "-----END PUBLIC KEY-----";
            const pemContents = pem.substring(
                pem.indexOf(pemHeader) + pemHeader.length,
                pem.indexOf(pemFooter)
            ).replace(/\n/g, "").replace(/\r/g, "");
            
            const binaryDerString = window.atob(pemContents);
            const binaryDer = Security.utils.strmM2ArrayBuffer(binaryDerString);

            return await window.crypto.subtle.importKey(
                "spki",
                binaryDer,
                { name: "RSA-OAEP", hash: "SHA-256" },
                true,
                ["encrypt"]
            );
        }
    },

    encryptPayload: async (data) => {
        try {
            const jsonString = JSON.stringify(data);
            const encodedData = new TextEncoder().encode(jsonString);

            // 1. Generate AES-GCM Session Key
            const sessionKey = await window.crypto.subtle.generateKey(
                { name: "AES-GCM", length: 256 },
                true,
                ["encrypt", "decrypt"]
            );

            // 2. Encrypt Data
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encryptedContent = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                sessionKey,
                encodedData
            );

            // 3. Encrypt Session Key
            const serverKey = await Security.utils.importPublicKey(Security.config.serverPublicKeyPem);
            const exportedSessionKey = await window.crypto.subtle.exportKey("raw", sessionKey);
            const encryptedSessionKey = await window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                serverKey,
                exportedSessionKey
            );

            return {
                encryptedKey: Security.utils.arrayBufferToBase64(encryptedSessionKey),
                iv: Security.utils.arrayBufferToBase64(iv),
                ciphertext: Security.utils.arrayBufferToBase64(encryptedContent)
            };

        } catch (error) {
            console.error("Encryption Failed:", error);
            throw new Error("Security Error: Could not encrypt payload.");
        }
    }
};

export default Security;
