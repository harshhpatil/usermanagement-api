import mongoose from 'mongoose';

const dbConnection = async () => {
    try{
        await mongoose.connect("mongodb://localhost:27017/userManagementDB");
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}
