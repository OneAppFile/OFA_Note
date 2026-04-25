/**
 * init cryptography.
 *
 * @homepage https://ocno.de/
 * @copyright 2026 Naki Dal Gelo
 * @Licensed under MIT
 */
const Cryptography = function()
{
    /**
     * generate string hash.
     * @returns {string}
     */
    this.getHash = function (word)
    {
        let hash = 0;

        if (!word) {
            return '';
        }

        for (const char of word) {
            hash = Math.trunc((hash << 5) - hash + char.codePointAt(0)); // Constrain to 32bit integer
        }

        return hash + '';
    };

    /**
     * return encrypted text.
     * @param {string} text
     * @param {string} pass
     * @returns {string}
     */
    this.encrypt = async function (text, pass) {
        const enc = new TextEncoder(),
            salt = globalThis.crypto.getRandomValues(new Uint8Array(16)),
            iv = globalThis.crypto.getRandomValues(new Uint8Array(12)),
            dataBytes = enc.encode(text),
            key = await this._deriveKey(pass.toString(), salt, ["encrypt"]),
            encryptedData = await globalThis.crypto.subtle.encrypt({name: "AES-GCM", iv}, key, dataBytes),
            result = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);

        result.set(salt, 0);
        result.set(iv, salt.length);
        result.set(new Uint8Array(encryptedData), salt.length + iv.length);

        return this._arrayBufferToHex(result.buffer);
    };

    /**
     * return decrypted text.
     * @param {string} text
     * @param {string} pass
     * @returns {string}
     */
    this.decrypt = async function (text, pass) {
        if (text === '') {
            return '';
        }

        const dec = new TextDecoder(),
            content = this._hexToUint8Array(text),
            salt = content.slice(0, 16),
            iv = content.slice(16, 28),
            data = content.slice(28),
            key = await this._deriveKey(pass.toString(), salt, ["decrypt"]),
            decryptedData = await globalThis.crypto.subtle.decrypt({name: "AES-GCM", iv}, key, data);

        return dec.decode(decryptedData);
    };

    /**
     * Converts an ArrayBuffer to a hexadecimal string.
     * @param {ArrayBuffer} buffer - The buffer to convert.
     * @returns {string} The hexadecimal representation of the buffer.
     */
    this._arrayBufferToHex = function (buffer)
    {
        return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    };

    /**
     * Converts a hexadecimal string to a Uint8Array.
     * @param {string} hexString - The hexadecimal string to convert.
     * @returns {Uint8Array} The resulting Uint8Array.
     */
    this._hexToUint8Array = function (hexString)
    {
        return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => Number.parseInt(byte, 16)));
    };

    /**
     * Derives a cryptographic key from a password using PBKDF2.
     * @param {string} password - The password to derive the key from.
     * @param {Uint8Array} salt - The salt for key derivation.
     * @param {string[]} keyUsage - The intended usage of the key (e.g., ["encrypt"] or ["decrypt"]).
     * @returns {Promise<CryptoKey>} A promise that resolves to the derived key.
     */
    this._deriveKey = async (password, salt, keyUsage) => {
        const enc = new TextEncoder(),
            keyMaterial = await globalThis.crypto.subtle.importKey(
                "raw",
                enc.encode(password), {name: "PBKDF2"},
                false,
                ["deriveBits", "deriveKey"]
            );

        return globalThis.crypto.subtle.deriveKey(
            {name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256"},
            keyMaterial, {name: "AES-GCM", length: 256},
            false,
            keyUsage
        );
    };
};
