import express from "express";
import { signup, login, forgotPassword, resetPassword, getCurrentUser, updateProfile, chat, getChatHistory, uploadDocument, ask} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getCurrentUser);
router.put("/update-profile", protect, updateProfile);
router.post("/chat", protect, chat);
router.get("/chat-history", protect, getChatHistory);
router.post("/upload", protect, uploadDocument);
router.post("/ask", protect, ask);
export default router;