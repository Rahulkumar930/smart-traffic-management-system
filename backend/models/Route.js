import mongoose from "mongoose";

const routeSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    distance: {
      type: Number,
      required: true,
      min: 0,
    },

    estimatedTime: {
      type: Number,
      required: true,
      min: 0,
    },

    congestionLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Severe"],
      default: "Low",
    },

    recommended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Route = mongoose.model("Route", routeSchema);

export default Route;