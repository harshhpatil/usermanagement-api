import Joi from 'joi';
import { PASSWORD_STRENGTH } from './constants.js';

// Password validation schema
const passwordSchema = Joi.string()
    .min(PASSWORD_STRENGTH.MIN_LENGTH)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
        'string.min': `Password must be at least ${PASSWORD_STRENGTH.MIN_LENGTH} characters long`,
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
        'any.required': 'Password is required'
    });

// User registration validation
export const registrationSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name cannot exceed 50 characters',
            'any.required': 'Name is required'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    password: passwordSchema,
    role: Joi.string()
        .valid('admin', 'user')
        .default('user')
        .messages({
            'any.only': 'Role must be either admin or user'
        })
});

// User login validation
export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        }),
    role: Joi.string()
        .valid('admin', 'user')
        .required()
        .messages({
            'any.only': 'Role must be either admin or user',
            'any.required': 'Role is required'
        }),
    otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .optional()
        .messages({
            'string.length': 'OTP must be exactly 6 digits',
            'string.pattern.base': 'OTP must contain only numbers'
        })
});

// Email verification validation
export const emailVerificationSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'any.required': 'Verification token is required'
        })
});

// Forgot password validation
export const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
});

// Reset password validation
export const resetPasswordSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'any.required': 'Reset token is required'
        }),
    password: passwordSchema
});

// Update profile validation
export const updateProfileSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name cannot exceed 50 characters'
        }),
    email: Joi.string()
        .email()
        .optional()
        .messages({
            'string.email': 'Please provide a valid email address'
        })
});

// Change password validation
export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'any.required': 'Current password is required'
        }),
    newPassword: passwordSchema
});

// 2FA validation
export const twoFactorAuthSchema = Joi.object({
    otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
            'string.length': 'OTP must be exactly 6 digits',
            'string.pattern.base': 'OTP must contain only numbers',
            'any.required': 'OTP is required'
        })
});

// Enable 2FA validation
export const enable2FASchema = Joi.object({
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required to enable 2FA'
        })
});
