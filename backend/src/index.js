import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import { connectDb } from "./lib/db.js";
import { seedIfEmpty } from "./lib/seed-if-empty.js";
import { authRouter } from "./routes/auth.js";
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { stripeWebhookRouter } from "./routes/stripe-webhook.js";
import { paymentsRouter } from "./routes/payments.js";
import { adminRouter } from "./routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
connectDb(process.env.MONGO_URI)
  .then(async () => {
    console.log(`MongoDB connected successfully`);
    await seedIfEmpty();
  })
  .catch((err) => console.error("MongoDB connection error:", err));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use('/products', express.static(path.join(__dirname, 'public/products')));


app.use(cors({ 
  origin: true, 
  credentials: true 
}));

app.use(cookieParser());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, limit: 240 }));

const apiRouter = express.Router();
apiRouter.use("/webhooks/stripe", stripeWebhookRouter);
apiRouter.use(express.json({ limit: "1mb" }));

// Routes
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/admin", adminRouter);

app.use("/api", apiRouter);

// Error Handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal_error", details: err.message });
});
export default app;

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API running locally on http://localhost:${port}`));
}