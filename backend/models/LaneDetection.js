import mongoose from "mongoose";

const laneDetectionSchema = new mongoose.Schema(
  {
    roadName: {
      type: String,
      required: true,
      trim: true
    },

    laneCount: {
      type: Number,
      default: 0,
      min: 0
    },

    detectedRegions: {
      type: Number,
      default: 0,
      min: 0
    },

    averageDetectedRegions: {
      type: Number,
      default: 0,
      min: 0
    },

    framesProcessed: {
      type: Number,
      default: 0,
      min: 0
    },

    outputVideo: {
      type: String,
      default: null
    },

    vehicleCount: {
      type: Number,
      default: 0,
      min: 0
    },

    averageSpeed: {
      type: Number,
      default: 0,
      min: 0
    },

    congestionLevel: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Severe"
      ],
      default: "Low"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "LaneDetection",
  laneDetectionSchema
);