import express from "express";
import {
  getRoutes,
  findBestRoute,
  createRoute,
} from "../controllers/routeController.js";
import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getRoutes);
router.get("/best", findBestRoute);
router.post("/", protect, adminOnly, createRoute);

export default router;