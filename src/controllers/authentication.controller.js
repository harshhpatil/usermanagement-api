import admin from '../models/admin.model.js';
import user from '../models/user.model.js';
import { hashPassword, comparePassword, generateToken, setAuthCookie } from '../services/auth.service.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../services/email.service.js';
import { generateVerificationToken, hashToken } from '../utils/tokenGenerator.js';
import { TOKEN_EXPIRY, HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { verifyOTP } from '../services/otp.service.js';
import { createAuditLog } from '../utils/auditLogger.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       201:
 *         description: User registered successfully
 */
export const register = asyncHandler(async (req, res) => {   
    const {name, email, password, role} = req.body;

    // Generate email verification token
    const { token, hashedToken, expiry } = generateVerificationToken(TOKEN_EXPIRY.EMAIL_VERIFICATION);

    // For admin registration
    if(role === 'admin') {
        const isAdmin = await admin.findOne({email});
        if(isAdmin) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                message: "Admin already exists."
            });
        }

        const hashedPassword = await hashPassword(password);
        const newAdmin = await admin.create({
            name, 
            email, 
            password: hashedPassword, 
            role,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: expiry
        });

        // Send verification email
        await sendVerificationEmail(email, name, token);

        // Create audit log
        await createAuditLog({
            userId: newAdmin._id,
            action: 'REGISTER',
            req,
            details: { role: 'admin' }
        });

        return res.status(HTTP_STATUS.CREATED).json({
            message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS
        });
    }

    // For user registration
    if(role === 'user') {
        const isUser = await user.findOne({email});
        if(isUser) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                message: "User already exists."
            });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await user.create({
            name, 
            email, 
            password: hashedPassword, 
            role,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: expiry
        });

        // Send verification email
        await sendVerificationEmail(email, name, token);

        // Create audit log
        await createAuditLog({
            userId: newUser._id,
            action: 'REGISTER',
            req,
            details: { role: 'user' }
        });

        return res.status(HTTP_STATUS.CREATED).json({
            message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS
        });
    }

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid role specified"
    });
});

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify user email
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: "Verification token is required"
        });
    }

    const hashedToken = hashToken(token);

    // Check in user collection
    let foundUser = await user.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
    });

    // Check in admin collection if not found in user
    if (!foundUser) {
        foundUser = await admin.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });
    }

    if (!foundUser) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: ERROR_MESSAGES.INVALID_TOKEN
        });
    }

    // Update user
    foundUser.isEmailVerified = true;
    foundUser.emailVerificationToken = undefined;
    foundUser.emailVerificationExpires = undefined;
    await foundUser.save();

    // Send welcome email
    await sendWelcomeEmail(foundUser.email, foundUser.name);

    // Create audit log
    await createAuditLog({
        userId: foundUser._id,
        action: 'EMAIL_VERIFIED',
        req
    });

    return res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.EMAIL_VERIFIED
    });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
