## User Management API

A secure Node.js backend for user authentication and management. This project implements a robust Model-View-Controller (MVC) architecture to handle user registration, login, and role-based access.</br>

**🚀 Features**
- User Registration & Login: Simplified onboarding and session start.</br>
- Secure Password Hashing: Utilizes industry-standard hashing (Bcrypt) to protect user data.</br>
- JWT Authentication: Implements JSON Web Tokens for secure, stateless communication.</br>
- Role-Based Logic: Pre-configured for Admin and User roles (Scalable for future features).</br>
- Database Integration: Ready for both MongoDB Compass (Local) and MongoDB Atlas (Cloud).</br> 

**🛠 Tech Stack**
- Runtime: Node.js (v22.x)</br>
- Framework: Express.js</br>
- Database: MongoDB (via Mongoose)</br>
- Security: JWT, Bcrypt</br>

**⚙️ Setup & Installation**
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
npm start</br></br>

**🛣 API Endpoints** 
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register` | Create a new user account | No |
| `POST` | `/api/login` | Authenticate user & return JWT | No |
</br>

**📁 Project Structure**

```text
├── index.js                # Entry point of the application
├── package.json  
├── package.lock.json
├── REDME.md
├── src
│   ├── config              # Database connection logic
│   ├── controller          # Request handling (logic)
│   ├── middleware          # Authentication guards
│   ├── model               # Mongoose schemas (User/Admin)
│   └── routes              # Endpoint definitions
├── .gitignore
├── .env.example
```
<br>

**🔮 Future Roadmap**  <br>
[ ] Implement Admin-only routes for user management.<br>
[ ] Add User Profile update endpoints.<br>
[ ] Integrate Password Reset functionality.