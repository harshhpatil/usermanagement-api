import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'admin'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String
    },
    backupCodes: [{
        type: String
    }],
    lastLogin: {
        type: Date
    }
}, { timestamps: true });

// Index for email lookup
adminSchema.index({ email: 1 });

// Index for token lookups
adminSchema.index({ emailVerificationToken: 1 });
adminSchema.index({ passwordResetToken: 1 });

export default mongoose.model('Admin', adminSchema);