import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'User Management API',
            version: '1.0.0',
            description: 'A comprehensive user management API with authentication, authorization, email verification, password reset, 2FA, and more',
            contact: {
                name: 'API Support',
                email: process.env.CONTACT_EMAIL || 'support@example.com'
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC'
            }
        },
        servers: [
            {
                url: process.env.APP_URL || 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'User ID'
                        },
                        name: {
                            type: 'string',
                            description: 'User name'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email'
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'user'],
                            description: 'User role'
                        },
                        isEmailVerified: {
                            type: 'boolean',
                            description: 'Email verification status'
                        },
                        twoFactorEnabled: {
                            type: 'boolean',
                            description: '2FA enabled status'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object'
                            },
                            description: 'Detailed validation errors'
                        }
                    }
                }
            }
        },
        security: [
            {
                cookieAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);
