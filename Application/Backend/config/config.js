import mongoose from "mongoose";
import dotenv from "dotenv";
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI not set");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message || error);
    process.exit(1);
  }
};

export default connectDB;
