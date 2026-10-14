
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../backend/models/User.js";
import TrafficData from "../backend/models/TrafficData.js";
import TrafficSignal from "../backend/models/TrafficSignal.js";
import Incident from "../backend/models/Incident.js";
import Route from "../backend/models/Route.js";
import Prediction from "../backend/models/Prediction.js";

// Load the backend environment file when running from the project root.
dotenv.config({ path: "backend/.env" });

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_SEED_PASSWORD = process.env.ADMIN_SEED_PASSWORD;

const seedDatabase = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing from backend/.env");
    }

    if (!ADMIN_SEED_PASSWORD) {
      throw new Error(
        "ADMIN_SEED_PASSWORD is missing from backend/.env"
      );
    }

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected for seeding");

    // Hash the password instead of storing it in plain text.
    const hashedPassword = await bcrypt.hash(
      ADMIN_SEED_PASSWORD,
      10
    );

    // WARNING: This seed script resets the demo collections.
    // Use only with a development database containing disposable data.
    await Promise.all([
      User.deleteMany({}),
      TrafficData.deleteMany({}),
      TrafficSignal.deleteMany({}),
      Incident.deleteMany({}),
      Route.deleteMany({}),
      Prediction.deleteMany({})
    ]);

    // Create demo users. All three use the configured seed password.
    await User.insertMany([
      {
        name: "Admin User",
        email: "admin@smarttraffic.com",
        password: hashedPassword,
        role: "admin"
      },
      {
        name: "Traffic Officer",
        email: "officer@smarttraffic.com",
        password: hashedPassword,
        role: "operator"
      },
      {
        name: "Demo User",
        email: "user@smarttraffic.com",
        password: hashedPassword,
        role: "user"
      }
    ]);

    // Traffic data
    await TrafficData.insertMany([
      {
        location: {
          latitude: 28.6139,
          longitude: 77.2090
        },
        roadName: "MG Road",
        vehicleCount: 145,
        averageSpeed: 24,
        congestionLevel: "High",
        timestamp: new Date()
      },
      {
        location: {
          latitude: 28.5355,
          longitude: 77.3910
        },
        roadName: "Noida Expressway",
        vehicleCount: 98,
        averageSpeed: 42,
        congestionLevel: "Medium",
        timestamp: new Date()
      },
      {
        location: {
          latitude: 28.4595,
          longitude: 77.0266
        },
        roadName: "Golf Course Road",
        vehicleCount: 65,
        averageSpeed: 55,
        congestionLevel: "Low",
        timestamp: new Date()
      }
    ]);

    // Traffic signals
    await TrafficSignal.insertMany([
      {
        signalId: "SIG-001",
        location: {
          latitude: 28.6139,
          longitude: 77.2090
        },
        intersectionName: "MG Road Junction",
        status: "Active",
        currentPhase: "Green",
        greenTime: 45,
        redTime: 60
      },
      {
        signalId: "SIG-002",
        location: {
          latitude: 28.5355,
          longitude: 77.3910
        },
        intersectionName: "Noida Sector 18",
        status: "Active",
        currentPhase: "Red",
        greenTime: 50,
        redTime: 55
      }
    ]);

    // Incidents
    await Incident.insertMany([
      {
        title: "Vehicle Accident",
        description: "Minor accident causing traffic slowdown",
        type: "Accident",
        severity: "High",
        location: {
          latitude: 28.6139,
          longitude: 77.2090
        },
        status: "Active"
      },
      {
        title: "Road Maintenance",
        description: "Road maintenance work in progress",
        type: "Roadwork",
        severity: "Medium",
        location: {
          latitude: 28.5355,
          longitude: 77.3910
        },
        status: "Active"
      }
    ]);

    // Routes
    await Route.insertMany([
      {
        source: "Connaught Place",
        destination: "Noida Sector 18",
        distance: 18.5,
        estimatedTime: 42,
        congestionLevel: "Medium",
        recommended: true
      },
      {
        source: "Connaught Place",
        destination: "Gurugram",
        distance: 28.2,
        estimatedTime: 55,
        congestionLevel: "High",
        recommended: false
      }
    ]);

    // Predictions
    await Prediction.insertMany([
      {
        location: "MG Road",
        predictedCongestion: "High",
        predictedVehicleCount: 180,
        predictedSpeed: 20,
        predictionTime: new Date(Date.now() + 60 * 60 * 1000)
      },
      {
        location: "Noida Expressway",
        predictedCongestion: "Medium",
        predictedVehicleCount: 120,
        predictedSpeed: 38,
        predictionTime: new Date(Date.now() + 60 * 60 * 1000)
      }
    ]);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

seedDatabase();
