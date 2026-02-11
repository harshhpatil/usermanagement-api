import { Router } from "express";
import { login, register, me, verifyEmail, forgotPassword, resetPassword } from "../controllers/authentication.controller.js";
import { authMiddleware } from "../middlewares/authMiddlware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { loginLimiter, registrationLimiter, strictLimiter } from "../middlewares/rateLimiter.middleware.js";
import { 
    registrationSchema, 
    loginSchema, 
    forgotPasswordSchema, 
    resetPasswordSchema 
} from "../utils/validators.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

// Public routes
router.post('/register', registrationLimiter, validate(registrationSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', strictLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', strictLimiter, validate(resetPasswordSchema), resetPassword);

// Protected routes
router.get('/me', authMiddleware, me);

export default router;