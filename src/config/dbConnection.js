import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected Successfully");
  } catch (err) {
    console.error("Database Error:", err.message);
    process.exit(1);
  };
};

export default dbConnection;
