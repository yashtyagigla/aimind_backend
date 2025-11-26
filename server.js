import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import fileUpload from "express-fileupload";

dotenv.config();
console.log("GROQ KEY =", process.env.GROQ_API_KEY ? "Loaded" : "Missing");
console.log("BREVO_HOST =", process.env.BREVO_HOST);
console.log("BREVO_USER =", process.env.BREVO_USER);
console.log("BREVO_PASS =", process.env.BREVO_PASS);
console.log("EMAIL_FROM =", process.env.EMAIL_FROM);
console.log("FRONTEND_URL =", process.env.FRONTEND_URL);

const app = express();
const PORT = process.env.PORT || 5050;

// ✅ must be before routes
app.use(cors({
  origin:["http://localhost:5173","http://localhost:5174","http://localhost:5175","https://sokit-io.onrender.com"],
  methods: "GET,POST,PUT,PATCH,DELETE",
   credentials: true,
}));
app.use(express.json());

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

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