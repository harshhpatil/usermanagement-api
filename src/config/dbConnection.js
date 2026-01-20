import mongoose from "mongoose";

const dbConnection = async () => {
  // Check before hand if the datbase connection string is available or not
  if (!process.env.MONGO_URI) {
    console.error(
      "FATAL Error: MONGO_URI didn't exists or load from the env file",
    );
    process.exit(1);
  }

  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI);

    // Event listeners for the connection
    mongoose.connection.on("error", (err) => {
      console.error("POST-DB CONNECTION ERROR:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(
        "DATABASE ERROR: Disconnected from the database. Attempting to reconnect...",
      );
    });

    console.log("Database Connected Successfully");
  } catch (err) {
    console.error("DATABASE ERROR:", err, err.message);
    process.exit(1);
  }
};

export default dbConnection;
