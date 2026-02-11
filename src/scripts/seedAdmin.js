import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import admin from '../src/models/admin.model.js';
import dbConnection from '../src/config/dbConnection.js';

/**
 * Seed admin user script
 * Usage: node src/scripts/seedAdmin.js
 */

const seedAdmin = async () => {
    try {
        // Connect to database
        await dbConnection();

        // Admin details
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
        const adminName = process.env.ADMIN_NAME || 'Admin User';

        // Check if admin already exists
        const existingAdmin = await admin.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('❌ Admin with this email already exists');
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create admin
        await admin.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            isEmailVerified: true // Admin is pre-verified
        });

        console.log('✅ Admin user created successfully');
        console.log('📧 Email:', adminEmail);
        console.log('🔑 Password:', adminPassword);
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
