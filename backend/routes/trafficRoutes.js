import express from "express";

import {
  getTrafficData,
  getTrafficByLocation,
  createTrafficData,
  getTrafficSummary,
  predictTraffic,
} from "../controllers/trafficController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all traffic data
router.get("/", getTrafficData);

// Get traffic summary
router.get("/summary", getTrafficSummary);

// Get traffic data by location
router.get(
  "/location/:location",
  getTrafficByLocation
);

// Create traffic data
router.post(
  "/",
  protect,
  createTrafficData
);

// ML traffic prediction
router.post(
  "/predict",
  protect,
  predictTraffic
);

export default router;