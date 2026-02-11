import nodemailer from 'nodemailer';

/**
 * Email configuration using nodemailer
 */
export const createEmailTransporter = () => {
    // Check if email is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email configuration missing. Email functionality will be disabled.');
        return null;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    return transporter;
};

/**
 * Verify email transporter configuration
 */
export const verifyEmailConfig = async () => {
    const transporter = createEmailTransporter();
    
    if (!transporter) {
        return false;
    }

    try {
        await transporter.verify();
        console.log('✅ Email configuration verified successfully');
        return true;
    } catch (error) {
        console.error('❌ Email configuration verification failed:', error.message);
        return false;
    }
};
