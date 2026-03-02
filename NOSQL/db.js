import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: new URL("../.env", import.meta.url) });

export async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Mongo connected");
}