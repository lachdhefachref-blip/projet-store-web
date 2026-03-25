import mongoose from "mongoose";

mongoose.set("strictQuery", true);
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDb(uri = process.env.MONGO_URI) {
  if (!uri) throw new Error("MONGO_URI is required in environment variables");

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log("=> New MongoDB connection established");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("=> MongoDB connection error:", e);
    throw e;
  }

  return cached.conn;
}