import mongoose from "mongoose";

const trafficDataSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
      trim: true,
    },

    // New field
    roadName: {
      type: String,
      required: true,
      trim: true,
    },

    // Old field support
    road: {
      type: String,
      trim: true,
    },

    // New field
    vehicleCount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Old field support
    vehicles: {
      type: Number,
      min: 0,
    },

    // New field
    averageSpeed: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Old field support
    avgSpeed: {
      type: Number,
      min: 0,
    },

    // New field
    congestionLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Severe"],
      default: "Low",
    },

    // Old field support
    congestion: {
      type: String,
      enum: ["Low", "Medium", "High", "Severe"],
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const TrafficData = mongoose.model(
  "TrafficData",
  trafficDataSchema
);

export default TrafficData;