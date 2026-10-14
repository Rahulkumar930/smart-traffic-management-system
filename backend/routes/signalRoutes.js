import express from "express";
import {
  getSignals,
  getSignalById,
  createSignal,
  updateSignal,
  deleteSignal,
} from "../controllers/signalController.js";
import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSignals);
router.get("/:id", getSignalById);

router.post("/", protect, adminOnly, createSignal);
router.put("/:id", protect, adminOnly, updateSignal);
router.delete("/:id", protect, adminOnly, deleteSignal);

export default router;