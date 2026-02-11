import user from '../models/user.model.js';
import admin from '../models/admin.model.js';
import { hashPassword, comparePassword, clearAuthCookie } from '../services/auth.service.js';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { createAuditLog, getUserAuditLogs } from '../utils/auditLogger.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { generate2FASecret, generateQRCode, verifyOTP, generateBackupCodes } from '../services/otp.service.js';
import bcrypt from 'bcrypt';

/**
 * @swagger
 * /api/profile/update:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { userid, role } = req.user.decoded;
    const { name, email } = req.body;

    const Model = role === 'admin' ? admin : user;
    const foundUser = await Model.findById(userid);

    if (!foundUser) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: ERROR_MESSAGES.USER_NOT_FOUND
        });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== foundUser.email) {
        const emailExists = await Model.findOne({ email });
        if (emailExists) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                message: "Email already in use"
            });
        }
        foundUser.email = email;
        // Reset email verification if email is changed
        foundUser.isEmailVerified = false;
    }

    if (name) {
        foundUser.name = name;
    }

    await foundUser.save();

    // Create audit log
    await createAuditLog({
        userId: foundUser._id,
        action: 'PROFILE_UPDATED',
        req,
        details: { name, email }
    });

    return res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.PROFILE_UPDATED,
        user: {
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role
        }
    });
});

/**
 * @swagger
 * /api/profile/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
export const changePassword = asyncHandler(async (req, res) => {
    const { userid, role } = req.user.decoded;
    const { currentPassword, newPassword } = req.body;

    const Model = role === 'admin' ? admin : user;
    const foundUser = await Model.findById(userid);

    if (!foundUser) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: ERROR_MESSAGES.USER_NOT_FOUND
        });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, foundUser.password);
    if (!isPasswordValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: "Current password is incorrect"
        });
    }

    // Update password
    foundUser.password = await hashPassword(newPassword);
    await foundUser.save();

    // Create audit log
    await createAuditLog({
        userId: foundUser._id,
        action: 'PASSWORD_CHANGED',
        req
    });

    return res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.PASSWORD_CHANGED
    });
});

/**
 * @swagger
 * /api/profile/delete-account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
export const deleteAccount = asyncHandler(async (req, res) => {
    const { userid, role } = req.user.decoded;
    const { password } = req.body;

    const Model = role === 'admin' ? admin : user;
    const foundUser = await Model.findById(userid);

    if (!foundUser) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: ERROR_MESSAGES.USER_NOT_FOUND
        });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, foundUser.password);
    if (!isPasswordValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: "Incorrect password"
        });
    }

    // Create audit log before deletion
    await createAuditLog({
        userId: foundUser._id,
        action: 'ACCOUNT_DELETED',
        req
    });

    // Delete user
    await Model.findByIdAndDelete(userid);

    // Clear auth cookie
    clearAuthCookie(res);

    return res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.ACCOUNT_DELETED
    });
});

/**
 * @swagger
 * /api/profile/enable-2fa:
 *   post:
 *     summary: Enable two-factor authentication
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA setup information returned
 */
export const enable2FA = asyncHandler(async (req, res) => {
    const { userid, role } = req.user.decoded;
    const { password } = req.body;

    const Model = role === 'admin' ? admin : user;
    const foundUser = await Model.findById(userid);

    if (!foundUser) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: ERROR_MESSAGES.USER_NOT_FOUND
        });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, foundUser.password);
    if (!isPasswordValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: "Incorrect password"
        });
    }

    if (foundUser.twoFactorEnabled) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: "2FA is already enabled"
        });
    }

    // Generate 2FA secret
    const { secret, otpauthUrl } = generate2FASecret(foundUser.email);
    const qrCode = await generateQRCode(otpauthUrl);

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = await Promise.all(
        backupCodes.map(code => bcrypt.hash(code, 10))
    );

    // Store secret and backup codes (not yet enabled)
    foundUser.twoFactorSecret = secret;
    foundUser.backupCodes = hashedBackupCodes;
    await foundUser.save();

    return res.status(HTTP_STATUS.OK).json({
        message: "Scan the QR code with your authenticator app and verify with OTP to enable 2FA",
        qrCode,
        secret,
        backupCodes // Return plain backup codes to user (only this once)
    });
});

/**
 * @swagger
 * /api/profile/verify-2fa:
 *   post:
 *     summary: Verify and activate two-factor authentication
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 */
export const verify2FA = asyncHandler(async (req, res) => {
    const { userid, role } = req.user.decoded;
    const { otp } = req.body;

    const Model = role === 'admin' ? admin : user;
    const foundUser = await Model.findById(userid);

    if (!foundUser) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: ERROR_MESSAGES.USER_NOT_FOUND
        });
    }

    if (!foundUser.twoFactorSecret) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: "2FA setup not initiated. Please call enable-2fa first"
        });
    }

    // Verify OTP
    const isOTPValid = verifyOTP(otp, foundUser.twoFactorSecret);
    if (!isOTPValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: "Invalid OTP"
        });
    }

    // Enable 2FA
    foundUser.twoFactorEnabled = true;
    await foundUser.save();

    // Create audit log
    await createAuditLog({
        userId: foundUser._id,
        action: '2FA_ENABLED',
        req
    });

    return res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.TWO_FA_ENABLED
    });
});

/**
 * @swagger
 * /api/profile/disable-2fa:
 *   post:
 *     summary: Disable two-factor authentication
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 */
export const disable2FA = asyncHandler(async (req, res) => {
    const { userid, role } = req.user.decoded;
    const { password } = req.body;

    const Model = role === 'admin' ? admin : user;
    const foundUser = await Model.findById(userid);

    if (!foundUser) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: ERROR_MESSAGES.USER_NOT_FOUND
        });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, foundUser.password);
    if (!isPasswordValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: "Incorrect password"
        });
    }

    if (!foundUser.twoFactorEnabled) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: "2FA is not enabled"
        });
    }

    // Disable 2FA
    foundUser.twoFactorEnabled = false;
    foundUser.twoFactorSecret = undefined;
    foundUser.backupCodes = [];
    await foundUser.save();

    // Create audit log
    await createAuditLog({
        userId: foundUser._id,
        action: '2FA_DISABLED',
        req
    });

    return res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.TWO_FA_DISABLED
    });
});

/**
 * @swagger
 * /api/profile/activity-logs:
 *   get:
 *     summary: Get user activity logs
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of logs to retrieve
 *     responses:
 *       200:
 *         description: Activity logs retrieved successfully
 */
export const getActivityLogs = asyncHandler(async (req, res) => {
    const { userid } = req.user.decoded;
    const limit = parseInt(req.query.limit) || 50;

    const logs = await getUserAuditLogs(userid, limit);

    return res.status(HTTP_STATUS.OK).json({
        logs,
        count: logs.length
    });
});
