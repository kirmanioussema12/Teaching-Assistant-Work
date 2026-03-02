import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config(); // 🔥 Load environment variables

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Mongo connection failed:", error.message);
  }
}

connectMongo();