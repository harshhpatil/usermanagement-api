import admin from '../model/admin.model.js';
import user from '../model/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

// Registration controller
export const register = async (req, res) => {   
    const {name, email, password, role} = req.body;
    try {
        // For the admin registration
        if(role === 'admin') {
            const isAdmin = await admin.findOne({email});
            if(isAdmin) return res.status(400).json({message: "Admin already exists."});

            const hashedPassword = await bcrypt.hash(password, 10); // Password hashing
            await admin.create({name, email, hashedPassword, role});
            return res.status(201).json({message: "Admin registered successfully"});
        }

        // For the user registration
        if(role === 'user') {
            const isUser = await user.findOne({email});
            if(isUser) return res.status(400).json({message: "User already exists."});

            const hashedPassword = await bcrypt.hash(password, 10); // Password hashing
            await user.create({name, email, hashedPassword, role});
            return res.status(201).json({message: "User registered successfully"});
        }

    } catch (err) {
        console.log("REGISTRATION CONTROLLER ERROR:", err.message);
        res.status(500).json({message: "Internal server error"});
    }
}

// Login controller
export const login =  async (req, res) => {
    const {email, password, role} = req.body;
    try {
        // For the admin login
        if (role === 'admin') {
            const isAdmin = await admin.findOne({email});
            if(!isAdmin || !(await bcrypt.compare(password, isAdmin.password))) return res.status(400).json({message: "Invalid credentials."});

            const token = jwt.sign( {userid: isAdmin._id, role: isAdmin.role}, process.env.JWT_SECRET, {expiresIn: '1d'} );
            
            res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax" });
            res.status(200).json({ message: "Login successful", user: { name: isAdmin.name } });
        }

        // For the user login
        if (role === 'user') {
            const isUser = await user.findOne({email});
            if(!isUser || !(await bcrypt.compare(password, isUser.password))) return res.status(400).json({message: "Invalid credentials."});

            const token = jwt.sign( {userid: isUser._id, role: isUser.role}, process.env.JWT_SECRET, {expiresIn: '1d'} );

            res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax" });
            res.status(200).json({ message: "Login successful", user: { name: isUser.name } });
        }
    } catch (err) {
        console.log("LOGIN CONTROLLER ERROR:", err.message);
        res.status(500).json({message: "Internal server error"});
    }
}