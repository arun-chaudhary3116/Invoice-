import express from "express";
import * as clientController from "../controller/client.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// ────────────────────────────────────────
// CLIENT ROUTES
// ────────────────────────────────────────

// GET all clients
router.get("/", clientController.getClients);

// CREATE client
router.post("/", clientController.createClient);

// GET specific client
router.get("/:id", clientController.getClient);

// UPDATE client
router.patch("/:id", clientController.updateClient);

// DELETE client
router.delete("/:id", clientController.deleteClient);

export default router;
