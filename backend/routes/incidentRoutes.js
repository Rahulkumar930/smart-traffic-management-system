import express from "express";
import {
  getIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
} from "../controllers/incidentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getIncidents);
router.post("/", protect, createIncident);
router.put("/:id", protect, updateIncident);
router.delete("/:id", protect, deleteIncident);

export default router;