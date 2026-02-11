import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants.js';

/**
 * Rate limiter for login attempts
 */
export const loginLimiter = rateLimit({
    windowMs: RATE_LIMITS.LOGIN.windowMs,
    max: RATE_LIMITS.LOGIN.max,
    message: {
        message: `Too many login attempts. Please try again after ${RATE_LIMITS.LOGIN.windowMs / 60000} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false
});

/**
 * Rate limiter for registration
 */
export const registrationLimiter = rateLimit({
    windowMs: RATE_LIMITS.REGISTRATION.windowMs,
    max: RATE_LIMITS.REGISTRATION.max,
    message: {
        message: `Too many registration attempts. Please try again after ${RATE_LIMITS.REGISTRATION.windowMs / 3600000} hour(s)`
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * General rate limiter for API endpoints
 */
export const generalLimiter = rateLimit({
    windowMs: RATE_LIMITS.GENERAL.windowMs,
    max: RATE_LIMITS.GENERAL.max,
    message: {
        message: `Too many requests. Please try again after ${RATE_LIMITS.GENERAL.windowMs / 1000} seconds`
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

/**
 * Strict rate limiter for sensitive operations (password reset, etc.)
 */
export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    message: {
        message: 'Too many requests for this operation. Please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});
