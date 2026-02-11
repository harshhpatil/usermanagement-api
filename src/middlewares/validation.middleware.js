import { HTTP_STATUS } from '../utils/constants.js';

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware
 */
export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: 'Validation error',
                errors
            });
        }

        // Replace req.body with validated and sanitized value
        req.body = value;
        next();
    };
};