export const login = asyncHandler(async (req, res) => {
    const {email, password, role, otp} = req.body;

    // For admin login
    if (role === 'admin') {
        const isAdmin = await admin.findOne({email});
        
        if (!isAdmin) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        const isPasswordValid = await comparePassword(password, isAdmin.password);
        if (!isPasswordValid) {
            // Log failed attempt
            await createAuditLog({
                userId: isAdmin._id,
                action: 'FAILED_LOGIN_ATTEMPT',
                req
            });
            
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        // Check email verification
        if (!isAdmin.isEmailVerified) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED
            });
        }

        // Check 2FA if enabled
        if (isAdmin.twoFactorEnabled) {
            if (!otp) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    message: "2FA is enabled. Please provide OTP",
                    requires2FA: true
                });
            }

            const isOTPValid = verifyOTP(otp, isAdmin.twoFactorSecret);
            if (!isOTPValid) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    message: "Invalid OTP"
                });
            }
        }

        // Update last login
        isAdmin.lastLogin = new Date();
        await isAdmin.save();

        const token = generateToken({userid: isAdmin._id, role: isAdmin.role});
        setAuthCookie(res, token);

        // Create audit log
        await createAuditLog({
            userId: isAdmin._id,
            action: 'LOGIN',
            req
        });

        return res.status(HTTP_STATUS.OK).json({ 
            message: SUCCESS_MESSAGES.LOGIN_SUCCESS, 
            user: { 
                name: isAdmin.name,
                email: isAdmin.email,
                role: isAdmin.role
            }, 
            token 
        });
    }

    // For user login
    if (role === 'user') {
        const isUser = await user.findOne({email});
        
        if (!isUser) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        const isPasswordValid = await comparePassword(password, isUser.password);
        if (!isPasswordValid) {
            // Log failed attempt
            await createAuditLog({
                userId: isUser._id,
                action: 'FAILED_LOGIN_ATTEMPT',
                req
            });
            
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: ERROR_MESSAGES.INVALID_CREDENTIALS
            });
        }

        // Check email verification
        if (!isUser.isEmailVerified) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED
            });
        }

        // Check 2FA if enabled
        if (isUser.twoFactorEnabled) {
            if (!otp) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    message: "2FA is enabled. Please provide OTP",
                    requires2FA: true
                });
            }

            const isOTPValid = verifyOTP(otp, isUser.twoFactorSecret);
            if (!isOTPValid) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    message: "Invalid OTP"
                });
            }
        }

        // Update last login
        isUser.lastLogin = new Date();
        await isUser.save();

        const token = generateToken({userid: isUser._id, role: isUser.role});
        setAuthCookie(res, token);

        // Create audit log
        await createAuditLog({
            userId: isUser._id,
            action: 'LOGIN',
            req
        });

        return res.status(HTTP_STATUS.OK).json({ 
            message: SUCCESS_MESSAGES.LOGIN_SUCCESS, 
            user: { 
                name: isUser.name,
                email: isUser.email,
                role: isUser.role
            }, 
            token 
        });
    }

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid role specified"
    });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 */
export const me = asyncHandler(async (req, res) => {
    const { userid, role } = req.user.decoded;

    if (role === 'admin') {
        const adminUser = await admin.findById(userid).select('-password -emailVerificationToken -passwordResetToken -twoFactorSecret -backupCodes');
        if (!adminUser) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ 
                message: ERROR_MESSAGES.USER_NOT_FOUND 
            });
        }
        return res.status(HTTP_STATUS.OK).json({ user: adminUser });
    }

    if (role === 'user') {
        const normalUser = await user.findById(userid).select('-password -emailVerificationToken -passwordResetToken -twoFactorSecret -backupCodes');
        if (!normalUser) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ 
                message: ERROR_MESSAGES.USER_NOT_FOUND 
            });
        }
        return res.status(HTTP_STATUS.OK).json({ user: normalUser });
    }

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid role"
    });
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Check in user collection
    let foundUser = await user.findOne({ email });

    // Check in admin collection if not found
    if (!foundUser) {
        foundUser = await admin.findOne({ email });
    }

    // Always return success to prevent email enumeration
    if (!foundUser) {
        return res.status(HTTP_STATUS.OK).json({
            message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT
        });
    }

    // Generate password reset token
    const { token, hashedToken, expiry } = generateVerificationToken(TOKEN_EXPIRY.PASSWORD_RESET);

    foundUser.passwordResetToken = hashedToken;
    foundUser.passwordResetExpires = expiry;
    await foundUser.save();

    // Send password reset email
    await sendPasswordResetEmail(foundUser.email, foundUser.name, token);

    // Create audit log
    await createAuditLog({
        userId: foundUser._id,
        action: 'PASSWORD_RESET_REQUESTED',
        req
    });

    return res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT
    });
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    const hashedToken = hashToken(token);

    // Check in user collection
    let foundUser = await user.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // Check in admin collection if not found
    if (!foundUser) {
        foundUser = await admin.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
    }

    if (!foundUser) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: ERROR_MESSAGES.INVALID_TOKEN
        });
    }

    // Update password
    foundUser.password = await hashPassword(password);
    foundUser.passwordResetToken = undefined;
    foundUser.passwordResetExpires = undefined;
    await foundUser.save();

    // Create audit log
    await createAuditLog({
        userId: foundUser._id,
        action: 'PASSWORD_RESET_COMPLETED',
        req
    });

    return res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS
    });
});