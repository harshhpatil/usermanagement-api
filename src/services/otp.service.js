import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate a secret for 2FA
 * @param {string} email - User email
 * @returns {Object} - Secret object with base32 and otpauth_url
 */
export const generate2FASecret = (email) => {
    const secret = speakeasy.generateSecret({
        name: `User Management API (${email})`,
        issuer: 'User Management API'
    });

    return {
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url
    };
};

/**
 * Generate QR code for 2FA setup
 * @param {string} otpauthUrl - OTP auth URL
 * @returns {Promise<string>} - QR code data URL
 */
export const generateQRCode = async (otpauthUrl) => {
    try {
        return await qrcode.toDataURL(otpauthUrl);
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Verify OTP token
 * @param {string} token - OTP token to verify
 * @param {string} secret - User's 2FA secret
 * @returns {boolean} - True if token is valid
 */
export const verifyOTP = (token, secret) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps before/after for clock skew
    });
};

/**
 * Generate backup codes for 2FA
 * @param {number} count - Number of backup codes to generate
 * @returns {Array<string>} - Array of backup codes
 */
export const generateBackupCodes = (count = 8) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        // Generate 8-character alphanumeric codes using crypto.randomBytes
        const bytes = crypto.randomBytes(6);
        const code = bytes.toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase();
        codes.push(code);
    }
    return codes;
};

/**
 * Verify backup code
 * @param {string} code - Backup code to verify
 * @param {Array<string>} backupCodes - Array of hashed backup codes
 * @returns {Object} - Result with isValid and remainingCodes
 */
export const verifyBackupCode = async (code, backupCodes) => {
    const bcrypt = (await import('bcrypt')).default;
    
    for (let i = 0; i < backupCodes.length; i++) {
        const isMatch = await bcrypt.compare(code, backupCodes[i]);
        if (isMatch) {
            // Remove used backup code
            const remainingCodes = [...backupCodes];
            remainingCodes.splice(i, 1);
            return { isValid: true, remainingCodes };
        }
    }
    
    return { isValid: false, remainingCodes: backupCodes };
};
