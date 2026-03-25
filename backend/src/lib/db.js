import mongoose from "mongoose";

mongoose.set("strictQuery", true);

const g = globalThis;
if (!g.__mongooseConnection) {
  g.__mongooseConnection = { promise: null };
}

if (!g.__mongooseDbListeners) {
  g.__mongooseDbListeners = true;
  mongoose.connection.on("disconnected", () => {
    g.__mongooseConnection.promise = null;
  });
}

export async function connectDb(uri = process.env.MONGO_URI) {
  if (!uri) throw new Error("MONGO_URI is required");

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!g.__mongooseConnection.promise) {
    g.__mongooseConnection.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15_000,
      })
      .then(() => mongoose.connection);
  }

  try {
    await g.__mongooseConnection.promise;
  } catch (err) {
    g.__mongooseConnection.promise = null;
    throw err;
  }

  return mongoose.connection;
}