import express from "express";

import {
  processLaneVideo,
  getLaneStatus
} from "../controllers/laneController.js";

const router = express.Router();

router.post(
  "/process",
  processLaneVideo
);

router.get(
  "/status",
  getLaneStatus
);

export default router;