import mongoose from "mongoose";
import User from "@/models/User";
import Country from "@/models/Country";
import Continent from "@/models/Continent";
import City from "@/models/City";

const connectMongo = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "Add the MONGODB_URI environment variable inside .env.local to use mongoose"
    );
  }
  return mongoose
    .connect(process.env.MONGODB_URI)
    .catch((e) => console.error("Mongoose Client Error: " + e.message));
};

export default connectMongo;

