import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// ✅ must be before routes
app.use(cors());
app.use(express.json());

// connect to db
connectDB();

app.use((req, res, next) => {
  console.log("➡️  Incoming:", req.method, req.originalUrl);
  next();
});
// routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("🚀 AIMind backend running..."));

// start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));