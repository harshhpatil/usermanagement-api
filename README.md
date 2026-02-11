# 🚀 User Management API v2.0

A **production-grade** Node.js backend for comprehensive user authentication and management. Built with Express.js, MongoDB, and modern security practices.

[![Node.js](https://img.shields.io/badge/Node.js-v22.12.0+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.x-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **User Registration & Login** - Secure account creation and authentication
- **JWT Authentication** - Stateless token-based authentication
- **Role-Based Access Control** - Admin and User roles
- **Email Verification** - Verify email addresses on registration
- **Password Reset** - Secure password recovery via email
- **Session Management** - Cookie-based session handling

### 🛡️ Security Features
- **Password Hashing** - Bcrypt with salt rounds
- **Rate Limiting** - Protection against brute force attacks
  - 5 login attempts per 15 minutes
  - 3 registration attempts per hour
  - 10 general requests per minute
- **Two-Factor Authentication (2FA)** - Optional TOTP-based 2FA with QR codes
- **Security Headers** - Helmet.js for HTTP security
- **Input Validation** - Joi schemas for all inputs
- **CORS Protection** - Configurable cross-origin policies
- **Audit Logging** - Track all security-related events

### 👤 User Profile Management
- **Update Profile** - Change name and email
- **Change Password** - Secure password updates
- **Delete Account** - Complete account removal
- **Activity Logs** - View account activity history

### 📧 Email Notifications
- **Verification Emails** - Welcome and email confirmation
- **Password Reset Emails** - Secure reset links
- **Activity Alerts** - Security notifications (optional)

### 📚 API Documentation
- **Swagger/OpenAPI** - Interactive API documentation
- **API Explorer** - Test endpoints directly in browser
- **Complete Schemas** - Detailed request/response documentation

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [API Endpoints](#-api-endpoints)
- [Authentication Flow](#-authentication-flow)
- [2FA Setup](#-2fa-setup)
- [Project Structure](#-project-structure)
- [Security Best Practices](#-security-best-practices)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web application framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication tokens |
| **Bcrypt** | Password hashing |
| **Nodemailer** | Email sending |
| **Joi** | Input validation |
| **Helmet** | Security headers |
| **Speakeasy** | 2FA OTP generation |
| **Swagger** | API documentation |
| **Morgan** | HTTP request logging |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v22.12.0 or higher ([Download](https://nodejs.org/))
- **MongoDB**: Local instance or MongoDB Atlas account ([Setup Guide](https://www.mongodb.com/docs/manual/installation/))
- **npm**: v10.0.0 or higher (comes with Node.js)

---

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harshhpatil/usermanagement-api.git
   cd usermanagement-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see [Configuration](#️-configuration))

---

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

### Required Configuration

```env
# Database
MONGO_URI=mongodb://localhost:27017/usermanagement
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/usermanagement

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000
```

### Optional Configuration

```env
# CORS (for frontend integration)
CORS_ORIGIN=http://localhost:3000

# Email Configuration (for verification & password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM_NAME=User Management API
```

### 📧 Email Setup (Gmail)

To enable email functionality:

1. Enable 2-Step Verification on your Google Account
2. Generate an App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use the generated password in `EMAIL_PASS`

**Note**: Email features are optional. The API will work without email configuration, but verification and password reset features will be disabled.

---

## 🚀 Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Admin User (Optional)
```bash
# Create a default admin account
npm run seed:admin

# Or with custom credentials
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=YourPassword123! npm run seed:admin
```

The server will start on `http://localhost:3000` (or your configured PORT).

---

## 📖 API Documentation

Once the server is running, access the interactive API documentation:

**Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

The Swagger interface allows you to:
- View all available endpoints
- See request/response schemas
- Test endpoints directly in the browser
- Authenticate and try protected routes

---

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register a new user | ❌ No |
| `POST` | `/api/auth/login` | Login user | ❌ No |
| `GET` | `/api/auth/verify-email` | Verify email with token | ❌ No |
| `POST` | `/api/auth/forgot-password` | Request password reset | ❌ No |
| `POST` | `/api/auth/reset-password` | Reset password with token | ❌ No |
| `GET` | `/api/auth/me` | Get current user info | ✅ Yes |

### Profile Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `PUT` | `/api/profile/update` | Update user profile | ✅ Yes |
| `PUT` | `/api/profile/change-password` | Change password | ✅ Yes |
| `DELETE` | `/api/profile/delete-account` | Delete account | ✅ Yes |
| `GET` | `/api/profile/activity-logs` | Get activity logs | ✅ Yes |

### Two-Factor Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/profile/enable-2fa` | Enable 2FA | ✅ Yes |
| `POST` | `/api/profile/verify-2fa` | Verify 2FA setup | ✅ Yes |
| `POST` | `/api/profile/disable-2fa` | Disable 2FA | ✅ Yes |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/health` | Check API status | ❌ No |

---

## 🔄 Authentication Flow

### Registration Flow

```mermaid
graph LR
    A[User Submits Registration] --> B[Validate Input]
    B --> C[Hash Password]
    C --> D[Generate Verification Token]
    D --> E[Save User to Database]
    E --> F[Send Verification Email]
    F --> G[Return Success Message]
```

1. User submits registration with name, email, password, and role
2. Input is validated using Joi schemas
3. Password is hashed with bcrypt
4. Verification token is generated
5. User is saved to database (email not verified yet)
6. Verification email is sent
7. User must verify email before login

### Login Flow

```mermaid
graph LR
    A[User Submits Credentials] --> B[Find User]
    B --> C[Verify Password]
    C --> D{Email Verified?}
    D -->|No| E[Return Error]
    D -->|Yes| F{2FA Enabled?}
    F -->|Yes| G[Verify OTP]
    F -->|No| H[Generate JWT]
    G --> H
    H --> I[Set Cookie]
    I --> J[Return Token & User]
```

1. User submits email, password, and role
2. System finds user in database
3. Password is verified with bcrypt
4. Email verification status is checked
5. If 2FA is enabled, OTP is verified
6. JWT token is generated
7. Token is set in HTTP-only cookie
8. Token and user info are returned

---

## 🔐 2FA Setup

### Enable 2FA

1. **Call Enable 2FA Endpoint**
   ```bash
   POST /api/profile/enable-2fa
   {
     "password": "your_password"
   }
   ```

2. **Receive QR Code and Secret**
   - API returns QR code image and secret key
   - Also returns backup codes (save these!)

3. **Scan QR Code**
   - Use an authenticator app (Google Authenticator, Authy, etc.)
   - Scan the QR code or manually enter the secret

4. **Verify 2FA Setup**
   ```bash
   POST /api/profile/verify-2fa
   {
     "otp": "123456"
   }
   ```

5. **Login with 2FA**
   ```bash
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "your_password",
     "role": "user",
     "otp": "123456"
   }
   ```

---

## 📁 Project Structure

```
usermanagement-api/
├── src/
│   ├── config/
│   │   ├── dbConnection.js       # MongoDB connection
│   │   ├── email.config.js       # Email transporter setup
│   │   └── swagger.config.js     # Swagger/OpenAPI config
│   ├── controllers/
│   │   ├── authentication.controller.js  # Auth logic
│   │   └── profile.controller.js         # Profile management
│   ├── middlewares/
│   │   ├── authMiddlware.js      # JWT authentication
│   │   ├── errorHandler.js       # Error handling
│   │   ├── validation.middleware.js  # Input validation
│   │   └── rateLimiter.middleware.js  # Rate limiting
│   ├── models/
│   │   ├── user.model.js         # User schema
│   │   ├── admin.model.js        # Admin schema
│   │   └── auditLog.model.js     # Activity log schema
│   ├── routes/
│   │   ├── authentication.routes.js  # Auth routes
│   │   └── profile.routes.js         # Profile routes
│   ├── services/
│   │   ├── email.service.js      # Email sending
│   │   ├── auth.service.js       # Auth utilities
│   │   └── otp.service.js        # 2FA/OTP handling
│   ├── utils/
│   │   ├── tokenGenerator.js     # Token generation
│   │   ├── validators.js         # Joi schemas
│   │   ├── constants.js          # App constants
│   │   └── auditLogger.js        # Audit log utility
│   └── scripts/
│       └── seedAdmin.js          # Admin seeding script
├── app.js                        # Express app setup
├── index.js                      # Server entry point
├── package.json                  # Dependencies
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

---

## 🔒 Security Best Practices

### Implemented Security Measures

1. **Password Security**
   - Minimum 8 characters
   - Must contain uppercase, lowercase, number, and special character
   - Hashed with bcrypt (10 salt rounds)

2. **JWT Security**
   - HTTP-only cookies
   - Secure flag in production
   - 1-day expiration
   - SameSite policy

3. **Rate Limiting**
   - Login: 5 attempts per 15 minutes
   - Registration: 3 attempts per hour
   - General API: 10 requests per minute
   - Password reset: 3 attempts per 15 minutes

4. **Security Headers**
   - Helmet.js for standard security headers
   - Content Security Policy
   - XSS Protection
   - CORS configuration

5. **Input Validation**
   - Joi schemas for all inputs
   - Sanitization of user data
   - Type checking and constraints

6. **Audit Logging**
   - All authentication events logged
   - Failed login attempts tracked
   - Security events monitored

### Recommended Practices

1. **Always use HTTPS in production**
2. **Keep dependencies updated**: `npm audit` and `npm update`
3. **Use strong JWT secrets**: Generate with `openssl rand -base64 32`
4. **Enable email verification** before allowing login
5. **Implement rate limiting** on all public endpoints
6. **Regular security audits** and penetration testing
7. **Monitor audit logs** for suspicious activity
8. **Backup database regularly**

---

## 🧪 Testing

### Manual Testing with cURL

#### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "user"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "user"
  }'
```

#### Get Current User (with token)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Testing with Swagger UI

1. Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
2. Click on any endpoint to expand
3. Click "Try it out"
4. Fill in parameters
5. Click "Execute"

### Postman Collection

You can import the API endpoints into Postman:
1. Import from URL: `http://localhost:3000/api-docs/swagger.json`
2. Or manually add endpoints from the documentation

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting
- Keep commits atomic and descriptive

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod` or check MongoDB Atlas
- Verify `MONGO_URI` in `.env`
- Check network connectivity

**JWT Error**
- Ensure `JWT_SECRET` is set in `.env`
- Clear cookies and try again
- Check token expiration

**Email Not Sending**
- Verify email credentials in `.env`
- Check if app password is used (for Gmail)
- Check spam folder for emails
- Email features are optional; API works without them

**Port Already in Use**
- Change `PORT` in `.env`
- Or stop the process using the port: `lsof -ti:3000 | xargs kill`

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Harsh Patil**
- GitHub: [@harshhpatil](https://github.com/harshhpatil)

---

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- MongoDB team for the database
- All open-source contributors

---

## 📞 Support

If you have questions or need help:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the API documentation at `/api-docs`

---

**⭐ If you find this project helpful, please give it a star!**

---

*Last Updated: February 2026*
