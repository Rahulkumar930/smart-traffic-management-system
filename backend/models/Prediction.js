import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
      trim: true,
    },

    predictedCongestion: {
      type: String,
      enum: ["Low", "Medium", "High", "Severe"],
      required: true,
    },

    predictedVehicleCount: {
      type: Number,
      default: 0,
    },

    predictionTime: {
      type: Date,
      required: true,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Prediction = mongoose.model("Prediction", predictionSchema);

export default Prediction;