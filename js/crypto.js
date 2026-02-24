/**
 * Cryptography Utility
 * Implements Client-Side AES-GCM + RSA-OAEP Hybrid Encryption.
 */

class CryptoUtils {
    constructor() {
        this.config = {
            // RSA Public Key (2048-bit)
            serverPublicKeyPem: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...INSERT_REAL_KEY_HERE...
-----END PUBLIC KEY-----`
        };
    }

    /**
     * Converts a binary string to an ArrayBuffer.
     * @param {string} str - Binary string.
     * @returns {ArrayBuffer}
     */
    str2ab(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    /**
     * Converts an ArrayBuffer to a Base64 string.
     * @param {ArrayBuffer} buffer 
     * @returns {string}
     */
    ab2str(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    /**
     * Imports a PEM-formatted RSA public key.
     * @param {string} pem 
     * @returns {Promise<CryptoKey>}
     */
    async importPublicKey(pem) {
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = pem.substring(
            pem.indexOf(pemHeader) + pemHeader.length,
            pem.indexOf(pemFooter)
        ).replace(/\n/g, "").replace(/\r/g, "");
        
        const binaryDerString = window.atob(pemContents);
        const binaryDer = this.str2ab(binaryDerString);

        return await window.crypto.subtle.importKey(
            "spki",
            binaryDer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["encrypt"]
        );
    }

    /**
     * Encrypts a JSON payload.
     * 1. Generates ephemeral AES-256-GCM key.
     * 2. Encrypts data with AES key.
     * 3. Encrypts AES key with Server RSA Public Key.
     * @param {Object} data 
     * @returns {Promise<{encryptedKey: string, iv: string, ciphertext: string}>}
     */
    async encryptPayload(data) {
        try {
            const jsonString = JSON.stringify(data);
            const encodedData = new TextEncoder().encode(jsonString);

            // 1. Generate AES Session Key
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
            const serverKey = await this.importPublicKey(this.config.serverPublicKeyPem);
            const exportedSessionKey = await window.crypto.subtle.exportKey("raw", sessionKey);
            const encryptedSessionKey = await window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                serverKey,
                exportedSessionKey
            );

            return {
                encryptedKey: this.ab2str(encryptedSessionKey),
                iv: this.ab2str(iv),
                ciphertext: this.ab2str(encryptedContent)
            };

        } catch (error) {
            console.error("Encryption Failed:", error);
            throw new Error("Security Error: Payload encryption failed.");
        }
    }
}

const cryptoInstance = new CryptoUtils();
export default cryptoInstance;
