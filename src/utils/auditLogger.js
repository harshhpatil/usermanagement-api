import AuditLog from '../models/auditLog.model.js';

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {string} params.userId - User ID
 * @param {string} params.action - Action performed
 * @param {Object} params.req - Express request object
 * @param {Object} params.details - Additional details
 */
export const createAuditLog = async ({ userId, action, req, details = {} }) => {
    try {
        await AuditLog.create({
            userId,
            action,
            ipAddress: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.headers['user-agent'],
            details
        });
    } catch (error) {
        console.error('Failed to create audit log:', error.message);
    }
};

/**
 * Get audit logs for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of logs to retrieve
 * @returns {Promise<Array>} - Array of audit logs
 */
export const getUserAuditLogs = async (userId, limit = 50) => {
    try {
        return await AuditLog.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();
    } catch (error) {
        console.error('Failed to retrieve audit logs:', error.message);
        return [];
    }
};
