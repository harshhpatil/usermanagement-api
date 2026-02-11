import { createEmailTransporter } from '../config/email.config.js';

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email text content
 * @param {string} options.html - Email HTML content
 */
export const sendEmail = async ({ to, subject, text, html }) => {
    const transporter = createEmailTransporter();

    if (!transporter) {
        console.warn('Email not sent: Email service not configured');
        return { success: false, message: 'Email service not configured' };
    }

    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'User Management API'}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        return { success: false, message: error.message };
    }
};

/**
 * Send email verification email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} token - Verification token
 */
export const sendVerificationEmail = async (email, name, token) => {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;

    const subject = 'Verify Your Email Address';
    const text = `Hello ${name},\n\nThank you for registering! Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Hello ${name},</p>
            <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Verify Email
                </a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
            <p style="color: #666; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
            <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
        </div>
    `;

    return await sendEmail({ to: email, subject, text, html });
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} token - Reset token
 */
export const sendPasswordResetEmail = async (email, name, token) => {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/reset-password?token=${token}`;

    const subject = 'Password Reset Request';
    const text = `Hello ${name},\n\nWe received a request to reset your password. Click the link below to reset it:\n\n${resetUrl}\n\nThis link will expire in 30 minutes.\n\nIf you didn't request a password reset, please ignore this email and your password will remain unchanged.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
            <p style="color: #666; font-size: 14px; word-break: break-all;">${resetUrl}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in 30 minutes.</p>
            <p style="color: #ff9800; font-size: 14px;"><strong>Important:</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
    `;

    return await sendEmail({ to: email, subject, text, html });
};

/**
 * Send welcome email after email verification
 * @param {string} email - User email
 * @param {string} name - User name
 */
export const sendWelcomeEmail = async (email, name) => {
    const subject = 'Welcome to User Management API!';
    const text = `Hello ${name},\n\nWelcome to User Management API! Your email has been verified successfully.\n\nYou can now enjoy all features of our platform.\n\nThank you for joining us!`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Welcome! 🎉</h2>
            <p>Hello ${name},</p>
            <p>Welcome to User Management API! Your email has been verified successfully.</p>
            <p>You can now enjoy all features of our platform.</p>
            <p>Thank you for joining us!</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                <p>If you have any questions, feel free to contact our support team.</p>
            </div>
        </div>
    `;

    return await sendEmail({ to: email, subject, text, html });
};
