## User Management API

A secure Node.js backend for user authentication and management. This project implements structured backend with controllers, routes, and middleware separation.

---

### 🚀 Features
* **User Registration & Login:** Simplified onboarding and session start.
* **Secure Password Hashing:** Utilizes industry-standard hashing (Bcrypt) to protect user data.
* **JWT Authentication:** Implements JSON Web Tokens for secure, stateless communication.
* **Role-Based Logic:** Pre-configured for Admin and User roles (Scalable for future features).
* **Database Integration:** Ready for both MongoDB Compass (Local) and MongoDB Atlas (Cloud).

--- 

### 🛠 Tech Stack
* **Runtime:** Node.js (LTS)
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **Security:** JWT, Bcrypt

---

### ⚙️ Setup & Installation
1. PrerequisitesNode.js: v22.12.0 or higherMongoDB: Local Compass instance or an Atlas Cluster</br>
2. InstallationBash# Clone the repository</br>
git clone https://github.com/harshhpatil/usermanagement-api.git

```bash
# Navigate to the directory
cd usermanagement-api

# Install dependencies
npm install
```
3. Environment ConfigurationCreate a .env file in the root directory and add your credentials:Code snippetMONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
4. Running the ApplicationBash# Start the server
npm start

---

### 🛣 API Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register` | Create a new user account | No |
| `POST` | `/api/login` | Authenticate user & return JWT | No |
| `GET` | `/api/me` | Authenticate user & return user data | Yes |

---

### 📁 Project Structure

```text
├── app.js
├── index.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── README.md
└── src
    ├── config
    │   └── dbConnection.js
    ├── controllers
    │   └── authentication.controller.js
    ├── middlewares
    │   └── authMiddlware.js
    ├── models
    │   ├── admin.model.js
    │   └── user.model.js
    └── routes
        └── authentication.routes.js
```

---

### Thank you..!!
