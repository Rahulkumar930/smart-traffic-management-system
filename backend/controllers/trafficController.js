import TrafficData from "../models/TrafficData.js";

// =====================================================
// CALCULATE CONGESTION
// =====================================================
const calculateCongestion = (
  vehicleCount,
  averageSpeed = 0
) => {
  if (vehicleCount >= 150 || averageSpeed < 15) {
    return "Severe";
  }

  if (vehicleCount >= 100 || averageSpeed < 25) {
    return "High";
  }

  if (vehicleCount >= 50 || averageSpeed < 40) {
    return "Medium";
  }

  return "Low";
};

// =====================================================
// GET ALL TRAFFIC DATA
// =====================================================
export const getTrafficData = async (req, res) => {
  try {
    const data = await TrafficData.find().sort({
      timestamp: -1,
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get traffic data error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET TRAFFIC DATA BY LOCATION
// =====================================================
export const getTrafficByLocation = async (req, res) => {
  try {
    const location = req.params.location;

    const data = await TrafficData.find({
      location: new RegExp(location, "i"),
    }).sort({
      timestamp: -1,
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(
      "Get traffic by location error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// CREATE TRAFFIC DATA
// =====================================================
export const createTrafficData = async (req, res) => {
  try {
    const {
      location,
      roadName,
      road,
      vehicleCount,
      vehicles,
      averageSpeed,
      avgSpeed,
    } = req.body;

    // Support both old and new field names
    const finalRoadName = roadName || road;

    const finalVehicleCount = Number(
      vehicleCount ?? vehicles ?? 0
    );

    const finalAverageSpeed = Number(
      averageSpeed ?? avgSpeed ?? 0
    );

    // Validation
    if (!location || !finalRoadName) {
      return res.status(400).json({
        success: false,
        message:
          "Location and road name are required",
      });
    }

    if (finalVehicleCount < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle count cannot be negative",
      });
    }

    if (finalAverageSpeed < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Average speed cannot be negative",
      });
    }

    const congestionLevel =
      calculateCongestion(
        finalVehicleCount,
        finalAverageSpeed
      );

    const trafficData =
      await TrafficData.create({
        location: location.trim(),
        roadName: finalRoadName.trim(),
        vehicleCount: finalVehicleCount,
        averageSpeed: finalAverageSpeed,
        congestionLevel,
      });

    res.status(201).json({
      success: true,
      message:
        "Traffic data created successfully",
      data: trafficData,
    });
  } catch (error) {
    console.error(
      "Create traffic data error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET TRAFFIC SUMMARY
// =====================================================
export const getTrafficSummary = async (req, res) => {
  try {
    const data = await TrafficData.find();

    const summary = {
      totalRecords: data.length,
      low: 0,
      medium: 0,
      high: 0,
      severe: 0,
      totalVehicles: 0,
    };

    data.forEach((item) => {
      // Support OLD database field:
      // vehicles
      //
      // Support NEW database field:
      // vehicleCount

      let vehicles = 0;

      if (
        item.vehicles !== undefined &&
        item.vehicles !== null
      ) {
        vehicles = Number(item.vehicles);
      } else if (
        item.vehicleCount !== undefined &&
        item.vehicleCount !== null
      ) {
        vehicles = Number(item.vehicleCount);
      }

      // Support old avgSpeed
      // Support new averageSpeed
      let speed = 0;

      if (
        item.avgSpeed !== undefined &&
        item.avgSpeed !== null
      ) {
        speed = Number(item.avgSpeed);
      } else if (
        item.averageSpeed !== undefined &&
        item.averageSpeed !== null
      ) {
        speed = Number(item.averageSpeed);
      }

      // Support old congestion
      // Support new congestionLevel
      let congestion =
        item.congestion ||
        item.congestionLevel;

      // Calculate if missing
      if (!congestion) {
        congestion = calculateCongestion(
          vehicles,
          speed
        );
      }

      // Add vehicles
      summary.totalVehicles += vehicles;

      // Count congestion
      switch (congestion) {
        case "Low":
          summary.low++;
          break;

        case "Medium":
          summary.medium++;
          break;

        case "High":
          summary.high++;
          break;

        case "Severe":
          summary.severe++;
          break;

        default:
          break;
      }
    });

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error(
      "Traffic summary error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// ML TRAFFIC PREDICTION
// =====================================================
export const predictTraffic = async (req, res) => {
  try {
    const {
      vehicleCount,
      averageSpeed,
      roadCapacity,
      timeOfDay,
      weather,
      accident,
    } = req.body;

    // Validation
    if (
      vehicleCount === undefined ||
      averageSpeed === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle count and average speed are required",
      });
    }

    // =================================================
    // CALL PYTHON ML SERVER
    // =================================================
    try {
      const mlResponse = await fetch(
        "http://127.0.0.1:5005/predict",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            vehicle_count:
              Number(vehicleCount),

            average_speed:
              Number(averageSpeed),

            road_capacity:
              Number(roadCapacity || 200),

            time_of_day:
              Number(timeOfDay || 12),

            weather:
              Number(weather || 0),

            accident:
              Number(accident || 0),
          }),
        }
      );

      if (mlResponse.ok) {
        const mlData =
          await mlResponse.json();

        return res.status(200).json({
          success: true,
          message:
            "Traffic prediction successful",
          data:
            mlData.data || mlData,
        });
      }

      console.log(
        "ML server returned status:",
        mlResponse.status
      );
    } catch (mlError) {
      console.log(
        "ML server unavailable:",
        mlError.message
      );
    }

    // FALLBACK PREDICTION
    // =================================================
    const congestion =
      calculateCongestion(
        Number(vehicleCount),
        Number(averageSpeed)
      );

    res.status(200).json({
      success: true,
      message:
        "Traffic prediction successful",

      data: {
        predictedCongestion:
          congestion,

        vehicleCount:
          Number(vehicleCount),

        averageSpeed:
          Number(averageSpeed),

        source: "fallback",
      },
    });
  } catch (error) {
    console.error(
      "Traffic prediction error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};