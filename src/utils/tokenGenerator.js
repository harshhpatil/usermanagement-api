import crypto from 'crypto';

/**
 * Generate a secure random token for email verification or password reset
 * @param {number} length - Token length (default: 32 bytes)
 * @returns {string} - Hex encoded token
 */
export const generateSecureToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a hash of a token for secure storage
 * @param {string} token - Token to hash
 * @returns {string} - SHA-256 hash of token
 */
export const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a verification token with expiry
 * @param {number} expiryMs - Expiry time in milliseconds
 * @returns {Object} - Token object with token and expiry
 */
export const generateVerificationToken = (expiryMs) => {
    const token = generateSecureToken();
    const hashedToken = hashToken(token);
    const expiry = new Date(Date.now() + expiryMs);
    
    return {
        token, // Plain token to send to user
        hashedToken, // Hashed token to store in database
        expiry
    };
};
