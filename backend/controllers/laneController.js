import path from "path";
import fs from "fs";

import LaneDetection from "../models/LaneDetection.js";
import { runLaneDetection } from "../services/laneDetectionService.js";

export const processLaneVideo = async (req, res) => {
  try {
    const {
      videoPath,
      roadName = "Unknown Road",
    } = req.body;

    if (!videoPath) {
      return res.status(400).json({
        success: false,
        message: "videoPath is required",
      });
    }

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: "Video file not found",
      });
    }

    const outputDirectory = path.resolve(
      process.cwd(),
      "ml-model",
      "videos",
      "processed"
    );

    fs.mkdirSync(outputDirectory, {
      recursive: true,
    });

    const outputFile = path.join(
      outputDirectory,
      `lane_${Date.now()}.mp4`
    );

    // Run Python + OpenCV + YOLO
    const result = await runLaneDetection(
      videoPath,
      outputFile
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || "Lane detection failed",
        result,
      });
    }

    // ------------------------------------------------
    // Values returned by Python
    // ------------------------------------------------

    const vehicleCount = Number(
      result.maxVehiclesInFrame || 0
    );

    const averageSpeed = Number(
      result.averageSpeed || 0
    );

    const congestionLevel =
      result.congestionLevel || "Low";

    // ------------------------------------------------
    // Save result to MongoDB
    // ------------------------------------------------

    const laneRecord = await LaneDetection.create({
      roadName,

      laneCount: 0,

      detectedRegions:
        Number(result.maxDetectedRegions || 0),

      averageDetectedRegions:
        Number(result.averageDetectedRegions || 0),

      framesProcessed:
        Number(result.framesProcessed || 0),

      outputVideo:
        result.outputVideo || outputFile,

      vehicleCount,

      averageSpeed,

      congestionLevel,
    });

    return res.status(200).json({
      success: true,

      message:
        "Lane detection completed successfully",

      result,

      record: laneRecord,
    });
  } catch (error) {
    console.error(
      "Lane detection error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getLaneStatus = async (req, res) => {
  try {
    const records = await LaneDetection.find()
      .sort({
        createdAt: -1,
      })
      .limit(20);

    return res.status(200).json({
      success: true,
      records,
    });
  } catch (error) {
    console.error(
      "Lane status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};