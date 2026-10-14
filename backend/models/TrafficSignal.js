import mongoose from "mongoose";

const trafficSignalSchema = new mongoose.Schema(
  {
    signalId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    roadName: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Red", "Yellow", "Green"],
      default: "Red",
    },

    greenTime: {
      type: Number,
      default: 30,
      min: 0,
    },

    redTime: {
      type: Number,
      default: 30,
      min: 0,
    },

    yellowTime: {
      type: Number,
      default: 5,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const TrafficSignal = mongoose.model(
  "TrafficSignal",
  trafficSignalSchema
);

export default TrafficSignal;