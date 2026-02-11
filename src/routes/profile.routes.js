import { Router } from "express";
import { 
    updateProfile, 
    changePassword, 
    deleteAccount,
    enable2FA,
    verify2FA,
    disable2FA,
    getActivityLogs
} from "../controllers/profile.controller.js";
import { authMiddleware } from "../middlewares/authMiddlware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { generalLimiter } from "../middlewares/rateLimiter.middleware.js";
import { 
    updateProfileSchema, 
    changePasswordSchema,
    enable2FASchema,
    twoFactorAuthSchema
} from "../utils/validators.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management endpoints
 */

// All profile routes require authentication
router.use(authMiddleware);
router.use(generalLimiter);

// Profile management
router.put('/update', validate(updateProfileSchema), updateProfile);
router.put('/change-password', validate(changePasswordSchema), changePassword);
router.delete('/delete-account', deleteAccount);

// 2FA management
router.post('/enable-2fa', validate(enable2FASchema), enable2FA);
router.post('/verify-2fa', validate(twoFactorAuthSchema), verify2FA);
router.post('/disable-2fa', validate(enable2FASchema), disable2FA);

// Activity logs
router.get('/activity-logs', getActivityLogs);

export default router;
