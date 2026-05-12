import express from "express";
import * as authController from "../controller/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import upload from "../middleware/upload.js"; // ✅ FIX HERE

const router = express.Router();

// Google
router.post("/google", authController.verifyGoogleToken);

// Email auth
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);

// Protected
router.get("/me", requireAuth, authController.getMe);

router.patch(
  "/me",
  requireAuth,
  upload.single("avatar"), // ✅ this is correct now
  authController.updateMe,
);

// Logout
router.post("/logout", authController.logout);

export default router;
