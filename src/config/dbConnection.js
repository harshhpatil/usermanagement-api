import mongoose from "mongoose";

let isConnected = false;

const dbConnection = async () => {
  // Check before hand if the datbase connection string is available or not
  if (!process.env.MONGO_URI) {
    console.error(
      "FATAL Error: MONGO_URI didn't exists or load from the env file",
    );
    process.exit(1);
  }

  if (isConnected) return; // Prevent multiple connections

  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI);

    isConnected = db.connections[0].readyState === 1; // 1 means connected

    // Event listeners for the connection
    mongoose.connection.on("error", (err) => {
      console.error("POST-DB CONNECTION ERROR:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(
        "DATABASE ERROR: Disconnected from the database. Attempting to reconnect...",
      );
      isConnected = false;
    });

    console.log("Database Connected Successfully");
  } catch (err) {
    console.error("DATABASE ERROR:", err.message);
    process.exit(1);
  }
};

export default dbConnection;
