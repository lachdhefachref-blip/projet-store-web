import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.js";
import { productRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: ["https://projet-store-web.vercel.app", "http://localhost:3000"],
  credentials: true
}));

app.use(express.json());

const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/storeweb";
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", ordersRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port: ${PORT}`));