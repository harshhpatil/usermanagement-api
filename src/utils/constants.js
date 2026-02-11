// Application constants
export const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user'
};

export const TOKEN_TYPES = {
    EMAIL_VERIFICATION: 'email_verification',
    PASSWORD_RESET: 'password_reset'
};

export const TOKEN_EXPIRY = {
    EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
    PASSWORD_RESET: 30 * 60 * 1000, // 30 minutes
    ACCESS_TOKEN: '1d' // 1 day
};

export const RATE_LIMITS = {
    LOGIN: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5 // 5 attempts
    },
    REGISTRATION: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3 // 3 attempts
    },
    GENERAL: {
        windowMs: 60 * 1000, // 1 minute
        max: 10 // 10 requests
    }
};

export const PASSWORD_STRENGTH = {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

export const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User already exists',
    EMAIL_NOT_VERIFIED: 'Email not verified. Please verify your email',
    INVALID_TOKEN: 'Invalid or expired token',
    UNAUTHORIZED: 'Unauthorized access',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    VALIDATION_ERROR: 'Validation error',
    WEAK_PASSWORD: 'Password does not meet strength requirements'
};

export const SUCCESS_MESSAGES = {
    REGISTRATION_SUCCESS: 'Registration successful. Please check your email for verification',
    LOGIN_SUCCESS: 'Login successful',
    EMAIL_VERIFIED: 'Email verified successfully',
    PASSWORD_RESET_EMAIL_SENT: 'Password reset link sent to your email',
    PASSWORD_RESET_SUCCESS: 'Password reset successful',
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    ACCOUNT_DELETED: 'Account deleted successfully',
    TWO_FA_ENABLED: '2FA enabled successfully',
    TWO_FA_DISABLED: '2FA disabled successfully'
};
